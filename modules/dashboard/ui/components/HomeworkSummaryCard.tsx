"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/shared/ui";
import type { HomeworkStatus } from "@/modules/homework/types/homework.types";

interface HomeworkSummaryItem {
  id: string;
  title: string;
  status: HomeworkStatus;
  questionCount: number;
  viewedCount: number;
  xpEarned: number;
  createdAt: string;
}

interface HomeworkSummaryCardProps {
  homework: HomeworkSummaryItem[];
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<string, {
  icon: string;
  color: string;
  bgColor: string;
  label: { en: string; he: string };
  animate?: boolean;
}> = {
  uploading: {
    icon: "tabler:upload",
    color: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    label: { en: "Uploading", he: "מעלה" },
  },
  processing: {
    icon: "tabler:loader-2",
    color: "text-warning-500",
    bgColor: "bg-warning-50 dark:bg-warning-900/20",
    label: { en: "Processing", he: "מעבד" },
    animate: true,
  },
  completed: {
    icon: "tabler:circle-check",
    color: "text-success-500",
    bgColor: "bg-success-50 dark:bg-success-900/20",
    label: { en: "Ready", he: "מוכן" },
  },
  failed: {
    icon: "tabler:alert-circle",
    color: "text-error-500",
    bgColor: "bg-error-50 dark:bg-error-900/20",
    label: { en: "Failed", he: "נכשל" },
  },
};

export function HomeworkSummaryCard({ homework, isLoading = false }: HomeworkSummaryCardProps) {
  const t = useTranslations();

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader bordered>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon icon="tabler:file-text" height={20} className="text-secondary-500" />
              {t("dashboard.homework")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No homework
  if (homework.length === 0) {
    return (
      <Card>
        <CardHeader bordered>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon icon="tabler:file-text" height={20} className="text-secondary-500" />
              {t("dashboard.homework")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center">
              <Icon icon="tabler:file-upload" height={24} className="text-secondary-600 dark:text-secondary-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
              {t("dashboard.noHomework")}
            </p>
            <Link href="/homework">
              <Button variant="outline" size="sm" icon="tabler:upload">
                {t("dashboard.uploadHomework")}
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
            <Icon icon="tabler:file-text" height={20} className="text-secondary-500" />
            {t("dashboard.homework")}
          </CardTitle>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {homework.length} {t("dashboard.documents")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {homework.map((hw) => {
            const statusConfig = STATUS_CONFIG[hw.status];
            const unviewedCount = hw.questionCount - hw.viewedCount;
            const hasUnviewed = unviewedCount > 0 && hw.status === "completed";
            const potentialXp = unviewedCount * 5; // 5 XP per question

            return (
              <Link
                key={hw.id}
                href={`/homework/${hw.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              >
                {/* Status indicator */}
                <div className={`w-10 h-10 rounded-xl ${statusConfig.bgColor} flex items-center justify-center relative`}>
                  <Icon
                    icon={statusConfig.icon}
                    height={20}
                    className={`${statusConfig.color} ${statusConfig.animate ? "animate-spin" : ""}`}
                  />
                  {/* Unviewed badge */}
                  {hasUnviewed && (
                    <div className="absolute -top-1 -end-1 w-5 h-5 bg-error-500 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{unviewedCount}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                    {hw.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {hw.status === "completed" ? (
                      <>
                        <span>{hw.viewedCount}/{hw.questionCount} {t("dashboard.viewed")}</span>
                        {hasUnviewed && (
                          <>
                            <span>•</span>
                            <span className="text-success-600 dark:text-success-400 font-medium">
                              +{potentialXp} XP
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <span className={statusConfig.color}>
                        {statusConfig.label.en}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <Icon
                  icon="tabler:chevron-right"
                  height={18}
                  className="text-gray-400 group-hover:text-primary-500 transition-colors"
                />
              </Link>
            );
          })}
        </div>

        {/* Upload button */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/homework" className="block">
            <Button variant="outline" className="w-full" icon="tabler:upload">
              {t("dashboard.uploadHomework")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
