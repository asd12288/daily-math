"use client";

// modules/admin/ui/components/QuestionFilters.tsx
// Filter bar for question management

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui";
import type { QuestionFilters as QuestionFiltersType } from "../../types";
import type { ExerciseDifficulty, AnswerType } from "@/lib/appwrite/types";

interface QuestionFiltersProps {
  filters: QuestionFiltersType;
  onFiltersChange: (filters: QuestionFiltersType) => void;
  courses: { id: string; name: string }[];
  topics: { id: string; name: string; courseId: string }[];
}

export function QuestionFiltersPanel({
  filters,
  onFiltersChange,
  courses,
  topics,
}: QuestionFiltersProps) {
  const t = useTranslations();

  const filteredTopics = filters.courseId
    ? topics.filter((topic) => topic.courseId === filters.courseId)
    : topics;

  const handleChange = (key: keyof QuestionFiltersType, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    // Reset topic when course changes
    if (key === "courseId") {
      newFilters.topicId = undefined;
    }
    // Reset page when filters change
    newFilters.page = 1;
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    onFiltersChange({ page: 1, limit: filters.limit || 20 });
  };

  const hasActiveFilters =
    filters.courseId ||
    filters.topicId ||
    filters.difficulty ||
    filters.answerType ||
    filters.search;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Course Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.filters.course")}
          </label>
          <select
            value={filters.courseId || ""}
            onChange={(e) => handleChange("courseId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{t("admin.filters.allCourses")}</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.filters.topic")}
          </label>
          <select
            value={filters.topicId || ""}
            onChange={(e) => handleChange("topicId", e.target.value)}
            disabled={!filters.courseId}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{t("admin.filters.allTopics")}</option>
            {filteredTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.filters.difficulty")}
          </label>
          <select
            value={filters.difficulty || ""}
            onChange={(e) => handleChange("difficulty", e.target.value as ExerciseDifficulty)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{t("admin.filters.allDifficulties")}</option>
            <option value="easy">{t("difficulty.easy")}</option>
            <option value="medium">{t("difficulty.medium")}</option>
            <option value="hard">{t("difficulty.hard")}</option>
          </select>
        </div>

        {/* Answer Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.filters.type")}
          </label>
          <select
            value={filters.answerType || ""}
            onChange={(e) => handleChange("answerType", e.target.value as AnswerType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{t("admin.filters.allTypes")}</option>
            <option value="numeric">{t("answerType.numeric")}</option>
            <option value="expression">{t("answerType.expression")}</option>
            <option value="proof">{t("answerType.proof")}</option>
            <option value="open">{t("answerType.open")}</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.filters.search")}
          </label>
          <div className="relative">
            <Icon
              icon="tabler:search"
              className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"
              height={18}
            />
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) => handleChange("search", e.target.value)}
              placeholder={t("admin.filters.searchPlaceholder")}
              className="w-full ps-10 pe-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-gray-600 dark:text-gray-400"
          >
            <Icon icon="tabler:x" className="me-1" height={16} />
            {t("admin.filters.clear")}
          </Button>
        </div>
      )}
    </div>
  );
}

export default QuestionFiltersPanel;
