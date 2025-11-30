// modules/practice/server/services/daily-set.service.ts
// Daily set generation and management

import { createAdminClient } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { SkillTreeService } from "@/modules/skill-tree/server/services/skill-tree.service";
import { UserProfileService } from "@/modules/gamification/server/services/user-profile.service";
import {
  TOPICS,
  getTopicById,
} from "@/modules/skill-tree/config/topics";
import { generateQuestionWithRetry } from "@/modules/ai/server/services/question-generation.service";
import type { SkillTreeState, TopicWithProgress, Topic } from "@/modules/skill-tree/types";
import { analyzeHandwrittenSolution } from "@/modules/ai/server/services/image-analysis.service";
import { generateDailyProblems } from "./daily-generation.service";
import type {
  DailySet,
  Problem,
  ProblemSlot,
  ProblemAttempt,
  DailySetConfig,
} from "../../types";
import { DEFAULT_DAILY_SET_CONFIG, XP_REWARDS } from "../../types";
import type { Difficulty } from "@/modules/skill-tree/types";
import type { Exercise } from "@/modules/courses/types";
import type { Models } from "node-appwrite";

// Appwrite document type for daily sets
interface DailySetDocument extends Models.Document {
  userId: string;
  date: string;
  problems: string;
  currentIndex: number;
  completedCount: number;
  totalProblems: number;
  isCompleted: boolean;
  completedAt: string | null;
  xpEarned: number;
  focusTopicId: string;
  focusTopicName: string;
}

export class DailySetService {
  /**
   * Get or create today's daily set for a user
   */
  static async getTodaySet(userId: string): Promise<DailySet | null> {
    const today = new Date().toISOString().split("T")[0];

    // Try to get existing set
    const existing = await this.getDailySetByDate(userId, today);
    if (existing) return existing;

    // Generate new set
    return await this.generateDailySet(userId, today);
  }

