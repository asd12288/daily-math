// modules/topics/ui/components/TopicHeader.tsx
// Header component for topic detail page

"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import type { TopicDetail } from "../../types";

interface TopicHeaderProps {
  topic: TopicDetail;
  courseId: string;
  mastery?: number; // 0-100
}

export function TopicHeader({ topic, courseId, mastery = 0 }: TopicHeaderProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isHe = locale === "he";

  const name = isHe ? topic.nameHe : topic.name;
  const branchName = isHe ? topic.branch.nameHe : topic.branch.name;

  // Determine mastery color
  const getMasteryColor = (value: number) => {
    if (value >= 80) return "text-success-600 bg-success-100";
    if (value >= 50) return "text-warning-600 bg-warning-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link
          href={`/${locale}/courses`}
          className="hover:text-primary-600 transition-colors"
        >
          {t("navigation.courses")}
        </Link>
        <Icon icon="tabler:chevron-right" className="w-4 h-4 rtl:rotate-180" />
        <Link
          href={`/${locale}/courses/${courseId}`}
          className="hover:text-primary-600 transition-colors"
        >
          {t("navigation.skillTree")}
        </Link>
        <Icon icon="tabler:chevron-right" className="w-4 h-4 rtl:rotate-180" />
        <span className="text-gray-900 dark:text-white font-medium">{name}</span>
      </nav>

      {/* Header content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Branch icon */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${topic.branch.color}-100 dark:bg-${topic.branch.color}-900/30`}
          >
            <Icon
              icon={topic.branch.icon}
              className={`w-6 h-6 text-${topic.branch.color}-600`}
            />
          </div>

          <div>
            {/* Branch label */}
            <span className={`text-xs font-medium text-${topic.branch.color}-600 uppercase tracking-wide`}>
              {branchName}
            </span>

            {/* Topic name */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {name}
            </h1>

            {/* Prerequisites */}
            {topic.prerequisiteTopics.length > 0 && (
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Icon icon="tabler:git-branch" className="w-4 h-4" />
                <span>
                  {t("topics.prerequisites")}:{" "}
                  {topic.prerequisiteTopics.map((prereq, idx) => (
                    <span key={prereq.$id}>
                      <Link
                        href={`/${locale}/courses/${courseId}/topics/${prereq.$id}`}
                        className="text-primary-600 hover:underline"
                      >
                        {isHe ? prereq.nameHe : prereq.name}
                      </Link>
                      {idx < topic.prerequisiteTopics.length - 1 && ", "}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mastery badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getMasteryColor(mastery)}`}>
          <Icon icon="tabler:chart-pie" className="w-5 h-5" />
          <div>
            <div className="text-xs uppercase tracking-wide opacity-70">
              {t("topics.mastery")}
            </div>
            <div className="text-lg font-bold">{mastery}%</div>
          </div>
        </div>
      </div>

      {/* Mastery progress bar */}
      <div className="mt-4">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              mastery >= 80 ? "bg-success-500" : mastery >= 50 ? "bg-warning-500" : "bg-gray-400"
            }`}
            style={{ width: `${mastery}%` }}
          />
        </div>
      </div>
    </div>
  );
}
