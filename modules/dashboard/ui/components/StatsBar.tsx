"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface StatsBarProps {
  todayCompleted: number;
  todayTotal: number;
  currentStreak: number;
  totalXp: number;
  currentLevel: number;
  levelTitle: string;
  isLoading?: boolean;
}

export function StatsBar({
  todayCompleted,
  todayTotal,
  currentStreak,
  totalXp,
  currentLevel,
  levelTitle,
  isLoading = false,
}: StatsBarProps) {
  const t = useTranslations();

  const stats = [
    {
      icon: "tabler:target",
      value: isLoading ? "..." : `${todayCompleted}/${todayTotal}`,
      label: t("dashboard.today"),
      href: "/practice",
      color: "primary",
      bgColor: "bg-primary-50 dark:bg-primary-900/20",
      iconColor: "text-primary-600 dark:text-primary-400",
    },
    {
      icon: "tabler:flame",
      value: isLoading ? "..." : currentStreak,
      label: t("dashboard.streak"),
      href: "/settings",
      color: "warning",
      bgColor: "bg-warning-50 dark:bg-warning-900/20",
      iconColor: "text-warning-600 dark:text-warning-400",
      animate: currentStreak > 0,
    },
    {
      icon: "tabler:star-filled",
      value: isLoading ? "..." : totalXp.toLocaleString(),
      label: t("gamification.xp"),
      href: "/history",
      color: "success",
      bgColor: "bg-success-50 dark:bg-success-900/20",
      iconColor: "text-success-600 dark:text-success-400",
    },
    {
      icon: "tabler:trophy",
      value: isLoading ? "..." : `Lv.${currentLevel}`,
      label: isLoading ? "..." : levelTitle,
      href: "/settings",
      color: "secondary",
      bgColor: "bg-secondary-50 dark:bg-secondary-900/20",
      iconColor: "text-secondary-600 dark:text-secondary-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <Link
          key={index}
          href={stat.href}
          className={`${stat.bgColor} rounded-xl p-3 flex items-center gap-3 hover:opacity-80 transition-opacity group`}
        >
          <div className={`${stat.iconColor}`}>
            <Icon
              icon={stat.icon}
              height={20}
              className={stat.animate ? "streak-fire" : ""}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {stat.label}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
