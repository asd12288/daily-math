// modules/practice/server/services/topic-practice.service.ts
// Service for on-demand topic practice sessions

import { createAdminClient } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { SkillTreeService } from "@/modules/skill-tree/server/services/skill-tree.service";
import {
  UserProfileService,
  calculateStreakBonus,
  XP_BASE,
} from "@/modules/gamification/server/services/user-profile.service";
import { getTopicById, TOPICS } from "@/modules/skill-tree/config/topics";
import type { Problem, StuckInfo } from "../../types";
import { STUCK_THRESHOLD } from "../../types";
import type { Difficulty } from "@/modules/skill-tree/types";
import type { Exercise } from "@/modules/courses/types";
import type { Models } from "node-appwrite";

// Appwrite document type for practice sessions
interface PracticeSessionDocument extends Models.Document {
  userId: string;
  topicId: string;
  topicName: string;
  topicNameHe: string;
  problems: string;
  currentIndex: number;
  completedCount: number;
  totalProblems: number;
  isCompleted: boolean;
  completedAt: string | null;
  xpEarned: number;
  createdAt: string;
}

/**
 * Practice session for a specific topic
 */
export interface PracticeSession {
  id: string;
  userId: string;
  topicId: string;
  topicName: string;
  topicNameHe: string;
  problems: Problem[];
  currentIndex: number;
  completedCount: number;
  totalProblems: number;
  isCompleted: boolean;
  completedAt: string | null;
  xpEarned: number;
  createdAt: string;
}

/**
 * Service for on-demand topic practice
 */
export class TopicPracticeService {
  /**
   * Start a new practice session for a topic
   * Returns 5 questions: 2 easy, 2 medium, 1 hard
   */
  static async startSession(userId: string, topicId: string): Promise<PracticeSession | null> {
    const topic = getTopicById(topicId);
    if (!topic) {
      console.error(`Topic not found: ${topicId}`);
      return null;
    }

    const { databases } = await createAdminClient();

    // Fetch exercises from the bank
    const usedExerciseIds: string[] = [];
    const problems: Problem[] = [];

    // 2 easy questions
    const easyExercises = await this.fetchExercises(topicId, "easy", 2, usedExerciseIds);
    for (const ex of easyExercises) {
      problems.push(this.exerciseToProblem(ex, "core", problems.length));
      usedExerciseIds.push(ex.$id);
    }

    // 2 medium questions
    const mediumExercises = await this.fetchExercises(topicId, "medium", 2, usedExerciseIds);
    for (const ex of mediumExercises) {
      problems.push(this.exerciseToProblem(ex, "core", problems.length));
      usedExerciseIds.push(ex.$id);
    }

    // 1 hard question
    const hardExercises = await this.fetchExercises(topicId, "hard", 1, usedExerciseIds);
    for (const ex of hardExercises) {
      problems.push(this.exerciseToProblem(ex, "challenge", problems.length));
      usedExerciseIds.push(ex.$id);
    }

    // Shuffle the problems
    const shuffledProblems = this.shuffleArray(problems);

    // Check if we have any problems - return null if empty
    if (shuffledProblems.length === 0) {
      console.warn(`No exercises available for topic: ${topicId}`);
      return null;
    }

    // Mark exercises as used
    if (usedExerciseIds.length > 0) {
      await this.markExercisesUsed(usedExerciseIds);
    }

    // Create session in database
    const session: Omit<PracticeSession, "id"> = {
      userId,
      topicId,
      topicName: topic.name,
      topicNameHe: topic.nameHe,
      problems: shuffledProblems,
      currentIndex: 0,
      completedCount: 0,
      totalProblems: shuffledProblems.length,
      isCompleted: false,
      completedAt: null,
      xpEarned: 0,
      createdAt: new Date().toISOString(),
    };

    const doc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.practiceSessions,
      ID.unique(),
      {
        userId: session.userId,
        topicId: session.topicId,
        topicName: session.topicName,
        topicNameHe: session.topicNameHe,
        problems: JSON.stringify(session.problems),
        currentIndex: session.currentIndex,
        completedCount: session.completedCount,
        totalProblems: session.totalProblems,
        isCompleted: session.isCompleted,
        completedAt: session.completedAt,
        xpEarned: session.xpEarned,
        createdAt: session.createdAt,
      }
    );

