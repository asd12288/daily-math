// shared/ui/session/SessionProgress.tsx
// Progress tracking components for practice sessions

"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";

interface SessionProgressDotsProps {
  /** Current question index (0-based) */
  currentIndex: number;
  /** Total number of questions */
  total: number;
  /** Array of completed question indices */
  completedIndices: number[];
  /** Optional: click handler to navigate to a question */
  onDotClick?: (index: number) => void;
  /** Size of dots */
  size?: "sm" | "md" | "lg";
}

const DOT_SIZES = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
};

/**
 * SessionProgressDots - Visual dot indicator for question progress
 */
export function SessionProgressDots({
  currentIndex,
  total,
  completedIndices,
  onDotClick,
  size = "md",
}: SessionProgressDotsProps) {
  const dotSize = DOT_SIZES[size];
  const completedSet = new Set(completedIndices);

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, index) => {
        const isCurrent = index === currentIndex;
        const isCompleted = completedSet.has(index);
        const isClickable = onDotClick !== undefined;

        return (
          <button
            key={index}
            onClick={() => onDotClick?.(index)}
            disabled={!isClickable}
            className={`
              ${dotSize} rounded-full transition-all duration-200
              ${isClickable ? "cursor-pointer" : "cursor-default"}
              ${
                isCurrent
                  ? "bg-primary-500 ring-2 ring-primary-200 dark:ring-primary-800 scale-125"
                  : isCompleted
                  ? "bg-success-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }
              ${isClickable && !isCurrent ? "hover:scale-110" : ""}
            `}
            title={`Question ${index + 1}`}
          />
        );
      })}
    </div>
  );
}

interface SessionProgressBarProps {
  /** Number of completed questions */
  completed: number;
  /** Total number of questions */
  total: number;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Bar height */
  height?: "sm" | "md" | "lg";
}

const BAR_HEIGHTS = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

/**
 * SessionProgressBar - Linear progress bar
 */
export function SessionProgressBar({
  completed,
  total,
  showPercentage = false,
  height = "md",
}: SessionProgressBarProps) {
  const t = useTranslations();
  const barHeight = BAR_HEIGHTS[height];
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed >= total;

  return (
    <div className="w-full">
      {showPercentage && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>
            {completed}/{total} {t("session.completed")}
          </span>
          <span>{percentage}%</span>
        </div>
      )}
      <div
        className={`w-full ${barHeight} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}
      >
        <div
          className={`${barHeight} rounded-full transition-all duration-500 ease-out ${
            isComplete ? "bg-success-500" : "bg-primary-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface SessionXPCounterProps {
  /** Total XP earned so far in session */
  earned: number;
  /** Potential XP remaining (optional) */
  remaining?: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show animation on change */
  animate?: boolean;
}

/**
 * SessionXPCounter - Shows earned XP with optional remaining
 */
export function SessionXPCounter({
  earned,
  remaining,
  size = "md",
  animate = true,
}: SessionXPCounterProps) {
  const t = useTranslations();

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <div className="flex items-center gap-3">
      {/* Earned XP */}
      <div
        className={`flex items-center gap-1 text-success-600 dark:text-success-400 font-semibold ${sizeClasses[size]}`}
      >
        <Icon icon="tabler:star-filled" height={iconSizes[size]} />
        <span className={animate ? "transition-all duration-300" : ""}>
          +{earned} XP
        </span>
      </div>

      {/* Remaining XP (if shown) */}
      {remaining !== undefined && remaining > 0 && (
        <div
          className={`flex items-center gap-1 text-gray-400 dark:text-gray-500 ${sizeClasses[size]}`}
        >
          <span className="text-xs">({remaining} {t("session.remaining")})</span>
        </div>
      )}
    </div>
  );
}

interface SessionHeaderProps {
  /** Session title (topic name, homework name, etc.) */
  title: string;
  /** Session subtitle (course name, date, etc.) */
  subtitle?: string;
  /** Current question index (0-based) */
  currentIndex: number;
  /** Total questions */
  total: number;
  /** Completed question indices */
  completedIndices: number[];
  /** XP earned so far */
  xpEarned: number;
  /** Optional: back button handler */
  onBack?: () => void;
  /** Optional: close button handler */
  onClose?: () => void;
  /** Progress dot click handler */
  onDotClick?: (index: number) => void;
}

/**
 * SessionHeader - Full header component with title, progress, and XP
 */
export function SessionHeader({
  title,
  subtitle,
  currentIndex,
  total,
  completedIndices,
  xpEarned,
  onBack,
  onClose,
  onDotClick,
}: SessionHeaderProps) {
  const t = useTranslations();

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Back button + Title */}
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ms-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Icon icon="tabler:arrow-left" height={20} className="rtl:rotate-180" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center: Progress dots */}
        <div className="hidden sm:flex items-center gap-4">
          <SessionProgressDots
            currentIndex={currentIndex}
            total={total}
            completedIndices={completedIndices ?? []}
            onDotClick={onDotClick}
            size="sm"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {currentIndex + 1}/{total}
          </span>
        </div>

        {/* Right: XP + Close */}
        <div className="flex items-center gap-3">
          <SessionXPCounter earned={xpEarned} size="sm" />
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 -me-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title={t("common.close")}
            >
              <Icon icon="tabler:x" height={20} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="sm:hidden mt-3">
        <SessionProgressBar
          completed={completedIndices?.length ?? 0}
          total={total}
          height="sm"
        />
      </div>
    </div>
  );
}
