// modules/homework/server/services/homework.service.ts
// Service for managing homework CRUD operations

import { createAdminClient } from "@/lib/appwrite/server";
import { Query, ID } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { XP_PER_QUESTION_VIEW } from "../../config/constants";
import type {
  Homework,
  HomeworkQuestion,
  HomeworkSolution,
  HomeworkWithQuestions,
  HomeworkListItem,
  HomeworkStatus,
  ProcessingStatus,
  ViewQuestionResult,
  HomeworkQuestionWithSolution,
  QuestionGroup,
  HomeworkFileType,
  SolutionStatus,
  GenerateSolutionResult,
  ClassifiedQuestion,
  QuestionClassification,
  AISuggestions,
} from "../../types";
import { UserProfileService } from "@/modules/gamification/server/services/user-profile.service";
import { AdaptiveSolvingService } from "./adaptive-solving.service";

/**
 * Homework Service
 * Handles all CRUD operations for homework, questions, and solutions
 */
export class HomeworkService {
  /**
   * Create a new homework record
   */
  static async createHomework(params: {
    userId: string;
    title: string;
    originalFileName: string;
    fileId: string;
    fileSize: number;
    pageCount: number;
    fileType: HomeworkFileType;
  }): Promise<Homework> {
    const { databases } = await createAdminClient();

    const homework = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.homeworks,
      ID.unique(),
      {
        userId: params.userId,
        title: params.title,
        originalFileName: params.originalFileName,
        fileId: params.fileId,
        fileSize: params.fileSize,
        pageCount: params.pageCount,
        fileType: params.fileType,
        status: "uploading" as HomeworkStatus,
        questionCount: 0,
        viewedCount: 0,
        xpEarned: 0,
      },
      // Permission for the user to read/update/delete their own homework
      [`read("user:${params.userId}")`, `update("user:${params.userId}")`, `delete("user:${params.userId}")`]
    );

