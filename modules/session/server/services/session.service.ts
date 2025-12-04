// modules/session/server/services/session.service.ts
// Service for managing practice sessions

import { createAdminClient } from "@/lib/appwrite/server";
import { Query, ID } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { SESSION_XP } from "../../config/constants";
import {
  adaptTopicExercise,
  adaptHomeworkQuestion,
  groupHomeworkQuestions,
  filterByDifficulty,
  selectRandomQuestions,
  calculateTotalPotentialXp,
} from "../../lib/adapters";
import type {
  Session,
  SessionQuestion,
  SessionQuestionGroup,
  SessionSource,
  SessionMode,
  SessionFilters,
  SessionResults,
  ActiveSession,
  TopicExercise,
  HomeworkQuestionRaw,
  SessionDifficulty,
} from "../../types/session.types";
import type { CreateSessionInput } from "../../lib/validation";

const { databaseId, collections } = APPWRITE_CONFIG;

/**
 * Parse exercise solution steps from JSON
 */
function parseSolutionSteps(stepsJson: string | undefined): string[] {
  if (!stepsJson) return [];
  try {
    return JSON.parse(stepsJson);
  } catch {
    return [];
  }
}

/**
 * Session document as stored in database
 * @internal Used for type reference in database operations
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface _SessionDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  source: SessionSource;
  sourceId: string;
  sourceName: string;
  sourceNameHe?: string;
  mode: SessionMode;
  questionsData: string; // JSON string of questions
  questionGroupsData?: string; // JSON string of groups
  hasGroups: boolean;
  currentIndex: number;
  viewedQuestionIds: string; // JSON array
  viewedCount: number;
  totalQuestions: number;
  xpEarned: number;
  isCompleted: boolean;
  filtersData: string; // JSON string of filters
  startedAt: string;
  completedAt?: string;
  lastActivityAt: string;
}

/**
 * Parse session document from Appwrite
 * Handles both new unified fields and legacy field names
 */
function parseSessionDocument(doc: Record<string, unknown>): Session {
  // Try new field first, fall back to legacy field
  const questionsDataStr = (doc.questionsData as string) || (doc.problems as string) || "[]";
  const questions: SessionQuestion[] = JSON.parse(questionsDataStr);
  const questionGroups: SessionQuestionGroup[] | undefined = doc.questionGroupsData
    ? JSON.parse(doc.questionGroupsData as string)
    : undefined;
  const filters: SessionFilters = JSON.parse((doc.filtersData as string) || "{}");

  // Determine source from new field or derive from legacy topicId
  let source: SessionSource = (doc.source as SessionSource) || "topic";
  let sourceId = (doc.sourceId as string) || (doc.topicId as string) || "";

  // If using legacy topicId and it starts with "homework_", extract the real ID
  if (!doc.source && doc.topicId && (doc.topicId as string).startsWith("homework_")) {
    source = "homework";
    sourceId = (doc.topicId as string).replace("homework_", "");
  }

  return {
    id: doc.$id as string,
    userId: doc.userId as string,
    source,
    sourceId,
    sourceName: (doc.sourceName as string) || (doc.topicName as string) || "",
    sourceNameHe: (doc.sourceNameHe as string) || (doc.topicNameHe as string) || undefined,
    mode: (doc.mode as SessionMode) || "learn",
    questions,
    questionGroups,
    hasGroups: (doc.hasGroups as boolean) || false,
    currentIndex: (doc.currentIndex as number) || 0,
    viewedCount: (doc.viewedCount as number) || (doc.completedCount as number) || 0,
    totalQuestions: (doc.totalQuestions as number) || (doc.totalProblems as number) || 0,
    xpEarned: (doc.xpEarned as number) || 0,
    isCompleted: (doc.isCompleted as boolean) || false,
    filters,
    startedAt: (doc.startedAt as string) || (doc.createdAt as string) || (doc.$createdAt as string),
    completedAt: (doc.completedAt as string) || undefined,
    lastActivityAt: (doc.lastActivityAt as string) || (doc.$updatedAt as string),
  };
}

/**
 * Session Service
 * Handles CRUD operations for practice sessions
 */
