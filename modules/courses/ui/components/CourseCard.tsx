// modules/courses/ui/components/CourseCard.tsx
// Course card component for course selection

"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/shared/ui";
import type { CourseWithProgress, Course } from "../../types";

interface CourseCardProps {
  course: CourseWithProgress | Course;
  showProgress?: boolean;
}

export function CourseCard({ course, showProgress = true }: CourseCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  const name = locale === "he" ? course.nameHe : course.name;
  const description = locale === "he" ? course.descriptionHe : course.description;

  // Check if course has progress data
  const hasProgress = "overallProgress" in course;
  const progress = hasProgress ? (course as CourseWithProgress).overallProgress : 0;
  const masteredTopics = hasProgress ? (course as CourseWithProgress).masteredTopics : 0;
  const totalTopics = hasProgress ? (course as CourseWithProgress).totalTopics : 15;

  const isActive = course.isActive;

  return (
    <Link
      href={isActive ? `/courses/${course.id}` : "#"}
      className={isActive ? "block" : "block cursor-not-allowed"}
    >
      <Card
        className={`h-full transition-all duration-200 hover:shadow-lg ${
          isActive
            ? "hover:border-primary-300 dark:hover:border-primary-700"
            : "opacity-60"
        }`}
      >
        <CardContent className="p-6">
          {/* Header with icon */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${course.color}20` }}
            >
              <Icon
                icon={course.icon}
                height={28}
                style={{ color: course.color }}
              />
            </div>
            {!isActive && (
              <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                {t("courses.comingSoon")}
              </span>
            )}
          </div>

          {/* Course name and description */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {description}
          </p>

          {/* Progress section */}
          {showProgress && hasProgress && isActive && (
            <div className="space-y-3">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("skillTree.yourProgress")}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {progress}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: course.color,
                    }}
                  />
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Icon icon="tabler:book" height={16} />
                  <span>
                    {totalTopics} {t("courses.topics")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-success-600 dark:text-success-400">
                  <Icon icon="tabler:circle-check" height={16} />
                  <span>
                    {masteredTopics} {t("skillTree.mastered")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Topic count for non-progress cards */}
          {(!showProgress || !hasProgress) && isActive && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <Icon icon="tabler:book" height={16} />
              <span>
                {totalTopics} {t("courses.topics")}
              </span>
            </div>
          )}

          {/* CTA */}
          {isActive && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {progress > 0 ? t("common.continue") : t("common.start")}
                </span>
                <Icon
                  icon="tabler:arrow-right"
                  height={18}
                  className="text-primary-600 dark:text-primary-400 rtl:rotate-180"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
