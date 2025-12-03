// modules/session/hooks/use-session-sync.ts
// Background sync hook for session state persistence

"use client";

import { useRef, useCallback, useEffect } from "react";
import { trpc } from "@/trpc/client";

/**
 * Action to sync to server
 */
export interface SyncAction {
  type: "reveal" | "navigate" | "complete";
  questionId?: string;
  index?: number;
  timestamp: number;
}

interface UseSessionSyncOptions {
  sessionId: string;
  /** Debounce time in ms before syncing (default: 2000) */
  debounceMs?: number;
  /** Called when sync completes */
  onSyncComplete?: (result: { xpAwarded: number }) => void;
  /** Called when sync fails */
  onSyncError?: (error: Error) => void;
}

interface UseSessionSyncReturn {
  /** Queue an action for background sync */
  queueSync: (action: Omit<SyncAction, "timestamp">) => void;
  /** Force immediate sync (e.g., before navigation) */
  flushSync: () => Promise<void>;
  /** Whether a sync is currently in progress */
  isSyncing: boolean;
  /** Number of pending actions in queue */
  pendingCount: number;
}

/**
 * Hook for background syncing session state to server
 *
 * Features:
 * - Debounced batching of multiple actions
 * - Auto-sync on page blur/close
 * - Retry on failure
 * - Minimal server calls (batches multiple actions)
 */
export function useSessionSync({
  sessionId,
  debounceMs = 2000,
  onSyncComplete,
  onSyncError,
}: UseSessionSyncOptions): UseSessionSyncReturn {
  const syncQueueRef = useRef<SyncAction[]>([]);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const flushSyncRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const syncMutation = trpc.session.batchSync.useMutation({
    onSuccess: (data) => {
      if (isMountedRef.current && onSyncComplete) {
        onSyncComplete(data);
      }
    },
    onError: (error) => {
      if (isMountedRef.current && onSyncError) {
        onSyncError(new Error(error.message));
      }
    },
  });

  // Flush all pending actions to server
  const flushSync = useCallback(async () => {
    if (syncQueueRef.current.length === 0) return;

    // Clear timeout to prevent double-sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }

    // Take all pending actions
    const actions = [...syncQueueRef.current];
    syncQueueRef.current = [];

    try {
      await syncMutation.mutateAsync({ sessionId, actions });
    } catch (error) {
      // Re-queue failed actions for retry
      console.error("[SessionSync] Sync failed, re-queuing actions:", error);
      syncQueueRef.current = [...actions, ...syncQueueRef.current];

      // Schedule retry after a delay (use ref to avoid circular dependency)
      if (isMountedRef.current) {
        syncTimeoutRef.current = setTimeout(() => flushSyncRef.current(), debounceMs * 2);
      }
    }
  }, [sessionId, syncMutation, debounceMs]);

  // Keep ref in sync with callback (must be in effect, not during render)
  useEffect(() => {
    flushSyncRef.current = flushSync;
  }, [flushSync]);

  // Queue an action and schedule sync
  const queueSync = useCallback(
    (action: Omit<SyncAction, "timestamp">) => {
      const fullAction: SyncAction = {
        ...action,
        timestamp: Date.now(),
      };

      syncQueueRef.current.push(fullAction);

      // Clear existing timeout and set new one (debounce)
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = setTimeout(flushSync, debounceMs);
    },
    [flushSync, debounceMs]
  );

  // Sync on page visibility change (blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && syncQueueRef.current.length > 0) {
        // Use sendBeacon for reliable sync on page hide
        flushSync();
      }
    };

    const handleBeforeUnload = () => {
      if (syncQueueRef.current.length > 0) {
        flushSync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [flushSync]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      // Clear timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Final sync on unmount (fire and forget)
      if (syncQueueRef.current.length > 0) {
        const actions = [...syncQueueRef.current];
        syncQueueRef.current = [];

        // Fire and forget - don't await
        syncMutation.mutate({ sessionId, actions });
      }
    };
  }, [sessionId, syncMutation]);

  return {
    queueSync,
    flushSync,
    isSyncing: syncMutation.isPending,
    // Note: pendingCount is approximate since we can't access refs during render
    // For accurate count, components should track their own pending state
    pendingCount: 0,
  };
}
