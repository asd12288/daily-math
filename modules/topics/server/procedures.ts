// modules/topics/server/procedures.ts
// tRPC router for Topics module

import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "@/trpc/init";
import {
  getTopicById,
  getTopicDetail,
  getTopicsByCourse,
  getTopicsGroupedByBranch,
  getAllBranches,
  getBranchById,
  updateTopicTheory,
  updateTopicVideos,
  getExercisesByTopic,
  getExerciseCountByTopic,
} from "./services/topic.service";
import type { ExerciseDifficulty } from "@/lib/appwrite/types";
import {
  getFormulasByTopic,
  getFormulasByCourse,
} from "./services/formula.service";
import {
  getVideosByTopic,
  getVideosGroupedByLanguage,
  getVideoCount,
  getVideosByCourse,
  createVideo,
  updateVideo,
  deleteVideo,
  type CreateVideoInput,
} from "./services/video.service";
import type { VideoLanguage, VideoSource } from "@/lib/appwrite/types";

export const topicsRouter = createTRPCRouter({
  /**
   * Get a single topic by ID
   */
  getById: publicProcedure
    .input(z.object({ topicId: z.string() }))
    .query(async ({ input }) => {
      return getTopicById(input.topicId);
    }),

  /**
   * Get topic detail with branch and related topics
   */
  getDetail: publicProcedure
    .input(z.object({ topicId: z.string() }))
    .query(async ({ input }) => {
      return getTopicDetail(input.topicId);
    }),

  /**
   * Get all topics for a course
   */
  getByCourse: publicProcedure
    .input(
      z.object({
        courseId: z.string(),
        includeInactive: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input }) => {
      return getTopicsByCourse(input.courseId, input.includeInactive);
    }),

  /**
   * Get topics grouped by branch
   */
  getGroupedByBranch: publicProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ input }) => {
      return getTopicsGroupedByBranch(input.courseId);
    }),

  /**
   * Get all branches
   */
  getAllBranches: publicProcedure.query(async () => {
    return getAllBranches();
  }),

  /**
   * Get a single branch by ID
   */
  getBranch: publicProcedure
    .input(z.object({ branchId: z.string() }))
    .query(async ({ input }) => {
      return getBranchById(input.branchId as "foundations" | "linear" | "polynomials" | "quadratics" | "functions");
    }),

  /**
   * Get formulas for a topic
   */
  getFormulas: publicProcedure
    .input(z.object({ topicId: z.string() }))
    .query(async ({ input }) => {
      return getFormulasByTopic(input.topicId);
    }),

  /**
   * Get all formulas for a course (cheat sheet)
   */
  getCourseFormulas: publicProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ input }) => {
      return getFormulasByCourse(input.courseId);
    }),

  /**
   * Admin: Update topic theory content
   */
  updateTheory: adminProcedure
    .input(
      z.object({
        topicId: z.string(),
        content: z.string(),
        contentHe: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return updateTopicTheory(input.topicId, input.content, input.contentHe);
    }),

  /**
   * Admin: Update topic videos
   */
  updateVideos: adminProcedure
    .input(
      z.object({
        topicId: z.string(),
        videoIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return updateTopicVideos(input.topicId, input.videoIds);
    }),

  /**
   * Get exercises for a topic
   */
  getExercises: publicProcedure
    .input(
      z.object({
        topicId: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return getExercisesByTopic(input.topicId, {
        difficulty: input.difficulty as ExerciseDifficulty | undefined,
        limit: input.limit,
      });
    }),

  /**
   * Get exercise count for a topic
   */
  getExerciseCount: publicProcedure
    .input(z.object({ topicId: z.string() }))
    .query(async ({ input }) => {
      return getExerciseCountByTopic(input.topicId);
    }),

  // ============================================
  // Video Procedures
  // ============================================

  /**
   * Get all videos for a topic
   */
  getVideos: publicProcedure
    .input(z.object({ topicId: z.string() }))
    .query(async ({ input }) => {
      return getVideosByTopic(input.topicId);
    }),

  /**
   * Get videos grouped by language
   */
  getVideosGrouped: publicProcedure
    .input(z.object({ topicId: z.string() }))
    .query(async ({ input }) => {
      return getVideosGroupedByLanguage(input.topicId);
    }),

  /**
   * Get video count for a topic (for badge display)
   */
  getVideoCount: publicProcedure
    .input(z.object({ topicId: z.string() }))
    .query(async ({ input }) => {
      return getVideoCount(input.topicId);
    }),

  /**
   * Get all videos for a course
   */
  getCourseVideos: publicProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ input }) => {
      return getVideosByCourse(input.courseId);
    }),

  /**
   * Admin: Create a new video
   */
  createVideo: adminProcedure
    .input(
      z.object({
        videoId: z.string().min(1).max(20),
        topicId: z.string(),
        courseId: z.string(),
        title: z.string().min(1).max(300),
        titleHe: z.string().max(300).optional(),
        channelName: z.string().min(1).max(150),
        thumbnailUrl: z.string().url(),
        duration: z.string().max(10).optional(),
        durationSeconds: z.number().int().min(0).optional(),
        language: z.enum(["en", "he", "other"]),
        sortOrder: z.number().int().min(0).optional(),
        source: z.enum(["curated", "api"]).optional(),
        description: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createVideo(input as CreateVideoInput);
    }),

  /**
   * Admin: Update a video
   */
  updateVideo: adminProcedure
    .input(
      z.object({
        videoDocId: z.string(),
        data: z.object({
          videoId: z.string().min(1).max(20).optional(),
          topicId: z.string().optional(),
          courseId: z.string().optional(),
          title: z.string().min(1).max(300).optional(),
          titleHe: z.string().max(300).optional(),
          channelName: z.string().min(1).max(150).optional(),
          thumbnailUrl: z.string().url().optional(),
          duration: z.string().max(10).optional(),
          durationSeconds: z.number().int().min(0).optional(),
          language: z.enum(["en", "he", "other"]).optional(),
          sortOrder: z.number().int().min(0).optional(),
          source: z.enum(["curated", "api"]).optional(),
          description: z.string().max(2000).optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return updateVideo(input.videoDocId, input.data);
    }),

  /**
   * Admin: Delete a video (soft delete)
   */
  deleteVideo: adminProcedure
    .input(z.object({ videoDocId: z.string() }))
    .mutation(async ({ input }) => {
      return deleteVideo(input.videoDocId);
    }),
});
