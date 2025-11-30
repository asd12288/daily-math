"use client";

import { Icon } from "@iconify/react";

interface XPToastProps {
  xp: number;
  message?: string;
  type?: "earned" | "bonus" | "streak" | "levelup";
}

export function XPToast({ xp, message, type = "earned" }: XPToastProps) {
  const configs = {
    earned: {
      icon: "tabler:star-filled",
      bgColor: "bg-success-500",
      title: "XP Earned!",
    },
    bonus: {
      icon: "tabler:sparkles",
      bgColor: "bg-warning-500",
      title: "Bonus XP!",
    },
    streak: {
      icon: "tabler:flame",
      bgColor: "bg-orange-500",
      title: "Streak Bonus!",
    },
    levelup: {
      icon: "tabler:arrow-big-up-lines",
      bgColor: "bg-primary-500",
      title: "Level Up!",
    },
  };

  const config = configs[type];

  return (
    <div
      className={`${config.bgColor} text-white rounded-xl p-4 shadow-lg flex items-center gap-4 min-w-[280px]`}
    >
      <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
        <Icon icon={config.icon} className="text-2xl" />
      </div>
      <div>
        <p className="font-medium opacity-90">{config.title}</p>
        <p className="text-2xl font-bold">+{xp} XP</p>
        {message && <p className="text-sm opacity-80">{message}</p>}
      </div>
    </div>
  );
}

// Daily set completion toast
interface DailySetCompleteToastProps {
  totalXp: number;
  bonusXp?: number;
}

export function DailySetCompleteToast({ totalXp, bonusXp }: DailySetCompleteToastProps) {
  return (
    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Icon icon="tabler:confetti" className="text-3xl" />
        </div>
        <div>
          <p className="text-lg font-medium opacity-90">Daily Set Complete!</p>
          <p className="text-3xl font-bold">+{totalXp} XP</p>
        </div>
      </div>

      {bonusXp && bonusXp > 0 && (
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
          <Icon icon="tabler:flame" className="text-orange-300" />
          <span className="text-sm">Streak bonus: +{bonusXp} XP</span>
        </div>
      )}
    </div>
  );
}
