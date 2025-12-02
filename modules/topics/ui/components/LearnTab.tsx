// modules/topics/ui/components/LearnTab.tsx
// Learn tab content with theory and prerequisites

"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { TheoryRenderer } from "@/shared/ui";
import type { TopicDetail } from "../../types";

interface LearnTabProps {
  topic: TopicDetail;
  courseId: string;
}

export function LearnTab({ topic, courseId }: LearnTabProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isHe = locale === "he";

  const description = isHe && topic.descriptionHe ? topic.descriptionHe : topic.description;
  const theoryContent = isHe && topic.theoryContentHe ? topic.theoryContentHe : topic.theoryContent;

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Icon icon="tabler:info-circle" className="w-5 h-5 text-primary-600" />
          {t("topics.about")}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {topic.estimatedMinutes && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Icon icon="tabler:clock" className="w-4 h-4" />
              <span>{topic.estimatedMinutes} {t("common.minutes")}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Icon icon="tabler:chart-bar" className="w-4 h-4" />
            <span>
              {topic.difficultyLevels.map((d) => t(`difficulty.${d}`)).join(", ")}
            </span>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      {topic.prerequisiteTopics.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Icon icon="tabler:git-branch" className="w-5 h-5 text-warning-600" />
            {t("topics.prerequisites")}
          </h3>
          <div className="space-y-3">
            {topic.prerequisiteTopics.map((prereq) => (
              <Link
                key={prereq.$id}
                href={`/${locale}/courses/${courseId}/topics/${prereq.$id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                  <Icon icon="tabler:book" className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {isHe ? prereq.nameHe : prereq.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {isHe ? prereq.descriptionHe : prereq.description}
                  </p>
                </div>
                <Icon
                  icon="tabler:chevron-right"
                  className="w-5 h-5 text-gray-400 ms-auto rtl:rotate-180"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Theory content */}
      {theoryContent ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Icon icon="tabler:notebook" className="w-5 h-5 text-primary-600" />
            {t("topics.theory")}
          </h3>
          <TheoryRenderer content={theoryContent} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
          <Icon icon="tabler:book-off" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("topics.noTheory")}
          </h3>
          <p className="text-gray-500">{t("topics.noTheoryDesc")}</p>
        </div>
      )}

      {/* What's next */}
      {topic.dependentTopics.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Icon icon="tabler:arrow-right" className="w-5 h-5 text-success-600" />
            {t("topics.whatsNext")}
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {topic.dependentTopics.map((dep) => (
              <Link
                key={dep.$id}
                href={`/${locale}/courses/${courseId}/topics/${dep.$id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                  <Icon icon="tabler:arrow-up-right" className="w-5 h-5 text-success-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {isHe ? dep.nameHe : dep.name}
                  </h4>
                </div>
                <Icon
                  icon="tabler:chevron-right"
                  className="w-5 h-5 text-gray-400 rtl:rotate-180"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
