"use client";

import { useTranslations, useLocale } from "next-intl";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/shared/ui";
import type { DailySet, Problem } from "@/modules/practice/types/practice.types";

interface TodaysPracticeCardProps {
  dailySet: DailySet | null;
  isLoading?: boolean;
}

const DIFFICULTY_COLORS = {
  easy: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400",
  medium: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400",
  hard: "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400",
};

const DIFFICULTY_LABELS = {
  easy: { en: "Easy", he: "קל" },
  medium: { en: "Med", he: "בינוני" },
  hard: { en: "Hard", he: "קשה" },
};

export function TodaysPracticeCard({ dailySet, isLoading = false }: TodaysPracticeCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  // Calculate progress
  const completedCount = dailySet?.completedCount ?? 0;
  const totalProblems = dailySet?.totalProblems ?? 5;
  const progressPercent = totalProblems > 0 ? Math.round((completedCount / totalProblems) * 100) : 0;
  const isCompleted = dailySet?.isCompleted ?? false;

  // Estimate remaining time (3 min per problem)
  const remainingProblems = totalProblems - completedCount;
  const estimatedMinutes = remainingProblems * 3;

  // Get current problem index
  const currentIndex = dailySet?.currentIndex ?? 0;

  // Get topic name based on locale
  const getTopicName = (problem: Problem) => {
    return locale === "he" ? problem.topicNameHe || problem.topicName : problem.topicName;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader bordered>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon icon="tabler:list-check" height={20} className="text-primary-500" />
              {t("dashboard.todaysPractice")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No daily set yet
  if (!dailySet) {
    return (
      <Card>
        <CardHeader bordered>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon icon="tabler:list-check" height={20} className="text-primary-500" />
              {t("dashboard.todaysPractice")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <Icon icon="tabler:sparkles" height={32} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("dashboard.noDailySetTitle")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t("dashboard.noDailySetDescription")}
            </p>
            <Link href="/practice">
              <Button variant="primary" icon="tabler:player-play">
                {t("dashboard.startDailySet")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader bordered>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon icon="tabler:list-check" height={20} className="text-primary-500" />
            {t("dashboard.todaysPractice")}
          </CardTitle>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {completedCount}/{totalProblems} {t("dashboard.completed")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden w-48">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted
                      ? "bg-success-500"
                      : "bg-gradient-to-r from-primary-500 to-primary-600"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                {progressPercent}%
              </span>
            </div>
            {!isCompleted && remainingProblems > 0 && (
              <span className="text-gray-500 dark:text-gray-400">
                ~{estimatedMinutes} {t("dashboard.minLeft")}
              </span>
            )}
          </div>
        </div>

        {/* Problem list */}
        <div className="space-y-2">
          {dailySet.problems.map((problem, index) => {
            const isCompleted = index < completedCount;
            const isCurrent = index === currentIndex && !dailySet.isCompleted;
            const isLocked = index > currentIndex && !dailySet.isCompleted;

            return (
              <div
                key={problem.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isCurrent
                    ? "bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500"
                    : isCompleted
                    ? "bg-success-50/50 dark:bg-success-900/10"
                    : "bg-gray-50 dark:bg-gray-800"
                } ${!isLocked ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" : "opacity-60"}`}
              >
                {/* Status icon */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? "bg-success-500 text-white"
                      : isCurrent
                      ? "bg-primary-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Icon icon="tabler:check" height={16} />
                  ) : isCurrent ? (
                    <Icon icon="tabler:arrow-right" height={16} />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Problem info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                    {getTopicName(problem)}
                  </p>
                </div>

                {/* Difficulty badge */}
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded ${DIFFICULTY_COLORS[problem.difficulty]}`}
                >
                  {DIFFICULTY_LABELS[problem.difficulty][locale as "en" | "he"]}
                </span>

                {/* XP reward */}
                <span className="text-xs font-semibold text-success-600 dark:text-success-400 whitespace-nowrap">
                  +{problem.xpReward} XP
                </span>

                {/* Action */}
                {isCurrent && (
                  <Link href={`/practice`}>
                    <Button size="sm" variant="primary">
                      {t("dashboard.solve")}
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion bonus */}
        {!isCompleted && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Icon icon="tabler:gift" height={16} className="text-success-500" />
                <span>{t("dashboard.completionBonus")}</span>
              </div>
              <span className="text-sm font-bold text-success-600 dark:text-success-400">
                +25 XP
              </span>
            </div>
          </div>
        )}

        {/* Completed state */}
        {isCompleted && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-success-600 dark:text-success-400">
              <Icon icon="tabler:circle-check-filled" height={20} />
              <span className="font-semibold">{t("dashboard.allCompleted")}</span>
              <span className="text-sm">+{dailySet.xpEarned} XP</span>
            </div>
          </div>
        )}

        {/* Continue button */}
        {!isCompleted && completedCount > 0 && (
          <div className="mt-4">
            <Link href="/practice" className="block">
              <Button variant="primary" className="w-full" icon="tabler:player-play">
                {t("dashboard.continue")}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
