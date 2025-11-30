"use client";

import { CardBox } from "@/shared/ui";
import { Icon } from "@iconify/react";
import { Progress } from "flowbite-react";
import { mockUser, mockLevels } from "../mock-data";

export function ProgressCard() {
  const currentLevel = mockLevels.find((l) => l.level === mockUser.currentLevel)!;
  const nextLevel = mockLevels.find((l) => l.level === mockUser.currentLevel + 1);

  const xpForCurrentLevel = currentLevel.xpRequired;
  const xpForNextLevel = nextLevel?.xpRequired || currentLevel.xpRequired;
  const xpProgress = mockUser.totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = Math.min((xpProgress / xpNeeded) * 100, 100);

  return (
    <CardBox>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold">Level Progress</h4>
        <span className="text-sm text-gray-500">
          {mockUser.totalXp} / {xpForNextLevel} XP
        </span>
      </div>

      <div className="flex items-center gap-6 mb-6">
        {/* Current Level */}
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-2">
            <Icon icon={currentLevel.icon} className="text-3xl text-primary-600" />
          </div>
          <p className="text-sm font-medium">Level {currentLevel.level}</p>
          <p className="text-xs text-gray-500">{currentLevel.title}</p>
        </div>

        {/* Progress Bar */}
        <div className="flex-1">
          <Progress progress={progressPercent} color="primary" size="lg" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{xpProgress} XP earned</span>
            <span>{xpNeeded - xpProgress} XP to go</span>
          </div>
        </div>

        {/* Next Level */}
        {nextLevel && (
          <div className="text-center opacity-50">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Icon icon={nextLevel.icon} className="text-3xl text-gray-400" />
            </div>
            <p className="text-sm font-medium">Level {nextLevel.level}</p>
            <p className="text-xs text-gray-500">{nextLevel.title}</p>
          </div>
        )}
      </div>

      {/* Level Milestones */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-sm text-gray-500 mb-3">Upcoming Rewards</p>
        <div className="flex gap-3 flex-wrap">
          <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm rounded-full flex items-center gap-1">
            <Icon icon="tabler:gift" className="text-sm" />
            New badge at Level 5
          </span>
          <span className="px-3 py-1 bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 text-sm rounded-full flex items-center gap-1">
            <Icon icon="tabler:confetti" className="text-sm" />
            Bonus XP multiplier
          </span>
        </div>
      </div>
    </CardBox>
  );
}
