// modules/practice/server/services/daily-set.service.ts
// Daily set generation and management

import { createAdminClient } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { getUserLocalDate, DEFAULT_TIMEZONE } from "@/lib/utils/timezone";
import { SkillTreeService } from "@/modules/skill-tree/server/services/skill-tree.service";
import {
  UserProfileService,
  XP_BASE,
  calculateStreakBonus,
} from "@/modules/gamification/server/services/user-profile.service";
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
import { DEFAULT_DAILY_SET_CONFIG, XP_REWARDS, createDailySetConfig } from "../../types";
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
   * Uses user's timezone to determine "today" (default: Israel time)
   */
  static async getTodaySet(userId: string): Promise<DailySet | null> {
    const { databases } = await createAdminClient();

    // Fetch user's timezone from profile
    let userTimezone = DEFAULT_TIMEZONE;
    try {
      const profiles = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        [Query.equal("userId", userId), Query.limit(1)]
      );
      if (profiles.documents.length > 0) {
        userTimezone = profiles.documents[0].timezone || DEFAULT_TIMEZONE;
      }
    } catch {
      // Use default timezone if fetch fails
    }

    const today = getUserLocalDate(userTimezone);

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
    config?: DailySetConfig,
    useAI: boolean = true
  ): Promise<DailySet> {
    const { databases } = await createAdminClient();

    // Fetch user profile for preferences and enrolled courses
    let effectiveConfig = config;
    let enrolledCourses: string[] = [];

    try {
      const profiles = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        [Query.equal("userId", userId), Query.limit(1)]
      );

      if (profiles.documents.length > 0) {
        const profile = profiles.documents[0];

        // Get dailyExerciseCount if no config provided
        if (!effectiveConfig) {
          const exerciseCount = profile.dailyExerciseCount || 5;
          effectiveConfig = createDailySetConfig(exerciseCount);
        }

        // Parse enrolled courses for hybrid filtering
        try {
          enrolledCourses = JSON.parse(profile.enrolledCourses || "[]");
        } catch {
          enrolledCourses = [];
        }
      } else {
        effectiveConfig = effectiveConfig || DEFAULT_DAILY_SET_CONFIG;
      }
    } catch {
      effectiveConfig = effectiveConfig || DEFAULT_DAILY_SET_CONFIG;
    }

    // Get user's skill tree state (filtered by enrolled courses if any)
    const skillTree = enrolledCourses.length > 0
      ? await SkillTreeService.getSkillTreeStateForCourses(userId, enrolledCourses)
      : await SkillTreeService.getSkillTreeState(userId);


    // Determine focus topic (first in_progress or first not_started)
    let focusTopic = skillTree.branches
      .flatMap((b) => b.topics)
      .find((t) => t.status === "in_progress");

    if (!focusTopic) {
      focusTopic = skillTree.branches
        .flatMap((b) => b.topics)
        .find((t) => t.status === "not_started");
    }

    // Fallback to first topic if nothing found (all mastered = maintenance mode)
    if (!focusTopic) {
      const firstTopic = TOPICS[0];
      focusTopic = {
        ...firstTopic,
        progress: null,
        status: "not_started" as const,
        mastery: 0,
        canPractice: true as const,
        hasUnmetPrerequisites: false,
        recommendedFirst: [],
      };
    }

    let problems: Problem[] = [];

    // Try AI generation first (if enabled and API key available)
    if (useAI && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        const aiResult = await generateDailyProblems(userId, focusTopic.id, effectiveConfig);
        problems = aiResult.problems;
      } catch {
        // Fall through to exercise bank
      }
    }

    // Fallback to exercise bank if AI didn't generate problems
    if (problems.length === 0) {
      problems = await this.generateFromExerciseBank(userId, focusTopic.id, effectiveConfig);
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

    // Race condition check: verify no set was created while we were generating problems
    // This prevents duplicate sets from concurrent requests
    const existingSet = await this.getDailySetByDate(userId, date);
    if (existingSet) {
      return existingSet;
    }

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
   * Uses dynamic slot counts from config
   */
  private static async generateFromExerciseBank(
    userId: string,
    focusTopicId: string,
    config: DailySetConfig
  ): Promise<Problem[]> {
    const skillTree = await SkillTreeService.getSkillTreeState(userId);
    const usedExerciseIds: string[] = [];
    const problems: Problem[] = [];

    // Get topic selections
    const reviewTopic = this.selectReviewTopic(skillTree, config);
    const reviewTopicId = reviewTopic?.id || TOPICS[0].id;
    const foundationTopic = this.selectFoundationTopic(focusTopicId);
    const foundationTopicId = foundationTopic?.id || TOPICS[0].id;

    // Generate review slots (easy, from mastered topics)
    for (let i = 0; i < config.slots.review; i++) {
      const problem = await this.fetchProblemFromBank(
        reviewTopicId, "easy", "review", problems.length, usedExerciseIds
      );
      problems.push(problem);
      if (problem.id) usedExerciseIds.push(problem.id);
    }

    // Generate core slots (medium, from focus topic)
    for (let i = 0; i < config.slots.core; i++) {
      const problem = await this.fetchProblemFromBank(
        focusTopicId, "medium", "core", problems.length, usedExerciseIds
      );
      problems.push(problem);
      if (problem.id) usedExerciseIds.push(problem.id);
    }

    // Generate foundation slots (easy, from prerequisite topics)
    for (let i = 0; i < config.slots.foundation; i++) {
      const problem = await this.fetchProblemFromBank(
        foundationTopicId, "easy", "foundation", problems.length, usedExerciseIds
      );
      problems.push(problem);
      if (problem.id) usedExerciseIds.push(problem.id);
    }

    // Generate challenge slots (hard, from focus topic)
    for (let i = 0; i < config.slots.challenge; i++) {
      const problem = await this.fetchProblemFromBank(
        focusTopicId, "hard", "challenge", problems.length, usedExerciseIds
      );
      problems.push(problem);
      if (problem.id) usedExerciseIds.push(problem.id);
    }

    // Mark used exercises
    const bankExerciseIds = usedExerciseIds.filter(
      (id) => !id.startsWith("problem_") && !id.startsWith("placeholder_")
    );
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
  ): Promise<{
    success: boolean;
    isCorrect: boolean | null;
    xpEarned: number;
    alreadyAnswered?: boolean;
    aiFeedback?: string | null;
    extractedAnswer?: string | null;
    completionBonus?: number;
    streakBonus?: number;
  }> {
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

    // Check for existing attempt (prevent XP double-counting)
    try {
      const existingAttempts = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.problemAttempts,
        [
          Query.equal("userId", userId),
          Query.equal("dailySetId", dailySetId),
          Query.equal("problemId", problemId),
          Query.limit(1),
        ]
      );

      if (existingAttempts.documents.length > 0) {
        const existing = existingAttempts.documents[0];
        return {
          success: true,
          isCorrect: existing.isCorrect as boolean | null,
          xpEarned: 0, // No duplicate XP
          alreadyAnswered: true,
        };
      }
    } catch {
      // Continue with submission if check fails
    }

    // Determine if answer is correct
    let isCorrect: boolean | null = null;
    let aiFeedback: string | null = null;
    let extractedAnswer: string | null = null;

    // Get user's preferred locale for AI feedback
    let userLocale: "en" | "he" = "en";
    try {
      const profiles = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.usersProfile,
        [Query.equal("userId", userId), Query.limit(1)]
      );
      if (profiles.documents.length > 0) {
        const preferredLocale = profiles.documents[0].preferredLocale;
        if (preferredLocale === "he") {
          userLocale = "he";
        }
      }
    } catch {
      // Use default locale if fetch fails
    }

    if (!isSkipped) {
      if (answerImageUrl) {
        // Use AI to analyze handwritten answer from image
        try {
          const analysis = await this.analyzeImageAnswer(
            answerImageUrl,
            problem.questionText,
            problem.correctAnswer,
            userLocale
          );
          isCorrect = analysis.isCorrect;
          aiFeedback = analysis.feedback;
          extractedAnswer = analysis.extractedAnswer;
        } catch {
          // Fall back to null (unknown) if AI fails
        }
      } else if (answerText) {
        // Simple text comparison for manual text answers
        isCorrect = this.checkAnswer(answerText, problem.correctAnswer);
      }
    }

    // Calculate XP
    const xpEarned = isCorrect ? problem.xpReward : 0;

    // Create attempt record - use Appwrite field names
    const attemptData = {
      sessionId: dailySetId, // Use dailySetId as sessionId for daily sets
      dailySetId: dailySetId,
      problemId,
      userId,
      answerType: isSkipped ? "skipped" : answerImageUrl ? "image" : "text",
      answerText: answerText || extractedAnswer || null, // Store extracted answer if from image
      answerImageUrl: answerImageUrl || null,
      isCorrect,
      aiFeedback: aiFeedback || null,
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      xpEarned: isCorrect ? problem.xpReward : 0,
    };

    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.problemAttempts,
      ID.unique(),
      attemptData
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

    // Track total XP earned (question + bonuses)
    let totalXpEarned = xpEarned;

    // Sync question XP to user profile
    if (xpEarned > 0) {
      await UserProfileService.syncUserXp(userId, xpEarned);
    }

    // Handle daily set completion bonuses
    let completionBonus = 0;
    let streakBonus = 0;

    if (isSetCompleted) {
      // Update streak and get the new count
      const streakResult = await UserProfileService.updateStreak(userId);

      if (streakResult.success) {
        // Calculate and award streak bonus XP (5 XP per day in streak, max 50)
        streakBonus = calculateStreakBonus(streakResult.currentStreak);

        // Daily set completion bonus (25 XP)
        completionBonus = XP_BASE.dailySetComplete;

        // Add bonuses to user XP
        const bonusXp = completionBonus + streakBonus;
        if (bonusXp > 0) {
          await UserProfileService.syncUserXp(userId, bonusXp);
          totalXpEarned += bonusXp;

          // Update the daily set with the total XP including bonuses
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.dailySets,
            dailySetId,
            {
              xpEarned: dailySet.xpEarned + xpEarned + bonusXp,
            }
          );
        }

      }
    }

    return {
      success: true,
      isCorrect,
      xpEarned: totalXpEarned,
      aiFeedback,
      extractedAnswer,
      completionBonus: isSetCompleted ? completionBonus : undefined,
      streakBonus: isSetCompleted ? streakBonus : undefined,
    };
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
          answerMethod: d.answerMethod,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    config: DailySetConfig
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
          answerType: aiQuestion.answerType,
          solutionSteps: aiQuestion.solutionSteps,
          solutionStepsHe: aiQuestion.solutionStepsHe,
          hint: aiQuestion.hint,
          hintHe: aiQuestion.hintHe,
          estimatedMinutes: aiQuestion.estimatedMinutes,
          xpReward: XP_REWARDS[difficulty],
        };
      } catch {
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
      answerType: "expression" as const,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    difficulty: Difficulty
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
    } catch {
      return [];
    }
  }

  /**
   * Convert an Exercise from the bank to a Problem for daily sets
   */
  private static exerciseToProblem(
    exercise: Exercise,
    slot: ProblemSlot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    index: number
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
      answerType: exercise.answerType,
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
    } catch {
      // Ignore failures
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
    } catch {
      return {
        isCorrect: null,
        feedback: "Could not analyze image. Please try again or enter your answer manually.",
        extractedAnswer: null,
      };
    }
  }
}
