"use client";

import { Icon } from "@iconify/react";

// Level icons for each tier
const LEVEL_ICONS: Record<number, string> = {
  1: "tabler:seedling",
  2: "tabler:book",
  3: "tabler:bulb",
  4: "tabler:target",
  5: "tabler:school",
  6: "tabler:award",
  7: "tabler:certificate",
  8: "tabler:trophy",
  9: "tabler:crown",
  10: "tabler:sparkles",
};

interface LevelBadgeProps {
  level: number;
  title?: string;
  showTitle?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LevelBadge({
  level,
  title,
  showTitle = true,
  size = "md",
}: LevelBadgeProps) {
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
  const icon = LEVEL_ICONS[level] || LEVEL_ICONS[1];

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
      <Icon icon={icon} className={s.icon} />
      <span className={`font-bold ${s.level}`}>Lv. {level}</span>
      {showTitle && title && <span className={`${s.title} opacity-80`}>{title}</span>}
    </span>
  );
}

// Full level display card with progress
interface LevelCardProps {
  level: number;
  title: string;
  totalXp: number;
  xpToNextLevel: number;
  progressToNextLevel: number;
  nextLevelTitle?: string;
}

export function LevelCard({
  level,
  title,
  totalXp,
  xpToNextLevel,
  progressToNextLevel,
  nextLevelTitle,
}: LevelCardProps) {
  const icon = LEVEL_ICONS[level] || LEVEL_ICONS[1];

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl text-white">
      <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
        <Icon icon={icon} className="text-3xl" />
      </div>
      <div className="flex-1">
        <p className="text-sm opacity-80">Current Level</p>
        <h3 className="text-2xl font-bold">
          Level {level}: {title}
        </h3>
        {level < 10 && nextLevelTitle && (
          <div className="mt-2">
            <div className="flex justify-between text-xs opacity-80 mb-1">
              <span>{totalXp} XP</span>
              <span>{xpToNextLevel} XP to {nextLevelTitle}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${Math.min(progressToNextLevel, 100)}%` }}
              />
            </div>
          </div>
        )}
        {level >= 10 && (
          <p className="text-sm opacity-80 mt-1">Max level reached!</p>
        )}
      </div>
    </div>
  );
}

// Level up celebration component
interface LevelUpCelebrationProps {
  newLevel: number;
  newTitle: string;
  onClose?: () => void;
}

export function LevelUpCelebration({ newLevel, newTitle, onClose }: LevelUpCelebrationProps) {
  const icon = LEVEL_ICONS[newLevel] || LEVEL_ICONS[1];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 p-8 rounded-2xl text-white text-center max-w-sm mx-4 animate-scale-in">
        <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm animate-bounce">
          <Icon icon={icon} className="text-5xl" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Level Up!</h2>
        <p className="text-xl mb-1">You reached Level {newLevel}</p>
        <p className="text-2xl font-semibold text-yellow-300">{newTitle}</p>
        <p className="text-sm opacity-80 mt-4">Keep practicing to reach the next level!</p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
