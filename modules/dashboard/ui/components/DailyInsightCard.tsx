"use client";

import { useTranslations, useLocale } from "next-intl";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Card, CardContent, Button } from "@/shared/ui";
import type { InsightType } from "@/modules/ai/server/services/daily-insight.service";

interface DailyInsightCardProps {
  insight: {
    type: InsightType;
    content: string;
    contentHe: string;
    relatedTopicId: string;
    relatedTopicName: string;
    relatedTopicNameHe: string;
  } | null;
  isLoading?: boolean;
}

const INSIGHT_TYPE_CONFIG = {
  fact: {
    icon: "tabler:sparkles",
    label: { en: "Did you know?", he: "הידעת?" },
    color: "text-primary-500",
    bgColor: "bg-primary-50 dark:bg-primary-900/20",
  },
  tip: {
    icon: "tabler:bulb",
    label: { en: "Study Tip", he: "טיפ ללמידה" },
    color: "text-warning-500",
    bgColor: "bg-warning-50 dark:bg-warning-900/20",
  },
  mistake: {
    icon: "tabler:alert-triangle",
    label: { en: "Watch Out!", he: "שימו לב!" },
    color: "text-error-500",
    bgColor: "bg-error-50 dark:bg-error-900/20",
  },
  connection: {
    icon: "tabler:world",
    label: { en: "Real World", he: "בעולם האמיתי" },
    color: "text-success-500",
    bgColor: "bg-success-50 dark:bg-success-900/20",
  },
};

export function DailyInsightCard({ insight, isLoading = false }: DailyInsightCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-0">
        <CardContent className="p-5">
          <div className="animate-pulse">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No insight available
  if (!insight) {
    return null;
  }

  const typeConfig = INSIGHT_TYPE_CONFIG[insight.type];
  const content = locale === "he" ? insight.contentHe : insight.content;
  const topicName = locale === "he" ? insight.relatedTopicNameHe : insight.relatedTopicName;
  const typeLabel = typeConfig.label[locale as "en" | "he"];

  return (
    <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-0 overflow-hidden">
      <CardContent className="p-5 relative">
        {/* Decorative background icon */}
        <div className="absolute top-0 end-0 opacity-5 transform translate-x-4 -translate-y-4">
          <Icon icon="tabler:bulb" height={120} />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3 relative">
          <div className={`w-10 h-10 ${typeConfig.bgColor} rounded-xl flex items-center justify-center`}>
            <Icon icon={typeConfig.icon} height={22} className={typeConfig.color} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t("dashboard.todaysInsight")}
            </h3>
            <span className={`text-xs font-medium ${typeConfig.color}`}>
              {typeLabel}
            </span>
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 relative">
          {content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between relative">
          {/* Related topic */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Icon icon="tabler:book" height={14} />
            <span>{topicName}</span>
          </div>

          {/* Practice button */}
          {insight.relatedTopicId && (
            <Link href={`/practice/topic/${insight.relatedTopicId}`}>
              <Button variant="primary" size="sm" icon="tabler:pencil">
                {t("dashboard.tryPractice")}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
