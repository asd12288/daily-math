"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/shared/ui";
import { useUser } from "@/shared/context";
import { XP_LEVELS } from "@/lib/appwrite/types";

export function DashboardView() {
  const t = useTranslations();
  const locale = useLocale();

  // Get user data from context
  const { profile, displayName, levelTitle, xpProgress, xpToNextLevel, isLoading } = useUser();

  // Get current and next level info for display
  const currentLevel = profile?.currentLevel ?? 1;
  const nextLevelInfo = XP_LEVELS.find((l) => l.level === currentLevel + 1);
  const nextLevelTitle = locale === "he" ? nextLevelInfo?.titleHe : nextLevelInfo?.title;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("dashboard.welcome")}, {isLoading ? "..." : displayName}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("app.tagline")}
          </p>
        </div>
        <Button variant="primary" size="lg" icon="tabler:player-play">
          {t("dashboard.startPractice")}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Set Card */}
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0 shadow-lg shadow-primary-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm font-medium">
                  {t("dashboard.todaysSet")}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {isLoading ? "..." : profile?.dailyExerciseCount ?? 5}
                </p>
                <p className="text-primary-100 text-sm mt-1">
                  {t("dashboard.exercises")}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Icon icon="tabler:notebook" height={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="bg-gradient-to-br from-warning-500 to-warning-600 text-white border-0 shadow-lg shadow-warning-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warning-100 text-sm font-medium">
                  {t("dashboard.currentStreak")}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {isLoading ? "..." : profile?.currentStreak ?? 0}
                </p>
                <p className="text-warning-100 text-sm mt-1">
                  {t("dashboard.days")}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Icon
                  icon="tabler:flame"
                  height={24}
                  className={(profile?.currentStreak ?? 0) > 0 ? "streak-fire" : ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total XP */}
        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white border-0 shadow-lg shadow-success-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-100 text-sm font-medium">
                  {t("dashboard.totalXP")}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {isLoading ? "..." : profile?.totalXp ?? 0}
                </p>
                <p className="text-success-100 text-sm mt-1">
                  {t("gamification.xp")}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Icon icon="tabler:star-filled" height={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level */}
        <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white border-0 shadow-lg shadow-secondary-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-100 text-sm font-medium">
                  {t("dashboard.level")}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {isLoading ? "..." : currentLevel}
                </p>
                <p className="text-secondary-100 text-sm mt-1">
                  {isLoading ? "..." : levelTitle}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Icon icon="tabler:trophy" height={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Exercises */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader bordered>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon
                    icon="tabler:list-check"
                    height={20}
                    className="text-primary-500"
                  />
                  {t("dashboard.todaysSet")}
                </CardTitle>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ~{(profile?.dailyExerciseCount ?? 5) * 3} {t("dashboard.minutes")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: profile?.dailyExerciseCount ?? 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-lightprimary dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Exercise {index + 1}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        Calculus 1 - Derivatives
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-lightsuccess dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-lg">
                        +10 XP
                      </span>
                      <Icon
                        icon="tabler:chevron-right"
                        height={20}
                        className="text-gray-400 group-hover:text-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <div className="space-y-6">
          {/* Your Progress */}
          <Card>
            <CardHeader bordered>
              <CardTitle className="flex items-center gap-2">
                <Icon
                  icon="tabler:chart-line"
                  height={20}
                  className="text-success-500"
                />
                {t("dashboard.yourProgress")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Level Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {t("dashboard.level")} {currentLevel}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {isLoading ? "..." : `${xpToNextLevel} XP ${t("dashboard.toNextLevel")}`}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${isLoading ? 0 : xpProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t("dashboard.nextLevel")}: {nextLevelTitle ?? levelTitle}
                  </p>
                </div>

                {/* Weekly Stats */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t("dashboard.streakCalendar")}
                  </h4>
                  <div className="grid grid-cols-7 gap-1.5">
                    {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
                      // Simple logic: mark days as completed based on streak
                      const streak = profile?.currentStreak ?? 0;
                      const today = new Date().getDay();
                      const adjustedToday = today === 0 ? 6 : today - 1; // Convert to M=0, S=6
                      const isCompleted = i <= adjustedToday && i > adjustedToday - streak;

                      return (
                        <div key={i} className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                            {day}
                          </p>
                          <div
                            className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center transition-colors ${
                              isCompleted
                                ? "bg-success-500 text-white shadow-md shadow-success-500/30"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            {isCompleted ? (
                              <Icon icon="tabler:check" height={14} />
                            ) : (
                              <Icon icon="tabler:minus" height={14} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link
                  href="/courses"
                  className="w-full flex items-center gap-3 p-3 text-start rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-10 h-10 bg-lightprimary dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <Icon
                      icon="tabler:book"
                      height={20}
                      className="text-primary-600 dark:text-primary-400"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t("nav.courses")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Manage your courses
                    </p>
                  </div>
                  <Icon
                    icon="tabler:chevron-right"
                    height={18}
                    className="text-gray-400 group-hover:text-primary-500 transition-colors"
                  />
                </Link>
                <Link
                  href="/history"
                  className="w-full flex items-center gap-3 p-3 text-start rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-10 h-10 bg-lightsecondary dark:bg-secondary-900/30 rounded-xl flex items-center justify-center">
                    <Icon
                      icon="tabler:history"
                      height={20}
                      className="text-secondary-600 dark:text-secondary-400"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t("nav.history")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      View past exercises
                    </p>
                  </div>
                  <Icon
                    icon="tabler:chevron-right"
                    height={18}
                    className="text-gray-400 group-hover:text-secondary-500 transition-colors"
                  />
                </Link>
                <Link
                  href="/settings"
                  className="w-full flex items-center gap-3 p-3 text-start rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-10 h-10 bg-lightwarning dark:bg-warning-900/30 rounded-xl flex items-center justify-center">
                    <Icon
                      icon="tabler:settings"
                      height={20}
                      className="text-warning-600 dark:text-warning-400"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t("nav.settings")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Customize preferences
                    </p>
                  </div>
                  <Icon
                    icon="tabler:chevron-right"
                    height={18}
                    className="text-gray-400 group-hover:text-warning-500 transition-colors"
                  />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
