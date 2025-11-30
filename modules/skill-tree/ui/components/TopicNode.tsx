// modules/skill-tree/ui/components/TopicNode.tsx
// Individual topic node in the skill tree

"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useLocale } from "next-intl";
import type { TopicWithProgress } from "../../types";

interface TopicNodeProps {
  topic: TopicWithProgress;
  onClick?: (topicId: string) => void;
  compact?: boolean;
}

const STATUS_CONFIG: Record<
  string,
  {
    icon: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    iconClass: string;
  }
> = {
  not_started: {
    icon: "tabler:circle",
    bgClass: "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800",
    borderClass: "border-gray-300 dark:border-gray-600 hover:border-primary-400",
    textClass: "text-gray-700 dark:text-gray-300",
    iconClass: "text-gray-400 dark:text-gray-500",
  },
  in_progress: {
    icon: "tabler:loader-2",
    bgClass: "bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30",
    borderClass: "border-primary-400 dark:border-primary-500",
    textClass: "text-primary-700 dark:text-primary-300",
    iconClass: "text-primary-500 animate-spin",
  },
  mastered: {
    icon: "tabler:check",
    bgClass: "bg-success-50 dark:bg-success-900/20",
    borderClass: "border-success-400 dark:border-success-500",
    textClass: "text-success-700 dark:text-success-300",
    iconClass: "text-success-500",
  },
  // Legacy status fallbacks
  locked: {
    icon: "tabler:circle",
    bgClass: "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800",
    borderClass: "border-gray-300 dark:border-gray-600 hover:border-primary-400",
    textClass: "text-gray-700 dark:text-gray-300",
    iconClass: "text-gray-400 dark:text-gray-500",
  },
  available: {
    icon: "tabler:circle",
    bgClass: "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800",
    borderClass: "border-gray-300 dark:border-gray-600 hover:border-primary-400",
    textClass: "text-gray-700 dark:text-gray-300",
    iconClass: "text-gray-400 dark:text-gray-500",
  },
};

export function TopicNode({ topic, onClick, compact = false }: TopicNodeProps) {
  const locale = useLocale();
  const config = STATUS_CONFIG[topic.status] || STATUS_CONFIG.not_started;

  const name = locale === "he" ? topic.nameHe : topic.name;
  const description = locale === "he" ? topic.descriptionHe : topic.description;

  // All topics are now clickable
  const isClickable = true;

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick(topic.id);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={!isClickable}
        className={`
          flex items-center gap-2 p-2 rounded-lg border transition-all
          ${config.bgClass} ${config.borderClass}
          ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"}
        `}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            topic.status === "mastered"
              ? "bg-success-500"
              : topic.status === "in_progress"
              ? "bg-primary-500"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <Icon
            icon={config.icon}
            height={14}
            className={
              topic.status === "mastered" || topic.status === "in_progress"
                ? "text-white"
                : config.iconClass
            }
          />
        </div>
        <span className={`text-sm font-medium truncate ${config.textClass}`}>
          {name}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isClickable}
      className={`
        w-full text-start p-4 rounded-xl border-2 transition-all
        ${config.bgClass} ${config.borderClass}
        ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            ${
              topic.status === "mastered"
                ? "bg-success-500"
                : topic.status === "in_progress"
                ? "bg-primary-500"
                : "bg-gray-200 dark:bg-gray-700"
            }
          `}
        >
          <Icon
            icon={config.icon}
            height={20}
            className={
              topic.status === "mastered" || topic.status === "in_progress"
                ? "text-white"
                : config.iconClass
            }
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`font-semibold truncate ${config.textClass}`}>
              {name}
            </h4>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                topic.mastery >= 80
                  ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                  : topic.mastery >= 50
                  ? "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {topic.mastery}%
            </span>
          </div>

          <p className="text-sm mt-0.5 line-clamp-1 text-gray-500 dark:text-gray-400">
            {description}
          </p>

          {/* Progress Bar */}
          <div className="mt-2">
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  topic.mastery >= 80
                    ? "bg-success-500"
                    : topic.mastery >= 50
                    ? "bg-warning-500"
                    : "bg-primary-500"
                }`}
                style={{ width: `${topic.mastery}%` }}
              />
            </div>
          </div>
        </div>

        {/* Arrow for clickable items */}
        {isClickable && (
          <Icon
            icon="tabler:chevron-right"
            height={20}
            className="text-gray-400 dark:text-gray-500 flex-shrink-0 rtl:rotate-180"
          />
        )}
      </div>
    </button>
  );
}
