"use client";

import { CardBox } from "@/shared/ui";
import { Icon } from "@iconify/react";
import { mockUser, mockStats } from "../mock-data";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  bgColor: string;
  iconColor: string;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
}

function StatCard({ title, value, icon, bgColor, iconColor, subtitle, trend }: StatCardProps) {
  return (
    <CardBox className={`${bgColor} !p-4`}>
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconColor} bg-white/80 dark:bg-gray-800/80`}
        >
          <Icon icon={icon} className="text-xl" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{value}</h3>
            {trend && (
              <span
                className={`text-xs font-medium flex items-center ${
                  trend.isPositive ? "text-success-600" : "text-error-600"
                }`}
              >
                <Icon
                  icon={trend.isPositive ? "tabler:arrow-up-right" : "tabler:arrow-down-right"}
                  className="text-sm"
                />
                {trend.value}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </CardBox>
  );
}

export function StatsCards() {
  const stats = [
    {
      title: "Total XP",
      value: `${mockUser.totalXp} XP`,
      icon: "tabler:star-filled",
      bgColor: "bg-primary-50 dark:bg-primary-900/20",
      iconColor: "text-primary-600",
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Current Streak",
      value: `${mockUser.currentStreak} days`,
      icon: "tabler:flame",
      bgColor: "bg-error-50 dark:bg-error-900/20",
      iconColor: "text-error-600",
      subtitle: `Best: ${mockUser.longestStreak} days`,
    },
    {
      title: "Level Progress",
      value: `Level ${mockUser.currentLevel}`,
      icon: "tabler:trophy",
      bgColor: "bg-warning-50 dark:bg-warning-900/20",
      iconColor: "text-warning-600",
      subtitle: mockUser.levelTitle,
    },
    {
      title: "Exercises Done",
      value: mockStats.totalExercises,
      icon: "tabler:checkbox",
      bgColor: "bg-success-50 dark:bg-success-900/20",
      iconColor: "text-success-600",
      subtitle: `${Math.round(mockStats.correctRate * 100)}% correct`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
