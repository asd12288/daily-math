"use client";

import { Icon } from "@iconify/react";
import { mockUser, mockLevels } from "../mock-data";

interface LevelBadgeProps {
  level?: number;
  showTitle?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LevelBadge({
  level = mockUser.currentLevel,
  showTitle = true,
  size = "md",
}: LevelBadgeProps) {
  const levelData = mockLevels.find((l) => l.level === level) || mockLevels[0];

  const sizeClasses = {
    sm: {
      container: "px-2 py-1 gap-1",
      icon: "text-sm",
      level: "text-xs",
      title: "text-xs",
    },
    md: {
      container: "px-3 py-1.5 gap-2",
      icon: "text-base",
      level: "text-sm",
      title: "text-sm",
    },
    lg: {
      container: "px-4 py-2 gap-2",
      icon: "text-xl",
      level: "text-base",
      title: "text-base",
    },
  };

  const s = sizeClasses[size];

  // Color based on level tier
  const getColorClass = (lvl: number) => {
    if (lvl <= 3) return "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300";
    if (lvl <= 6) return "bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300";
    if (lvl <= 8) return "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300";
    return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${s.container} ${getColorClass(level)}`}
    >
      <Icon icon={levelData.icon} className={s.icon} />
      <span className={`font-bold ${s.level}`}>Lv. {level}</span>
      {showTitle && <span className={`${s.title} opacity-80`}>{levelData.title}</span>}
    </span>
  );
}

// Full level display card
export function LevelCard() {
  const levelData = mockLevels.find((l) => l.level === mockUser.currentLevel)!;
  const nextLevel = mockLevels.find((l) => l.level === mockUser.currentLevel + 1);

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl text-white">
      <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
        <Icon icon={levelData.icon} className="text-3xl" />
      </div>
      <div>
        <p className="text-sm opacity-80">Current Level</p>
        <h3 className="text-2xl font-bold">
          Level {mockUser.currentLevel}: {levelData.title}
        </h3>
        {nextLevel && (
          <p className="text-sm opacity-80">
            {nextLevel.xpRequired - mockUser.totalXp} XP to {nextLevel.title}
          </p>
        )}
      </div>
    </div>
  );
}

// Showcase all levels
export function LevelBadgeShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Sizes</p>
        <div className="flex items-center gap-3 flex-wrap">
          <LevelBadge size="sm" />
          <LevelBadge size="md" />
          <LevelBadge size="lg" />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">All Levels</p>
        <div className="flex flex-wrap gap-2">
          {mockLevels.map((level) => (
            <LevelBadge key={level.level} level={level.level} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Level Card</p>
        <LevelCard />
      </div>
    </div>
  );
}
