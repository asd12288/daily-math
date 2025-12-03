// shared/ui/session/SessionQuestion.tsx
// Unified question display component for all session types

"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/shared/ui";
import { MathDisplay } from "@/shared/ui/math-display";

type Difficulty = "easy" | "medium" | "hard";

interface SessionQuestionProps {
  /** Question number in the session (1-indexed) */
  number: number;
  /** Total questions in session */
  total?: number;
  /** Question text (supports LaTeX) */
  content: string;
  /** Hebrew version of the question */
  contentHe?: string;
  /** Question difficulty */
  difficulty: Difficulty;
  /** XP reward for this question */
  xpReward: number;
  /** Estimated time in minutes */
  estimatedMinutes?: number;
  /** Is this a sub-question (e.g., part a, b, c) */
  isSubQuestion?: boolean;
  /** Sub-question label (e.g., "a", "b", "1") */
  subLabel?: string;
  /** Parent question context (for sub-questions) */
  parentContext?: string;
  /** Whether the question has been viewed/answered */
  isCompleted?: boolean;
  /** Current locale */
  locale?: "en" | "he";
  /** Additional CSS classes */
  className?: string;
}

const DIFFICULTY_CONFIG: Record<Difficulty, {
  color: string;
  bg: string;
  icon: string;
  label: string;
  labelHe: string;
}> = {
  easy: {
    color: "text-success-700 dark:text-success-400",
    bg: "bg-success-100 dark:bg-success-900/30",
    icon: "tabler:star",
    label: "Easy",
    labelHe: "קל",
  },
  medium: {
    color: "text-warning-700 dark:text-warning-400",
    bg: "bg-warning-100 dark:bg-warning-900/30",
    icon: "tabler:star-half-filled",
    label: "Medium",
    labelHe: "בינוני",
  },
  hard: {
    color: "text-error-700 dark:text-error-400",
    bg: "bg-error-100 dark:bg-error-900/30",
    icon: "tabler:stars",
    label: "Hard",
    labelHe: "קשה",
  },
};

export function SessionQuestion({
  number,
  total,
  content,
  contentHe,
  difficulty,
  xpReward,
  estimatedMinutes,
  isSubQuestion = false,
  subLabel,
  parentContext,
  isCompleted = false,
  locale = "en",
  className,
}: SessionQuestionProps) {
  const t = useTranslations();
  const isHebrew = locale === "he";
  const diffConfig = DIFFICULTY_CONFIG[difficulty];

  // Use Hebrew content if available and locale is Hebrew
  const displayContent = isHebrew && contentHe ? contentHe : content;
  const diffLabel = isHebrew ? diffConfig.labelHe : diffConfig.label;

  return (
    <div className={`space-y-3 ${className || ""}`}>
      {/* Parent context for sub-questions */}
      {isSubQuestion && parentContext && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Icon icon="tabler:info-circle" height={16} />
            <span>{t("session.parentContext")}</span>
          </div>
          <div className="text-gray-700 dark:text-gray-300">
            <MathDisplay content={parentContext} size="md" />
          </div>
        </div>
      )}

      {/* Main question card */}
      <Card className="relative overflow-visible">
        {/* Question number badge */}
        <div className="absolute -top-3 -start-3 z-10">
          <div
            className={`
              min-w-8 h-8 px-2 rounded-lg shadow-md flex items-center justify-center
              ${isCompleted
                ? "bg-success-500 text-white"
                : "bg-primary-600 dark:bg-primary-500 text-white"
              }
            `}
          >
            <span className="font-bold text-sm">
              {isSubQuestion && subLabel ? subLabel : number}
            </span>
          </div>
        </div>

        <CardContent className="pt-4">
          {/* Header: Progress + Difficulty + XP */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Progress indicator (if total provided and not sub-question) */}
              {total && !isSubQuestion && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {number}/{total}
                </span>
              )}

              {/* Difficulty badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${diffConfig.bg} ${diffConfig.color}`}
              >
                <Icon icon={diffConfig.icon} height={12} />
                {diffLabel}
              </span>

              {/* Estimated time */}
              {estimatedMinutes && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <Icon icon="tabler:clock" height={12} />
                  ~{estimatedMinutes} {t("common.min")}
                </span>
              )}
            </div>

            {/* XP reward */}
            <div className="flex items-center gap-1 text-success-600 dark:text-success-400">
              <Icon icon="tabler:star-filled" height={14} />
              <span className="text-sm font-medium">{xpReward} XP</span>
            </div>
          </div>

          {/* Question content */}
          <div className="min-h-[80px] flex items-center justify-center py-6">
            <div className="text-center w-full">
              <MathDisplay
                content={displayContent}
                size="lg"
                className="text-gray-900 dark:text-gray-100 leading-relaxed"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * SessionQuestionGroup - For displaying parent question with sub-questions together
 */
interface SessionQuestionGroupProps {
  /** Parent question (main question) */
  parent: {
    content: string;
    contentHe?: string;
  };
  /** Sub-questions */
  subQuestions: Array<{
    id: string;
    label: string;
    content: string;
    contentHe?: string;
    difficulty: Difficulty;
    xpReward: number;
    isCompleted?: boolean;
  }>;
  /** Group number in the session */
  groupNumber: number;
  /** Total groups */
  totalGroups?: number;
  /** Current locale */
  locale?: "en" | "he";
  /** Which sub-question is currently active */
  activeSubIndex?: number;
  /** Callback when a sub-question is clicked */
  onSubQuestionClick?: (index: number) => void;
}

export function SessionQuestionGroup({
  parent,
  subQuestions,
  groupNumber,
  totalGroups,
  locale = "en",
  activeSubIndex,
  onSubQuestionClick,
}: SessionQuestionGroupProps) {
  const t = useTranslations();
  const isHebrew = locale === "he";

  const parentContent = isHebrew && parent.contentHe ? parent.contentHe : parent.content;

  return (
    <div className="space-y-4">
      {/* Progress header */}
      {totalGroups && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {t("session.questionGroup")} {groupNumber}/{totalGroups}
          </span>
          <span className="text-xs">
            {subQuestions.length} {subQuestions.length === 1 ? t("session.part") : t("session.parts")}
          </span>
        </div>
      )}

      {/* Parent question card */}
      <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="font-bold text-sm text-primary-700 dark:text-primary-400">
                {groupNumber}
              </span>
            </div>
            <div className="flex-1 pt-1">
              <MathDisplay
                content={parentContent}
                size="md"
                className="text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-questions */}
      <div className="space-y-3 ms-4 border-s-2 border-gray-200 dark:border-gray-700 ps-4">
        {subQuestions.map((sub, index) => (
          <div
            key={sub.id}
            className={`
              transition-all duration-200
              ${activeSubIndex === index ? "scale-[1.02]" : ""}
              ${onSubQuestionClick ? "cursor-pointer hover:scale-[1.01]" : ""}
            `}
            onClick={() => onSubQuestionClick?.(index)}
          >
            <SessionQuestion
              number={index + 1}
              content={sub.content}
              contentHe={sub.contentHe}
              difficulty={sub.difficulty}
              xpReward={sub.xpReward}
              isSubQuestion={true}
              subLabel={sub.label}
              isCompleted={sub.isCompleted}
              locale={locale}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
