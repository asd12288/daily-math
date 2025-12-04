"use client";

import { useTranslations, useLocale } from "next-intl";
import { trpc } from "@/trpc/client";
import { useUser } from "@/shared/context";
import { XP_LEVELS } from "@/lib/appwrite/types";
import {
  StatsBar,
  DailyInsightCard,
  TodaysPracticeCard,
  HomeworkSummaryCard,
  MyCoursesCard,
  QuickActionsCard,
} from "../components";
import type { HomeworkStatus } from "@/modules/homework/types/homework.types";

export function DashboardView() {
  const t = useTranslations();
  const locale = useLocale();

  // Get user context for level title
  const { levelTitle, isLoading: userLoading } = useUser();

  // Fetch all dashboard data in one query
  const { data, isLoading: dataLoading } = trpc.dashboard.getDashboardData.useQuery();

  const isLoading = userLoading || dataLoading;

  // Get level title from XP_LEVELS
  const currentLevel = data?.stats?.currentLevel ?? 1;
  const levelInfo = XP_LEVELS.find((l) => l.level === currentLevel);
  const displayLevelTitle = locale === "he" ? levelInfo?.titleHe : levelInfo?.title;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("dashboard.welcome")}, {isLoading ? "..." : data?.profile?.displayName ?? ""}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("app.tagline")}
          </p>
        </div>
      </div>

      {/* Compact Stats Bar */}
      <StatsBar
        todayCompleted={data?.stats?.todayCompleted ?? 0}
        todayTotal={data?.stats?.todayTotal ?? 5}
        currentStreak={data?.stats?.currentStreak ?? 0}
        totalXp={data?.stats?.totalXp ?? 0}
        currentLevel={currentLevel}
        levelTitle={displayLevelTitle ?? levelTitle ?? "Beginner"}
        isLoading={isLoading}
      />

      {/* Daily AI Insight */}
      <DailyInsightCard
        insight={data?.dailyInsight ?? null}
        isLoading={isLoading}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - 3/5 width */}
        <div className="lg:col-span-3 space-y-6">
          {/* Today's Practice */}
          <TodaysPracticeCard
            dailySet={data?.todaysPractice ?? null}
            isLoading={isLoading}
          />

          {/* Homework Summary */}
          <HomeworkSummaryCard
            homework={data?.recentHomework?.map((hw) => ({
              id: hw.id,
              title: hw.title,
              status: hw.status as HomeworkStatus,
              questionCount: hw.questionCount,
              viewedCount: hw.viewedCount,
              xpEarned: hw.xpEarned,
              createdAt: hw.createdAt,
            })) ?? []}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column - 2/5 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Courses */}
          <MyCoursesCard
            courses={data?.enrolledCourses ?? []}
            isLoading={isLoading}
          />

          {/* Quick Actions */}
          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
}
