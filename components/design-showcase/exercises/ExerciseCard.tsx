"use client";

import { CardBox } from "@/shared/ui";
import { Icon } from "@iconify/react";
import { DifficultyBadge } from "./DifficultyBadge";
import { MathRenderer } from "../shared/MathRenderer";
import type { MockExercise } from "@/lib/mock-data";
import { mockExercises } from "@/lib/mock-data";

interface ExerciseCardProps {
  exercise: MockExercise;
  showSolution?: boolean;
  onComplete?: () => void;
  onUpload?: () => void;
}

export function ExerciseCard({
  exercise,
  showSolution = false,
  onComplete,
  onUpload,
}: ExerciseCardProps) {
  const statusColors = {
    pending: "border-gray-200 dark:border-gray-700",
    in_progress: "border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10",
    completed: "border-success-300 dark:border-success-700 bg-success-50/50 dark:bg-success-900/10",
    skipped: "border-gray-300 dark:border-gray-600 opacity-60",
  };

  return (
    <CardBox className={`border-2 ${statusColors[exercise.status]}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <DifficultyBadge difficulty={exercise.difficulty} />
          <span className="text-sm text-gray-500">{exercise.courseName}</span>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-500">{exercise.topic}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon icon="tabler:clock" className="text-gray-400" />
          <span className="text-sm text-gray-500">~{exercise.estimatedTime} min</span>
          <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full font-medium">
            {exercise.xp} XP
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Question:</h4>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <MathRenderer content={exercise.question} className="text-lg" />
        </div>
      </div>

      {/* Tip */}
      <div className="mb-6 p-3 bg-primary-50 dark:bg-primary-900/20 border-s-4 border-primary-500 rounded-e-lg">
        <div className="flex items-start gap-2">
          <Icon icon="tabler:bulb" className="text-primary-600 text-lg mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary-800 dark:text-primary-200">Tip:</p>
            <MathRenderer
              content={exercise.tip}
              className="text-sm text-primary-700 dark:text-primary-300"
            />
          </div>
        </div>
      </div>

      {/* Solution (if showing) */}
      {showSolution && (
        <div className="mb-6 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
          <div className="flex items-center gap-2 mb-3">
            <Icon icon="tabler:check" className="text-success-600" />
            <h4 className="font-medium text-success-800 dark:text-success-200">Solution:</h4>
          </div>
          <MathRenderer content={exercise.solution} className="text-gray-700 dark:text-gray-300" />
          <div className="mt-4 pt-4 border-t border-success-200 dark:border-success-700">
            <p className="text-sm font-medium text-success-800 dark:text-success-200">Answer:</p>
            <MathRenderer
              content={exercise.answer}
              className="text-lg font-medium text-success-700 dark:text-success-300"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      {exercise.status !== "completed" && !showSolution && (
        <div className="flex items-center gap-3">
          <button
            onClick={onUpload}
            className="flex-1 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <Icon icon="tabler:camera" className="text-lg" />
            Upload Handwork
          </button>
          <button
            onClick={onComplete}
            className="px-6 py-2.5 bg-success-600 hover:bg-success-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Icon icon="tabler:check" className="text-lg" />
            Mark as Done
          </button>
        </div>
      )}

      {exercise.status === "completed" && (
        <div className="flex items-center gap-2 text-success-600">
          <Icon icon="tabler:circle-check-filled" className="text-xl" />
          <span className="font-medium">Completed! +{exercise.xp} XP earned</span>
        </div>
      )}
    </CardBox>
  );
}

// Showcase
export function ExerciseCardShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">In Progress Exercise</p>
        <ExerciseCard exercise={mockExercises[2]} />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Completed Exercise with Solution</p>
        <ExerciseCard exercise={mockExercises[0]} showSolution />
      </div>
    </div>
  );
}
