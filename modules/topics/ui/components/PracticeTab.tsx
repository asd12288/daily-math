// modules/topics/ui/components/PracticeTab.tsx
// Practice tab with question list and filters

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { Button } from "@/shared/ui";
import { MathDisplay } from "@/shared/ui/math-display";
import { useTopicExercises } from "../../hooks";
import type { TopicDocument } from "../../types";
import type { ExerciseDifficulty } from "@/lib/appwrite/types";

interface PracticeTabProps {
  topic: TopicDocument;
  courseId: string;
}

type FilterType = "all" | "easy" | "medium" | "hard";

export function PracticeTab({ topic, courseId }: PracticeTabProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isHe = locale === "he";
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const { data: exercises, isLoading, error } = useTopicExercises(topic.$id);

  const filters: { id: FilterType; label: string; icon: string }[] = [
    { id: "all", label: t("topics.filters.all"), icon: "tabler:list" },
    { id: "easy", label: t("difficulty.easy"), icon: "tabler:star" },
    { id: "medium", label: t("difficulty.medium"), icon: "tabler:star-half-filled" },
    { id: "hard", label: t("difficulty.hard"), icon: "tabler:stars" },
  ];

  // Filter exercises based on selected filter
  const filteredExercises = useMemo(() => {
    if (!exercises) return [];
    if (activeFilter === "all") return exercises;
    return exercises.filter((ex) => ex.difficulty === activeFilter);
  }, [exercises, activeFilter]);

  // Count by difficulty
  const counts = useMemo(() => {
    if (!exercises) return { easy: 0, medium: 0, hard: 0, total: 0 };
    return {
      easy: exercises.filter((e) => e.difficulty === "easy").length,
      medium: exercises.filter((e) => e.difficulty === "medium").length,
      hard: exercises.filter((e) => e.difficulty === "hard").length,
      total: exercises.length,
    };
  }, [exercises]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon icon="tabler:loader-2" className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon icon="tabler:alert-circle" className="w-12 h-12 mx-auto text-error-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{t("errors.loadFailed")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                activeFilter === filter.id
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              }
            `}
          >
            <Icon icon={filter.icon} className="w-4 h-4" />
            {filter.label}
            {filter.id !== "all" && (
              <span className="text-xs bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded">
                {counts[filter.id as keyof typeof counts]}
              </span>
            )}
            {filter.id === "all" && (
              <span className="text-xs bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded">
                {counts.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Question list */}
      {filteredExercises.length > 0 ? (
        <div className="space-y-3">
          {filteredExercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.$id}
              exercise={exercise}
              index={index + 1}
              isHe={isHe}
              courseId={courseId}
              topicId={topic.$id}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center py-8">
            <Icon icon="tabler:mood-empty" className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t("topics.noExercises")}
            </h3>
            <p className="text-gray-500">{t("topics.noExercisesDesc")}</p>
          </div>
        </div>
      )}

      {/* Start practice button */}
      {filteredExercises.length > 0 && (
        <div className="flex justify-center pt-4">
          <Link href={`/${locale}/practice?topic=${topic.$id}`}>
            <Button variant="primary" size="lg">
              <Icon icon="tabler:player-play" className="w-5 h-5 me-2" />
              {t("topics.startPractice")}
            </Button>
          </Link>
        </div>
      )}

      {/* Question types */}
      {topic.questionTypes && topic.questionTypes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Icon icon="tabler:category" className="w-5 h-5 text-secondary-600" />
            {t("topics.questionTypes")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {topic.questionTypes.map((type) => (
              <span
                key={type}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
              >
                {type.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ExerciseCardProps {
  exercise: {
    $id: string;
    question: string;
    questionHe?: string;
    difficulty: ExerciseDifficulty;
    xpReward: number;
    estimatedMinutes?: number;
  };
  index: number;
  isHe: boolean;
  courseId: string;
  topicId: string;
}

function ExerciseCard({ exercise, index, isHe, courseId, topicId }: ExerciseCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  const question = isHe && exercise.questionHe ? exercise.questionHe : exercise.question;

  const difficultyColors = {
    easy: "bg-success-100 text-success-700 dark:bg-success-900/30",
    medium: "bg-warning-100 text-warning-700 dark:bg-warning-900/30",
    hard: "bg-error-100 text-error-700 dark:bg-error-900/30",
  };

  const difficultyIcons = {
    easy: "tabler:star",
    medium: "tabler:star-half-filled",
    hard: "tabler:stars",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Question number */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{index}</span>
        </div>

        {/* Question content */}
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 dark:text-white mb-2">
            <MathDisplay content={question} />
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {/* Difficulty badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                difficultyColors[exercise.difficulty]
              }`}
            >
              <Icon icon={difficultyIcons[exercise.difficulty]} className="w-3 h-3" />
              {t(`difficulty.${exercise.difficulty}`)}
            </span>

            {/* XP reward */}
            <span className="inline-flex items-center gap-1 text-success-600">
              <Icon icon="tabler:star-filled" className="w-3 h-3" />
              {exercise.xpReward} XP
            </span>

            {/* Estimated time */}
            {exercise.estimatedMinutes && (
              <span className="inline-flex items-center gap-1 text-gray-500">
                <Icon icon="tabler:clock" className="w-3 h-3" />
                ~{exercise.estimatedMinutes} {t("common.min")}
              </span>
            )}
          </div>
        </div>

        {/* Action button */}
        <Link
          href={`/${locale}/practice?topic=${topicId}&exercise=${exercise.$id}`}
          className="flex-shrink-0 p-2 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 transition-colors"
        >
          <Icon icon="tabler:chevron-right" className="w-5 h-5 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
