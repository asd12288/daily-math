// modules/skill-tree/ui/components/SkillTreeView.tsx
// Main skill tree visualization component

"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/shared/ui";
import { BranchCard } from "./BranchCard";
import { useSkillTree } from "../../hooks";
import type { SkillTreeState } from "../../types";

interface SkillTreeViewProps {
  onTopicClick?: (topicId: string) => void;
}

export function SkillTreeView({ onTopicClick }: SkillTreeViewProps) {
  const t = useTranslations();
  // Locale available for future localized skill tree content
  const _locale = useLocale();
  const { skillTree, isLoading, error } = useSkillTree();

  if (isLoading) {
    return <SkillTreeSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-error-200 dark:border-error-800">
        <CardContent className="py-8 text-center">
          <Icon
            icon="tabler:alert-circle"
            height={48}
            className="mx-auto text-error-500 mb-3"
          />
          <p className="text-error-600 dark:text-error-400">
            {t("common.error")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!skillTree) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress Header */}
      <OverallProgressCard skillTree={skillTree} />

      {/* Branches */}
      <div className="space-y-4">
        {skillTree.branches.map((branch, index) => (
          <BranchCard
            key={branch.id}
            branch={branch}
            onTopicClick={onTopicClick}
            defaultExpanded={index < 2} // First 2 branches expanded by default
          />
        ))}
      </div>
    </div>
  );
}

function OverallProgressCard({ skillTree }: { skillTree: SkillTreeState }) {
  const t = useTranslations();

  return (
    <Card className="bg-gradient-to-br from-primary-500 to-secondary-600 text-white border-0">
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">
              {t("skillTree.yourProgress")}
            </h2>
            <p className="text-primary-100 text-sm">
              {skillTree.totalMastered} / {skillTree.totalTopics}{" "}
              {t("skillTree.topicsMastered")}
            </p>
          </div>
          <div className="text-end">
            <p className="text-4xl font-bold">{skillTree.overallProgress}%</p>
            <p className="text-primary-100 text-sm">{t("skillTree.complete")}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${skillTree.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Current Focus */}
        {skillTree.currentFocusTopic && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-primary-100 mb-1">
              {t("skillTree.currentFocus")}
            </p>
            <div className="flex items-center gap-2">
              <Icon icon="tabler:target" height={18} />
              <span className="font-medium">
                {skillTree.branches
                  .flatMap((b) => b.topics)
                  .find((t) => t.id === skillTree.currentFocusTopic)?.name ||
                  skillTree.currentFocusTopic}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SkillTreeSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl" />

      {/* Branch skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      ))}
    </div>
  );
}
