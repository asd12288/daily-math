// modules/homework/hooks/use-upload-homework.ts
// Hook for uploading homework files (PDF, images) with progress tracking

import { useState, useCallback } from "react";
import { trpc } from "@/trpc/client";
import { MAX_FILE_SIZE, POLLING_INTERVAL_MS, ALLOWED_FILE_TYPES } from "../config/constants";

interface UploadState {
  status: "idle" | "validating" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
  homeworkId?: string;
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
        });
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setUploadState({
          status: "error",
          progress: 0,
          error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
        });
        return;
      }

      setUploadState({ status: "uploading", progress: 10 });

      try {
        // Convert file to base64
        const base64Data = await fileToBase64(file);
        setUploadState({ status: "uploading", progress: 30 });

        // Upload to server
        const result = await uploadMutation.mutateAsync({
          base64Data,
          fileName: file.name,
          title,
          generateIllustrations: generateIllustrations ?? false,
        });

        setUploadState({
          status: "processing",
          progress: 50,
          homeworkId: result.homeworkId,
        });

        // Poll for processing status
        const homeworkId = result.homeworkId;
        let attempts = 0;
        const maxAttempts = 150; // 5 minutes max

        const pollStatus = async () => {
          attempts++;

          try {
            const status = await utils.homework.getStatus.fetch({ homeworkId });

            if (status.status === "completed") {
              setUploadState({
                status: "completed",
                progress: 100,
                homeworkId,
              });
              // Invalidate list to refresh
              utils.homework.list.invalidate();
              return;
            }

            if (status.status === "failed") {
              setUploadState({
                status: "error",
                progress: 0,
                error: status.errorMessage || "Processing failed",
                homeworkId,
              });
              return;
            }

            // Still processing - update progress
            const progressEstimate = Math.min(50 + attempts, 95);
            setUploadState({
              status: "processing",
              progress: progressEstimate,
              homeworkId,
            });

            // Continue polling
            if (attempts < maxAttempts) {
              setTimeout(pollStatus, POLLING_INTERVAL_MS);
            } else {
              setUploadState({
                status: "error",
                progress: 0,
                error: "Processing timed out. Please check back later.",
                homeworkId,
              });
            }
          } catch {
            // Polling error - retry
            if (attempts < maxAttempts) {
              setTimeout(pollStatus, POLLING_INTERVAL_MS);
            }
          }
        };

        // Start polling
        setTimeout(pollStatus, POLLING_INTERVAL_MS);
      } catch (error) {
        setUploadState({
          status: "error",
          progress: 0,
          error: error instanceof Error ? error.message : "Upload failed",
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
