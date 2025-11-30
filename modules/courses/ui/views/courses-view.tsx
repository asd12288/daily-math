// modules/courses/ui/views/courses-view.tsx
// Main courses list view

"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/shared/ui";
import { CourseCard } from "../components/CourseCard";
import { useCoursesWithProgress } from "../../hooks";

export function CoursesView() {
  const t = useTranslations();
  const { courses, isLoading, error } = useCoursesWithProgress();

  if (isLoading) {
    return <CoursesViewSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-error-200 dark:border-error-800">
        <CardContent className="py-8 text-center">
          <Icon
            icon="tabler:alert-circle"
            height={48}
            className="mx-auto text-error-500 mb-3"
          />
          <p className="text-error-600 dark:text-error-400">
            {t("common.error")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("courses.title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t("courses.subtitle")}
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} showProgress={true} />
        ))}
      </div>

      {/* Empty state */}
      {courses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon
              icon="tabler:book-off"
              height={48}
              className="mx-auto text-gray-400 mb-3"
            />
            <p className="text-gray-600 dark:text-gray-400">
              No courses available yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CoursesViewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-5 w-72 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
