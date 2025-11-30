// modules/practice/ui/components/WorksheetQuestion.tsx
// A compact question card for worksheet mode

"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, Input, MathDisplay } from "@/shared/ui";
import type { Problem, ProblemSlot } from "../../types";
import { SLOT_INFO } from "../../types";

interface WorksheetQuestionProps {
  problem: Problem;
  index: number;
  answer: string;
  isSkipped: boolean;
  onAnswerChange: (value: string) => void;
  onSkipToggle: () => void;
  showHint?: boolean;
}

const SLOT_LABELS: Record<ProblemSlot, { en: string; he: string }> = {
  review: { en: "Review", he: "חזרה" },
  core: { en: "Core", he: "ליבה" },
  foundation: { en: "Foundation", he: "יסוד" },
  challenge: { en: "Challenge", he: "אתגר" },
};

const DIFFICULTY_STYLES = {
  easy: {
    bg: "bg-success-100 dark:bg-success-900/30",
    text: "text-success-700 dark:text-success-400",
  },
  medium: {
    bg: "bg-warning-100 dark:bg-warning-900/30",
    text: "text-warning-700 dark:text-warning-400",
  },
  hard: {
    bg: "bg-error-100 dark:bg-error-900/30",
    text: "text-error-700 dark:text-error-400",
  },
};

const SLOT_STYLES: Record<ProblemSlot, { bg: string; text: string }> = {
  review: {
    bg: "bg-secondary-100 dark:bg-secondary-900/30",
    text: "text-secondary-700 dark:text-secondary-400",
  },
  core: {
    bg: "bg-primary-100 dark:bg-primary-900/30",
    text: "text-primary-700 dark:text-primary-400",
  },
  foundation: {
    bg: "bg-success-100 dark:bg-success-900/30",
    text: "text-success-700 dark:text-success-400",
  },
  challenge: {
    bg: "bg-warning-100 dark:bg-warning-900/30",
    text: "text-warning-700 dark:text-warning-400",
  },
};

export function WorksheetQuestion({
  problem,
  index,
  answer,
  isSkipped,
  onAnswerChange,
  onSkipToggle,
  showHint = true,
}: WorksheetQuestionProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [hintVisible, setHintVisible] = React.useState(false);

  const slotInfo = SLOT_INFO[problem.slot];
  const slotLabel = locale === "he" ? SLOT_LABELS[problem.slot].he : SLOT_LABELS[problem.slot].en;
  const topicName = locale === "he" ? problem.topicNameHe : problem.topicName;
  const questionText = locale === "he" ? problem.questionTextHe : problem.questionText;
  const hint = locale === "he" ? problem.hintHe : problem.hint;
  const difficultyLabel = t(`practice.difficulty.${problem.difficulty}`);

  const difficultyStyles = DIFFICULTY_STYLES[problem.difficulty];
  const slotStyles = SLOT_STYLES[problem.slot];

  return (
    <Card className={`transition-all duration-200 ${isSkipped ? "opacity-60" : ""}`}>
      <CardContent className="p-4 sm:p-6">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          {/* Question Number & Topic */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
              {index + 1}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {topicName}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Slot badge */}
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-md flex items-center gap-1 ${slotStyles.bg} ${slotStyles.text}`}
            >
              <Icon icon={slotInfo.icon} height={12} />
              <span className="hidden sm:inline">{slotLabel}</span>
            </span>

            {/* Difficulty badge */}
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-md ${difficultyStyles.bg} ${difficultyStyles.text}`}
            >
              {difficultyLabel}
            </span>

            {/* XP badge */}
            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400">
              +{problem.xpReward}
            </span>
          </div>
        </div>

        {/* Question Content */}
        <div className="mb-4">
          <div className="text-gray-900 dark:text-white font-medium text-lg">
            <MathDisplay content={questionText} />
          </div>
        </div>

        {/* Answer Input */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
              {t("practice.yourAnswer")}:
            </label>
            <Input
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder={t("practice.enterAnswer")}
              disabled={isSkipped}
              className={`flex-1 ${isSkipped ? "bg-gray-100 dark:bg-gray-800" : ""}`}
            />
          </div>

          {/* Skip checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <input
              type="checkbox"
              checked={isSkipped}
              onChange={onSkipToggle}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
            />
            <span>{t("practice.notSure")}</span>
          </label>
        </div>

        {/* Hint */}
        {showHint && hint && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            {!hintVisible ? (
              <button
                onClick={() => setHintVisible(true)}
                className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                <Icon icon="tabler:bulb" height={16} />
                {t("practice.showHint")}
              </button>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                <Icon
                  icon="tabler:bulb"
                  height={16}
                  className="text-warning-600 dark:text-warning-400 mt-0.5 shrink-0"
                />
                <span className="text-sm text-warning-800 dark:text-warning-200">
                  <MathDisplay content={hint} />
                </span>
              </div>
            )}
          </div>
        )}

        {/* DEV ONLY: Show correct answer */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-3 pt-3 border-t border-dashed border-purple-300 dark:border-purple-700">
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-500 text-white rounded">
                DEV
              </span>
              <span className="text-sm text-purple-700 dark:text-purple-300">
                Answer: <code className="font-mono font-bold"><MathDisplay content={problem.correctAnswer} /></code>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
