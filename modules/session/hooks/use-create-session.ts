// modules/session/hooks/use-create-session.ts
// Hook for creating new sessions

"use client";

import { trpc } from "@/trpc/client";
import { useCallback, useState } from "react";
import type {
  SessionSource,
  SessionMode,
  SessionFilters,
  SessionDifficulty,
} from "../types/session.types";
import { DEFAULT_FILTERS, SESSION_PRESETS } from "../config/constants";

interface UseCreateSessionOptions {
  source: SessionSource;
  sourceId: string;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

interface UseCreateSessionReturn {
  // Source info
  sourceInfo: { name: string; nameHe?: string } | null | undefined;
  questionCounts: { total: number; easy: number; medium: number; hard: number } | null | undefined;
  isLoadingInfo: boolean;
  // Filters state
  filters: SessionFilters;
  setFilters: (filters: SessionFilters) => void;
  setDifficulty: (difficulty: SessionDifficulty | "all") => void;
  setCount: (count: number) => void;
  // Mode state
  mode: SessionMode;
  setMode: (mode: SessionMode) => void;
  // Presets
  presets: typeof SESSION_PRESETS;
  applyPreset: (presetId: string) => void;
  // Create action
  createSession: () => Promise<string>;
  isCreating: boolean;
  error: Error | null;
  // Computed
  availableQuestionCount: number;
}

export function useCreateSession({
  source,
  sourceId,
  onSuccess,
  onError,
}: UseCreateSessionOptions): UseCreateSessionReturn {
  const utils = trpc.useUtils();

  // Local state for filters
  const [filters, setFilters] = useState<SessionFilters>({
    ...DEFAULT_FILTERS,
  });
  const [mode, setMode] = useState<SessionMode>(
    source === "homework" ? "review" : "learn"
  );

  // Fetch source info
  const { data: sourceInfo, isLoading: isLoadingSourceInfo } =
    trpc.session.getSourceInfo.useQuery(
      { source, sourceId },
      { enabled: !!sourceId }
    );

  // Fetch question counts
  const { data: questionCounts, isLoading: isLoadingCounts } =
    trpc.session.getQuestionCounts.useQuery(
      { source, sourceId },
      { enabled: !!sourceId }
    );

  // Create mutation
  const createMutation = trpc.session.create.useMutation({
    onSuccess: (session) => {
      utils.session.listActive.invalidate();
      if (onSuccess) {
        onSuccess(session.id);
      }
    },
    onError: (error) => {
      if (onError) {
        onError(error as unknown as Error);
      }
    },
  });

  // Filter setters
  const setDifficulty = useCallback(
    (difficulty: SessionDifficulty | "all") => {
      setFilters((prev) => ({ ...prev, difficulty }));
    },
    []
  );

  const setCount = useCallback((count: number) => {
    setFilters((prev) => ({ ...prev, count }));
  }, []);

  // Apply preset
  const applyPreset = useCallback((presetId: string) => {
    const preset = SESSION_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setFilters(preset.filters);
    }
  }, []);

  // Create session
  const createSession = useCallback(async () => {
    const result = await createMutation.mutateAsync({
      source,
      sourceId,
      mode,
      filters,
    });
    return result.id;
  }, [createMutation, source, sourceId, mode, filters]);

  // Compute available question count based on current filter
  const availableQuestionCount = questionCounts
    ? filters.difficulty === "all" || !filters.difficulty
      ? questionCounts.total
      : questionCounts[filters.difficulty as SessionDifficulty]
    : 0;

  return {
    // Source info
    sourceInfo,
    questionCounts,
    isLoadingInfo: isLoadingSourceInfo || isLoadingCounts,
    // Filters state
    filters,
    setFilters,
    setDifficulty,
    setCount,
    // Mode state
    mode,
    setMode,
    // Presets
    presets: SESSION_PRESETS,
    applyPreset,
    // Create action
    createSession,
    isCreating: createMutation.isPending,
    error: createMutation.error as Error | null,
    // Computed
    availableQuestionCount,
  };
}
