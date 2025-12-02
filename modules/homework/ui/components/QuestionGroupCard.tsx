// modules/homework/ui/components/QuestionGroupCard.tsx
// Ultra-minimal question group card - focus on the problem

"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Card } from "@/shared/ui";
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

  // Handle view solution click
  const handleViewSolution = (questionId: string, isViewed: boolean) => {
    if (!isViewed && onViewSolution) {
      onViewSolution(questionId);
    }
    setShownSolutions((prev) => new Set(prev).add(questionId));
  };

  // Check if all questions are viewed
  const allQuestions = hasSubQuestions ? [parentQuestion, ...subQuestions] : [parentQuestion];
  const isGroupComplete = allQuestions.every((q) => q.isViewed);

  return (
    <Card className="relative overflow-visible">
      {/* ─── Question Number Badge ─── */}
      <div className="absolute -top-3 -start-3 z-10">
        <div className={`
          w-9 h-9 rounded-xl shadow-md flex items-center justify-center font-bold
          ${isGroupComplete
            ? 'bg-success-500 text-white'
            : 'bg-primary-600 dark:bg-primary-500 text-white'
          }
        `}>
          {groupNumber}
        </div>
      </div>

      <div className="pt-2">
        {/* ─── Question Content ─── */}
        <div className="mb-4">
          <MathDisplay
            content={getQuestionText(parentQuestion)}
            size="xl"
            className="text-gray-900 dark:text-gray-100 leading-relaxed"
          />
        </div>

        {/* ─── AI Illustration (if available) ─── */}
        {parentQuestion.illustrationUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={parentQuestion.illustrationUrl}
              alt={t("homework.illustrationAlt")}
              className="w-full h-auto max-h-48 object-contain bg-white dark:bg-gray-900"
              loading="lazy"
            />
          </div>
        )}

        {/* ─── Sub-questions ─── */}
        {hasSubQuestions ? (
          <div className="space-y-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {t("homework.subQuestions")} ({subQuestions.length})
            </div>

            {subQuestions.map((subQ) => {
              const isShown = shownSolutions.has(subQ.$id);

              return (
                <div
                  key={subQ.$id}
                  className="relative ps-8 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0"
                >
                  {/* Sub-question label */}
                  <div className="absolute start-0 top-0 w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center font-semibold text-sm">
                    {subQ.subQuestionLabel || "?"}
                  </div>

                  {/* Sub-question text */}
                  <div className="mb-3">
                    <MathDisplay
                      content={getQuestionText(subQ)}
                      size="lg"
                      className="text-gray-800 dark:text-gray-200"
                    />
                  </div>

                  {/* Solution section */}
                  {!isShown ? (
                    <div className="flex justify-end">
                      {isGenerating(subQ) ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-primary-500">
                          <Icon icon="tabler:loader-2" height={16} className="animate-spin" />
                          {t("homework.generatingSolution")}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleViewSolution(subQ.$id, subQ.isViewed)}
                          disabled={isViewingSolution && generatingQuestionId === subQ.$id}
                          className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                            ${subQ.isViewed
                              ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                              : 'bg-primary-600 hover:bg-primary-700 text-white'
                            }
                          `}
                        >
                          <Icon icon="tabler:eye" height={16} />
                          {subQ.isViewed ? t("homework.viewSolutionAgain") : t("homework.viewSolution")}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <QuestionSolution
                        question={subQ}
                        onHide={() =>
                          setShownSolutions((prev) => {
                            const next = new Set(prev);
                            next.delete(subQ.$id);
                            return next;
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Single question (no sub-questions) - show solution button
          <div className="mt-4 flex justify-end">
            {!shownSolutions.has(parentQuestion.$id) ? (
              <>
                {isGenerating(parentQuestion) ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-primary-500">
                    <Icon icon="tabler:loader-2" height={16} className="animate-spin" />
                    {t("homework.generatingSolution")}
                  </span>
                ) : (
                  <button
                    onClick={() => handleViewSolution(parentQuestion.$id, parentQuestion.isViewed)}
                    disabled={isViewingSolution && generatingQuestionId === parentQuestion.$id}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${parentQuestion.isViewed
                        ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }
                    `}
                  >
                    <Icon icon="tabler:eye" height={16} />
                    {parentQuestion.isViewed ? t("homework.viewSolutionAgain") : t("homework.viewSolution")}
                  </button>
                )}
              </>
            ) : (
              <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-800">
                <QuestionSolution
                  question={parentQuestion}
                  onHide={() =>
                    setShownSolutions((prev) => {
                      const next = new Set(prev);
                      next.delete(parentQuestion.$id);
                      return next;
                    })
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
