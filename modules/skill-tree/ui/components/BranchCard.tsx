// modules/skill-tree/ui/components/BranchCard.tsx
// Branch card showing topics within a branch

"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useLocale } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui";
import { TopicNode } from "./TopicNode";
import type { BranchWithTopics } from "../../types";

interface BranchCardProps {
  branch: BranchWithTopics;
  onTopicClick?: (topicId: string) => void;
  defaultExpanded?: boolean;
}

const BRANCH_COLORS: Record<string, string> = {
  success: "from-success-500 to-success-600",
  primary: "from-primary-500 to-primary-600",
  secondary: "from-secondary-500 to-secondary-600",
  warning: "from-warning-500 to-warning-600",
  error: "from-error-500 to-error-600",
};

const BRANCH_LIGHT_COLORS: Record<string, string> = {
  success: "bg-lightsuccess dark:bg-success-900/20 text-success-600 dark:text-success-400",
  primary: "bg-lightprimary dark:bg-primary-900/20 text-primary-600 dark:text-primary-400",
  secondary: "bg-lightsecondary dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400",
  warning: "bg-lightwarning dark:bg-warning-900/20 text-warning-600 dark:text-warning-400",
  error: "bg-lighterror dark:bg-error-900/20 text-error-600 dark:text-error-400",
};

export function BranchCard({
  branch,
  onTopicClick,
  defaultExpanded = true,
}: BranchCardProps) {
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const name = locale === "he" ? branch.nameHe : branch.name;
  const gradientClass = BRANCH_COLORS[branch.color] || BRANCH_COLORS.primary;
  // Light color class available for future hover/focus states
  const _lightClass = BRANCH_LIGHT_COLORS[branch.color] || BRANCH_LIGHT_COLORS.primary;

  const allLocked = branch.topics.every((t) => t.status === "locked");
  const hasInProgress = branch.topics.some((t) => t.status === "in_progress");

  return (
    <Card className={`overflow-hidden ${allLocked ? "opacity-60" : ""}`}>
      {/* Branch Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full"
      >
        <CardHeader bordered className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center gap-4">
            {/* Branch Icon */}
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg`}
            >
              <Icon icon={branch.icon} height={24} className="text-white" />
            </div>

            {/* Branch Info */}
            <div className="flex-1 min-w-0 text-start">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{name}</CardTitle>
                {hasInProgress && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full">
                    In Progress
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {branch.completedCount} / {branch.totalCount} topics mastered
              </p>
            </div>

            {/* Progress Circle */}
            <div className="flex items-center gap-3">
              <div className="text-end">
                <p className={`text-2xl font-bold ${
                  branch.overallMastery >= 80
                    ? "text-success-600 dark:text-success-400"
                    : branch.overallMastery >= 50
                    ? "text-warning-600 dark:text-warning-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}>
                  {branch.overallMastery}%
                </p>
              </div>
              <Icon
                icon={isExpanded ? "tabler:chevron-up" : "tabler:chevron-down"}
                height={20}
                className="text-gray-400"
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${gradientClass} rounded-full transition-all duration-500`}
                style={{ width: `${branch.overallMastery}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </button>

      {/* Topics List */}
      {isExpanded && (
        <CardContent className="pt-2">
          <div className="space-y-2">
            {branch.topics.map((topic) => (
              <TopicNode
                key={topic.id}
                topic={topic}
                onClick={onTopicClick}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
