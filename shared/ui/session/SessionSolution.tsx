// shared/ui/session/SessionSolution.tsx
// Unified solution display component for all session types

"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui";
import { MathDisplay, MathEquation } from "@/shared/ui/math-display";

interface SessionSolutionProps {
  /** The final answer */
  answer: string;
  /** Solution steps (localized array) */
  steps: string[];
  /** Optional tip/insight */
  tip?: string;
  /** AI confidence score (0-1), only shown for homework */
  aiConfidence?: number;
  /** Whether to show AI confidence badge */
  showAiConfidence?: boolean;
  /** Callback when solution is hidden */
  onHide?: () => void;
  /** Current locale */
  locale?: "en" | "he";
  /** Additional CSS classes */
  className?: string;
  /** Whether solution is still generating */
  isGenerating?: boolean;
  /** Generation error message */
  generationError?: string;
}

/**
 * Parse a solution step to separate text from block math
 * Returns { text: string, math: string | null }
 */
function parseStepContent(step: string): { text: string; math: string | null } {
  // Check for block math $$...$$
  const blockMathMatch = step.match(/\$\$([^$]+)\$\$/);
  if (blockMathMatch) {
    const text = step.replace(/\$\$[^$]+\$\$/, "").trim();
    return { text, math: blockMathMatch[1].trim() };
  }

  // Check for inline math with significant content
  const inlineMathMatches = step.match(/\$([^$]+)\$/g);
  if (inlineMathMatches && inlineMathMatches.length > 0) {
    const mathContents = inlineMathMatches.map((m) => m.slice(1, -1));
    const largestMath = mathContents.reduce((a, b) =>
      a.length > b.length ? a : b
    );

    // If math is substantial, keep inline for now
    if (
      largestMath.length > 10 ||
      /[=+\-*/\\frac\\int\\lim\\sum]/.test(largestMath)
    ) {
      return { text: step, math: null };
    }
  }

  return { text: step, math: null };
}

export function SessionSolution({
  answer,
  steps,
  tip,
  aiConfidence,
  showAiConfidence = false,
  onHide,
  locale = "en",
  className,
  isGenerating = false,
  generationError,
}: SessionSolutionProps) {
  const t = useTranslations();
  const _isHebrew = locale === "he";
  void _isHebrew; // Available for RTL-specific styling
  const [showAllSteps, setShowAllSteps] = useState(true);

  // Memoize parsed steps
  const parsedSteps = useMemo(
    () => steps.map((step) => parseStepContent(step)),
    [steps]
  );

  // Handle generating state
  if (isGenerating) {
    return (
      <div className={`py-8 ${className || ""}`}>
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
            <Icon
              icon="tabler:sparkles"
              height={24}
              className="text-primary-500 animate-pulse"
            />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("session.generatingSolution")}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
            {t("session.generatingSolutionDesc")}
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (generationError) {
    return (
      <div className={`py-6 ${className || ""}`}>
        <div className="flex flex-col items-center justify-center text-center">
          <Icon icon="tabler:alert-circle" height={28} className="text-error-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {generationError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Answer Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icon
            icon="tabler:circle-check-filled"
            height={20}
            className="text-success-500"
          />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t("session.answer")}
          </h4>
        </div>

        {/* Answer box with left border accent */}
        <div className="relative ps-4 border-s-2 border-success-400 dark:border-success-500">
          <div dir="ltr" className="py-2">
            <MathDisplay content={answer} size="lg" />
          </div>
        </div>
      </div>

      {/* Solution Steps Section */}
      {steps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon
                icon="tabler:list-numbers"
                height={20}
                className="text-primary-500"
              />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("session.solutionSteps")}
              </h4>
              <span className="text-xs text-gray-400">({steps.length})</span>
            </div>

            {steps.length > 3 && (
              <button
                onClick={() => setShowAllSteps(!showAllSteps)}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                {showAllSteps
                  ? t("session.collapseSteps")
                  : t("session.expandSteps")}
              </button>
            )}
          </div>

          {/* Steps list */}
          <div className="space-y-4">
            {(showAllSteps ? parsedSteps : parsedSteps.slice(0, 2)).map(
              ({ text, math }, index) => (
                <div key={index} className="solution-step">
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
                        size="sm"
                        className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Separated math block (if substantial) */}
                  {math && (
                    <div className="ms-9 mt-2 py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <MathEquation content={math} size="md" />
                    </div>
                  )}
                </div>
              )
            )}

            {/* Show collapsed indicator */}
            {!showAllSteps && steps.length > 2 && (
              <button
                onClick={() => setShowAllSteps(true)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Icon icon="tabler:dots" height={16} />
                <span>
                  {t("session.moreSteps", { count: steps.length - 2 })}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tip Section */}
      {tip && (
        <div className="flex items-start gap-3 pt-2">
          <Icon
            icon="tabler:bulb"
            height={18}
            className="text-warning-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <span className="text-xs font-medium text-warning-600 dark:text-warning-400">
              {t("session.tip")}:
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
              {tip}
            </p>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        {/* AI Confidence (if shown) */}
        {showAiConfidence && aiConfidence !== undefined && aiConfidence !== null && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Icon icon="tabler:robot" height={14} />
            <span>{Math.round(aiConfidence * 100)}%</span>
          </div>
        )}

        {/* Spacer if no AI confidence */}
        {!showAiConfidence && <div />}

        {/* Hide button */}
        {onHide && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onHide}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon icon="tabler:chevron-up" height={16} className="me-1" />
            {t("session.hideSolution")}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * SessionSolutionToggle - Button to reveal solution with loading state
 */
interface SessionSolutionToggleProps {
  /** Is the solution currently visible */
  isVisible: boolean;
  /** Has this solution been viewed before */
  hasBeenViewed: boolean;
  /** Callback to toggle visibility */
  onToggle: () => void;
  /** Is currently loading/generating */
  isLoading?: boolean;
  /** XP to be earned on reveal (if not viewed yet) */
  xpOnReveal?: number;
}

export function SessionSolutionToggle({
  isVisible,
  hasBeenViewed,
  onToggle,
  isLoading = false,
  xpOnReveal,
}: SessionSolutionToggleProps) {
  const t = useTranslations();

  if (isVisible) {
    return null; // Solution component has its own hide button
  }

  return (
    <div className="flex justify-center py-4">
      <Button
        variant={hasBeenViewed ? "outline" : "primary"}
        size="lg"
        onClick={onToggle}
        disabled={isLoading}
        isLoading={isLoading}
        className="min-w-[200px]"
      >
        {!isLoading && <Icon icon="tabler:eye" height={20} className="me-2" />}
        {hasBeenViewed
          ? t("session.viewSolutionAgain")
          : t("session.showSolution")}
        {!hasBeenViewed && xpOnReveal && (
          <span className="ms-2 px-2 py-0.5 bg-white/20 rounded text-xs">
            +{xpOnReveal} XP
          </span>
        )}
      </Button>
    </div>
  );
}
