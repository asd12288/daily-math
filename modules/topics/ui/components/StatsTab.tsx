// modules/topics/ui/components/StatsTab.tsx
// Stats tab showing user progress and history

"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import type { TopicUserStats } from "../../types";

interface StatsTabProps {
  topicId: string;
  stats?: TopicUserStats | null;
}

export function StatsTab({ stats }: StatsTabProps) {
  const t = useTranslations();

  // If no stats, show empty state
  if (!stats || stats.totalAttempts === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center py-8">
          <Icon icon="tabler:chart-bar-off" className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("topics.noStats")}
          </h3>
          <p className="text-gray-500">{t("topics.noStatsDesc")}</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Main stats grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon="tabler:chart-pie"
          label={t("topics.stats.mastery")}
          value={`${stats.mastery}%`}
          color="primary"
        />
        <StatCard
          icon="tabler:target"
          label={t("topics.stats.accuracy")}
          value={`${stats.accuracy}%`}
          color="success"
        />
        <StatCard
          icon="tabler:clock"
          label={t("topics.stats.timeSpent")}
          value={formatTime(stats.totalTimeSeconds)}
          color="secondary"
        />
        <StatCard
          icon="tabler:check"
          label={t("topics.stats.solved")}
          value={`${stats.correctAttempts}/${stats.totalAttempts}`}
          color="warning"
        />
      </div>

      {/* Progress visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Icon icon="tabler:trending-up" className="w-5 h-5 text-primary-600" />
          {t("topics.stats.progress")}
        </h3>

        {/* Mastery progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">{t("topics.stats.mastery")}</span>
            <span className="font-medium text-gray-900 dark:text-white">{stats.mastery}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
              style={{ width: `${stats.mastery}%` }}
            />
          </div>
        </div>

        {/* Accuracy progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">{t("topics.stats.accuracy")}</span>
            <span className="font-medium text-gray-900 dark:text-white">{stats.accuracy}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                stats.accuracy >= 80
                  ? "bg-success-500"
                  : stats.accuracy >= 50
                  ? "bg-warning-500"
                  : "bg-error-500"
              }`}
              style={{ width: `${stats.accuracy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Last practiced */}
      {stats.lastPracticedAt && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Icon icon="tabler:calendar" className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("topics.stats.lastPracticed")}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(stats.lastPracticedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  color: "primary" | "success" | "secondary" | "warning";
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary-100 dark:bg-primary-900/30 text-primary-600",
    success: "bg-success-100 dark:bg-success-900/30 text-success-600",
    secondary: "bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600",
    warning: "bg-warning-100 dark:bg-warning-900/30 text-warning-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon icon={icon} className="w-5 h-5" />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
