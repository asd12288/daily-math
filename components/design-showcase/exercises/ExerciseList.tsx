"use client";

import { CardBox } from "@/shared/ui";
import { Icon } from "@iconify/react";
import { DifficultyBadge } from "./DifficultyBadge";
import { MathRenderer } from "../shared/MathRenderer";
import { mockExercises, mockDailySet } from "../mock-data";

interface ExerciseListItemProps {
  exercise: (typeof mockExercises)[0];
  index: number;
  isActive?: boolean;
  onClick?: () => void;
}

function ExerciseListItem({ exercise, index, isActive, onClick }: ExerciseListItemProps) {
  const statusIcons = {
    pending: "tabler:circle",
    in_progress: "tabler:player-play-filled",
    completed: "tabler:circle-check-filled",
    skipped: "tabler:circle-x",
  };

  const statusColors = {
    pending: "text-gray-400",
    in_progress: "text-primary-500",
    completed: "text-success-500",
    skipped: "text-gray-400",
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
        isActive
          ? "bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-300 dark:border-primary-700"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-2 border-transparent"
      }`}
    >
      {/* Status Icon */}
      <div className={`shrink-0 ${statusColors[exercise.status]}`}>
        <Icon icon={statusIcons[exercise.status]} className="text-2xl" />
      </div>

      {/* Exercise Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
          <DifficultyBadge difficulty={exercise.difficulty} size="sm" />
        </div>
        <div className="truncate">
          <MathRenderer
            content={exercise.question.substring(0, 60) + (exercise.question.length > 60 ? "..." : "")}
            className="text-sm"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {exercise.courseName} • {exercise.topic}
        </p>
      </div>

      {/* XP & Time */}
      <div className="shrink-0 text-end">
        <p className="text-sm font-medium text-primary-600">{exercise.xp} XP</p>
        <p className="text-xs text-gray-500">~{exercise.estimatedTime} min</p>
      </div>

      {/* Arrow */}
      <Icon icon="tabler:chevron-right" className="text-gray-400 shrink-0" />
    </div>
  );
}

export function ExerciseList() {
  return (
    <CardBox>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold">Today&apos;s Exercises</h4>
          <p className="text-sm text-gray-500">
            {mockDailySet.completedCount} of {mockDailySet.exercises.length} completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
            {mockDailySet.totalXp} XP total
          </span>
          <span className="text-sm text-gray-500">
            <Icon icon="tabler:clock" className="inline me-1" />
            ~{mockDailySet.estimatedTime} min
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-success-500 rounded-full transition-all"
            style={{
              width: `${(mockDailySet.completedCount / mockDailySet.exercises.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Exercise Items */}
      <div className="space-y-2">
        {mockExercises.map((exercise, index) => (
          <ExerciseListItem
            key={exercise.id}
            exercise={exercise}
            index={index}
            isActive={exercise.status === "in_progress"}
          />
        ))}
      </div>
    </CardBox>
  );
}

// Compact list for sidebar
export function ExerciseListCompact() {
  return (
    <div className="space-y-2">
      {mockExercises.slice(0, 3).map((exercise, index) => (
        <div
          key={exercise.id}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
        >
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
              exercise.status === "completed"
                ? "bg-success-100 text-success-600"
                : exercise.status === "in_progress"
                ? "bg-primary-100 text-primary-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {exercise.status === "completed" ? (
              <Icon icon="tabler:check" />
            ) : (
              index + 1
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{exercise.topic}</p>
            <p className="text-xs text-gray-500">{exercise.courseName}</p>
          </div>
          <DifficultyBadge difficulty={exercise.difficulty} size="sm" />
        </div>
      ))}
    </div>
  );
}

// Showcase
export function ExerciseListShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Full Exercise List</p>
        <ExerciseList />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Compact List (for sidebar)</p>
        <div className="max-w-sm">
          <CardBox>
            <h5 className="font-medium mb-3">Quick Access</h5>
            <ExerciseListCompact />
          </CardBox>
        </div>
      </div>
    </div>
  );
}
