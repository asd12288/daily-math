"use client";

// modules/admin/ui/components/QuestionPreview.tsx
// Modal component for previewing a question

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Button, MathDisplay } from "@/shared/ui";
import type { Exercise } from "@/lib/appwrite/types";
import { getDifficultyColor, formatEstimatedTime } from "../../lib/utils";

interface QuestionPreviewProps {
  question: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (question: Exercise) => void;
}

export function QuestionPreview({
  question,
  isOpen,
  onClose,
  onEdit,
}: QuestionPreviewProps) {
  const t = useTranslations();

  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("admin.questions.preview")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon icon="tabler:x" height={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(
                question.difficulty
              )}`}
            >
              {t(`difficulty.${question.difficulty}`)}
            </span>
            <span className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
              {t(`answerType.${question.answerType}`)}
            </span>
            {question.estimatedTime && (
              <span className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                <Icon icon="tabler:clock" className="inline me-1" height={14} />
                {formatEstimatedTime(question.estimatedTime)}
              </span>
            )}
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                question.isActive
                  ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {question.isActive ? t("admin.status.active") : t("admin.status.inactive")}
            </span>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              {t("admin.preview.question")}
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <MathDisplay content={question.question} />
            </div>
            {question.questionHe && (
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg" dir="rtl">
                <p className="text-xs text-gray-400 mb-2">(Hebrew)</p>
                <MathDisplay content={question.questionHe} />
              </div>
            )}
          </div>

          {/* Answer */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              {t("admin.preview.answer")}
            </h3>
            <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
              <MathDisplay content={question.correctAnswer} />
            </div>
          </div>

          {/* Solution */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              {t("admin.preview.solution")}
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <MathDisplay content={question.solution} />
            </div>
            {question.solutionHe && (
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg" dir="rtl">
                <p className="text-xs text-gray-400 mb-2">(Hebrew)</p>
                <MathDisplay content={question.solutionHe} />
              </div>
            )}
          </div>

          {/* Hints */}
          {question.hints && question.hints.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                {t("admin.preview.hints")}
              </h3>
              <ul className="space-y-2">
                {question.hints.map((hint, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg"
                  >
                    <Icon
                      icon="tabler:bulb"
                      className="text-warning-500 flex-shrink-0 mt-0.5"
                      height={18}
                    />
                    <span className="text-gray-700 dark:text-gray-300">{hint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                {t("admin.preview.tags")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            {t("admin.close")}
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(question)}>
              <Icon icon="tabler:edit" className="me-2" height={18} />
              {t("admin.questions.edit")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionPreview;
