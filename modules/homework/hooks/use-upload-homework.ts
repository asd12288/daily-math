// modules/homework/hooks/use-upload-homework.ts
// Hook for uploading homework files (PDF, images)
// SIMPLIFIED: Synchronous processing, no polling needed

import { useState, useCallback } from "react";
import { trpc } from "@/trpc/client";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "../config/constants";

/**
 * Error types for better user feedback
 */
export type UploadErrorType =
  | "file_type"        // Invalid file type
  | "file_size"        // File too large
  | "upload_failed"    // Failed to upload to storage
  | "network"          // Network/connection error
  | "ai_credits"       // AI API credits exhausted
  | "ai_rate_limit"    // Too many AI requests
  | "ai_unavailable"   // AI service down
  | "processing"       // General processing error
  | "timeout"          // Processing took too long
  | "server"           // Internal server error
  | "auth"             // Authentication error
  | "unknown";         // Unknown error

interface UploadState {
  status: "idle" | "validating" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
  errorType?: UploadErrorType;
  homeworkId?: string;
}

/**
 * Parse error message to determine error type
 */
function parseErrorType(error: unknown): { type: UploadErrorType; message: string } {
  const errorStr = error instanceof Error ? error.message : String(error);
  const errorLower = errorStr.toLowerCase();

  // AI credit/quota errors
  if (
    errorLower.includes("quota") ||
    errorLower.includes("credit") ||
    errorLower.includes("billing") ||
    errorLower.includes("exceeded") ||
    errorLower.includes("limit exceeded") ||
    errorLower.includes("resource_exhausted") ||
    errorLower.includes("429")
  ) {
    return {
      type: "ai_credits",
      message: errorStr
    };
  }

  // Rate limit errors
  if (
    errorLower.includes("rate limit") ||
    errorLower.includes("too many requests") ||
    errorLower.includes("throttl")
  ) {
    return {
      type: "ai_rate_limit",
      message: errorStr
    };
  }

  // AI service unavailable
  if (
    errorLower.includes("service unavailable") ||
    errorLower.includes("503") ||
    errorLower.includes("model is overloaded") ||
    errorLower.includes("temporarily unavailable")
  ) {
    return {
      type: "ai_unavailable",
      message: errorStr
    };
  }

  // Network errors
  if (
    errorLower.includes("network") ||
    errorLower.includes("fetch") ||
    errorLower.includes("connection") ||
    errorLower.includes("econnrefused") ||
    errorLower.includes("timeout") && errorLower.includes("connect")
  ) {
    return {
      type: "network",
      message: errorStr
    };
  }

  // Auth errors
  if (
    errorLower.includes("unauthorized") ||
    errorLower.includes("401") ||
    errorLower.includes("forbidden") ||
    errorLower.includes("403") ||
    errorLower.includes("invalid api key")
  ) {
    return {
      type: "auth",
      message: errorStr
    };
  }

  // Server errors
  if (
    errorLower.includes("internal server error") ||
    errorLower.includes("500") ||
    errorLower.includes("502") ||
    errorLower.includes("504")
  ) {
    return {
      type: "server",
      message: errorStr
    };
  }

  // Upload specific
  if (errorLower.includes("upload")) {
    return {
      type: "upload_failed",
      message: errorStr
    };
  }

  // Processing timeout
  if (errorLower.includes("timeout") || errorLower.includes("timed out")) {
    return {
      type: "timeout",
      message: errorStr
    };
  }

  // Default to processing error
  return {
    type: "processing",
    message: errorStr
  };
}

export function useUploadHomework() {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });

  const utils = trpc.useUtils();
  const uploadMutation = trpc.homework.upload.useMutation();

  // Reset state
  const reset = useCallback(() => {
    setUploadState({ status: "idle", progress: 0 });
  }, []);

  // Main upload function
  // SIMPLIFIED: Processing is now synchronous, no polling needed
  const upload = useCallback(
    async (file: File, title?: string, generateIllustrations?: boolean) => {
      // Reset state
      setUploadState({ status: "validating", progress: 0 });

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setUploadState({
          status: "error",
          progress: 0,
          error: "Supported formats: PDF, JPG, PNG, WebP",
          errorType: "file_type",
        });
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setUploadState({
          status: "error",
          progress: 0,
          error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
          errorType: "file_size",
        });
        return;
      }

      setUploadState({ status: "uploading", progress: 20 });

      try {
        // Convert file to base64
        const base64Data = await fileToBase64(file);
        setUploadState({ status: "uploading", progress: 40 });

        // Upload and process (synchronous - waits for AI processing)
        setUploadState({ status: "processing", progress: 60 });

        const result = await uploadMutation.mutateAsync({
          base64Data,
          fileName: file.name,
          title,
          generateIllustrations: generateIllustrations ?? false,
        });

        // Processing complete - if we get here, it was successful
        // (errors throw TRPCError and go to catch block)
        setUploadState({
          status: "completed",
          progress: 100,
          homeworkId: result.homeworkId,
        });
        // Invalidate list to refresh
        utils.homework.list.invalidate();
      } catch (error) {
        const parsedError = parseErrorType(error);
        setUploadState({
          status: "error",
          progress: 0,
          error: parsedError.message,
          errorType: parsedError.type,
        });
      }
    },
    [uploadMutation, utils]
  );

  return {
    upload,
    reset,
    ...uploadState,
    isUploading: uploadState.status === "uploading" || uploadState.status === "processing",
    isComplete: uploadState.status === "completed",
    isError: uploadState.status === "error",
    errorType: uploadState.errorType,
  };
}

// Helper to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
