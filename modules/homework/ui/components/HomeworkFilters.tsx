// modules/homework/ui/components/HomeworkFilters.tsx
// Compact filter bar with dropdown selects

"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { STATUS_STYLES } from "../../config/constants";
import type { HomeworkStatus, HomeworkDateRange, HomeworkFilterCounts } from "../../types";

interface HomeworkFiltersProps {
  selectedSubject: string;
  selectedStatus: "all" | HomeworkStatus;
  selectedDateRange: HomeworkDateRange;
  onSubjectChange: (subject: string) => void;
  onStatusChange: (status: "all" | HomeworkStatus) => void;
  onDateRangeChange: (dateRange: HomeworkDateRange) => void;
  filterCounts: HomeworkFilterCounts;
}

export function HomeworkFilters({
  selectedSubject,
  selectedStatus,
  selectedDateRange,
  onSubjectChange,
  onStatusChange,
  onDateRangeChange,
  filterCounts,
}: HomeworkFiltersProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isHebrew = locale === "he";

  // Subject options
  const subjectOptions = [
    { key: "all", label: t("homework.filters.all"), count: filterCounts.total },
    ...Object.entries(filterCounts.bySubject)
      .sort((a, b) => b[1] - a[1])
      .map(([subject, count]) => ({ key: subject, label: subject, count })),
  ];

  // Status options
  const statusOptions = [
    { key: "all" as const, label: t("homework.filters.allStatuses"), count: filterCounts.byStatus.all },
    { key: "completed" as const, label: isHebrew ? STATUS_STYLES.completed.labelHe : STATUS_STYLES.completed.label, count: filterCounts.byStatus.completed },
    { key: "processing" as const, label: isHebrew ? STATUS_STYLES.processing.labelHe : STATUS_STYLES.processing.label, count: filterCounts.byStatus.processing },
    { key: "failed" as const, label: isHebrew ? STATUS_STYLES.failed.labelHe : STATUS_STYLES.failed.label, count: filterCounts.byStatus.failed },
  ];

  // Date range options
  const dateRangeOptions = [
    { key: "all" as HomeworkDateRange, label: t("homework.filters.allTime") },
    { key: "today" as HomeworkDateRange, label: t("homework.filters.today") },
    { key: "week" as HomeworkDateRange, label: t("homework.filters.thisWeek") },
    { key: "month" as HomeworkDateRange, label: t("homework.filters.thisMonth") },
  ];

  const selectClassName = `
    appearance-none bg-white dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    rounded-lg px-3 py-1.5 pe-8
    text-sm text-gray-700 dark:text-gray-300
    hover:border-gray-300 dark:hover:border-gray-600
    focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
    cursor-pointer transition-colors
  `;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Icon icon="tabler:filter" height={16} className="text-gray-400" />

      {/* Subject Filter */}
      {subjectOptions.length > 1 && (
        <div className="relative">
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className={selectClassName}
          >
            {subjectOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
          <Icon
            icon="tabler:chevron-down"
            height={14}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      )}

      {/* Status Filter */}
      <div className="relative">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as "all" | HomeworkStatus)}
          className={selectClassName}
        >
          {statusOptions.map((option) => (
            <option
              key={option.key}
              value={option.key}
              disabled={option.count === 0 && option.key !== "all"}
            >
              {option.label} ({option.count})
            </option>
          ))}
        </select>
        <Icon
          icon="tabler:chevron-down"
          height={14}
          className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {/* Date Range Filter */}
      <div className="relative">
        <select
          value={selectedDateRange}
          onChange={(e) => onDateRangeChange(e.target.value as HomeworkDateRange)}
          className={selectClassName}
        >
          {dateRangeOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          icon="tabler:chevron-down"
          height={14}
          className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
