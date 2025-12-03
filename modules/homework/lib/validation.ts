// Homework Module Validation Schemas

import { z } from "zod";
import {
  MAX_FILE_SIZE,
  MAX_PAGES,
  ALLOWED_EXTENSIONS,
  ALLOWED_FILE_TYPES,
} from "../config/constants";

/**
 * Homework status enum
 */
export const homeworkStatusSchema = z.enum([
  "uploading",
  "processing",
  "completed",
  "failed",
]);

/**
 * Detected language enum
 */
export const detectedLanguageSchema = z.enum(["en", "he", "mixed"]);

/**
 * Original language enum
 */
export const originalLanguageSchema = z.enum(["en", "he"]);

/**
 * Question type enum
 */
export const questionTypeSchema = z.enum([
  "multiple_choice",
  "open_ended",
  "proof",
  "calculation",
  "word_problem",
]);

/**
 * Difficulty enum
 */
export const difficultySchema = z.enum(["easy", "medium", "hard"]);

/**
 * Upload homework input validation
 */
export const uploadHomeworkSchema = z.object({
  base64Data: z.string().min(1, "File data is required"),
  fileName: z
    .string()
    .min(1, "File name is required")
    .refine(
      (name) => {
        const ext = name.split(".").pop()?.toLowerCase();
        return ext && ALLOWED_EXTENSIONS.includes(ext);
      },
      { message: "Supported formats: PDF, JPG, PNG, WebP" }
    ),
  title: z.string().max(255).optional(),
  generateIllustrations: z.boolean().default(false), // AI-generated physics diagrams
});

/**
 * Get homework by ID input
 */
export const getHomeworkByIdSchema = z.object({
  homeworkId: z.string().min(1, "Homework ID is required"),
});

/**
 * Date range filter enum
 */
export const dateRangeSchema = z.enum(["all", "today", "week", "month"]);

/**
 * List homeworks input with filters
 */
export const listHomeworksSchema = z.object({
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
  status: z
    .enum(["all", "uploading", "processing", "completed", "failed"])
    .default("all"),
  subject: z.string().default("all"), // "all" or specific subject like "Calculus 1"
  dateRange: dateRangeSchema.default("all"),
});

/**
 * View question input
 */
export const viewQuestionSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
});

/**
 * Delete homework input
 */
export const deleteHomeworkSchema = z.object({
  homeworkId: z.string().min(1, "Homework ID is required"),
});

/**
 * Retry processing input
 */
export const retryProcessingSchema = z.object({
  homeworkId: z.string().min(1, "Homework ID is required"),
});

/**
 * Get processing status input
 */
export const getStatusSchema = z.object({
  homeworkId: z.string().min(1, "Homework ID is required"),
});

/**
 * AI extracted question schema
 */
export const extractedQuestionSchema = z.object({
  questionText: z.string().min(1),
  pageNumber: z.number().int().min(1).max(MAX_PAGES),
  originalLanguage: originalLanguageSchema,
  orderIndex: z.number().int().min(0),
});

/**
 * AI solved question schema
 */
export const solvedQuestionSchema = extractedQuestionSchema.extend({
  questionType: questionTypeSchema,
  detectedSubject: z.string().min(1),
  detectedTopic: z.string().optional(),
  difficulty: difficultySchema,
  answer: z.string().min(1),
  solutionSteps: z.array(z.string()).min(1).max(20), // Increased from 10 to handle complex solutions
  solutionStepsHe: z.array(z.string()).optional(), // Hebrew steps (optional)
  tip: z.string().optional(),
  tipHe: z.string().optional(),
  aiConfidence: z.number().min(0).max(10),
  processingNotes: z.string().optional(),
});

/**
 * File validation helper
 */
export function validateFile(file: {
  size: number;
  type: string;
  name: string;
}): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
    };
  }

  // Check file type (PDF or images)
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Supported formats: PDF, JPG, PNG, WebP",
    };
  }

  // Check extension
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: "Supported formats: PDF, JPG, PNG, WebP",
    };
  }

  return { valid: true };
}

/**
 * Validate page count
 */
export function validatePageCount(pageCount: number): {
  valid: boolean;
  error?: string;
} {
  if (pageCount < 1) {
    return { valid: false, error: "PDF must have at least 1 page" };
  }
  if (pageCount > MAX_PAGES) {
    return {
      valid: false,
      error: `PDF exceeds ${MAX_PAGES} page limit`,
    };
  }
  return { valid: true };
}

// Export type inferences
export type UploadHomeworkInput = z.infer<typeof uploadHomeworkSchema>;
export type ListHomeworksInput = z.infer<typeof listHomeworksSchema>;
export type ExtractedQuestionInput = z.infer<typeof extractedQuestionSchema>;
export type SolvedQuestionInput = z.infer<typeof solvedQuestionSchema>;
