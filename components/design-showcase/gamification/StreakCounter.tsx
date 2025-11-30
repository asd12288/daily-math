"use client";

import { Icon } from "@iconify/react";
import { mockUser } from "@/lib/mock-data";

interface StreakCounterProps {
  streak?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animate?: boolean;
}

export function StreakCounter({
  streak = mockUser.currentStreak,
  size = "md",
  showLabel = true,
  animate = true,
}: StreakCounterProps) {
  const sizeClasses = {
    sm: { container: "gap-1", icon: "text-lg", text: "text-sm", label: "text-xs" },
    md: { container: "gap-2", icon: "text-2xl", text: "text-xl", label: "text-sm" },
    lg: { container: "gap-3", icon: "text-4xl", text: "text-3xl", label: "text-base" },
  };

  const isActive = streak > 0;
  const s = sizeClasses[size];

  return (
    <div className={`flex items-center ${s.container}`}>
      <div className={`relative ${animate && isActive ? "animate-pulse" : ""}`}>
        <Icon
          icon="tabler:flame"
          className={`${s.icon} ${isActive ? "text-orange-500" : "text-gray-300 dark:text-gray-600"}`}
        />
        {isActive && (
          <Icon
            icon="tabler:flame"
            className={`${s.icon} text-red-500 absolute top-0 left-0 opacity-50 blur-sm`}
          />
        )}
      </div>
      <div>
        <span className={`font-bold ${s.text} ${isActive ? "text-orange-600" : "text-gray-400"}`}>
          {streak}
        </span>
        {showLabel && (
          <span className={`${s.label} text-gray-500 ms-1`}>
            {streak === 1 ? "day" : "days"}
          </span>
        )}
      </div>
    </div>
  );
}

// Streak warning component
export function StreakWarning() {
  return (
    <div className="flex items-center gap-3 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
      <Icon icon="tabler:alert-triangle" className="text-2xl text-warning-600" />
      <div>
        <p className="font-medium text-warning-800 dark:text-warning-200">
          Don&apos;t lose your streak!
        </p>
        <p className="text-sm text-warning-600 dark:text-warning-400">
          Complete today&apos;s exercises to keep your {mockUser.currentStreak}-day streak alive.
        </p>
      </div>
    </div>
  );
}

// Streak lost component
export function StreakLost() {
  return (
    <div className="flex items-center gap-3 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
      <Icon icon="tabler:flame-off" className="text-2xl text-error-600" />
      <div>
        <p className="font-medium text-error-800 dark:text-error-200">Streak Lost</p>
        <p className="text-sm text-error-600 dark:text-error-400">
          You missed a day. Start a new streak today!
        </p>
      </div>
    </div>
  );
}

// Showcase component
export function StreakCounterShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Sizes</p>
        <div className="flex items-center gap-6">
          <StreakCounter size="sm" />
          <StreakCounter size="md" />
          <StreakCounter size="lg" />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">States</p>
        <div className="flex items-center gap-6">
          <StreakCounter streak={7} />
          <StreakCounter streak={0} />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Alerts</p>
        <div className="space-y-3">
          <StreakWarning />
          <StreakLost />
        </div>
      </div>
    </div>
  );
}