export class SessionService {
  /**
   * Create a new session
   */
  static async createSession(
    userId: string,
    input: CreateSessionInput,
    locale: "en" | "he" = "en"
  ): Promise<Session> {
    const { source, sourceId, mode, filters } = input;
    const { databases } = await createAdminClient();

    // Fetch questions based on source
    let questions: SessionQuestion[] = [];
    let sourceName = "";
    let sourceNameHe: string | undefined;
    let hasGroups = false;
    let questionGroups: SessionQuestionGroup[] | undefined;

    // Legacy fields for backward compatibility (required in old schema)
    let topicId = sourceId;
    let topicName = "";
    let topicNameHe = "";

    if (source === "topic") {
      // Fetch topic info
      const topic = await databases.getDocument(
        databaseId,
        collections.topics,
        sourceId
      );
      sourceName = topic.name as string;
      sourceNameHe = topic.nameHe as string;

      // Set legacy fields for topic sessions
      topicId = sourceId;
      topicName = sourceName;
      topicNameHe = sourceNameHe || sourceName;

      // Fetch exercises for this topic
      const exercisesResponse = await databases.listDocuments(
        databaseId,
        collections.exercises,
        [
          Query.equal("topicId", sourceId),
          Query.equal("isActive", true),
          Query.limit(100),
        ]
      );

      // Convert to TopicExercise format and adapt
      const exercises: TopicExercise[] = exercisesResponse.documents.map((doc) => ({
        $id: doc.$id as string,
        topicId: doc.topicId as string,
        question: doc.question as string,
        questionHe: (doc.questionHe as string) || undefined,
        difficulty: doc.difficulty as SessionDifficulty,
        xpReward: doc.xpReward as number,
        estimatedMinutes: (doc.estimatedMinutes as number) || undefined,
        answer: (doc.answer as string) || undefined,
        answerType: doc.answerType as TopicExercise["answerType"],
        tip: (doc.tip as string) || undefined,
        tipHe: (doc.tipHe as string) || undefined,
        solutionSteps: parseSolutionSteps(doc.solution as string | undefined),
        solutionStepsHe: parseSolutionSteps(doc.solutionHe as string | undefined),
      }));

      questions = exercises.map((ex) => adaptTopicExercise(ex, mode, locale));
    } else if (source === "homework") {
      // Fetch homework info
      const homework = await databases.getDocument(
        databaseId,
        collections.homeworks,
        sourceId
      );
      sourceName = homework.title as string;

      // Set legacy fields for homework sessions (placeholder values for required fields)
      topicId = `homework_${sourceId}`;
      topicName = sourceName;
      topicNameHe = sourceName;

      // Fetch homework questions
      const questionsResponse = await databases.listDocuments(
        databaseId,
        collections.homeworkQuestions,
        [
          Query.equal("homeworkId", sourceId),
          Query.orderAsc("questionNumber"),
          Query.limit(100),
        ]
      );

      // Fetch solutions for these questions
      const questionIds = questionsResponse.documents.map((q) => q.$id);
      const solutionsResponse = questionIds.length > 0
        ? await databases.listDocuments(
            databaseId,
            collections.homeworkSolutions,
            [Query.equal("questionId", questionIds), Query.limit(100)]
          )
        : { documents: [] };

      // Map solutions by questionId
      const solutionsByQuestion = new Map<string, Record<string, unknown>>();
      for (const sol of solutionsResponse.documents) {
        solutionsByQuestion.set(sol.questionId as string, sol);
      }

      // Convert to HomeworkQuestionRaw format
      const homeworkQuestions: HomeworkQuestionRaw[] = questionsResponse.documents.map((doc) => {
        const sol = solutionsByQuestion.get(doc.$id as string);
        return {
          $id: doc.$id as string,
          homeworkId: doc.homeworkId as string,
          questionText: doc.questionText as string,
          questionTextHe: (doc.questionTextHe as string) || undefined,
          difficulty: (doc.difficulty as SessionDifficulty) || "medium",
          isSubQuestion: doc.isSubQuestion as boolean,
          parentQuestionId: (doc.parentQuestionId as string) || undefined,
          subQuestionLabel: (doc.subQuestionLabel as string) || undefined,
          parentContext: (doc.parentContext as string) || undefined,
          answer: (doc.answer as string) || "",
          solutionStatus: (doc.solutionStatus as HomeworkQuestionRaw["solutionStatus"]) || "pending",
          aiConfidence: (doc.aiConfidence as number) || undefined,
          solution: sol
            ? {
                solutionSteps: sol.solutionSteps as string,
                tip: (sol.tip as string) || undefined,
                tipHe: (sol.tipHe as string) || undefined,
              }
            : undefined,
        };
      });

      questions = homeworkQuestions.map((q) => adaptHomeworkQuestion(q, mode, locale));

      // Check if we have sub-questions
      const hasSubQuestions = questions.some((q) => q.isSubQuestion || q.parentId);
      if (hasSubQuestions) {
        hasGroups = true;
        questionGroups = groupHomeworkQuestions(questions);
      }
    }

    // Apply filters
    if (filters.difficulty && filters.difficulty !== "all") {
      questions = filterByDifficulty(questions, filters.difficulty);
    }

    // Select random questions up to count
    if (filters.count && filters.count < questions.length) {
      questions = selectRandomQuestions(questions, filters.count);
    }

    // Calculate total potential XP (available for future use)
    const _totalPotentialXp = calculateTotalPotentialXp(questions);
    void _totalPotentialXp;

    // Create session document
    const now = new Date().toISOString();
    const sessionDoc = await databases.createDocument(
      databaseId,
      collections.practiceSessions,
      ID.unique(),
      {
        // Legacy required fields (for backward compatibility)
        userId,
        topicId,
        topicName,
        topicNameHe,
        problems: JSON.stringify(questions), // Legacy field name
        totalProblems: questions.length, // Legacy field name
        currentIndex: 0,
        completedCount: 0, // Legacy field name
        xpEarned: 0,
        isCompleted: false,
        createdAt: now, // Legacy field name

        // New unified session fields
        source,
        sourceId,
        sourceName,
        sourceNameHe: sourceNameHe || null,
        mode,
        questionsData: JSON.stringify(questions),
        questionGroupsData: questionGroups ? JSON.stringify(questionGroups) : null,
        hasGroups,
        viewedQuestionIds: "[]",
        viewedCount: 0,
        totalQuestions: questions.length,
        filtersData: JSON.stringify(filters),
        startedAt: now,
        lastActivityAt: now,
      },
      [`read("user:${userId}")`, `update("user:${userId}")`, `delete("user:${userId}")`]
    );

    return parseSessionDocument(sessionDoc);
  }

