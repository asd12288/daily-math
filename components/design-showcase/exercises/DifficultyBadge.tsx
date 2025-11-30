"use client";

import { Icon } from "@iconify/react";
import type { Difficulty } from "../mock-data";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  showXP?: boolean;
  size?: "sm" | "md";
}

const difficultyConfig = {
  easy: {
    label: "Easy",
    xp: 10,
    color: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300",
    icon: "tabler:circle-filled",
  },
  medium: {
    label: "Medium",
    xp: 20,
    color: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",
    icon: "tabler:circle-half-2",
  },
  hard: {
    label: "Hard",
    xp: 30,
    color: "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300",
    icon: "tabler:circle-dotted",
  },
};

export function DifficultyBadge({ difficulty, showXP = false, size = "md" }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${config.color}`}
    >
      <Icon icon={config.icon} className={size === "sm" ? "text-xs" : "text-sm"} />
      {config.label}
      {showXP && (
        <span className="opacity-75">
          • {config.xp} XP
        </span>
      )}
    </span>
  );
}

// Showcase
export function DifficultyBadgeShowcase() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-500 mb-2">Sizes</p>
        <div className="flex items-center gap-3">
          <DifficultyBadge difficulty="medium" size="sm" />
          <DifficultyBadge difficulty="medium" size="md" />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">All Difficulties</p>
        <div className="flex items-center gap-3">
          <DifficultyBadge difficulty="easy" showXP />
          <DifficultyBadge difficulty="medium" showXP />
          <DifficultyBadge difficulty="hard" showXP />
        </div>
      </div>
    </div>
  );
}