  /**
   * Get a daily set by date
   */
  static async getDailySetByDate(
    userId: string,
    date: string
  ): Promise<DailySet | null> {
    const { databases } = await createAdminClient();

    try {
      // Query for set by date
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.dailySets
      );

      const doc = response.documents.find(
        (d) => d.userId === userId && d.date === date
      ) as unknown as DailySetDocument | undefined;

      if (!doc) return null;

      return this.documentToDailySet(doc);
    } catch {
      return null;
    }
  }

  /**
   * Generate a new daily set for a user
   * Uses AI generation by default with fallback to exercise bank/placeholders
   */
  static async generateDailySet(
    userId: string,
    date: string,
    config: DailySetConfig = DEFAULT_DAILY_SET_CONFIG,
    useAI: boolean = true
  ): Promise<DailySet> {
    const { databases } = await createAdminClient();

    // Get user's skill tree state
    const skillTree = await SkillTreeService.getSkillTreeState(userId);

    // Determine focus topic (first in_progress or first available)
    let focusTopic = skillTree.branches
      .flatMap((b) => b.topics)
      .find((t) => t.status === "in_progress");

    if (!focusTopic) {
      focusTopic = skillTree.branches
        .flatMap((b) => b.topics)
        .find((t) => t.status === "available");
    }

    // Fallback to first topic if nothing found
    if (!focusTopic) {
      const firstTopic = TOPICS[0];
      focusTopic = {
        ...firstTopic,
        progress: null,
        status: "available" as const,
        mastery: 0,
        isUnlocked: true,
      };
    }

    let problems: Problem[] = [];

    // Try AI generation first (if enabled and API key available)
    if (useAI && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        console.log(`[DailySet] Generating AI problems for user ${userId}, focus: ${focusTopic.id}`);
        const aiResult = await generateDailyProblems(userId, focusTopic.id, config);
        problems = aiResult.problems;
        console.log(`[DailySet] AI generated ${aiResult.generatedCount} problems (${aiResult.fallbackCount} fallbacks)`);
      } catch (error) {
        console.error("[DailySet] AI generation failed, falling back to exercise bank:", error);
        // Fall through to exercise bank
      }
    }

    // Fallback to exercise bank if AI didn't generate problems
    if (problems.length === 0) {
      console.log("[DailySet] Using exercise bank for problem generation");
      problems = await this.generateFromExerciseBank(userId, focusTopic.id, config);
    }

    // Create daily set document
    const dailySet: Omit<DailySet, "id"> = {
      userId,
      date,
      problems,
      currentIndex: 0,
      completedCount: 0,
      totalProblems: problems.length,
      isCompleted: false,
      completedAt: null,
      xpEarned: 0,
      focusTopicId: focusTopic.id,
      focusTopicName: focusTopic.name,
    };

    // Save to database
    const doc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.dailySets,
      ID.unique(),
      {
        userId: dailySet.userId,
        date: dailySet.date,
        problems: JSON.stringify(dailySet.problems),
        currentIndex: dailySet.currentIndex,
        completedCount: dailySet.completedCount,
        totalProblems: dailySet.totalProblems,
        isCompleted: dailySet.isCompleted,
        completedAt: dailySet.completedAt,
        xpEarned: dailySet.xpEarned,
        focusTopicId: dailySet.focusTopicId,
        focusTopicName: dailySet.focusTopicName,
      }
    );

    return { ...dailySet, id: doc.$id };
  }

  /**
   * Generate problems from the exercise bank (fallback method)
   */
  private static async generateFromExerciseBank(
    userId: string,
    focusTopicId: string,
    config: DailySetConfig
  ): Promise<Problem[]> {
    const skillTree = await SkillTreeService.getSkillTreeState(userId);
    // focusTopic resolved for potential future debugging
    const _focusTopic = getTopicById(focusTopicId) || TOPICS[0];

    const usedExerciseIds: string[] = [];
    const problems: Problem[] = [];

    // 1. Review slot
    const reviewTopic = this.selectReviewTopic(skillTree, config);
    const reviewTopicId = reviewTopic?.id || TOPICS[0].id;
    const reviewProblem = await this.fetchProblemFromBank(
      reviewTopicId, "easy", "review", 0, usedExerciseIds
    );
    problems.push(reviewProblem);
    if (reviewProblem.id) usedExerciseIds.push(reviewProblem.id);

    // 2-3. Core slots
    for (let i = 0; i < 2; i++) {
      const coreProblem = await this.fetchProblemFromBank(
        focusTopicId, "medium", "core", problems.length, usedExerciseIds
      );
      problems.push(coreProblem);
      if (coreProblem.id) usedExerciseIds.push(coreProblem.id);
    }

    // 4. Foundation slot
    const foundationTopic = this.selectFoundationTopic(focusTopicId);
    const foundationTopicId = foundationTopic?.id || TOPICS[0].id;
    const foundationProblem = await this.fetchProblemFromBank(
      foundationTopicId, "easy", "foundation", problems.length, usedExerciseIds
    );
    problems.push(foundationProblem);
    if (foundationProblem.id) usedExerciseIds.push(foundationProblem.id);

    // 5. Challenge slot
    const challengeProblem = await this.fetchProblemFromBank(
      focusTopicId, "hard", "challenge", problems.length, usedExerciseIds
    );
    problems.push(challengeProblem);
    if (challengeProblem.id) usedExerciseIds.push(challengeProblem.id);

    // Mark used exercises
    const bankExerciseIds = usedExerciseIds.filter((id) => !id.startsWith("problem_") && !id.startsWith("placeholder_"));
    if (bankExerciseIds.length > 0) {
      await this.markExercisesUsed(bankExerciseIds);
    }

    return problems;
  }

  /**
   * Fetch a problem from the exercise bank, falling back to placeholder if not available
   */
  private static async fetchProblemFromBank(
    topicId: string,
    difficulty: Difficulty,
    slot: ProblemSlot,
    index: number,
    excludeIds: string[]
  ): Promise<Problem> {
    // Try to fetch from the exercise bank
    const exercises = await this.fetchExercisesFromBank(topicId, difficulty, 1, excludeIds);

    if (exercises.length > 0) {
      return this.exerciseToProblem(exercises[0], slot, index);
    }

    // Fallback to placeholder if bank is empty
    console.warn(`No exercises found in bank for topic ${topicId} (${difficulty}), using placeholder`);
    return this.createProblemPlaceholder(topicId, slot, difficulty, index);
  }

  /**
   * Submit an answer for a problem
   */
  static async submitAnswer(
    userId: string,
    dailySetId: string,
    problemId: string,
    answerText: string | null,
    answerImageUrl: string | null,
    isSkipped: boolean
  ): Promise<{ success: boolean; isCorrect: boolean | null; xpEarned: number }> {
    const { databases } = await createAdminClient();

    // Get the daily set
    const dailySet = await this.getDailySetById(dailySetId);
    if (!dailySet || dailySet.userId !== userId) {
      return { success: false, isCorrect: null, xpEarned: 0 };
    }

    // Find the problem
    const problem = dailySet.problems.find((p) => p.id === problemId);
    if (!problem) {
      return { success: false, isCorrect: null, xpEarned: 0 };
    }

    // Determine if answer is correct (simple text comparison for now)
    // TODO: Add AI verification for image uploads
    let isCorrect: boolean | null = null;
    if (!isSkipped && answerText) {
      isCorrect = this.checkAnswer(answerText, problem.correctAnswer);
    }

    // Calculate XP
    const xpEarned = isCorrect ? problem.xpReward : 0;

    // Create attempt record
    const attempt: Omit<ProblemAttempt, "id"> = {
      dailySetId: dailySetId,
      problemId,
      userId,
      answerType: isSkipped ? "skipped" : answerImageUrl ? "image" : "text",
      answerText: answerText || undefined,
      answerImageUrl: answerImageUrl || undefined,
      isCorrect,
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.problemAttempts,
      ID.unique(),
      attempt
    );

    // Update daily set progress
    const newCompletedCount = dailySet.completedCount + 1;
    const isSetCompleted = newCompletedCount >= dailySet.totalProblems;

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.dailySets,
      dailySetId,
      {
        completedCount: newCompletedCount,
        currentIndex: Math.min(
          dailySet.currentIndex + 1,
          dailySet.totalProblems - 1
        ),
        xpEarned: dailySet.xpEarned + xpEarned,
        isCompleted: isSetCompleted,
        completedAt: isSetCompleted ? new Date().toISOString() : null,
      }
    );

    // Update topic progress in skill tree
    if (isCorrect !== null) {
      await SkillTreeService.updateProgress(userId, problem.topicId, isCorrect);
    }

    // Sync XP to user profile
    if (xpEarned > 0) {
      await UserProfileService.syncUserXp(userId, xpEarned);
    }

    // Update streak when daily set is completed
    if (isSetCompleted) {
      await UserProfileService.updateStreak(userId);
    }

    return { success: true, isCorrect, xpEarned };
  }

  /**
   * Get attempts for a daily set
   */
  static async getAttempts(
    userId: string,
    dailySetId: string
  ): Promise<ProblemAttempt[]> {
    const { databases } = await createAdminClient();

    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.problemAttempts
      );

      return response.documents
        .filter((d) => d.userId === userId && d.dailySetId === dailySetId)
        .map((d) => ({
          id: d.$id,
          dailySetId: d.dailySetId,
          problemId: d.problemId,
          userId: d.userId,
          answerType: d.answerType,
          answerText: d.answerText,
          answerImageUrl: d.answerImageUrl,
          isCorrect: d.isCorrect,
          aiFeedback: d.aiFeedback,
          aiFeedbackHe: d.aiFeedbackHe,
          startedAt: d.startedAt,
          submittedAt: d.submittedAt,
        }));
    } catch {
      return [];
    }
  }

  // === Private helper methods ===

  private static async getDailySetById(id: string): Promise<DailySet | null> {
    const { databases } = await createAdminClient();

    try {
      const doc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.dailySets,
        id
      ) as unknown as DailySetDocument;
      return this.documentToDailySet(doc);
    } catch {
      return null;
    }
  }

  private static documentToDailySet(doc: DailySetDocument): DailySet {
    return {
      id: doc.$id,
      userId: doc.userId,
      date: doc.date,
      problems: JSON.parse(doc.problems || "[]") as Problem[],
      currentIndex: doc.currentIndex,
      completedCount: doc.completedCount,
      totalProblems: doc.totalProblems,
      isCompleted: doc.isCompleted,
      completedAt: doc.completedAt,
      xpEarned: doc.xpEarned,
      focusTopicId: doc.focusTopicId,
      focusTopicName: doc.focusTopicName,
    };
  }

  private static selectReviewTopic(
    skillTree: SkillTreeState,
    _config: DailySetConfig
  ): TopicWithProgress | null {
    // Find a mastered topic that hasn't been practiced recently
    const masteredTopics = skillTree.branches
      .flatMap((b) => b.topics)
      .filter((t) => t.status === "mastered" || t.mastery >= 50);

    if (masteredTopics.length === 0) return null;

    // Sort by last practiced (oldest first)
    const sorted = masteredTopics.sort((a, b) => {
      const aDate = a.progress?.lastPracticed || "1970-01-01";
      const bDate = b.progress?.lastPracticed || "1970-01-01";
      return aDate.localeCompare(bDate);
    });

    return sorted[0];
  }

  private static selectFoundationTopic(focusTopicId: string): Topic | null {
    const topic = getTopicById(focusTopicId);
    if (!topic || topic.prerequisites.length === 0) return null;

    // Get a random prerequisite
    const prereqId =
      topic.prerequisites[
        Math.floor(Math.random() * topic.prerequisites.length)
      ];
    return getTopicById(prereqId) || null;
  }

  /**
   * Create a problem - uses AI generation if enabled, otherwise placeholder
   */
  private static async createProblemAsync(
    topicId: string,
    slot: ProblemSlot,
    difficulty: Difficulty,
    index: number,
    useAI: boolean = false
  ): Promise<Problem> {
    const topic = getTopicById(topicId) || TOPICS[0];

    // Use AI generation if enabled and API key is available
    if (useAI && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        const aiQuestion = await generateQuestionWithRetry({
          topicId: topic.id,
          difficulty,
        });

        return {
          id: `problem_${Date.now()}_${index}`,
          topicId: topic.id,
          topicName: topic.name,
          topicNameHe: topic.nameHe,
          slot,
          difficulty,
          questionText: aiQuestion.questionText,
          questionTextHe: aiQuestion.questionTextHe,
          questionLatex: "", // AI doesn't generate LaTeX separately
          correctAnswer: aiQuestion.correctAnswer,
          solutionSteps: aiQuestion.solutionSteps,
          solutionStepsHe: aiQuestion.solutionStepsHe,
          hint: aiQuestion.hint,
          hintHe: aiQuestion.hintHe,
          estimatedMinutes: aiQuestion.estimatedMinutes,
          xpReward: XP_REWARDS[difficulty],
        };
      } catch (error) {
        console.error("AI question generation failed, using placeholder:", error);
        // Fall through to placeholder generation
      }
    }

    // Fallback to placeholder problem
    return this.createProblemPlaceholder(topicId, slot, difficulty, index);
  }

  /**
   * Create a placeholder problem (no AI)
   */
  private static createProblemPlaceholder(
    topicId: string,
    slot: ProblemSlot,
    difficulty: Difficulty,
    index: number
  ): Problem {
    const topic = getTopicById(topicId) || TOPICS[0];

    return {
      id: `problem_${Date.now()}_${index}`,
      topicId: topic.id,
      topicName: topic.name,
      topicNameHe: topic.nameHe,
      slot,
      difficulty,
      questionText: this.generatePlaceholderQuestion(topic, difficulty),
      questionTextHe: this.generatePlaceholderQuestionHe(topic, difficulty),
      questionLatex: this.generatePlaceholderLatex(topic, difficulty),
      correctAnswer: this.generatePlaceholderAnswer(topic, difficulty),
      solutionSteps: [
        "Step 1: Identify the problem type",
        "Step 2: Apply the appropriate method",
        "Step 3: Simplify and solve",
      ],
      solutionStepsHe: [
        "שלב 1: זהה את סוג הבעיה",
        "שלב 2: החל את השיטה המתאימה",
        "שלב 3: פשט ופתור",
      ],
      hint: `Hint: This is a ${topic.name} problem.`,
      hintHe: `רמז: זוהי בעיית ${topic.nameHe}.`,
      estimatedMinutes: difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5,
      xpReward: XP_REWARDS[difficulty],
    };
  }

  /**
   * Synchronous createProblem for backward compatibility
   */
  private static createProblem(
    topicId: string,
    slot: ProblemSlot,
    difficulty: Difficulty,
    index: number
  ): Problem {
    return this.createProblemPlaceholder(topicId, slot, difficulty, index);
  }

  private static generatePlaceholderQuestion(
    topic: Topic,
    difficulty: Difficulty
  ): string {
    const templates: Record<string, string[]> = {
      "order-of-operations": [
        "Evaluate: 3 + 4 × 2",
        "Evaluate: (8 + 2) × 5 - 3",
        "Evaluate: 2³ + 4 × (6 - 2)",
      ],
      "basic-equations": [
        "Solve for x: x + 5 = 12",
        "Solve for x: 2x - 3 = 7",
        "Solve for x: 3x + 4 = 2x + 9",
      ],
      "linear-equations-one-var": [
        "Solve: 2x + 5 = 13",
        "Solve: 3(x - 2) = 12",
        "Solve: 4x - 7 = 2x + 9",
      ],
      "factoring-basics": [
        "Factor: x² - 9",
        "Factor: 2x² + 6x",
        "Factor: x² - 4x + 4",
      ],
      "factoring-trinomials": [
        "Factor: x² + 5x + 6",
        "Factor: x² + 7x + 12",
        "Factor: x² - x - 6",
      ],
      "quadratic-by-factoring": [
        "Solve: x² + 5x + 6 = 0",
        "Solve: x² - 4x - 5 = 0",
        "Solve: x² + 2x - 15 = 0",
      ],
      "quadratic-formula": [
        "Solve using the quadratic formula: x² + 2x - 3 = 0",
        "Solve: 2x² - 5x + 2 = 0",
        "Solve: x² - 4x + 1 = 0",
      ],
    };

    const questions = templates[topic.id] || [
      `Solve this ${topic.name} problem (${difficulty})`,
    ];
    const idx =
      difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;
    return questions[Math.min(idx, questions.length - 1)];
  }

  private static generatePlaceholderQuestionHe(
    topic: Topic,
    difficulty: Difficulty
  ): string {
    return `פתור בעיה ב${topic.nameHe} (${
      difficulty === "easy" ? "קל" : difficulty === "medium" ? "בינוני" : "קשה"
    })`;
  }

  private static generatePlaceholderLatex(
    topic: Topic,
    _difficulty: Difficulty
  ): string {
    const templates: Record<string, string> = {
      "factoring-trinomials": "x^2 + 7x + 12",
      "quadratic-formula": "x^2 + 2x - 3 = 0",
      "quadratic-by-factoring": "x^2 + 5x + 6 = 0",
    };
    return templates[topic.id] || "";
  }

  private static generatePlaceholderAnswer(
    topic: Topic,
    difficulty: Difficulty
  ): string {
    const answers: Record<string, string[]> = {
      "order-of-operations": ["11", "47", "40"],
      "basic-equations": ["7", "5", "5"],
      "linear-equations-one-var": ["4", "6", "8"],
      "factoring-basics": ["(x+3)(x-3)", "2x(x+3)", "(x-2)²"],
      "factoring-trinomials": ["(x+2)(x+3)", "(x+3)(x+4)", "(x-3)(x+2)"],
      "quadratic-by-factoring": ["x=-2, x=-3", "x=-1, x=5", "x=-5, x=3"],
      "quadratic-formula": ["x=1, x=-3", "x=2, x=0.5", "x=2±√3"],
    };
    const topicAnswers = answers[topic.id] || ["answer"];
    const idx = difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;
    return topicAnswers[Math.min(idx, topicAnswers.length - 1)];
  }

  private static checkAnswer(userAnswer: string, correctAnswer: string): boolean {
    // Simple comparison - normalize and compare
    const normalize = (s: string) =>
      s.toLowerCase().replace(/\s+/g, "").replace(/\*/g, "");
    return normalize(userAnswer) === normalize(correctAnswer);
  }

  /**
   * Fetch exercises from the pre-seeded bank for a topic
   */
  private static async fetchExercisesFromBank(
    topicId: string,
    difficulty: Difficulty,
    limit: number = 1,
    excludeIds: string[] = []
  ): Promise<Exercise[]> {
    try {
      const { databases } = await createAdminClient();

      const queries: string[] = [
        Query.equal("topicId", topicId),
        Query.equal("difficulty", difficulty),
        Query.orderAsc("timesUsed"), // Prefer less-used questions
        Query.limit(limit * 3), // Fetch more to filter
      ];

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.exercises,
        queries
      );

      // Filter out excluded IDs and limit
      const filtered = response.documents
        .filter((doc) => !excludeIds.includes(doc.$id))
        .slice(0, limit);

      return filtered as unknown as Exercise[];
    } catch (error) {
      console.warn("Failed to fetch exercises from bank:", error);
      return [];
    }
  }

  /**
   * Convert an Exercise from the bank to a Problem for daily sets
   */
  private static exerciseToProblem(
    exercise: Exercise,
    slot: ProblemSlot,
    _index: number
  ): Problem {
    const topic = getTopicById(exercise.topicId) || TOPICS[0];

    return {
      id: exercise.$id, // Use the exercise ID
      topicId: exercise.topicId,
      topicName: topic.name,
      topicNameHe: topic.nameHe,
      slot,
      difficulty: exercise.difficulty,
      // Map from actual DB field names
      questionText: exercise.question,
      questionTextHe: exercise.questionHe || exercise.question,
      questionLatex: "", // Can be extracted from questionText if needed
      correctAnswer: exercise.answer || "",
      solutionSteps: [], // Fetched from exercise_solutions if needed
      solutionStepsHe: [],
      hint: exercise.tip || "",
      hintHe: exercise.tipHe || exercise.tip || "",
      estimatedMinutes: exercise.estimatedMinutes || 5,
      xpReward: exercise.xpReward,
    };
  }

  /**
   * Mark exercises as used (increment timesUsed counter)
   */
  private static async markExercisesUsed(exerciseIds: string[]): Promise<void> {
    try {
      const { databases } = await createAdminClient();

      await Promise.all(
        exerciseIds.map(async (id) => {
          try {
            const doc = await databases.getDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.exercises,
              id
            );
            await databases.updateDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.exercises,
              id,
              { timesUsed: (doc.timesUsed || 0) + 1 }
            );
          } catch {
            // Ignore individual update failures
          }
        })
      );
    } catch (error) {
      console.warn("Failed to mark exercises as used:", error);
    }
  }

  /**
   * Analyze an image answer using AI
   */
  static async analyzeImageAnswer(
    imageUrl: string,
    questionText: string,
    correctAnswer: string,
    locale: "en" | "he" = "en"
  ): Promise<{
    isCorrect: boolean | null;
    feedback: string;
    extractedAnswer: string | null;
  }> {
    // Check if AI is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return {
        isCorrect: null,
        feedback: "Image analysis not available. Please enter your answer manually.",
        extractedAnswer: null,
      };
    }

    try {
      const analysis = await analyzeHandwrittenSolution({
        imageUrl,
        questionText,
        correctAnswer,
        locale,
      });

      return {
        isCorrect: analysis.isCorrect,
        feedback: analysis.feedback,
        extractedAnswer: analysis.extractedAnswer,
      };
    } catch (error) {
      console.error("Image analysis failed:", error);
      return {
        isCorrect: null,
        feedback: "Could not analyze image. Please try again or enter your answer manually.",
        extractedAnswer: null,
      };
    }
  }
}
