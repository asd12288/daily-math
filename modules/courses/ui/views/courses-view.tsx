// modules/courses/ui/views/courses-view.tsx
// Main courses list view with tabs

"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, Button } from "@/shared/ui";
import { CourseCard } from "../components/CourseCard";
import { CourseSettingsModal } from "../components/CourseSettingsModal";
import { useCoursesWithProgress, useEnrollCourse } from "../../hooks";
import type { CourseWithProgress } from "../../types";

type TabType = "my-courses" | "explore";

export function CoursesView() {
  const t = useTranslations();
  const locale = useLocale();
  const { courses, isLoading, error, refetch } = useCoursesWithProgress();
  const { enroll, isEnrolling } = useEnrollCourse();

  const [activeTab, setActiveTab] = useState<TabType>("my-courses");
  const [settingsModalCourse, setSettingsModalCourse] = useState<CourseWithProgress | null>(null);

  // Split courses into enrolled and available
  const enrolledCourses = courses.filter((c) => c.isEnrolled);
  const availableCourses = courses.filter((c) => !c.isEnrolled && c.isActive);
  const comingSoonCourses = courses.filter((c) => !c.isActive);

  // Note: displayCourses is used in the component below based on activeTab

  const handleEnroll = async (courseId: string) => {
    try {
      await enroll({ courseId });
      refetch();
    } catch (error) {
      console.error("Failed to enroll:", error);
    }
  };

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

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="tabler:book"
          value={enrolledCourses.length}
          label={t("courses.stats.enrolled")}
          color="primary"
        />
        <StatCard
          icon="tabler:circle-check"
          value={enrolledCourses.reduce((acc, c) => acc + c.masteredTopics, 0)}
          label={t("courses.stats.topicsMastered")}
          color="success"
        />
        <StatCard
          icon="tabler:chart-line"
          value={
            enrolledCourses.length > 0
              ? Math.round(
                  enrolledCourses.reduce((acc, c) => acc + c.overallProgress, 0) /
                    enrolledCourses.length
                )
              : 0
          }
          label={t("courses.stats.avgProgress")}
          suffix="%"
          color="secondary"
        />
        <StatCard
          icon="tabler:compass"
          value={availableCourses.length}
          label={t("courses.stats.available")}
          color="warning"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <TabButton
          active={activeTab === "my-courses"}
          onClick={() => setActiveTab("my-courses")}
          icon="tabler:book-2"
          label={t("courses.tabs.myCourses")}
          count={enrolledCourses.length}
        />
        <TabButton
          active={activeTab === "explore"}
          onClick={() => setActiveTab("explore")}
          icon="tabler:compass"
          label={t("courses.tabs.explore")}
          count={availableCourses.length}
        />
      </div>

      {/* My Courses Tab */}
      {activeTab === "my-courses" && (
        <>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="relative group">
                  <CourseCard course={course} showProgress={true} />
                  {/* Settings button overlay */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSettingsModalCourse(course);
                    }}
                    className="absolute top-4 end-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-700"
                    title={t("nav.settings")}
                  >
                    <Icon icon="tabler:settings" height={18} className="text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon
                  icon="tabler:book-off"
                  height={48}
                  className="mx-auto text-gray-400 mb-3"
                />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t("courses.empty.noEnrolled")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("courses.empty.noEnrolledDesc")}
                </p>
                <Button
                  variant="primary"
                  onClick={() => setActiveTab("explore")}
                >
                  <Icon icon="tabler:compass" height={18} />
                  {t("courses.empty.exploreCourses")}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Explore Tab */}
      {activeTab === "explore" && (
        <>
          {availableCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <ExploreCourseCard
                  key={course.id}
                  course={course}
                  onEnroll={() => handleEnroll(course.id)}
                  isEnrolling={isEnrolling}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon
                  icon="tabler:circle-check"
                  height={48}
                  className="mx-auto text-success-500 mb-3"
                />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t("courses.empty.allEnrolled")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("courses.empty.allEnrolledDesc")}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Coming Soon Section */}
          {comingSoonCourses.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t("courses.comingSoon")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comingSoonCourses.map((course) => (
                  <CourseCard key={course.id} course={course} showProgress={false} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Settings Modal */}
      {settingsModalCourse && (
        <CourseSettingsModal
          isOpen={!!settingsModalCourse}
          onClose={() => setSettingsModalCourse(null)}
          courseId={settingsModalCourse.id}
          courseName={locale === "he" ? settingsModalCourse.nameHe : settingsModalCourse.name}
          courseColor={settingsModalCourse.color}
          courseIcon={settingsModalCourse.icon}
          showUnenroll={true}
        />
      )}
    </div>
  );
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
        ${
          active
            ? "border-primary-500 text-primary-600 dark:text-primary-400"
            : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        }
      `}
    >
      <Icon icon={icon} height={18} />
      {label}
      <span
        className={`
          px-2 py-0.5 text-xs rounded-full
          ${
            active
              ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800"
          }
        `}
      >
        {count}
      </span>
    </button>
  );
}

// Stat Card Component
function StatCard({
  icon,
  value,
  label,
  suffix = "",
  color,
}: {
  icon: string;
  value: number;
  label: string;
  suffix?: string;
  color: "primary" | "success" | "secondary" | "warning";
}) {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
    success: "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400",
    secondary: "bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400",
    warning: "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon icon={icon} height={20} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {value}{suffix}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Explore Course Card with Enroll Button
function ExploreCourseCard({
  course,
  onEnroll,
  isEnrolling,
  locale,
  t,
}: {
  course: CourseWithProgress;
  onEnroll: () => void;
  isEnrolling: boolean;
  locale: string;
  t: (key: string) => string;
}) {
  const name = locale === "he" ? course.nameHe : course.name;
  const description = locale === "he" ? course.descriptionHe : course.description;

  return (
    <Card className="h-full">
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
        </div>

        {/* Course name and description */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Topic count */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Icon icon="tabler:book" height={16} />
          <span>
            {course.totalTopics} {t("courses.topics")}
          </span>
        </div>

        {/* Enroll button */}
        <Button
          variant="primary"
          className="w-full"
          onClick={onEnroll}
          isLoading={isEnrolling}
        >
          <Icon icon="tabler:plus" height={18} />
          {t("courses.explore.enrollNow")}
        </Button>
      </CardContent>
    </Card>
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
