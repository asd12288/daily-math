"use client";

import { useTranslations, useLocale } from "next-intl";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/shared/ui";

interface CourseProgress {
  id: string;
  name: string;
  nameHe: string;
  icon: string;
  color: string;
  overallProgress: number; // 0-100
  totalTopics: number;
  masteredTopics: number;
  nextTopicId?: string;
  nextTopicName?: string;
  nextTopicNameHe?: string;
}

interface MyCoursesCardProps {
  courses: CourseProgress[];
  isLoading?: boolean;
}

export function MyCoursesCard({ courses, isLoading = false }: MyCoursesCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  // Only show first 2 courses (compact)
  const displayCourses = courses.slice(0, 2);
  const hasMoreCourses = courses.length > 2;

  // Get localized name
  const getCourseName = (course: CourseProgress) => {
    return locale === "he" ? course.nameHe || course.name : course.name;
  };

  const getNextTopicName = (course: CourseProgress) => {
    if (!course.nextTopicName) return null;
    return locale === "he" ? course.nextTopicNameHe || course.nextTopicName : course.nextTopicName;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader bordered>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon icon="tabler:books" height={20} className="text-primary-500" />
              {t("dashboard.myCourses")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No enrolled courses
  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader bordered>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon icon="tabler:books" height={20} className="text-primary-500" />
              {t("dashboard.myCourses")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <Icon icon="tabler:book-2" height={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
              {t("dashboard.noCourses")}
            </p>
            <Link href="/courses">
              <Button variant="primary" size="sm" icon="tabler:plus">
                {t("dashboard.browseCourses")}
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
            <Icon icon="tabler:books" height={20} className="text-primary-500" />
            {t("dashboard.myCourses")}
          </CardTitle>
          {courses.length > 0 && (
            <Link
              href="/courses"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              {t("dashboard.viewAll")}
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayCourses.map((course) => {
            const nextTopic = getNextTopicName(course);

            return (
              <div
                key={course.id}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
              >
                {/* Course header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${course.color}20` }}
                  >
                    {course.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {getCourseName(course)}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {course.masteredTopics}/{course.totalTopics} {t("dashboard.topicsMastered")}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t("dashboard.progress")}
                    </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {course.overallProgress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${course.overallProgress}%`,
                        backgroundColor: course.color,
                      }}
                    />
                  </div>
                </div>

                {/* Next topic */}
                {nextTopic && (
                  <Link
                    href={`/courses/${course.id}/topics/${course.nextTopicId}`}
                    className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon icon="tabler:arrow-right" height={14} className="text-primary-500 shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {t("dashboard.next")}: {nextTopic}
                      </span>
                    </div>
                    <Icon
                      icon="tabler:chevron-right"
                      height={16}
                      className="text-gray-400 group-hover:text-primary-500 transition-colors shrink-0"
                    />
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Browse more courses */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/courses" className="block">
            <Button variant="outline" className="w-full" icon="tabler:plus">
              {hasMoreCourses ? t("dashboard.viewAllCourses") : t("dashboard.browseCourses")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
