// shared/ui/session/SessionNavigation.tsx
// Navigation controls for practice sessions

"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui";

interface SessionNavigationProps {
  /** Current question index (0-based) */
  currentIndex: number;
  /** Total questions */
  total: number;
  /** Whether current question has been viewed/answered */
  isCurrentCompleted: boolean;
  /** Navigate to previous question */
  onPrevious: () => void;
  /** Navigate to next question */
  onNext: () => void;
  /** Complete session (only shown on last question when all complete) */
  onComplete: () => void;
  /** Whether all questions are completed */
  allCompleted: boolean;
  /** Is completing in progress */
  isCompleting?: boolean;
  /** Disable navigation during loading */
  isLoading?: boolean;
}

/**
 * SessionNavigation - Bottom navigation bar with prev/next/complete
 */
export function SessionNavigation({
  currentIndex,
  total,
  isCurrentCompleted,
  onPrevious,
  onNext,
  onComplete,
  allCompleted,
  isCompleting = false,
  isLoading = false,
}: SessionNavigationProps) {
  const t = useTranslations();

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;
  const canComplete = isLast && allCompleted;

  return (
    <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-4">
      <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto">
        {/* Previous button */}
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst || isLoading}
          className="flex-1 sm:flex-none"
        >
          <Icon icon="tabler:chevron-left" height={18} className="me-1 rtl:rotate-180" />
          <span className="hidden sm:inline">{t("session.previous")}</span>
          <span className="sm:hidden">{t("session.prev")}</span>
        </Button>

        {/* Progress indicator (mobile) */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium">
            {currentIndex + 1}
          </span>
          <span>/</span>
          <span>{total}</span>
        </div>

        {/* Next or Complete button */}
        {canComplete ? (
          <Button
            variant="success"
            onClick={onComplete}
            disabled={isCompleting}
            isLoading={isCompleting}
            className="flex-1 sm:flex-none"
          >
            <Icon icon="tabler:check" height={18} className="me-1" />
            {t("session.completeSession")}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={onNext}
            disabled={isLast || isLoading}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">{t("session.next")}</span>
            <span className="sm:hidden">{t("session.next")}</span>
            <Icon icon="tabler:chevron-right" height={18} className="ms-1 rtl:rotate-180" />
          </Button>
        )}
      </div>

      {/* Hint to view solution if not completed */}
      {!isCurrentCompleted && !isLoading && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
          {t("session.viewSolutionToProgress")}
        </p>
      )}
    </div>
  );
}

interface SessionQuickNavProps {
  /** Current question index (0-based) */
  currentIndex: number;
  /** Total questions */
  total: number;
  /** Array of completed question indices */
  completedIndices: number[];
  /** Navigate to specific question */
  onNavigate: (index: number) => void;
  /** Is any navigation disabled */
  disabled?: boolean;
}

/**
 * SessionQuickNav - Grid of question numbers for quick navigation
 */
export function SessionQuickNav({
  currentIndex,
  total,
  completedIndices,
  onNavigate,
  disabled = false,
}: SessionQuickNavProps) {
  const t = useTranslations();
  const completedSet = new Set(completedIndices);

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {t("session.jumpToQuestion")}
      </p>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: total }, (_, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = completedSet.has(index);

          return (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              disabled={disabled}
              className={`
                w-9 h-9 rounded-lg font-medium text-sm transition-all
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                ${
                  isCurrent
                    ? "bg-primary-500 text-white ring-2 ring-primary-300 dark:ring-primary-700"
                    : isCompleted
                    ? "bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }
              `}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
