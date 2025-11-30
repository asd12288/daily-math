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
export function DailySetCompleteToast({ totalXp, bonusXp }: { totalXp: number; bonusXp?: number }) {
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

// Showcase
export function XPToastShowcase() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-2">Toast Types</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <XPToast xp={20} type="earned" message="Exercise completed" />
        <XPToast xp={10} type="bonus" message="Perfect answer!" />
        <XPToast xp={35} type="streak" message="7-day streak!" />
        <XPToast xp={50} type="levelup" message="You reached Level 4!" />
      </div>
      <div className="mt-6">
        <p className="text-sm text-gray-500 mb-2">Daily Completion</p>
        <DailySetCompleteToast totalXp={90} bonusXp={35} />
      </div>
    </div>
  );
}
