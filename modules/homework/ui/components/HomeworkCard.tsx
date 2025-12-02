// modules/homework/ui/components/HomeworkCard.tsx
// Card component for displaying homework in list view

"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Card } from "@/shared/ui";
import { STATUS_STYLES, XP_PER_QUESTION_VIEW } from "../../config/constants";
import type { HomeworkListItem } from "../../types";

interface HomeworkCardProps {
  homework: HomeworkListItem;
  onClick?: () => void;
  onDelete?: () => void;
}

export function HomeworkCard({
  homework,
  onClick,
  onDelete,
}: HomeworkCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isHebrew = locale === "he";

  // Get status config
  const statusConfig = STATUS_STYLES[homework.status];

  // Format date
  const formattedDate = new Date(homework.$createdAt).toLocaleDateString(
    isHebrew ? "he-IL" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  // Get counts
  const viewedCount = homework.viewedCount;
  const totalQuestions = homework.questionCount;
  const progressPercent =
    totalQuestions > 0 ? Math.round((viewedCount / totalQuestions) * 100) : 0;

  // Calculate potential XP
  const potentialXp =
    (totalQuestions - viewedCount) * XP_PER_QUESTION_VIEW;

  return (
    <Card
      className={`
        relative cursor-pointer transition-all duration-200 hover:shadow-lg
        ${homework.status === "completed" ? "" : "opacity-80"}
      `}
      onClick={onClick}
    >
      {/* Delete button */}
      {onDelete && homework.status !== "processing" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-4 end-4 p-2 text-gray-400 hover:text-error-500 transition-colors rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20"
          title={t("common.delete")}
        >
          <Icon icon="tabler:trash" height={18} />
        </button>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4 pe-10">
        <div
          className={`
          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
          ${statusConfig.bg}
        `}
        >
          <Icon
            icon={
              homework.status === "completed"
                ? "tabler:file-check"
                : statusConfig.icon
            }
            height={24}
            className={`
              ${statusConfig.text}
              ${homework.status === "processing" ? "animate-spin" : ""}
            `}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {homework.title || homework.originalFileName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formattedDate}
          </p>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
          ${statusConfig.bg} ${statusConfig.text}
        `}
        >
          <Icon
            icon={statusConfig.icon}
            height={14}
            className={homework.status === "processing" ? "animate-spin" : ""}
          />
          {isHebrew ? statusConfig.labelHe : statusConfig.label}
        </span>

        {homework.status === "completed" && totalQuestions > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {viewedCount}/{totalQuestions} {t("homework.questionsViewed")}
          </span>
        )}
      </div>

      {/* Progress and stats */}
      {homework.status === "completed" && totalQuestions > 0 && (
        <>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`
                  h-full rounded-full transition-all duration-300
                  ${
                    progressPercent === 100
                      ? "bg-success-500"
                      : "bg-primary-500"
                  }
                `}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {/* Questions count */}
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <Icon icon="tabler:list-numbers" height={16} />
                <span>
                  {totalQuestions} {t("homework.questions")}
                </span>
              </div>
            </div>

            {/* Potential XP */}
            {potentialXp > 0 && (
              <div className="flex items-center gap-1.5 text-success-600 dark:text-success-400 font-medium">
                <Icon icon="tabler:star" height={16} />
                <span>+{potentialXp} XP</span>
              </div>
            )}

            {/* Completed badge */}
            {progressPercent === 100 && (
              <div className="flex items-center gap-1.5 text-success-600 dark:text-success-400 font-medium">
                <Icon icon="tabler:circle-check" height={16} />
                <span>{t("homework.allViewed")}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Processing message */}
      {homework.status === "processing" && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("homework.processingMessage")}
        </p>
      )}

      {/* Failed message */}
      {homework.status === "failed" && (
        <p className="text-sm text-error-600 dark:text-error-400">
          {t("homework.errors.processingFailed")}
        </p>
      )}
    </Card>
  );
}
