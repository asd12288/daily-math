"use client";

import { CardBox } from "@/shared/ui";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { MathRenderer } from "../shared/MathRenderer";
import { mockExercises } from "@/lib/mock-data";

interface SolutionRevealProps {
  solution: string;
  answer: string;
  xpEarned?: number;
  isRevealed?: boolean;
}

export function SolutionReveal({
  solution,
  answer,
  xpEarned = 20,
  isRevealed: initialRevealed = false,
}: SolutionRevealProps) {
  const [isRevealed, setIsRevealed] = useState(initialRevealed);

  if (!isRevealed) {
    return (
      <CardBox className="text-center">
        <div className="py-8">
          <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Icon icon="tabler:eye-off" className="text-3xl text-gray-400" />
          </div>
          <h4 className="font-medium text-lg mb-2">Solution Hidden</h4>
          <p className="text-gray-500 mb-6">
            Complete the exercise to reveal the solution
          </p>
          <button
            onClick={() => setIsRevealed(true)}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Reveal Solution
          </button>
        </div>
      </CardBox>
    );
  }

  return (
    <CardBox className="border-2 border-success-200 dark:border-success-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
            <Icon icon="tabler:check" className="text-xl text-success-600" />
          </div>
          <div>
            <h4 className="font-semibold text-success-800 dark:text-success-200">
              Solution Revealed
            </h4>
            <p className="text-sm text-gray-500">Review the step-by-step solution</p>
          </div>
        </div>
        {xpEarned > 0 && (
          <span className="px-3 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded-full font-medium">
            +{xpEarned} XP
          </span>
        )}
      </div>

      {/* Solution Steps */}
      <div className="mb-6">
        <h5 className="font-medium mb-3 flex items-center gap-2">
          <Icon icon="tabler:list-numbers" className="text-primary-500" />
          Step-by-Step Solution:
        </h5>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {solution.split("\n").map((line, index) => (
            <div key={index} className="mb-2 last:mb-0">
              {line.startsWith("**") ? (
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {line.replace(/\*\*/g, "")}
                </p>
              ) : (
                <MathRenderer content={line} className="text-gray-700 dark:text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final Answer */}
      <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
        <h5 className="font-medium text-success-800 dark:text-success-200 mb-2 flex items-center gap-2">
          <Icon icon="tabler:target" className="text-success-600" />
          Final Answer:
        </h5>
        <div className="text-xl">
          <MathRenderer content={answer} className="text-success-700 dark:text-success-300 font-medium" />
        </div>
      </div>
    </CardBox>
  );
}

// Showcase
export function SolutionRevealShowcase() {
  const exercise = mockExercises[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Hidden State</p>
        <SolutionReveal solution={exercise.solution} answer={exercise.answer} />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Revealed State</p>
        <SolutionReveal solution={exercise.solution} answer={exercise.answer} isRevealed xpEarned={20} />
      </div>
    </div>
  );
}
