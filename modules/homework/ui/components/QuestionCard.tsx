// modules/homework/ui/components/QuestionCard.tsx
// Ultra-minimal question card - focus on the problem

"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Card } from "@/shared/ui";
import { MathDisplay } from "@/shared/ui/math-display";
import type { HomeworkQuestionWithSolution } from "../../types";
import { QuestionSolution } from "./QuestionSolution";

interface QuestionCardProps {
  question: HomeworkQuestionWithSolution;
  questionNumber: number;
  onViewSolution?: (questionId: string) => void;
  isViewingSolution?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  onViewSolution,
  isViewingSolution = false,
}: QuestionCardProps) {
  const t = useTranslations();

  const [showSolution, setShowSolution] = useState(false);

  // Get display text based on locale - prefer Hebrew if available
  const questionText = question.questionTextHe || question.questionText;

  // Handle view solution click
  const handleViewSolution = () => {
    if (!question.isViewed && onViewSolution) {
      onViewSolution(question.$id);
    }
    setShowSolution(true);
  };

  return (
    <Card className="relative overflow-visible">
      {/* ─── Question Number (floating badge) ─── */}
      <div className="absolute -top-3 -start-3 z-10">
        <div className={`
          w-8 h-8 rounded-lg shadow-md flex items-center justify-center
          ${question.isViewed
            ? 'bg-success-500 text-white'
            : 'bg-primary-600 dark:bg-primary-500 text-white'
          }
        `}>
          <span className="font-bold text-sm">{questionNumber}</span>
        </div>
      </div>

      {/* ─── Question Content ─── */}
      <div className="pt-2">
        {/* Question text - large and prominent */}
        <div className="min-h-[60px] flex items-center">
          <MathDisplay
            content={questionText}
            size="xl"
            className="text-gray-900 dark:text-gray-100 leading-relaxed w-full"
          />
        </div>
      </div>

      {/* ─── Solution Toggle ─── */}
      {!showSolution ? (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleViewSolution}
            disabled={isViewingSolution}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              transition-colors
              ${question.isViewed
                ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
              }
              ${isViewingSolution ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isViewingSolution ? (
              <Icon icon="tabler:loader-2" height={16} className="animate-spin" />
            ) : (
              <Icon icon="tabler:eye" height={16} />
            )}
            {question.isViewed
              ? t("homework.viewSolutionAgain")
              : t("homework.viewSolution")}
          </button>
        </div>
      ) : (
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <QuestionSolution
            question={question}
            onHide={() => setShowSolution(false)}
          />
        </div>
      )}
    </Card>
  );
}
