// modules/courses/ui/views/course-detail-view.tsx
// Course detail page with embedded skill tree

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, Button } from "@/shared/ui";
import { SkillTreeFlowContainer } from "@/modules/skill-tree/ui/components/flow";
import { CourseSettingsModal } from "../components/CourseSettingsModal";
import { useCourseDetail } from "../../hooks";

interface CourseDetailViewProps {
  courseId: string;
  onTopicClick?: (topicId: string) => void;
}

export function CourseDetailView({ courseId, onTopicClick }: CourseDetailViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { courseDetail, isLoading, error } = useCourseDetail(courseId);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  return (
    <div className="relative h-[calc(100vh-64px)] min-h-[500px] -m-4 sm:-m-6">
      {/* Floating Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
        {/* Back button */}
        <Link
          href="/courses"
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Icon icon="tabler:arrow-left" height={18} className="rtl:rotate-180" />
        </Link>

        {/* Course icon & name */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${course.color}20` }}
        >
          <Icon icon={course.icon} height={18} style={{ color: course.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">
            {name}
          </h1>
        </div>

        {/* Progress stats - inline */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-success-600 dark:text-success-400 font-semibold">
              {userProgress.masteredTopics}
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500 dark:text-gray-400">
              {userProgress.totalTopics}
            </span>
          </div>
          <div
            className="text-lg font-bold"
            style={{ color: course.color }}
          >
            {userProgress.overallProgress}%
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title={locale === "he" ? "הגדרות" : "Settings"}
        >
          <Icon icon="tabler:settings" height={18} />
        </button>
      </div>

      {/* Skill Tree - Full area */}
      <div className="h-full w-full">
        <SkillTreeFlowContainer courseId={courseId} onTopicClick={onTopicClick} />
      </div>

      {/* Settings Modal */}
      <CourseSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        courseId={courseId}
        courseName={name}
        onSave={(settings) => {
          // TODO: Save settings to database
          console.log("Saving settings:", settings);
        }}
      />
    </div>
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="relative h-[calc(100vh-64px)] min-h-[500px] -m-4 sm:-m-6 animate-pulse">
      {/* Floating header skeleton */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="flex-1 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>

      {/* Skill tree skeleton - full area */}
      <div className="h-full w-full bg-gray-100 dark:bg-gray-950" />
    </div>
  );
}
