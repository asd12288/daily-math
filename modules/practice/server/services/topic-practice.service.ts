// modules/practice/server/services/topic-practice.service.ts
// Service for on-demand topic practice sessions

import { createAdminClient } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { SkillTreeService } from "@/modules/skill-tree/server/services/skill-tree.service";
import { UserProfileService } from "@/modules/gamification/server/services/user-profile.service";
import { getTopicById, TOPICS } from "@/modules/skill-tree/config/topics";
import type { Problem } from "../../types";
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
   */
  static async submitAnswer(
    userId: string,
    sessionId: string,
    problemId: string,
    answerText: string | null,
    isSkipped: boolean
  ): Promise<{ success: boolean; isCorrect: boolean | null; xpEarned: number }> {
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

    return { success: true, isCorrect, xpEarned };
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
    _index: number
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
