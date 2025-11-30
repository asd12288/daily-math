"use client";

// modules/admin/ui/components/QuestionTable.tsx
// Table component for displaying questions

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import type { Exercise } from "@/lib/appwrite/types";
import { getDifficultyColor, truncateText } from "../../lib/utils";

interface QuestionTableProps {
  questions: Exercise[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  onEdit: (question: Exercise) => void;
  onDelete: (questionId: string) => void;
  onView: (question: Exercise) => void;
}

export function QuestionTable({
  questions,
  isLoading,
  selectedIds,
  onSelectIds,
  onEdit,
  onDelete,
  onView,
}: QuestionTableProps) {
  const t = useTranslations();

  const handleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      onSelectIds([]);
    } else {
      onSelectIds(questions.map((q) => q.$id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectIds(selectedIds.filter((i) => i !== id));
    } else {
      onSelectIds([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <Icon icon="tabler:loader-2" className="animate-spin text-primary-600" height={32} />
          <span className="ms-3 text-gray-600 dark:text-gray-400">
            {t("admin.messages.loading")}
          </span>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <Icon
            icon="tabler:database-off"
            className="mx-auto text-gray-400"
            height={48}
          />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {t("admin.messages.noQuestions")}
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {t("admin.messages.noQuestionsDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              {/* Checkbox */}
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === questions.length && questions.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              {/* Question */}
              <th className="px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t("admin.table.question")}
              </th>
              {/* Course */}
              <th className="px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t("admin.table.course")}
              </th>
              {/* Difficulty */}
              <th className="px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t("admin.table.difficulty")}
              </th>
              {/* Type */}
              <th className="px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t("admin.table.type")}
              </th>
              {/* Status */}
              <th className="px-4 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t("admin.table.status")}
              </th>
              {/* Actions */}
              <th className="px-4 py-3 text-end text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t("admin.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {questions.map((question) => (
              <tr
                key={question.$id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
              >
                {/* Checkbox */}
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(question.$id)}
                    onChange={() => handleSelectOne(question.$id)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                {/* Question */}
                <td className="px-4 py-3">
                  <div className="max-w-md">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {truncateText(question.question, 80)}
                    </p>
                    {question.tags && question.tags.length > 0 && (
                      <div className="mt-1 flex gap-1 flex-wrap">
                        {question.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {question.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{question.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                {/* Course */}
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {question.courseId}
                  </span>
                </td>
                {/* Difficulty */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                      question.difficulty
                    )}`}
                  >
                    {t(`difficulty.${question.difficulty}`)}
                  </span>
                </td>
                {/* Type */}
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t(`answerType.${question.answerType}`)}
                  </span>
                </td>
                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      question.isActive
                        ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {question.isActive ? t("admin.status.active") : t("admin.status.inactive")}
                  </span>
                </td>
                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(question)}
                      className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={t("admin.questions.view")}
                    >
                      <Icon icon="tabler:eye" height={18} />
                    </button>
                    <button
                      onClick={() => onEdit(question)}
                      className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={t("admin.questions.edit")}
                    >
                      <Icon icon="tabler:edit" height={18} />
                    </button>
                    <button
                      onClick={() => onDelete(question.$id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-error-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={t("admin.questions.delete")}
                    >
                      <Icon icon="tabler:trash" height={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QuestionTable;
