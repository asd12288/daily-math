"use client";

import { CardBox } from "@/shared/ui";
import { Icon } from "@iconify/react";
import { mockCourses } from "../mock-data";

interface CourseCardProps {
  course: (typeof mockCourses)[0];
  onToggle?: () => void;
}

export function CourseCard({ course, onToggle }: CourseCardProps) {
  const colorClasses = {
    primary: {
      bg: "bg-primary-50 dark:bg-primary-900/20",
      icon: "text-primary-600",
      border: "border-primary-200 dark:border-primary-800",
    },
    secondary: {
      bg: "bg-secondary-50 dark:bg-secondary-900/20",
      icon: "text-secondary-600",
      border: "border-secondary-200 dark:border-secondary-800",
    },
    warning: {
      bg: "bg-warning-50 dark:bg-warning-900/20",
      icon: "text-warning-600",
      border: "border-warning-200 dark:border-warning-800",
    },
  };

  const colors = colorClasses[course.color as keyof typeof colorClasses] || colorClasses.primary;

  return (
    <CardBox
      className={`relative overflow-hidden transition-all hover:shadow-lg ${
        course.enrolled ? `${colors.bg} border-2 ${colors.border}` : ""
      } ${course.comingSoon ? "opacity-60" : "cursor-pointer"}`}
    >
      {course.comingSoon && (
        <div className="absolute top-3 end-3">
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
            Coming Soon
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div
          className={`h-14 w-14 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}
        >
          <Icon icon={course.icon} className={`text-2xl ${colors.icon}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{course.name}</h3>
            {course.enrolled && (
              <Icon icon="tabler:circle-check-filled" className="text-success-500" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{course.description}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {course.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full"
              >
                {topic}
              </span>
            ))}
            {course.topics.length > 3 && (
              <span className="px-2 py-0.5 text-gray-400 text-xs">
                +{course.topics.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              <Icon icon="tabler:notebook" className="inline me-1" />
              {course.exerciseCount} exercises
            </span>

            {!course.comingSoon && (
              <button
                onClick={onToggle}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  course.enrolled
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                }`}
              >
                {course.enrolled ? "Enrolled" : "Enroll"}
              </button>
            )}
          </div>
        </div>
      </div>
    </CardBox>
  );
}

// Course grid showcase
export function CourseCardShowcase() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {mockCourses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