    return homework as unknown as Homework;
  }

  /**
   * Update homework status
   */
  static async updateHomeworkStatus(
    homeworkId: string,
    status: HomeworkStatus,
    additionalData?: {
      errorMessage?: string;
      questionCount?: number;
      detectedLanguage?: "en" | "he" | "mixed";
      processingStartedAt?: string;
      processingCompletedAt?: string;
    }
  ): Promise<void> {
    const { databases } = await createAdminClient();

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.homeworks,
      homeworkId,
      {
        status,
        ...additionalData,
      }
    );

  }

  /**
   * Get homework by ID
   */
  static async getHomeworkById(homeworkId: string): Promise<Homework | null> {
    const { databases } = await createAdminClient();

    try {
      const homework = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.homeworks,
        homeworkId
      );
      return homework as unknown as Homework;
    } catch {
      return null;
    }
  }

  /**
   * Get homework with all questions and solutions
   */
  static async getHomeworkWithQuestions(
    homeworkId: string
  ): Promise<HomeworkWithQuestions | null> {
    const { databases } = await createAdminClient();

    try {
      // Get homework
      const homework = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.homeworks,
        homeworkId
      );

      // Get all questions for this homework
      const questionsResult = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.homeworkQuestions,
        [
          Query.equal("homeworkId", homeworkId),
          Query.orderAsc("orderIndex"),
          Query.limit(100),
        ]
      );

      const questions = questionsResult.documents as unknown as HomeworkQuestion[];

      // Get solutions for all questions
      const questionIds = questions.map((q) => q.$id);
      let solutions: HomeworkSolution[] = [];

      if (questionIds.length > 0) {
        const solutionsResult = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.homeworkSolutions,
          [Query.equal("questionId", questionIds), Query.limit(100)]
        );
        solutions = solutionsResult.documents as unknown as HomeworkSolution[];
      }

      // Map solutions to questions
      const solutionMap = new Map(solutions.map((s) => [s.questionId, s]));
      const questionsWithSolutions: HomeworkQuestionWithSolution[] = questions.map(
        (q) => ({
          ...q,
          solution: solutionMap.get(q.$id),
        })
      );

      return {
        ...(homework as unknown as Homework),
        questions: questionsWithSolutions,
      };
    } catch {
      return null;
    }
  }

  /**
   * Group questions into hierarchical groups (parent + sub-questions)
   * Used for UI display of physics/math questions with sub-parts
   */
  static groupQuestionsByHierarchy(
    questions: HomeworkQuestionWithSolution[]
  ): QuestionGroup[] {
    const groups: QuestionGroup[] = [];
    const questionMap = new Map<string, HomeworkQuestionWithSolution>();

    // Build a map for quick lookup
    for (const q of questions) {
      questionMap.set(q.$id, q);
    }

    // Collect parent questions and standalone questions
    const parentQuestions = questions.filter((q) => !q.isSubQuestion);
    const subQuestions = questions.filter((q) => q.isSubQuestion);

    // Create groups for each parent question
    for (const parent of parentQuestions) {
      // Find all sub-questions that belong to this parent
      const children = subQuestions
        .filter((sq) => sq.parentQuestionId === parent.$id)
        .sort((a, b) => a.orderIndex - b.orderIndex);

      groups.push({
        parentQuestion: parent,
        subQuestions: children,
      });
    }

    // Sort groups by parent question order
    groups.sort((a, b) => a.parentQuestion.orderIndex - b.parentQuestion.orderIndex);

    return groups;
  }

  /**
   * List homeworks for a user
   */
  static async listHomeworks(params: {
    userId: string;
    limit?: number;
    offset?: number;
    status?: "all" | HomeworkStatus;
  }): Promise<{ homeworks: HomeworkListItem[]; total: number }> {
    const { databases } = await createAdminClient();
    const { userId, limit = 20, offset = 0, status = "all" } = params;

    const queries = [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
      Query.offset(offset),
    ];

    if (status !== "all") {
      queries.push(Query.equal("status", status));
    }

    const result = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.homeworks,
      queries
    );

    const homeworks: HomeworkListItem[] = result.documents.map((doc) => ({
      $id: doc.$id,
      title: doc.title as string,
      originalFileName: doc.originalFileName as string,
      status: doc.status as HomeworkStatus,
      questionCount: (doc.questionCount as number) || 0,
      viewedCount: (doc.viewedCount as number) || 0,
      xpEarned: (doc.xpEarned as number) || 0,
      potentialXp: ((doc.questionCount as number) || 0) * XP_PER_QUESTION_VIEW,
      detectedLanguage: (doc.detectedLanguage as "en" | "he" | "mixed") || "en",
      $createdAt: doc.$createdAt,
    }));

    return { homeworks, total: result.total };
  }

  /**
   * Get processing status for a homework
   */
  static async getProcessingStatus(homeworkId: string): Promise<ProcessingStatus | null> {
    const homework = await this.getHomeworkById(homeworkId);
    if (!homework) return null;

    return {
      status: homework.status,
      questionCount: homework.questionCount,
      errorMessage: homework.errorMessage,
      processingStartedAt: homework.processingStartedAt,
      processingCompletedAt: homework.processingCompletedAt,
    };
  }

  /**
   * Create a homework question
   */
  static async createQuestion(params: {
    homeworkId: string;
    userId: string;
    orderIndex: number;
    pageNumber: number;
    questionText: string;
    questionTextHe?: string;
    originalLanguage: "en" | "he";
    questionType: string;
    detectedSubject: string;
    detectedTopic?: string;
    difficulty: "easy" | "medium" | "hard";
    answer: string;
    aiConfidence?: number;
    // Hierarchical question support
    isSubQuestion?: boolean;
    parentQuestionId?: string;
    subQuestionLabel?: string;
    parentContext?: string;
    // Illustration fields
    illustrationFileId?: string;
    illustrationUrl?: string;
    // On-demand solution generation
    solutionStatus?: SolutionStatus;
    aiSuggestions?: string; // JSON string of AISuggestions
  }): Promise<HomeworkQuestion> {
    const { databases } = await createAdminClient();

    const question = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.homeworkQuestions,
      ID.unique(),
      {
        homeworkId: params.homeworkId,
        userId: params.userId,
        orderIndex: params.orderIndex,
        pageNumber: params.pageNumber,
        questionText: params.questionText,
        questionTextHe: params.questionTextHe,
        originalLanguage: params.originalLanguage,
        questionType: params.questionType,
        detectedSubject: params.detectedSubject,
        detectedTopic: params.detectedTopic,
        difficulty: params.difficulty,
        answer: params.answer,
        isViewed: false,
        xpAwarded: 0,
        aiConfidence: params.aiConfidence,
        // Hierarchical fields
        isSubQuestion: params.isSubQuestion ?? false,
        parentQuestionId: params.parentQuestionId,
        subQuestionLabel: params.subQuestionLabel,
        // Note: parentContext is not stored in DB (size limit) - look up via parentQuestionId
        // Illustration fields
        illustrationFileId: params.illustrationFileId,
        illustrationUrl: params.illustrationUrl,
        // On-demand solution generation
        solutionStatus: params.solutionStatus,
        aiSuggestions: params.aiSuggestions,
      },
      [`read("user:${params.userId}")`, `update("user:${params.userId}")`]
    );

    return question as unknown as HomeworkQuestion;
  }

  /**
   * Create a homework solution
   * Note: solutionSteps stores combined EN/HE format: { en: string[], he: string[] }
   * This is because Appwrite hit attribute size limit and we can't add solutionStepsHe
   */
  static async createSolution(params: {
    questionId: string;
    userId: string;
    solutionStepsEn: string[]; // English steps array
    solutionStepsHe: string[]; // Hebrew steps array
    tip: string;
    tipHe: string;
  }): Promise<HomeworkSolution> {
    const { databases } = await createAdminClient();

    // Store combined EN/HE format in solutionSteps field
    const combinedSteps = JSON.stringify({
      en: params.solutionStepsEn,
      he: params.solutionStepsHe,
    });

    const solution = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.homeworkSolutions,
      ID.unique(),
      {
        questionId: params.questionId,
        solutionSteps: combinedSteps,
        tip: params.tip,
        tipHe: params.tipHe,
      },
      [`read("user:${params.userId}")`]
    );

    return solution as unknown as HomeworkSolution;
  }

  /**
   * Update a question with illustration data
   */
  static async updateQuestionIllustration(
    questionId: string,
    illustrationFileId: string,
    illustrationUrl: string
  ): Promise<void> {
    const { databases } = await createAdminClient();

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.homeworkQuestions,
      questionId,
      {
        illustrationFileId,
        illustrationUrl,
      }
    );

  }

  /**
   * Mark a question as viewed and award XP
   */
  static async viewQuestion(
    questionId: string,
    userId: string
  ): Promise<ViewQuestionResult> {
    const { databases } = await createAdminClient();

    // Get the question
    const question = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.homeworkQuestions,
      questionId
    ) as unknown as HomeworkQuestion;

    // Check if already viewed
    if (question.isViewed) {
      // Get current homework XP
      const homework = await this.getHomeworkById(question.homeworkId);
      return {
        xpAwarded: 0,
        isFirstView: false,
        totalXpEarned: homework?.xpEarned || 0,
      };
    }

    // Mark as viewed
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.homeworkQuestions,
      questionId,
      {
        isViewed: true,
        viewedAt: new Date().toISOString(),
        xpAwarded: XP_PER_QUESTION_VIEW,
      }
    );

    // Update homework stats
    const homework = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.homeworks,
      question.homeworkId
    );

    const newViewedCount = ((homework.viewedCount as number) || 0) + 1;
    const newXpEarned = ((homework.xpEarned as number) || 0) + XP_PER_QUESTION_VIEW;

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.homeworks,
      question.homeworkId,
      {
        viewedCount: newViewedCount,
        xpEarned: newXpEarned,
      }
    );

    // Sync XP to user profile
    await UserProfileService.syncUserXp(userId, XP_PER_QUESTION_VIEW);

    return {
      xpAwarded: XP_PER_QUESTION_VIEW,
      isFirstView: true,
      totalXpEarned: newXpEarned,
    };
  }

  /**
   * Generate solution on-demand for a question
   * This is called when user clicks "Get Solution" on a question
   */
  static async generateSolutionOnDemand(
    questionId: string,
    userId: string
  ): Promise<GenerateSolutionResult> {
    const { databases } = await createAdminClient();

    try {
      // 1. Get the question
      const question = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.homeworkQuestions,
        questionId
      ) as unknown as HomeworkQuestion;

      // Verify ownership
      if (question.userId !== userId) {
        return { success: false, xpAwarded: 0, isFirstView: false, totalXpEarned: 0, error: "Unauthorized" };
      }

      // 2. Check if solution already exists in database (handles race conditions)
      const existingSolutions = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.homeworkSolutions,
        [Query.equal("questionId", questionId), Query.limit(1)]
      );

      // If solution exists (from status check OR from DB), return it
      if (
        existingSolutions.documents.length > 0 ||
        question.solutionStatus === undefined ||
        question.solutionStatus === "completed"
      ) {
        // Solution exists - update status if needed and mark as viewed
        if (question.solutionStatus !== "completed" && question.solutionStatus !== undefined) {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.homeworkQuestions,
            questionId,
            { solutionStatus: "completed", isViewed: true }
          );
        }

        const viewResult = await this.viewQuestion(questionId, userId);

        return {
          success: true,
          solution: existingSolutions.documents[0] as unknown as HomeworkSolution,
          xpAwarded: viewResult.xpAwarded,
          isFirstView: viewResult.isFirstView,
          totalXpEarned: viewResult.totalXpEarned,
        };
      }

      // 3. If status is "generating", another request is in progress - wait or return
      if (question.solutionStatus === "generating") {
        return {
          success: false,
          xpAwarded: 0,
          isFirstView: false,
          totalXpEarned: 0,
          error: "Solution is being generated, please wait...",
        };
      }

      // 4. Update status to "generating"
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.homeworkQuestions,
        questionId,
        { solutionStatus: "generating" }
      );

      // 5. Build ClassifiedQuestion from stored data
      let classification: QuestionClassification;

      if (question.aiSuggestions) {
        const suggestions = JSON.parse(question.aiSuggestions) as AISuggestions;
        classification = {
          complexity: suggestions.estimatedSteps <= 2 ? "simple" : suggestions.estimatedSteps <= 4 ? "medium" : "complex",
          estimatedSteps: suggestions.estimatedSteps,
          visualizationNeed: suggestions.visualizationNeeded ? "helpful" : "not_needed",
          visualizationReason: suggestions.visualizationReason,
          questionCategory: suggestions.questionCategory,
          canBatchProcess: suggestions.estimatedSteps <= 2,
        };
      } else {
        // Fallback for questions without aiSuggestions
        classification = {
          complexity: question.difficulty === "easy" ? "simple" : question.difficulty === "hard" ? "complex" : "medium",
          estimatedSteps: 3,
          visualizationNeed: "not_needed",
          questionCategory: "calculation",
          canBatchProcess: false,
        };
      }

      // Get parent context for sub-questions
      let parentContext: string | undefined;
      if (question.isSubQuestion && question.parentQuestionId) {
        try {
          const parentQuestion = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.homeworkQuestions,
            question.parentQuestionId
          );
          parentContext = parentQuestion.questionText as string;
        } catch {
          // Parent question not found, continue without context
        }
      }

      const classifiedQuestion: ClassifiedQuestion = {
        questionText: question.questionText,
        pageNumber: question.pageNumber,
        originalLanguage: question.originalLanguage,
        orderIndex: question.orderIndex,
        isSubQuestion: question.isSubQuestion,
        subQuestionLabel: question.subQuestionLabel,
        parentContext,
        classification,
      };

      // 6. Call AI to solve
      const solved = await AdaptiveSolvingService.solveAdaptive(classifiedQuestion);

      // 7. Create HomeworkSolution
      const solution = await this.createSolution({
        questionId,
        userId,
        solutionStepsEn: solved.solutionSteps,
        solutionStepsHe: solved.solutionStepsHe,
        tip: solved.tip,
        tipHe: solved.tipHe,
      });

      // 8. Update question: solutionStatus = "completed", isViewed = true, answer from AI
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.homeworkQuestions,
        questionId,
        {
          solutionStatus: "completed",
          isViewed: true,
          viewedAt: new Date().toISOString(),
          xpAwarded: XP_PER_QUESTION_VIEW,
          answer: solved.answer,
          questionType: solved.questionType,
          detectedSubject: solved.detectedSubject,
          detectedTopic: solved.detectedTopic,
          difficulty: solved.difficulty,
          // Clamp aiConfidence to 0-1 range (AI might return percentage like 95 instead of 0.95)
          aiConfidence: Math.min(1, Math.max(0, solved.aiConfidence > 1 ? solved.aiConfidence / 100 : solved.aiConfidence)),
        }
      );

      // 8. Update homework stats and award XP
      const homework = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.homeworks,
        question.homeworkId
      );

      const newViewedCount = ((homework.viewedCount as number) || 0) + 1;
      const newXpEarned = ((homework.xpEarned as number) || 0) + XP_PER_QUESTION_VIEW;

      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.homeworks,
        question.homeworkId,
        {
          viewedCount: newViewedCount,
          xpEarned: newXpEarned,
        }
      );

      // Sync XP to user profile
      await UserProfileService.syncUserXp(userId, XP_PER_QUESTION_VIEW);

      // 9. Return result
      return {
        success: true,
        solution,
        xpAwarded: XP_PER_QUESTION_VIEW,
        isFirstView: true,
        totalXpEarned: newXpEarned,
      };
    } catch (error) {
      console.error("[HomeworkService] generateSolutionOnDemand failed:", error);

      // Update status to "failed"
      try {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.homeworkQuestions,
          questionId,
          { solutionStatus: "failed" }
        );
      } catch {
        // Ignore update error
      }

      return {
        success: false,
        xpAwarded: 0,
        isFirstView: false,
        totalXpEarned: 0,
        error: error instanceof Error ? error.message : "Failed to generate solution",
      };
    }
  }

  /**
   * Delete a homework and all its questions/solutions
   */
  static async deleteHomework(homeworkId: string, userId: string): Promise<boolean> {
    const { databases, storage } = await createAdminClient();

    try {
      // Verify ownership
      const homework = await this.getHomeworkById(homeworkId);
      if (!homework || homework.userId !== userId) {
        return false;
      }

      // Get all questions
      const questions = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.homeworkQuestions,
        [Query.equal("homeworkId", homeworkId), Query.limit(100)]
      );

      // Delete solutions for all questions
      for (const question of questions.documents) {
        try {
          const solutions = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.homeworkSolutions,
            [Query.equal("questionId", question.$id), Query.limit(1)]
          );
          for (const solution of solutions.documents) {
            await databases.deleteDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.homeworkSolutions,
              solution.$id
            );
          }
        } catch {
          // Continue even if solution not found
        }
      }

      // Delete all questions
      for (const question of questions.documents) {
        await databases.deleteDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.homeworkQuestions,
          question.$id
        );
      }

      // Delete the PDF file from storage
      try {
        await storage.deleteFile(
          APPWRITE_CONFIG.buckets.userFiles,
          homework.fileId
        );
      } catch {
        // File may have already been deleted
      }

      // Delete the homework document
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.homeworks,
        homeworkId
      );

      return true;
    } catch {
      return false;
    }
  }
}
