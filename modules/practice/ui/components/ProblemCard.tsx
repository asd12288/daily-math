// modules/practice/ui/components/ProblemCard.tsx
// Display a single problem

"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, MathDisplay } from "@/shared/ui";
import type { Problem, ProblemSlot } from "../../types";
import { SLOT_INFO } from "../../types";

interface ProblemCardProps {
  problem: Problem;
  problemNumber: number;
  totalProblems: number;
  showSolution?: boolean;
}

const SLOT_LABELS: Record<ProblemSlot, { en: string; he: string }> = {
  review: { en: "Review", he: "חזרה" },
  core: { en: "Core", he: "ליבה" },
  foundation: { en: "Foundation", he: "יסוד" },
  challenge: { en: "Challenge", he: "אתגר" },
};

const DIFFICULTY_COLORS = {
  easy: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400",
  medium: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400",
  hard: "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400",
};

export function ProblemCard({
  problem,
  problemNumber,
  totalProblems,
  showSolution = false,
}: ProblemCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  const slotInfo = SLOT_INFO[problem.slot];
  const slotLabel = locale === "he" ? SLOT_LABELS[problem.slot].he : SLOT_LABELS[problem.slot].en;
  const topicName = locale === "he" ? problem.topicNameHe : problem.topicName;
  const questionText = locale === "he" ? problem.questionTextHe : problem.questionText;
  const difficultyLabel = t(`practice.difficulty.${problem.difficulty}`);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Problem number */}
          <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center font-bold">
            {problemNumber}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("practice.exerciseOf", { current: problemNumber, total: totalProblems })}
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {topicName}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          {/* Slot badge */}
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 bg-light${slotInfo.color} text-${slotInfo.color}-700 dark:text-${slotInfo.color}-400`}
          >
            <Icon icon={slotInfo.icon} height={14} />
            {slotLabel}
          </span>

          {/* Difficulty badge */}
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-lg ${DIFFICULTY_COLORS[problem.difficulty]}`}
          >
            {difficultyLabel}
          </span>

          {/* XP badge */}
          <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400">
            +{problem.xpReward} XP
          </span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              <MathDisplay content={questionText} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hint (if available) */}
      {problem.hint && !showSolution && (
        <HintSection hint={locale === "he" ? problem.hintHe : problem.hint} />
      )}

      {/* Solution (if showing) */}
      {showSolution && (
        <SolutionSection
          problem={problem}
          locale={locale}
        />
      )}
    </div>
  );
}

function HintSection({ hint }: { hint?: string }) {
  const [showHint, setShowHint] = React.useState(false);
  const t = useTranslations();

  if (!hint) return null;

  return (
    <div className="mt-4">
      {!showHint ? (
        <button
          onClick={() => setShowHint(true)}
          className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          <Icon icon="tabler:bulb" height={16} />
          {t("practice.tip")}
        </button>
      ) : (
        <div className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl">
          <div className="flex items-start gap-2">
            <Icon icon="tabler:bulb" height={18} className="text-warning-600 dark:text-warning-400 mt-0.5" />
            <span className="text-sm text-warning-800 dark:text-warning-200">
              <MathDisplay content={hint} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function SolutionSection({
  problem,
  locale,
}: {
  problem: Problem;
  locale: string;
}) {
  const t = useTranslations();
  const steps = locale === "he" ? problem.solutionStepsHe : problem.solutionSteps;

  return (
    <Card className="border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20">
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Icon icon="tabler:check-circle" height={20} className="text-success-600 dark:text-success-400" />
          <h3 className="font-semibold text-success-800 dark:text-success-200">
            {t("practice.solution")}
          </h3>
        </div>

        {/* Solution steps */}
        <div className="space-y-2 mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-success-200 dark:bg-success-800 text-success-800 dark:text-success-200 flex items-center justify-center text-xs font-medium shrink-0">
                {index + 1}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <MathDisplay content={step} />
              </span>
            </div>
          ))}
        </div>

        {/* Final answer */}
        <div className="pt-4 border-t border-success-200 dark:border-success-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t("practice.answer")}:
          </p>
          <div className="text-lg font-mono font-semibold text-success-800 dark:text-success-200">
            <MathDisplay content={problem.correctAnswer} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
