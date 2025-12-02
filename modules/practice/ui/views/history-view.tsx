// modules/practice/ui/views/history-view.tsx
// History view showing past daily practice sessions

"use client";

import { useTranslations, useLocale } from "next-intl";
import { Icon } from "@iconify/react";
import { Card, CardContent } from "@/shared/ui";
import { usePastDailySets, useTodaySet } from "../../hooks/use-practice";
import Link from "next/link";

export function HistoryView() {
  const t = useTranslations();
  const locale = useLocale();
  const { dailySets, isLoading } = usePastDailySets(30);
  const { dailySet: todaySet, isLoading: isTodayLoading } = useTodaySet();

  // Check if today's practice is completed
  // Use the date from todaySet (server-side, timezone-aware) instead of client-side date
  const todayCompleted = todaySet?.isCompleted ?? false;
  const todayDate = todaySet?.date; // Server determines "today" with proper timezone

  // Filter out today's set from history (show separately)
  // If todayDate is undefined, show all sets in history
  const pastSets = todayDate
    ? dailySets.filter((set) => set.date !== todayDate)
    : dailySets;

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading || isTodayLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Icon
            icon="tabler:loader-2"
            className="w-8 h-8 animate-spin text-primary-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Icon
          icon="tabler:history"
          className="w-8 h-8 text-primary-600"
        />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("history.title")}
        </h1>
      </div>

      {/* Today's Status Banner */}
      {todayCompleted ? (
        <Card className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                <Icon
                  icon="tabler:check"
                  className="w-6 h-6 text-success-600 dark:text-success-400"
                />
              </div>
              <div>
                <p className="text-success-800 dark:text-success-200 font-medium">
                  {t("history.todayCompleted")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : todaySet ? (
        <Card className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                  <Icon
                    icon="tabler:alert-circle"
                    className="w-6 h-6 text-warning-600 dark:text-warning-400"
                  />
                </div>
                <div>
                  <p className="text-warning-800 dark:text-warning-200 font-medium">
                    {t("history.todayIncomplete")}
                  </p>
                  <p className="text-sm text-warning-600 dark:text-warning-300">
                    {t("history.problems", {
                      completed: todaySet.completedCount,
                      total: todaySet.totalProblems,
                    })}
                  </p>
                </div>
              </div>
              <Link
                href="/practice"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                {t("history.continuePractice")}
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Past Daily Sets */}
      {pastSets.length === 0 ? (
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardContent>
            <div className="text-center py-8">
              <Icon
                icon="tabler:history-off"
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
              />
              <p className="text-gray-600 dark:text-gray-400">
                {t("history.empty")}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {t("history.pastSessions")}
          </h2>
          {pastSets.map((set) => (
            <Card
              key={set.id}
              variant="bordered"
              className="hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
            >
              <CardContent>
                <div className="flex items-center justify-between">
                  {/* Left side - Date and Topic */}
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                      <Icon
                        icon="tabler:math"
                        className="w-6 h-6 text-primary-600 dark:text-primary-400"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(set.date)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {locale === "he" ? set.focusTopicNameHe : set.focusTopicName}
                      </p>
                    </div>
                  </div>

                  {/* Right side - Stats */}
                  <div className="flex items-center gap-4">
                    {/* Completion Status */}
                    <div className="text-end">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("history.problems", {
                          completed: set.completedCount,
                          total: set.totalProblems,
                        })}
                      </p>
                      <p className="font-semibold text-success-600 dark:text-success-400">
                        {t("history.xpEarned", { xp: set.xpEarned })}
                      </p>
                    </div>

                    {/* Completion Indicator */}
                    {set.isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                        <Icon
                          icon="tabler:check"
                          className="w-5 h-5 text-success-600 dark:text-success-400"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Icon
                          icon="tabler:minus"
                          className="w-5 h-5 text-gray-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
