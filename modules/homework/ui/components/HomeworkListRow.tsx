// modules/homework/ui/components/HomeworkListRow.tsx
// Compact list row component for homework items

"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { STATUS_STYLES, XP_PER_QUESTION_VIEW, getSubjectStyles } from "../../config/constants";
import type { HomeworkListItem } from "../../types";

interface HomeworkListRowProps {
  homework: HomeworkListItem;
  onClick?: () => void;
  onDelete?: () => void;
}

export function HomeworkListRow({
  homework,
  onClick,
  onDelete,
}: HomeworkListRowProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isHebrew = locale === "he";

  // Get status config
  const statusConfig = STATUS_STYLES[homework.status];

  // Format date
  const formattedDate = new Date(homework.$createdAt).toLocaleDateString(
    isHebrew ? "he-IL" : "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );

  // Get counts and progress
  const viewedCount = homework.viewedCount;
  const totalQuestions = homework.questionCount;
  const progressPercent =
    totalQuestions > 0 ? Math.round((viewedCount / totalQuestions) * 100) : 0;
  const potentialXp = (totalQuestions - viewedCount) * XP_PER_QUESTION_VIEW;

  // Get subject styles
  const subjectStyles = homework.primarySubject
    ? getSubjectStyles(homework.primarySubject)
    : null;

  const isClickable = homework.status === "completed";
  const isProcessing = homework.status === "processing";

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        transition-colors duration-150
        ${isClickable ? "cursor-pointer hover:border-gray-300 dark:hover:border-gray-600" : ""}
        ${!isClickable && !isProcessing ? "opacity-70" : ""}
      `}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Status Icon */}
      <div
        className={`
          w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
          ${statusConfig.bg}
        `}
      >
        <Icon
          icon={homework.status === "completed" ? "tabler:file-check" : statusConfig.icon}
          height={18}
          className={`
            ${statusConfig.text}
            ${isProcessing ? "animate-spin" : ""}
          `}
        />
      </div>

      {/* Title - flex-1 to take remaining space */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {homework.title || homework.originalFileName}
        </h3>
      </div>

      {/* Subject Badge */}
      {subjectStyles && homework.primarySubject && (
        <span
          className={`
            hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0
            ${subjectStyles.bg} ${subjectStyles.text}
          `}
        >
          {homework.primarySubject}
        </span>
      )}

      {/* Date */}
      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 w-12 text-center hidden md:block">
        {formattedDate}
      </span>

      {/* Progress section - only for completed */}
      {homework.status === "completed" && totalQuestions > 0 && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Progress text */}
          <span className="text-xs text-gray-600 dark:text-gray-400 w-10 text-end">
            {viewedCount}/{totalQuestions}
          </span>

          {/* Mini progress bar */}
          <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden hidden sm:block">
            <div
              className={`
                h-full rounded-full transition-all duration-300
                ${progressPercent === 100 ? "bg-success-500" : "bg-primary-500"}
              `}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Status text for non-completed */}
      {homework.status !== "completed" && (
        <span
          className={`
            text-xs font-medium flex-shrink-0
            ${statusConfig.text}
          `}
        >
          {isHebrew ? statusConfig.labelHe : statusConfig.label}
        </span>
      )}

      {/* Potential XP or Done badge */}
      <div className="w-16 flex-shrink-0 flex justify-end">
        {homework.status === "completed" && progressPercent === 100 && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success-600 dark:text-success-400">
            <Icon icon="tabler:circle-check" height={14} />
            <span className="hidden sm:inline">{t("homework.done")}</span>
          </span>
        )}
        {homework.status === "completed" && potentialXp > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success-600 dark:text-success-400">
            <Icon icon="tabler:star" height={14} />
            <span>+{potentialXp}</span>
          </span>
        )}
      </div>

      {/* Delete button */}
      {onDelete && !isProcessing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 text-gray-400 hover:text-error-500 transition-colors rounded hover:bg-error-50 dark:hover:bg-error-900/20 flex-shrink-0"
          title={t("common.delete")}
        >
          <Icon icon="tabler:trash" height={16} />
        </button>
      )}
    </div>
  );
}
