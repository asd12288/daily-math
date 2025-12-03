// modules/session/lib/validation.ts
// Zod validation schemas for session module

import { z } from "zod";

/**
 * Session source enum
 */
export const sessionSourceSchema = z.enum(["topic", "homework", "daily"]);

/**
 * Session mode enum
 */
export const sessionModeSchema = z.enum(["learn", "review", "practice"]);

/**
 * Difficulty enum
 */
export const sessionDifficultySchema = z.enum(["easy", "medium", "hard"]);

/**
 * Session filters schema
 */
export const sessionFiltersSchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard", "all"]).optional().default("all"),
  questionType: z.string().optional(),
  count: z.number().int().min(1).max(20).default(5),
});

/**
 * Create session input schema
 */
export const createSessionSchema = z.object({
  source: sessionSourceSchema,
  sourceId: z.string().min(1),
  mode: sessionModeSchema,
  filters: sessionFiltersSchema,
});

/**
 * Get session input schema
 */
export const getSessionSchema = z.object({
  sessionId: z.string().min(1),
});

/**
 * Mark question viewed input schema
 */
export const markViewedSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
});

/**
 * Complete session input schema
 */
export const completeSessionSchema = z.object({
  sessionId: z.string().min(1),
});

/**
 * Navigate session input schema
 */
export const navigateSessionSchema = z.object({
  sessionId: z.string().min(1),
  index: z.number().int().min(0),
});

/**
 * List active sessions input schema
 */
export const listActiveSessionsSchema = z.object({
  limit: z.number().int().min(1).max(20).optional().default(10),
});

/**
 * Delete session input schema
 */
export const deleteSessionSchema = z.object({
  sessionId: z.string().min(1),
});

// Export types from schemas
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type GetSessionInput = z.infer<typeof getSessionSchema>;
export type MarkViewedInput = z.infer<typeof markViewedSchema>;
export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;
export type NavigateSessionInput = z.infer<typeof navigateSessionSchema>;
export type ListActiveSessionsInput = z.infer<typeof listActiveSessionsSchema>;
export type DeleteSessionInput = z.infer<typeof deleteSessionSchema>;
