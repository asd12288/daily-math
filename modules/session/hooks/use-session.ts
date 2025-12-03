// modules/session/hooks/use-session.ts
// Hook for managing an active session with instant local-first navigation

"use client";

import { trpc } from "@/trpc/client";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useSessionSync } from "./use-session-sync";
import type { Session, SessionQuestion } from "../types/session.types";

interface UseSessionOptions {
  sessionId: string;
  onXpAwarded?: (xp: number) => void;
  onComplete?: () => void;
}

interface UseSessionReturn {
  session: Session | null | undefined;
  isLoading: boolean;
  error: Error | null;
  // Current question
  currentQuestion: SessionQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  // Progress
  viewedCount: number;
  completedIndices: number[];
  xpEarned: number;
  isCompleted: boolean;
  progress: number; // 0-100
  // Actions (now instant!)
  revealSolution: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  completeSession: () => Promise<void>;
  // State
  isRevealing: boolean;
  isNavigating: boolean;
  isCompleting: boolean;
  isSyncing: boolean;
}

export function useSession({
  sessionId,
  onXpAwarded,
  onComplete,
}: UseSessionOptions): UseSessionReturn {
  const utils = trpc.useUtils();

  // ============================================
  // LOCAL STATE FOR INSTANT NAVIGATION
  // ============================================
  const [localIndex, setLocalIndex] = useState(0);
  const [localViewedIds, setLocalViewedIds] = useState<Set<string>>(new Set());
  const [localXp, setLocalXp] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================
  // BACKGROUND SYNC
  // ============================================
  const { queueSync, flushSync, isSyncing } = useSessionSync({
    sessionId,
    onSyncError: (error) => {
      console.error("[useSession] Sync failed:", error);
    },
  });

  // ============================================
  // SERVER DATA (initial load only)
  // ============================================
  const {
    data: session,
    isLoading,
    error,
  } = trpc.session.getById.useQuery(
    { sessionId },
    {
      enabled: !!sessionId,
      refetchOnWindowFocus: false,
      // Don't auto-refetch - we manage state locally
      staleTime: Infinity,
    }
  );

  // Initialize local state from server data (only once per session)
  useEffect(() => {
    if (session && !isInitialized) {
      // Use timeout to avoid synchronous setState in effect
      const timeout = setTimeout(() => {
        setLocalIndex(session.currentIndex);
        setLocalViewedIds(
          new Set(session.questions.filter((q) => q.isViewed).map((q) => q.id))
        );
        setLocalXp(session.xpEarned);
        setIsInitialized(true);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [session, isInitialized]);

  // Reset initialization when session changes
  useEffect(() => {
    const timeout = setTimeout(() => setIsInitialized(false), 0);
    return () => clearTimeout(timeout);
  }, [sessionId]);

  // ============================================
  // LEGACY MUTATIONS (kept as fallback)
  // ============================================
  const _markViewedMutation = trpc.session.markViewed.useMutation({
    onSuccess: (data) => {
      if (data.xpAwarded > 0 && onXpAwarded) {
        onXpAwarded(data.xpAwarded);
      }
    },
  });
  void _markViewedMutation; // Kept for potential future use

  const completeMutation = trpc.session.complete.useMutation({
    onSuccess: () => {
      utils.session.getById.invalidate({ sessionId });
      utils.session.listActive.invalidate();
      if (onComplete) {
        onComplete();
      }
    },
  });

  // ============================================
  // COMPUTED VALUES (from local state)
  // ============================================
  const totalQuestions = session?.totalQuestions ?? 0;

  const currentQuestion = useMemo(() => {
    if (!session) return null;
    return session.questions[localIndex] || null;
  }, [session, localIndex]);

  const viewedCount = localViewedIds.size;

  const progress = useMemo(() => {
    if (totalQuestions === 0) return 0;
    return Math.round((viewedCount / totalQuestions) * 100);
  }, [viewedCount, totalQuestions]);

  // Get indices of completed (viewed) questions
  const completedIndices = useMemo(() => {
    if (!session) return [];
    return session.questions
      .map((q, index) => (localViewedIds.has(q.id) ? index : -1))
      .filter((index) => index !== -1);
  }, [session, localViewedIds]);

  // ============================================
  // INSTANT ACTIONS
  // ============================================

  // INSTANT navigation - no server call
  const goToNext = useCallback(() => {
    if (localIndex < totalQuestions - 1) {
      const newIndex = localIndex + 1;
      setLocalIndex(newIndex);
      queueSync({ type: "navigate", index: newIndex });
    }
  }, [localIndex, totalQuestions, queueSync]);

  const goToPrevious = useCallback(() => {
    if (localIndex > 0) {
      const newIndex = localIndex - 1;
      setLocalIndex(newIndex);
      queueSync({ type: "navigate", index: newIndex });
    }
  }, [localIndex, queueSync]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalQuestions && index !== localIndex) {
        setLocalIndex(index);
        queueSync({ type: "navigate", index });
      }
    },
    [totalQuestions, localIndex, queueSync]
  );

  // INSTANT solution reveal - show immediately, sync in background
  const revealSolution = useCallback(() => {
    const question = session?.questions[localIndex];
    if (!question) return;

    // Already viewed - no action needed
    if (localViewedIds.has(question.id)) return;

    // Instant local update
    setLocalViewedIds((prev) => new Set([...prev, question.id]));
    setLocalXp((prev) => prev + question.xpReward);

    // Trigger XP animation immediately
    if (onXpAwarded) {
      onXpAwarded(question.xpReward);
    }

    // Queue background sync
    queueSync({ type: "reveal", questionId: question.id });
  }, [session, localIndex, localViewedIds, onXpAwarded, queueSync]);

  // Complete session - needs to sync first, then complete
  const completeSession = useCallback(async () => {
    // Flush any pending syncs first
    await flushSync();

    // Then complete the session
    await completeMutation.mutateAsync({ sessionId });
  }, [sessionId, completeMutation, flushSync]);

  // ============================================
  // RETURN
  // ============================================
  return {
    session,
    isLoading,
    error: error as Error | null,
    // Current question (from local state)
    currentQuestion,
    currentIndex: localIndex,
    totalQuestions,
    // Progress (from local state)
    viewedCount,
    completedIndices,
    xpEarned: localXp,
    isCompleted: session?.isCompleted ?? false,
    progress,
    // Actions (now instant!)
    revealSolution,
    goToNext,
    goToPrevious,
    goToIndex,
    completeSession,
    // State
    isRevealing: false, // Always false now - instant reveal
    isNavigating: false, // Always false now - instant navigation
    isCompleting: completeMutation.isPending,
    isSyncing,
  };
}
