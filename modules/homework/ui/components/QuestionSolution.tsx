// modules/homework/ui/components/QuestionSolution.tsx
// Minimalistic solution display with clear hierarchy and RTL support

"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/shared/ui";
import { MathEquation, MathDisplay } from "@/shared/ui/math-display";
import type { HomeworkQuestionWithSolution, CombinedSolutionSteps } from "../../types";

interface QuestionSolutionProps {
  question: HomeworkQuestionWithSolution;
  isGenerating?: boolean;
  onHide?: () => void;
}

/**
 * Parse a solution step to separate text from math
 * Returns { text: string, math: string | null }
 */
function parseStepContent(step: string): { text: string; math: string | null } {
  // Check for block math $$...$$
  const blockMathMatch = step.match(/\$\$([^$]+)\$\$/);
  if (blockMathMatch) {
    const text = step.replace(/\$\$[^$]+\$\$/, "").trim();
    return { text, math: blockMathMatch[1].trim() };
  }

  // Check for inline math with significant content (likely meant to be displayed)
  const inlineMathMatches = step.match(/\$([^$]+)\$/g);
  if (inlineMathMatches && inlineMathMatches.length > 0) {
    // If the step has substantial math, extract the largest math block
    const mathContents = inlineMathMatches.map(m => m.slice(1, -1));
    const largestMath = mathContents.reduce((a, b) => a.length > b.length ? a : b);

    // If math is substantial (has operators or complex content), separate it
    if (largestMath.length > 10 || /[=+\-*/\\frac\\int\\lim\\sum]/.test(largestMath)) {
      // Keep the text with inline math for context
      return { text: step, math: null };
    }
  }

  return { text: step, math: null };
}

export function QuestionSolution({
  question,
  isGenerating = false,
  onHide,
}: QuestionSolutionProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isHebrew = locale === "he";
  const [showAllSteps, setShowAllSteps] = useState(true);

  // IMPORTANT: All hooks must be called before any early returns (Rules of Hooks)
  // Parse solution steps from JSON (combined EN/HE format)
  const solutionSteps = useMemo(() => {
    const stepsJson = question.solution?.solutionSteps;
    if (!stepsJson) return [];

    try {
      const parsed = JSON.parse(stepsJson);

      // Check if it's the new combined format { en: [], he: [] }
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const combined = parsed as CombinedSolutionSteps;
        if (isHebrew && combined.he && combined.he.length > 0) {
          return combined.he;
        }
        return combined.en || [];
      }

      // Fallback: old format was a direct array
      if (Array.isArray(parsed)) {
        return parsed;
      }

      return [];
    } catch {
      return [stepsJson];
    }
  }, [question.solution?.solutionSteps, isHebrew]);

  // Get tip based on locale
  const tip = isHebrew && question.solution?.tipHe
    ? question.solution.tipHe
    : question.solution?.tip;

  // Handle missing solution (on-demand generation not yet triggered)
  // Skip this check if isGenerating is true (we want to show loading state)
  if (!question.solution && question.solutionStatus === "pending" && !isGenerating) {
    return null;
  }

  // Handle generating state (either from solutionStatus or explicit isGenerating prop)
  if (question.solutionStatus === "generating" || isGenerating) {
    return (
      <div className="py-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
            <Icon icon="tabler:sparkles" height={24} className="text-primary-500 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("homework.aiSolving")}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
            {t("homework.aiSolvingDescription")}
          </p>
        </div>
      </div>
    );
  }

  // Handle failed state
  if (question.solutionStatus === "failed") {
    return (
      <div className="py-6">
        <div className="flex flex-col items-center justify-center text-center">
          <Icon icon="tabler:alert-circle" height={28} className="text-error-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("homework.solutionFailed")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Answer Section ─── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icon
            icon="tabler:circle-check-filled"
            height={20}
            className="text-success-500"
          />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t("homework.answer")}
          </h4>
        </div>

        {/* Answer box - clean with left border accent */}
        <div className="relative ps-4 border-s-2 border-success-400 dark:border-success-500">
          <div dir="ltr" className="py-2">
            <MathDisplay content={question.answer} size="2xl" />
          </div>
        </div>
      </div>

      {/* ─── Solution Steps Section ─── */}
      {solutionSteps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="tabler:list-numbers"
                height={20}
                className="text-primary-500"
              />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("homework.solutionSteps")}
              </h4>
              <span className="text-xs text-gray-400">
                ({solutionSteps.length})
              </span>
            </div>

            {solutionSteps.length > 3 && (
              <button
                onClick={() => setShowAllSteps(!showAllSteps)}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                {showAllSteps ? t("homework.collapseSteps") : t("homework.expandSteps")}
              </button>
            )}
          </div>

          {/* Steps list */}
          <div className="space-y-4">
            {(showAllSteps ? solutionSteps : solutionSteps.slice(0, 2)).map((step, index) => {
              const { text, math } = parseStepContent(step);

              return (
                <div
                  key={index}
                  className="solution-step"
                >
                  {/* Step number + text */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <MathDisplay
                        content={text}
                        size="xl"
                        className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Separated math block (if substantial) */}
                  {math && (
                    <div className="ms-9 mt-2 py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <MathEquation content={math} size="2xl" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Show collapsed indicator */}
            {!showAllSteps && solutionSteps.length > 2 && (
              <button
                onClick={() => setShowAllSteps(true)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Icon icon="tabler:dots" height={16} />
                <span>{t("homework.moreSteps", { count: solutionSteps.length - 2 })}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Tip Section ─── */}
      {tip && (
        <div className="flex items-start gap-3 pt-2">
          <Icon
            icon="tabler:bulb"
            height={18}
            className="text-warning-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <span className="text-xs font-medium text-warning-600 dark:text-warning-400">
              {t("homework.tip")}:
            </span>
            <div className="text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
              <MathDisplay content={tip} size="xl" />
            </div>
          </div>
        </div>
      )}

      {/* ─── Footer Actions ─── */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        {/* AI Confidence */}
        {question.aiConfidence !== undefined && question.aiConfidence !== null && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Icon icon="tabler:robot" height={14} />
            <span>{Math.round(question.aiConfidence * 100)}%</span>
          </div>
        )}

        {/* Hide button */}
        {onHide && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onHide}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon icon="tabler:chevron-up" height={16} className="me-1" />
            {t("homework.hideSolution")}
          </Button>
        )}
      </div>
    </div>
  );
}