    return { ...session, id: doc.$id };
  }

  /**
   * Get a practice session by ID
   */
  static async getSession(sessionId: string): Promise<PracticeSession | null> {
    const { databases } = await createAdminClient();

    try {
      const doc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.practiceSessions,
        sessionId
      ) as unknown as PracticeSessionDocument;
      return this.documentToSession(doc);
    } catch {
      return null;
    }
  }

  /**
   * Get active (incomplete) sessions for a user
   */
  static async getActiveSessions(userId: string): Promise<PracticeSession[]> {
    const { databases } = await createAdminClient();

    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.practiceSessions,
        [
          Query.equal("userId", userId),
          Query.equal("isCompleted", false),
          Query.orderDesc("createdAt"),
          Query.limit(10),
        ]
      );

      return response.documents.map((doc) => this.documentToSession(doc as unknown as PracticeSessionDocument));
    } catch {
      return [];
    }
  }

  /**
   * Get session history for a user (recent completed sessions)
   */
  static async getSessionHistory(
    userId: string,
    limit: number = 10
  ): Promise<PracticeSession[]> {
    const { databases } = await createAdminClient();

    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.practiceSessions,
        [
          Query.equal("userId", userId),
          Query.equal("isCompleted", true),
          Query.orderDesc("completedAt"),
          Query.limit(limit),
        ]
      );

      return response.documents.map((doc) => this.documentToSession(doc as unknown as PracticeSessionDocument));
    } catch {
      return [];
    }
  }

  /**
   * Complete a session with all results at once
   * Called after worksheet submission - syncs XP, updates streak, checks level up
   */
  static async completeSession(
    userId: string,
    sessionId: string,
    results: {
      totalXp: number;
      correctCount: number;
      incorrectCount: number;
      skippedCount: number;
      results: Array<{
        problemId: string;
        isCorrect: boolean;
        isSkipped: boolean;
        xpEarned: number;
      }>;
    }
  ): Promise<{
    success: boolean;
    totalXp: number;
    baseXp: number;
    streakBonus: number;
    perfectBonus: number;
    newStreak: number;
    leveledUp: boolean;
    newLevel: number;
    newLevelTitle: string;
  }> {
    const { databases } = await createAdminClient();

    // Get the session
    const session = await this.getSession(sessionId);
    if (!session || session.userId !== userId) {
      return {
        success: false,
        totalXp: 0,
        baseXp: 0,
        streakBonus: 0,
        perfectBonus: 0,
        newStreak: 0,
        leveledUp: false,
        newLevel: 1,
        newLevelTitle: "Beginner",
      };
    }

    // Calculate bonuses
    const baseXp = results.totalXp;

    // Update streak first to get current streak for bonus calculation
    const streakResult = await UserProfileService.updateStreak(userId);
    const currentStreak = streakResult.currentStreak;

    // Calculate streak bonus (5 XP per day, max 50)
    const streakBonus = calculateStreakBonus(currentStreak);

    // Perfect bonus if all answers correct
    const totalQuestions = results.correctCount + results.incorrectCount + results.skippedCount;
    const perfectBonus = results.correctCount === totalQuestions ? XP_BASE.perfectDayBonus : 0;

    // Total XP including bonuses
    const totalXpWithBonuses = baseXp + streakBonus + perfectBonus;

    // Sync XP to user profile and check for level up
    const xpResult = await UserProfileService.syncUserXp(userId, totalXpWithBonuses);

    // Update session as completed
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.practiceSessions,
      sessionId,
      {
        isCompleted: true,
        completedAt: new Date().toISOString(),
        xpEarned: totalXpWithBonuses,
        completedCount: totalQuestions,
      }
    );

    // Update skill tree progress for each problem
    for (const result of results.results) {
      if (!result.isSkipped) {
        const problem = session.problems.find((p) => p.id === result.problemId);
        if (problem) {
          await SkillTreeService.updateProgress(userId, problem.topicId, result.isCorrect);
        }
      }
    }

    // Get level title
    const { XP_LEVELS } = await import("@/modules/gamification/server/services/user-profile.service");
    const levelInfo = XP_LEVELS.find((l) => l.level === xpResult.newLevel) || XP_LEVELS[0];

    return {
      success: true,
      totalXp: totalXpWithBonuses,
      baseXp,
      streakBonus,
      perfectBonus,
      newStreak: currentStreak,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel,
      newLevelTitle: levelInfo.title,
    };
  }

  /**
   * Validate that a string is a valid Appwrite document ID
   * (max 36 chars, alphanumeric + period, hyphen, underscore, can't start with special char)
   */
  private static isValidDocumentId(id: string): boolean {
    if (!id || id.length > 36) return false;
    if (/^[.\-_]/.test(id)) return false;
    return /^[a-zA-Z0-9._-]+$/.test(id);
  }

  /**
   * Submit an answer for a practice session problem
   * Now includes stuck detection after consecutive wrong answers
   */
  static async submitAnswer(
    userId: string,
    sessionId: string,
    problemId: string,
    answerText: string | null,
    isSkipped: boolean
  ): Promise<{ success: boolean; isCorrect: boolean | null; xpEarned: number; stuckInfo?: StuckInfo }> {
    // Validate IDs before using them
    if (!this.isValidDocumentId(sessionId)) {
      console.error(`Invalid sessionId format: ${sessionId} (length: ${sessionId?.length})`);
      return { success: false, isCorrect: null, xpEarned: 0 };
    }
    if (!this.isValidDocumentId(problemId)) {
      console.error(`Invalid problemId format: ${problemId} (length: ${problemId?.length})`);
      return { success: false, isCorrect: null, xpEarned: 0 };
    }

    const { databases } = await createAdminClient();

    // Get the session
    const session = await this.getSession(sessionId);
    if (!session || session.userId !== userId) {
      return { success: false, isCorrect: null, xpEarned: 0 };
    }

    // Find the problem
    const problem = session.problems.find((p) => p.id === problemId);
    if (!problem) {
      return { success: false, isCorrect: null, xpEarned: 0 };
    }

    // Check answer
    let isCorrect: boolean | null = null;
    if (!isSkipped && answerText) {
      isCorrect = this.checkAnswer(answerText, problem.correctAnswer);
    }

    // Calculate XP
    const xpEarned = isCorrect ? problem.xpReward : 0;

    // Create attempt record in database
    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.problemAttempts,
      ID.unique(),
      {
        sessionId,
        problemId,
        userId,
        answerType: isSkipped ? "skipped" : "text",
        answerText: answerText || null,
        answerImageUrl: null,
        isCorrect,
        xpEarned,
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
      }
    );

    // Update session progress
    const newCompletedCount = session.completedCount + 1;
    const isSessionCompleted = newCompletedCount >= session.totalProblems;

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.practiceSessions,
      sessionId,
      {
        completedCount: newCompletedCount,
        currentIndex: Math.min(session.currentIndex + 1, session.totalProblems - 1),
        xpEarned: session.xpEarned + xpEarned,
        isCompleted: isSessionCompleted,
        completedAt: isSessionCompleted ? new Date().toISOString() : null,
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

    // Update streak when practice session is completed
    if (isSessionCompleted) {
      await UserProfileService.updateStreak(userId);
    }

    // Check for stuck detection if answer was wrong
    let stuckInfo: StuckInfo | undefined;
    if (isCorrect === false) {
      stuckInfo = await this.checkIfStuck(userId, problem.topicId);
    }

    return { success: true, isCorrect, xpEarned, stuckInfo };
  }

  /**
   * Check if user is stuck on a topic (5+ consecutive wrong answers)
   */
  static async checkIfStuck(userId: string, topicId: string): Promise<StuckInfo> {
    const { databases } = await createAdminClient();

    try {
      // Get recent attempts for this topic
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.problemAttempts,
        [
          Query.equal("userId", userId),
          Query.orderDesc("submittedAt"),
          Query.limit(20), // Look at recent attempts
        ]
      );

      // Count consecutive wrong answers on this topic
      let consecutiveWrong = 0;
      for (const doc of response.documents) {
        // We need to check if this attempt is for the same topic
        // Get the problem's topicId from the session or problem
        const session = await this.getSession(doc.sessionId);
        if (!session) continue;

        const problem = session.problems.find(p => p.id === doc.problemId);
        if (!problem || problem.topicId !== topicId) continue;

        if (doc.isCorrect === false) {
          consecutiveWrong++;
        } else if (doc.isCorrect === true) {
          break; // Stop at first correct answer
        }
        // Skip skipped answers for consecutive count
      }

      const isStuck = consecutiveWrong >= STUCK_THRESHOLD;
      const topic = getTopicById(topicId);

      // Generate suggestions based on how stuck they are
      let suggestions: string[] = [];
      let suggestionsHe: string[] = [];
      let recommendedAction: StuckInfo["recommendedAction"] = "continue";

      if (consecutiveWrong >= STUCK_THRESHOLD + 3) {
        // Very stuck (8+ wrong)
        suggestions = [
          "Take a short break and come back with fresh eyes",
          `Consider reviewing the prerequisites for "${topic?.name || "this topic"}"`,
          "Try watching a tutorial video on this concept",
        ];
        suggestionsHe = [
          "קח הפסקה קצרה וחזור עם מבט רענן",
          `שקול לחזור על הדרישות המקדימות של "${topic?.nameHe || "נושא זה"}"`,
          "נסה לצפות בסרטון הסבר על הנושא",
        ];
        recommendedAction = "take_break";
      } else if (consecutiveWrong >= STUCK_THRESHOLD + 1) {
        // Moderately stuck (6-7 wrong)
        suggestions = [
          "Try an easier problem first to build confidence",
          "Read the hints carefully before attempting",
          "Review the solution steps from previous problems",
        ];
        suggestionsHe = [
          "נסה שאלה קלה יותר קודם כדי לבנות ביטחון",
          "קרא את הרמזים בעיון לפני שתנסה",
          "עבור על שלבי הפתרון משאלות קודמות",
        ];
        recommendedAction = "try_easier";
      } else if (isStuck) {
        // Just stuck (5 wrong)
        suggestions = [
          "Don't give up! This is a challenging topic",
          "Use the hint button for guidance",
          "Focus on understanding, not just the answer",
        ];
        suggestionsHe = [
          "אל תוותר! זה נושא מאתגר",
          "השתמש בכפתור הרמז לעזרה",
          "התמקד בהבנה, לא רק בתשובה",
        ];
        recommendedAction = "review_hint";
      }

      return {
        isStuck,
        consecutiveWrong,
        suggestions,
        suggestionsHe,
        recommendedAction,
      };
    } catch (error) {
      console.error("Failed to check stuck status:", error);
      return {
        isStuck: false,
        consecutiveWrong: 0,
        suggestions: [],
        suggestionsHe: [],
        recommendedAction: "continue",
      };
    }
  }

  // === Private helper methods ===

  private static async fetchExercises(
    topicId: string,
    difficulty: Difficulty,
    limit: number,
    excludeIds: string[]
  ): Promise<Exercise[]> {
    try {
      const { databases } = await createAdminClient();

      const queries: string[] = [
        Query.equal("topicId", topicId),
        Query.equal("difficulty", difficulty),
        Query.orderAsc("timesUsed"),
        Query.limit(limit * 3),
      ];

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.exercises,
        queries
      );

      const filtered = response.documents
        .filter((doc) => !excludeIds.includes(doc.$id))
        .slice(0, limit);

      return filtered as unknown as Exercise[];
    } catch (error) {
      console.warn("Failed to fetch exercises:", error);
      return [];
    }
  }

  private static exerciseToProblem(
    exercise: Exercise,
    slot: "core" | "challenge",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    index: number
  ): Problem {
    const topic = getTopicById(exercise.topicId) || TOPICS[0];

    return {
      id: exercise.$id,
      topicId: exercise.topicId,
      topicName: topic.name,
      topicNameHe: topic.nameHe,
      slot,
      difficulty: exercise.difficulty,
      // Map from actual DB field names
      questionText: exercise.question,
      questionTextHe: exercise.questionHe || exercise.question,
      questionLatex: "",
      correctAnswer: exercise.answer || "",
      answerType: exercise.answerType,
      solutionSteps: [], // Will be fetched from exercise_solutions if needed
      solutionStepsHe: [],
      hint: exercise.tip || "",
      hintHe: exercise.tipHe || exercise.tip || "",
      estimatedMinutes: exercise.estimatedMinutes || 5,
      xpReward: exercise.xpReward || 10,
    };
  }

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
            // Ignore individual failures
          }
        })
      );
    } catch (error) {
      console.warn("Failed to mark exercises used:", error);
    }
  }

  private static documentToSession(doc: PracticeSessionDocument): PracticeSession {
    return {
      id: doc.$id,
      userId: doc.userId,
      topicId: doc.topicId,
      topicName: doc.topicName,
      topicNameHe: doc.topicNameHe,
      problems: JSON.parse(doc.problems || "[]") as Problem[],
      currentIndex: doc.currentIndex,
      completedCount: doc.completedCount,
      totalProblems: doc.totalProblems,
      isCompleted: doc.isCompleted,
      completedAt: doc.completedAt,
      xpEarned: doc.xpEarned,
      createdAt: doc.createdAt,
    };
  }

  private static checkAnswer(userAnswer: string, correctAnswer: string): boolean {
    const normalize = (s: string) =>
      s.toLowerCase().replace(/\s+/g, "").replace(/\*/g, "");
    return normalize(userAnswer) === normalize(correctAnswer);
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
