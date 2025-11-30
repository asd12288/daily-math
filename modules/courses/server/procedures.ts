// modules/courses/server/procedures.ts
// tRPC router for courses module

import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/trpc/init";
import { coursesService } from "./services/courses.service";
import { getActiveCourses, getCourseById } from "../config";

export const coursesRouter = createTRPCRouter({
  /**
   * Get all active courses (public - for landing page)
   */
  getAll: publicProcedure.query(async () => {
    return getActiveCourses();
  }),

  /**
   * Get all courses from database (for admin/dynamic usage)
   */
  getCoursesFromDB: publicProcedure.query(async () => {
    return coursesService.getCoursesFromDB();
  }),

  /**
   * Get all topics from database (optionally filtered by course)
   */
  getTopicsFromDB: publicProcedure
    .input(z.object({ courseId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return coursesService.getTopicsFromDB(input?.courseId);
    }),

  /**
   * Get courses with user progress
   */
  getWithProgress: protectedProcedure.query(async ({ ctx }) => {
    return coursesService.getCoursesWithProgress(ctx.session.userId);
  }),

  /**
   * Get course detail by ID
   */
  getDetail: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      return coursesService.getCourseDetail(ctx.session.userId, input.courseId);
    }),

  /**
   * Get course by ID (static data only)
   */
  getById: publicProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ input }) => {
      return getCourseById(input.courseId) || null;
    }),

  /**
   * Get exercises for a topic
   */
  getExercises: protectedProcedure
    .input(
      z.object({
        topicId: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      return coursesService.getExercisesForTopic(input.topicId, {
        difficulty: input.difficulty,
        limit: input.limit,
      });
    }),

  /**
   * Get exercises for a practice session (5 questions)
   */
  getSessionExercises: protectedProcedure
    .input(
      z.object({
        topicId: z.string(),
        excludeIds: z.array(z.string()).default([]),
      })
    )
    .query(async ({ input }) => {
      return coursesService.getExercisesForSession(input.topicId, input.excludeIds);
    }),
});
