// modules/admin/server/services/question-service.ts
// Business logic for question management

import { Query, ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import type { Exercise } from "@/lib/appwrite/types";
import type { QuestionFiltersInput, QuestionFormInput } from "../../lib/validation";
import type { PaginatedQuestions, AdminStats } from "../../types";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const EXERCISES_COLLECTION = process.env.APPWRITE_EXERCISES_COLLECTION!;

/**
 * Get paginated list of questions with filters
 */
export async function getQuestions(
  filters: QuestionFiltersInput
): Promise<PaginatedQuestions> {
  const { databases } = await createAdminClient();

  const queries: string[] = [];

  // Apply filters
  if (filters.courseId) {
    queries.push(Query.equal("courseId", filters.courseId));
  }
  if (filters.topicId) {
    queries.push(Query.equal("topicId", filters.topicId));
  }
  if (filters.difficulty) {
    queries.push(Query.equal("difficulty", filters.difficulty));
  }
  if (filters.answerType) {
    queries.push(Query.equal("answerType", filters.answerType));
  }
  if (filters.search) {
    queries.push(Query.search("question", filters.search));
  }

  // Calculate offset for pagination
  const offset = (filters.page - 1) * filters.limit;
  queries.push(Query.limit(filters.limit));
  queries.push(Query.offset(offset));
  queries.push(Query.orderDesc("$createdAt"));

  // Fetch questions
  const response = await databases.listDocuments(
    DATABASE_ID,
    EXERCISES_COLLECTION,
    queries
  );

  const questions = response.documents as unknown as Exercise[];
  const total = response.total;
  const totalPages = Math.ceil(total / filters.limit);

  return {
    questions,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages,
  };
}

/**
 * Get a single question by ID
 */
export async function getQuestionById(questionId: string): Promise<Exercise | null> {
  const { databases } = await createAdminClient();

  try {
    const document = await databases.getDocument(
      DATABASE_ID,
      EXERCISES_COLLECTION,
      questionId
    );
    return document as unknown as Exercise;
  } catch {
    return null;
  }
}

/**
 * Create a new question
 */
export async function createQuestion(data: QuestionFormInput): Promise<Exercise> {
  const { databases } = await createAdminClient();

  const document = await databases.createDocument(
    DATABASE_ID,
    EXERCISES_COLLECTION,
    ID.unique(),
    {
      courseId: data.courseId,
      topicId: data.topicId,
      question: data.question,
      questionHe: data.questionHe || null,
      difficulty: data.difficulty,
      answerType: data.answerType,
      correctAnswer: data.correctAnswer,
      solution: data.solution,
      solutionHe: data.solutionHe || null,
      hints: data.hints || [],
      hintsHe: data.hintsHe || [],
      tags: data.tags || [],
      estimatedTime: data.estimatedTime || 5,
      isActive: data.isActive ?? true,
      aiGenerated: false,
    }
  );

  return document as unknown as Exercise;
}

/**
 * Update an existing question
 */
export async function updateQuestion(
  questionId: string,
  data: Partial<QuestionFormInput>
): Promise<Exercise> {
  const { databases } = await createAdminClient();

  // Build update data, filtering out undefined values
  const updateData: Record<string, unknown> = {};

  if (data.courseId !== undefined) updateData.courseId = data.courseId;
  if (data.topicId !== undefined) updateData.topicId = data.topicId;
  if (data.question !== undefined) updateData.question = data.question;
  if (data.questionHe !== undefined) updateData.questionHe = data.questionHe || null;
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
  if (data.answerType !== undefined) updateData.answerType = data.answerType;
  if (data.correctAnswer !== undefined) updateData.correctAnswer = data.correctAnswer;
  if (data.solution !== undefined) updateData.solution = data.solution;
  if (data.solutionHe !== undefined) updateData.solutionHe = data.solutionHe || null;
  if (data.hints !== undefined) updateData.hints = data.hints;
  if (data.hintsHe !== undefined) updateData.hintsHe = data.hintsHe;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.estimatedTime !== undefined) updateData.estimatedTime = data.estimatedTime;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const document = await databases.updateDocument(
    DATABASE_ID,
    EXERCISES_COLLECTION,
    questionId,
    updateData
  );

  return document as unknown as Exercise;
}

/**
 * Delete a question
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  const { databases } = await createAdminClient();

  await databases.deleteDocument(DATABASE_ID, EXERCISES_COLLECTION, questionId);
}

/**
 * Bulk update questions (activate/deactivate)
 */
export async function bulkUpdateQuestions(
  questionIds: string[],
  operation: "activate" | "deactivate"
): Promise<number> {
  const { databases } = await createAdminClient();

  let updated = 0;
  const isActive = operation === "activate";

  for (const questionId of questionIds) {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        EXERCISES_COLLECTION,
        questionId,
        { isActive }
      );
      updated++;
    } catch {
      console.error(`Failed to update question ${questionId}`);
    }
  }

  return updated;
}

/**
 * Bulk delete questions
 */
export async function bulkDeleteQuestions(questionIds: string[]): Promise<number> {
  const { databases } = await createAdminClient();

  let deleted = 0;

  for (const questionId of questionIds) {
    try {
      await databases.deleteDocument(DATABASE_ID, EXERCISES_COLLECTION, questionId);
      deleted++;
    } catch {
      console.error(`Failed to delete question ${questionId}`);
    }
  }

  return deleted;
}

/**
 * Get admin statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
  const { databases } = await createAdminClient();

  // Get total questions
  const totalResponse = await databases.listDocuments(
    DATABASE_ID,
    EXERCISES_COLLECTION,
    [Query.limit(1)]
  );

  // Get questions by difficulty
  const easyResponse = await databases.listDocuments(
    DATABASE_ID,
    EXERCISES_COLLECTION,
    [Query.equal("difficulty", "easy"), Query.limit(1)]
  );
  const mediumResponse = await databases.listDocuments(
    DATABASE_ID,
    EXERCISES_COLLECTION,
    [Query.equal("difficulty", "medium"), Query.limit(1)]
  );
  const hardResponse = await databases.listDocuments(
    DATABASE_ID,
    EXERCISES_COLLECTION,
    [Query.equal("difficulty", "hard"), Query.limit(1)]
  );

  // Get active/inactive counts
  const activeResponse = await databases.listDocuments(
    DATABASE_ID,
    EXERCISES_COLLECTION,
    [Query.equal("isActive", true), Query.limit(1)]
  );
  const inactiveResponse = await databases.listDocuments(
    DATABASE_ID,
    EXERCISES_COLLECTION,
    [Query.equal("isActive", false), Query.limit(1)]
  );

  return {
    totalQuestions: totalResponse.total,
    questionsByCourse: {}, // Would need additional queries per course
    questionsByDifficulty: {
      easy: easyResponse.total,
      medium: mediumResponse.total,
      hard: hardResponse.total,
    },
    activeQuestions: activeResponse.total,
    inactiveQuestions: inactiveResponse.total,
  };
}