  /**
   * Get a session by ID
   */
  static async getSession(sessionId: string): Promise<Session | null> {
    const { databases } = await createAdminClient();

    try {
      const doc = await databases.getDocument(
        databaseId,
        collections.practiceSessions,
        sessionId
      );
      return parseSessionDocument(doc);
    } catch {
      return null;
    }
  }

  /**
   * Mark a question as viewed and award XP
   */
  static async markQuestionViewed(
    sessionId: string,
    questionId: string,
    userId: string
  ): Promise<{ xpAwarded: number; session: Session }> {
    const { databases } = await createAdminClient();

    // Get current session
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Check ownership
    if (session.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Find the question
    const question = session.questions.find((q) => q.id === questionId);
    if (!question) {
      throw new Error("Question not found in session");
    }

    // Check if already viewed
    if (question.isViewed) {
      return { xpAwarded: 0, session };
    }

    // Award XP based on mode
    const xpAwarded = question.xpReward;

    // Update question as viewed
    const updatedQuestions = session.questions.map((q) =>
      q.id === questionId
        ? { ...q, isViewed: true, viewedAt: new Date().toISOString() }
        : q
    );

    // Update session
    const viewedIds: string[] = JSON.parse(
      (await databases.getDocument(databaseId, collections.practiceSessions, sessionId))
        .viewedQuestionIds as string || "[]"
    );
    viewedIds.push(questionId);

    await databases.updateDocument(
      databaseId,
      collections.practiceSessions,
      sessionId,
      {
        // Update both new and legacy fields
        questionsData: JSON.stringify(updatedQuestions),
        problems: JSON.stringify(updatedQuestions), // Legacy field
        viewedQuestionIds: JSON.stringify(viewedIds),
        viewedCount: viewedIds.length,
        completedCount: viewedIds.length, // Legacy field
        xpEarned: session.xpEarned + xpAwarded,
        lastActivityAt: new Date().toISOString(),
      }
    );

    // Update user profile XP
    await this.updateUserXp(userId, xpAwarded);

    // Return updated session
    const updatedSession = await this.getSession(sessionId);
    return { xpAwarded, session: updatedSession! };
  }

  /**
   * Navigate to a specific question index
   */
  static async navigateToIndex(
    sessionId: string,
    index: number,
    userId: string
  ): Promise<Session> {
    const { databases } = await createAdminClient();

    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (index < 0 || index >= session.totalQuestions) {
      throw new Error("Index out of bounds");
    }

    await databases.updateDocument(
      databaseId,
      collections.practiceSessions,
      sessionId,
      {
        currentIndex: index,
        lastActivityAt: new Date().toISOString(),
      }
    );

    const updatedSession = await this.getSession(sessionId);
    return updatedSession!;
  }

  /**
   * Complete a session
   */
  static async completeSession(
    sessionId: string,
    userId: string
  ): Promise<SessionResults> {
    const { databases } = await createAdminClient();

    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Calculate completion bonus
    const completionBonus =
      session.viewedCount === session.totalQuestions
        ? SESSION_XP.completionBonus
        : 0;

    // Calculate time spent
    const startTime = new Date(session.startedAt).getTime();
    const endTime = Date.now();
    const timeSpentSeconds = Math.round((endTime - startTime) / 1000);

    // Update session
    const now = new Date().toISOString();
    await databases.updateDocument(
      databaseId,
      collections.practiceSessions,
      sessionId,
      {
        isCompleted: true,
        completedAt: now,
        xpEarned: session.xpEarned + completionBonus,
        lastActivityAt: now,
      }
    );

    // Award completion bonus XP
    if (completionBonus > 0) {
      await this.updateUserXp(userId, completionBonus);
    }

    return {
      sessionId,
      totalQuestions: session.totalQuestions,
      viewedCount: session.viewedCount,
      xpEarned: session.xpEarned + completionBonus,
      xpBreakdown: {
        questionsXp: session.xpEarned,
        completionBonus,
      },
      timeSpentSeconds,
      source: {
        type: session.source,
        name: session.sourceName,
        nameHe: session.sourceNameHe,
      },
    };
  }

  /**
   * List active (incomplete) sessions for a user
   */
  static async listActiveSessions(
    userId: string,
    limit: number = 10
  ): Promise<ActiveSession[]> {
    const { databases } = await createAdminClient();

    const response = await databases.listDocuments(
      databaseId,
      collections.practiceSessions,
      [
        Query.equal("userId", userId),
        Query.equal("isCompleted", false),
        Query.orderDesc("lastActivityAt"),
        Query.limit(limit),
      ]
    );

    return response.documents.map((doc) => ({
      id: doc.$id as string,
      source: doc.source as SessionSource,
      sourceName: doc.sourceName as string,
      sourceNameHe: (doc.sourceNameHe as string) || undefined,
      viewedCount: doc.viewedCount as number,
      totalQuestions: doc.totalQuestions as number,
      xpEarned: doc.xpEarned as number,
      lastActivityAt: doc.lastActivityAt as string,
      isCompleted: doc.isCompleted as boolean,
    }));
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    const { databases } = await createAdminClient();

    const session = await this.getSession(sessionId);
    if (!session) {
      return false;
    }

    if (session.userId !== userId) {
      return false;
    }

    await databases.deleteDocument(
      databaseId,
      collections.practiceSessions,
      sessionId
    );

    return true;
  }

  /**
   * Batch sync session state (optimized for instant UI)
   * Processes multiple actions in a single DB update
   */
  static async batchSync(
    sessionId: string,
    actions: Array<{
      type: "reveal" | "navigate" | "complete";
      questionId?: string;
      index?: number;
      timestamp: number;
    }>,
    userId: string
  ): Promise<{ xpAwarded: number }> {
    const { databases } = await createAdminClient();

    // Get current session (1 DB call)
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Sort actions by timestamp to process in order
    const sortedActions = [...actions].sort((a, b) => a.timestamp - b.timestamp);

    // Process actions locally
    let totalXpAwarded = 0;
    const currentViewedIds = new Set(
      session.questions.filter((q) => q.isViewed).map((q) => q.id)
    );
    const newViewedIds = new Set(currentViewedIds);
    let latestIndex = session.currentIndex;

    // Track which questions need to be updated
    const updatedQuestions = [...session.questions];

    for (const action of sortedActions) {
      if (action.type === "reveal" && action.questionId) {
        // Only award XP if not already viewed
        if (!newViewedIds.has(action.questionId)) {
          newViewedIds.add(action.questionId);

          // Find and update the question
          const questionIndex = updatedQuestions.findIndex(
            (q) => q.id === action.questionId
          );
          if (questionIndex !== -1) {
            const question = updatedQuestions[questionIndex];
            totalXpAwarded += question.xpReward;

            // Mark question as viewed
            updatedQuestions[questionIndex] = {
              ...question,
              isViewed: true,
              viewedAt: new Date(action.timestamp).toISOString(),
            };
          }
        }
      }

      if (action.type === "navigate" && action.index !== undefined) {
        // Validate index
        if (action.index >= 0 && action.index < session.totalQuestions) {
          latestIndex = action.index;
        }
      }
    }

    // Only update DB if there were changes
    const hasViewedChanges = newViewedIds.size > currentViewedIds.size;
    const hasNavigationChanges = latestIndex !== session.currentIndex;

    if (hasViewedChanges || hasNavigationChanges) {
      // Single DB update with all changes
      await databases.updateDocument(
        databaseId,
        collections.practiceSessions,
        sessionId,
        {
          // Update navigation
          currentIndex: latestIndex,

          // Update viewed state
          questionsData: JSON.stringify(updatedQuestions),
          problems: JSON.stringify(updatedQuestions), // Legacy field
          viewedQuestionIds: JSON.stringify([...newViewedIds]),
          viewedCount: newViewedIds.size,
          completedCount: newViewedIds.size, // Legacy field

          // Update XP
          xpEarned: session.xpEarned + totalXpAwarded,

          // Update timestamp
          lastActivityAt: new Date().toISOString(),
        }
      );
    }

    // Update user XP if any was awarded (separate DB call)
    if (totalXpAwarded > 0) {
      await this.updateUserXp(userId, totalXpAwarded);
    }

    return { xpAwarded: totalXpAwarded };
  }

  /**
   * Update user XP (helper)
   */
  private static async updateUserXp(userId: string, xpAmount: number): Promise<void> {
    if (xpAmount <= 0) return;

    const { databases } = await createAdminClient();

    try {
      // Get user profile
      const profileResponse = await databases.listDocuments(
        databaseId,
        collections.usersProfile,
        [Query.equal("userId", userId), Query.limit(1)]
      );

      if (profileResponse.documents.length === 0) {
        console.warn(`[SessionService] User profile not found for ${userId}`);
        return;
      }

      const profile = profileResponse.documents[0];
      const currentXp = (profile.totalXp as number) || 0;
      const newXp = currentXp + xpAmount;

      // Update profile
      await databases.updateDocument(
        databaseId,
        collections.usersProfile,
        profile.$id,
        {
          totalXp: newXp,
        }
      );
    } catch (error) {
      console.error("[SessionService] Failed to update user XP:", error);
    }
  }

  /**
   * Get source info (topic or homework name)
   */
  static async getSourceInfo(
    source: SessionSource,
    sourceId: string
  ): Promise<{ name: string; nameHe?: string } | null> {
    const { databases } = await createAdminClient();

    try {
      if (source === "topic") {
        const topic = await databases.getDocument(
          databaseId,
          collections.topics,
          sourceId
        );
        return {
          name: topic.name as string,
          nameHe: topic.nameHe as string,
        };
      } else if (source === "homework") {
        const homework = await databases.getDocument(
          databaseId,
          collections.homeworks,
          sourceId
        );
        return {
          name: homework.title as string,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get question count for a source (for UI display before session creation)
   */
  static async getAvailableQuestionCount(
    source: SessionSource,
    sourceId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _difficulty?: SessionDifficulty | "all"
  ): Promise<{ total: number; easy: number; medium: number; hard: number }> {
    const { databases } = await createAdminClient();

    const counts = { total: 0, easy: 0, medium: 0, hard: 0 };

    if (source === "topic") {
      const queries = [
        Query.equal("topicId", sourceId),
        Query.equal("isActive", true),
      ];

      const response = await databases.listDocuments(
        databaseId,
        collections.exercises,
        [...queries, Query.limit(1000)]
      );

      for (const doc of response.documents) {
        const diff = doc.difficulty as SessionDifficulty;
        counts.total++;
        if (diff === "easy") counts.easy++;
        else if (diff === "medium") counts.medium++;
        else if (diff === "hard") counts.hard++;
      }
    } else if (source === "homework") {
      const response = await databases.listDocuments(
        databaseId,
        collections.homeworkQuestions,
        [Query.equal("homeworkId", sourceId), Query.limit(1000)]
      );

      for (const doc of response.documents) {
        const diff = (doc.difficulty as SessionDifficulty) || "medium";
        counts.total++;
        if (diff === "easy") counts.easy++;
        else if (diff === "medium") counts.medium++;
        else if (diff === "hard") counts.hard++;
      }
    }

    return counts;
  }
}
