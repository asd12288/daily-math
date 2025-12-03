// modules/homework/ui/components/QuestionGroupCard.tsx
// Clean, minimal question card design

"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { MathDisplay } from "@/shared/ui/math-display";
import type { QuestionGroup, HomeworkQuestionWithSolution } from "../../types";
import { QuestionSolution } from "./QuestionSolution";

interface QuestionGroupCardProps {
  group: QuestionGroup;
  groupNumber: number;
  onViewSolution?: (questionId: string) => void;
  isViewingSolution?: boolean;
  generatingQuestionId?: string | null;
}

// Reusable solution button component
function SolutionButton({
  question,
  isGenerating,
  hasFailed,
  isViewingSolution,
  generatingQuestionId,
  onView,
  t,
}: {
  question: HomeworkQuestionWithSolution;
  isGenerating: boolean;
  hasFailed: boolean;
  isViewingSolution: boolean;
  generatingQuestionId: string | null;
  onView: () => void;
  t: (key: string) => string;
}) {
  if (isGenerating) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-primary-500">
        <Icon icon="tabler:loader-2" height={14} className="animate-spin" />
        <span className="text-gray-400">{t("homework.generatingSolution")}</span>
      </span>
    );
  }

  if (hasFailed) {
    return (
      <button
        onClick={onView}
        disabled={isViewingSolution}
        className="inline-flex items-center gap-1.5 text-sm text-error-500 hover:text-error-600 transition-colors"
      >
        <Icon icon="tabler:refresh" height={14} />
        {t("common.tryAgain")}
      </button>
    );
  }

  return (
    <button
      onClick={onView}
      disabled={isViewingSolution && generatingQuestionId === question.$id}
      className={`
        inline-flex items-center gap-1.5 text-sm transition-colors
        ${question.isViewed
          ? "text-gray-400 hover:text-gray-500"
          : "text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        }
      `}
    >
      {question.isViewed ? (
        <>
          <Icon icon="tabler:eye-check" height={14} />
          {t("homework.viewSolutionAgain")}
        </>
      ) : (
        <>
          <Icon icon="tabler:eye" height={14} />
          {t("homework.viewSolution")}
        </>
      )}
    </button>
  );
}

export function QuestionGroupCard({
  group,
  groupNumber,
  onViewSolution,
  isViewingSolution = false,
  generatingQuestionId,
}: QuestionGroupCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isHebrew = locale === "he";

  const { parentQuestion, subQuestions } = group;
  const hasSubQuestions = subQuestions.length > 0;

  // Track which solutions are shown
  const [shownSolutions, setShownSolutions] = useState<Set<string>>(new Set());

  // Get display text based on locale
  const getQuestionText = (q: HomeworkQuestionWithSolution) =>
    isHebrew && q.questionTextHe ? q.questionTextHe : q.questionText;

  // Check if a question is generating
  const isGenerating = (q: HomeworkQuestionWithSolution) =>
    q.solutionStatus === "generating" || generatingQuestionId === q.$id;

  // Check if solution generation failed
  const hasFailed = (q: HomeworkQuestionWithSolution) =>
    q.solutionStatus === "failed";

  // Handle view solution click
  const handleViewSolution = (questionId: string, isViewed: boolean) => {
    if (!isViewed && onViewSolution) {
      onViewSolution(questionId);
    }
    setShownSolutions((prev) => new Set(prev).add(questionId));
  };

  // Hide solution
  const hideSolution = (questionId: string) => {
    setShownSolutions((prev) => {
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
  };

  // Check if all questions are viewed
  const allQuestions = hasSubQuestions ? [parentQuestion, ...subQuestions] : [parentQuestion];
  const isGroupComplete = allQuestions.every((q) => q.isViewed);

  return (
    <div className="group">
      {/* Main card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Question header with number */}
        <div className="flex items-start gap-4 p-5">
          {/* Question number */}
          <div
            className={`
              flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold
              ${isGroupComplete
                ? "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }
            `}
          >
            {isGroupComplete ? <Icon icon="tabler:check" height={16} /> : groupNumber}
          </div>

          {/* Question content */}
          <div className="flex-1 min-w-0">
            <MathDisplay
              content={getQuestionText(parentQuestion)}
              size="2xl"
              className="text-gray-800 dark:text-gray-200 leading-relaxed"
            />

            {/* AI Illustration */}
            {parentQuestion.illustrationUrl && (
              <div className="mt-4 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                <img
                  src={parentQuestion.illustrationUrl}
                  alt={t("homework.illustrationAlt")}
                  className="w-full h-auto max-h-40 object-contain"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>

        {/* Sub-questions or single question action */}
        {hasSubQuestions ? (
          <div className="border-t border-gray-100 dark:border-gray-800">
            {subQuestions.map((subQ, idx) => {
              const isShown = shownSolutions.has(subQ.$id);

              return (
                <div
                  key={subQ.$id}
                  className={`
                    ${idx !== subQuestions.length - 1 ? "border-b border-gray-50 dark:border-gray-800/50" : ""}
                  `}
                >
                  {/* Sub-question row */}
                  <div className="flex items-start gap-3 px-5 py-4">
                    {/* Label */}
                    <span className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center text-xs font-medium">
                      {subQ.subQuestionLabel || String.fromCharCode(97 + idx)}
                    </span>

                    {/* Content + action */}
                    <div className="flex-1 min-w-0">
                      <MathDisplay
                        content={getQuestionText(subQ)}
                        size="xl"
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </div>

                    {/* Action */}
                    {!isShown && (
                      <div className="flex-shrink-0">
                        <SolutionButton
                          question={subQ}
                          isGenerating={isGenerating(subQ)}
                          hasFailed={hasFailed(subQ)}
                          isViewingSolution={isViewingSolution}
                          generatingQuestionId={generatingQuestionId || null}
                          onView={() => handleViewSolution(subQ.$id, subQ.isViewed)}
                          t={t}
                        />
                      </div>
                    )}
                  </div>

                  {/* Expanded solution */}
                  {isShown && (
                    <div className="px-5 pb-4 ps-14">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <QuestionSolution
                          question={subQ}
                          isGenerating={generatingQuestionId === subQ.$id}
                          onHide={() => hideSolution(subQ.$id)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Single question - action in footer
          <>
            {!shownSolutions.has(parentQuestion.$id) ? (
              <div className="px-5 pb-4 flex justify-end">
                <SolutionButton
                  question={parentQuestion}
                  isGenerating={isGenerating(parentQuestion)}
                  hasFailed={hasFailed(parentQuestion)}
                  isViewingSolution={isViewingSolution}
                  generatingQuestionId={generatingQuestionId || null}
                  onView={() => handleViewSolution(parentQuestion.$id, parentQuestion.isViewed)}
                  t={t}
                />
              </div>
            ) : (
              <div className="border-t border-gray-100 dark:border-gray-800 p-5">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <QuestionSolution
                    question={parentQuestion}
                    isGenerating={generatingQuestionId === parentQuestion.$id}
                    onHide={() => hideSolution(parentQuestion.$id)}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
