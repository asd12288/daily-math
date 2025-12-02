// modules/homework/server/procedures.ts
// tRPC router for homework feature

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";
import { ID } from "node-appwrite";
import { HomeworkService } from "./services/homework.service";
import { PdfProcessingService } from "./services/pdf-processing.service";

/**
 * Get the base URL for API calls
 * Uses NGROK_URL for local development, NEXT_PUBLIC_APP_URL for production
 */
function getBaseUrl(): string {
  return (
    process.env.NGROK_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}
import {
  uploadHomeworkSchema,
  getHomeworkByIdSchema,
  listHomeworksSchema,
  viewQuestionSchema,
  deleteHomeworkSchema,
  retryProcessingSchema,
  getStatusSchema,
} from "../lib/validation";
import { MAX_FILE_SIZE, MAX_PAGES, getMimeTypeFromExtension } from "../config/constants";
import type { HomeworkFileType } from "../types/homework.types";

/**
 * Helper to count PDF pages from base64 data
 * Uses a simple heuristic - counts /Page objects
 */
function countPdfPages(base64Data: string): number {
  try {
    const pdfContent = Buffer.from(base64Data, "base64").toString("latin1");
    // Count page objects in PDF
    const pageMatches = pdfContent.match(/\/Type\s*\/Page[^s]/g);
    return pageMatches ? pageMatches.length : 1;
  } catch {
    return 1;
  }
}

export const homeworkRouter = createTRPCRouter({
  /**
   * List user's homeworks with pagination and filtering
   */
  list: protectedProcedure
    .input(listHomeworksSchema)
    .query(async ({ ctx, input }) => {
      const { limit, offset, status } = input;

      const result = await HomeworkService.listHomeworks({
        userId: ctx.session.userId,
        limit,
        offset,
        status,
      });

      return result;
    }),

  /**
   * Get a single homework with all its questions
   */
  getById: protectedProcedure
    .input(getHomeworkByIdSchema)
    .query(async ({ ctx, input }) => {
      const homework = await HomeworkService.getHomeworkWithQuestions(input.homeworkId);

      if (!homework) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Homework not found",
        });
      }

      // Verify ownership
      if (homework.userId !== ctx.session.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this homework",
        });
      }

      return homework;
    }),

  /**
   * Upload a new homework (PDF or image)
   * Accepts base64 data, stores file, and starts async processing
   */
  upload: protectedProcedure
    .input(uploadHomeworkSchema)
    .mutation(async ({ ctx, input }) => {
      const { base64Data, fileName, title } = input;

      // Determine file type from extension
      const ext = fileName.split(".").pop()?.toLowerCase();
      const fileType: HomeworkFileType = ext === "pdf" ? "pdf" : "image";

      // Extract base64 content (remove data URL prefix if present)
      let fileBase64 = base64Data;
      if (base64Data.startsWith("data:")) {
        const parts = base64Data.split(",");
        if (parts.length !== 2) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid file data format",
          });
        }
        fileBase64 = parts[1];
      }

      // Validate file size
      const fileSize = Buffer.from(fileBase64, "base64").length;
      if (fileSize > MAX_FILE_SIZE) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
        });
      }

      // Page count: PDFs can have multiple pages, images are always 1
      let pageCount = 1;
      if (fileType === "pdf") {
        pageCount = countPdfPages(fileBase64);
        if (pageCount > MAX_PAGES) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `PDF exceeds ${MAX_PAGES} page limit`,
          });
        }
      }

      // Upload file to Appwrite Storage
      const { storage } = await createAdminClient();
      const fileId = ID.unique();

      try {
        // Create a File-like object from the buffer
        const buffer = Buffer.from(fileBase64, "base64");

        // Use InputFile from node-appwrite/file for server-side upload
        const { InputFile } = await import("node-appwrite/file");
        const inputFile = InputFile.fromBuffer(buffer, fileName);

        await storage.createFile(
          APPWRITE_CONFIG.buckets.userFiles,
          fileId,
          inputFile,
          // read("any") allows viewing via direct URL (IDs are random UUIDs)
          // User can still only delete their own files
          [`read("any")`, `read("user:${ctx.session.userId}")`, `delete("user:${ctx.session.userId}")`]
        );
      } catch (error) {
        console.error("[Homework] File upload failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload file",
        });
      }

      // Create homework record
      const extPattern = /\.(pdf|jpg|jpeg|png|webp)$/i;
      const homeworkTitle = title || fileName.replace(extPattern, "");
      const homework = await HomeworkService.createHomework({
        userId: ctx.session.userId,
        title: homeworkTitle,
        originalFileName: fileName,
        fileId,
        fileSize,
        pageCount,
        fileType,
      });

      // Fire-and-forget: trigger processing API
      // This allows the request to return immediately while processing happens in background
      const generateIllustrations = input.generateIllustrations ?? false;
      const baseUrl = getBaseUrl();

      console.log("[Homework] Triggering processing:", {
        url: `${baseUrl}/api/process-homework`,
        homeworkId: homework.$id,
        hasSecret: !!process.env.INTERNAL_API_SECRET,
        secretPreview: process.env.INTERNAL_API_SECRET?.substring(0, 10) + "...",
      });

      fetch(`${baseUrl}/api/process-homework`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
        },
        body: JSON.stringify({
          homeworkId: homework.$id,
          userId: ctx.session.userId,
          generateIllustrations,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            console.error("[Homework] Processing API error:", res.status, text);
            await HomeworkService.updateHomeworkStatus(homework.$id, "failed", {
              errorMessage: `Processing API returned ${res.status}: ${text.substring(0, 100)}`,
            });
          } else {
            console.log("[Homework] Processing API called successfully");
          }
        })
        .catch((err) => {
          console.error("[Homework] Failed to trigger processing:", err);
          // Mark as failed if we can't even start processing
          HomeworkService.updateHomeworkStatus(homework.$id, "failed", {
            errorMessage: "Failed to start processing: " + err.message,
          });
        });

      return {
        homeworkId: homework.$id,
        status: "pending",
        message: "Upload successful. Processing will begin shortly.",
      };
    }),

  /**
   * Get processing status for a homework
   * Used for polling during upload
   */
  getStatus: protectedProcedure
    .input(getStatusSchema)
    .query(async ({ input }) => {
      const status = await HomeworkService.getProcessingStatus(input.homeworkId);

      if (!status) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Homework not found",
        });
      }

      return status;
    }),

  /**
   * Generate solution on-demand and mark as viewed
   * If solution already exists, just marks as viewed and awards XP
   */
  viewQuestion: protectedProcedure
    .input(viewQuestionSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await HomeworkService.generateSolutionOnDemand(
        input.questionId,
        ctx.session.userId
      );

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error || "Failed to generate solution",
        });
      }

      return {
        xpAwarded: result.xpAwarded,
        isFirstView: result.isFirstView,
        totalXpEarned: result.totalXpEarned,
        solution: result.solution,
      };
    }),

  /**
   * Delete a homework and all associated data
   */
  delete: protectedProcedure
    .input(deleteHomeworkSchema)
    .mutation(async ({ ctx, input }) => {
      const success = await HomeworkService.deleteHomework(
        input.homeworkId,
        ctx.session.userId
      );

      if (!success) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Homework not found or you don't have permission to delete it",
        });
      }

      return { success: true };
    }),

  /**
   * Retry processing for a failed homework
   */
  retry: protectedProcedure
    .input(retryProcessingSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await PdfProcessingService.retryProcessing(
        input.homeworkId,
        ctx.session.userId
      );

      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "Failed to retry processing",
        });
      }

      return {
        success: true,
        message: "Processing restarted",
      };
    }),
});
