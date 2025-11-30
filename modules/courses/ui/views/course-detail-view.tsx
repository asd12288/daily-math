// modules/courses/ui/views/course-detail-view.tsx
// Course detail page with embedded skill tree

"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, Button } from "@/shared/ui";
import { SkillTreeFlowContainer } from "@/modules/skill-tree/ui/components/flow";
import { useCourseDetail } from "../../hooks";

interface CourseDetailViewProps {
  courseId: string;
  onTopicClick?: (topicId: string) => void;
}

export function CourseDetailView({ courseId, onTopicClick }: CourseDetailViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { courseDetail, isLoading, error } = useCourseDetail(courseId);

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (error || !courseDetail) {
    return (
      <Card className="border-error-200 dark:border-error-800">
        <CardContent className="py-8 text-center">
          <Icon
            icon="tabler:alert-circle"
            height={48}
            className="mx-auto text-error-500 mb-3"
          />
          <p className="text-error-600 dark:text-error-400 mb-4">
            {t("common.error")}
          </p>
          <Link href="/courses">
            <Button variant="outline">{t("common.back")}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const { course, userProgress } = courseDetail;
  const name = locale === "he" ? course.nameHe : course.name;
  // Description available for future use
  const _description = locale === "he" ? course.descriptionHe : course.description;

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center gap-4 py-2">
        {/* Back button */}
        <Link
          href="/courses"
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Icon icon="tabler:arrow-left" height={20} className="rtl:rotate-180" />
        </Link>

        {/* Course icon & name */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${course.color}20` }}
        >
          <Icon icon={course.icon} height={20} style={{ color: course.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {name}
          </h1>
        </div>

        {/* Progress stats - inline */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-success-600 dark:text-success-400 font-semibold">
              {userProgress.masteredTopics}
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-gray-400">
              {userProgress.totalTopics}
            </span>
          </div>
          <div
            className="text-xl font-bold"
            style={{ color: course.color }}
          >
            {userProgress.overallProgress}%
          </div>
        </div>
      </div>

      {/* Skill Tree - Full height */}
      <SkillTreeFlowContainer courseId={courseId} onTopicClick={onTopicClick} />
    </div>
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Compact header skeleton */}
      <div className="flex items-center gap-4 py-2">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="w-24 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>

      {/* Skill tree skeleton */}
      <div className="h-[calc(100vh-220px)] min-h-[400px] bg-gray-200 dark:bg-gray-800 rounded-xl" />
    </div>
  );
}
