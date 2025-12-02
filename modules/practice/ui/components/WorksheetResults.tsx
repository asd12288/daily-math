// modules/practice/ui/components/WorksheetResults.tsx
// Shows results after worksheet submission

"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, Button, MathDisplay } from "@/shared/ui";
import type { Problem } from "../../types";
import type { WorksheetResults as WorksheetResultsType, ProblemResult } from "../../lib/check-answers";
import { getResultMessage } from "../../lib/check-answers";

interface WorksheetResultsProps {
  results: WorksheetResultsType;
  problems: Problem[];
  onPracticeAgain: () => void;
  onBackToDashboard: () => void;
}

export function WorksheetResults({
  results,
  problems,
  onPracticeAgain,
  onBackToDashboard,
}: WorksheetResultsProps) {
  const t = useTranslations();
  const locale = useLocale();

  const message = getResultMessage(results);
  const displayTitle = locale === "he" ? message.titleHe : message.title;
  const displayMessage = locale === "he" ? message.messageHe : message.message;

  // Map problems by ID for easy lookup
  const problemsMap = new Map(problems.map((p) => [p.id, p]));

  // Get appropriate styling based on result type
  const getHeaderStyle = () => {
    switch (message.type) {
      case "success":
        return "from-success-500 to-success-600";
      case "good":
        return "from-primary-500 to-primary-600";
      case "okay":
        return "from-warning-500 to-warning-600";
      case "needs_work":
        return "from-gray-500 to-gray-600";
      case "all_skipped":
        return "from-gray-400 to-gray-500";
      default:
        return "from-primary-500 to-primary-600";
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case "success":
        return "tabler:trophy";
      case "good":
        return "tabler:star";
      case "okay":
        return "tabler:thumb-up";
      case "needs_work":
        return "tabler:book";
      case "all_skipped":
        return "tabler:player-skip-forward";
      default:
        return "tabler:check";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card className={`bg-gradient-to-r ${getHeaderStyle()} border-0`}>
        <CardContent className="py-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
            <Icon icon={getIcon()} height={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{displayTitle}</h1>
          <p className="text-white/90">{displayMessage}</p>

          {/* XP Badge */}
          {results.totalXp > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-white/20 rounded-xl">
              <Icon icon="tabler:star-filled" height={24} className="text-yellow-300" />
              <span className="text-2xl font-bold text-white">+{results.totalXp}</span>
              <span className="text-white/80">XP</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon="tabler:circle-check"
          iconColor="text-success-500"
          value={results.correctCount}
          label={t("practice.correct")}
          bgColor="bg-success-50 dark:bg-success-900/20"
        />
        <StatCard
          icon="tabler:circle-x"
          iconColor="text-error-500"
          value={results.incorrectCount}
          label={t("practice.incorrect")}
          bgColor="bg-error-50 dark:bg-error-900/20"
        />
        <StatCard
          icon="tabler:circle-minus"
          iconColor="text-gray-400"
          value={results.skippedCount}
          label={t("practice.skipped")}
          bgColor="bg-gray-50 dark:bg-gray-800/50"
        />
      </div>

      {/* Results List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("practice.reviewAnswers")}
        </h2>

        {results.results.map((result, index) => {
          const problem = problemsMap.get(result.problemId);
          if (!problem) return null;

          return (
            <ResultCard
              key={result.problemId}
              index={index}
              result={result}
              problem={problem}
              locale={locale}
            />
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={onPracticeAgain}
          icon="tabler:refresh"
          className="flex-1"
        >
          {t("practice.practiceAgain")}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onBackToDashboard}
          icon="tabler:arrow-left"
          className="flex-1"
        >
          {t("practice.backToDashboard")}
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconColor,
  value,
  label,
  bgColor,
}: {
  icon: string;
  iconColor: string;
  value: number;
  label: string;
  bgColor: string;
}) {
  return (
    <Card className={bgColor}>
      <CardContent className="py-4 text-center">
        <Icon icon={icon} height={24} className={`mx-auto mb-1 ${iconColor}`} />
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      </CardContent>
    </Card>
  );
}

function ResultCard({
  index,
  result,
  problem,
  locale,
}: {
  index: number;
  result: ProblemResult;
  problem: Problem;
  locale: string;
}) {
  const t = useTranslations();
  const [showSolution, setShowSolution] = useState(false);

  const questionText = locale === "he" ? problem.questionTextHe : problem.questionText;
  const solutionSteps = locale === "he" ? problem.solutionStepsHe : problem.solutionSteps;

  const getStatusStyle = () => {
    if (result.isSkipped) {
      return {
        border: "border-gray-200 dark:border-gray-700",
        bg: "bg-gray-50 dark:bg-gray-800/50",
        icon: "tabler:circle-minus",
        iconColor: "text-gray-400",
        label: t("practice.skipped"),
        labelColor: "text-gray-600 dark:text-gray-400",
      };
    }
    if (result.isCorrect) {
      return {
        border: "border-success-200 dark:border-success-800",
        bg: "bg-success-50 dark:bg-success-900/20",
        icon: "tabler:circle-check",
        iconColor: "text-success-500",
        label: t("practice.correct"),
        labelColor: "text-success-700 dark:text-success-300",
      };
    }
    return {
      border: "border-error-200 dark:border-error-800",
      bg: "bg-error-50 dark:bg-error-900/20",
      icon: "tabler:circle-x",
      iconColor: "text-error-500",
      label: t("practice.incorrect"),
      labelColor: "text-error-700 dark:text-error-300",
    };
  };

  const style = getStatusStyle();

  return (
    <Card className={`${style.border} ${style.bg}`}>
      <CardContent className="py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {index + 1}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-gray-900 dark:text-white font-medium">
                <MathDisplay content={questionText} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Icon icon={style.icon} height={20} className={style.iconColor} />
            <span className={`text-sm font-medium ${style.labelColor}`}>
              {style.label}
            </span>
          </div>
        </div>

        {/* Answer Comparison */}
        {!result.isSkipped && (
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t("practice.yourAnswer")}
              </p>
              <div
                className={`font-mono font-medium ${
                  result.isCorrect
                    ? "text-success-700 dark:text-success-300"
                    : "text-error-700 dark:text-error-300"
                }`}
              >
                {result.userAnswer ? <MathDisplay content={result.userAnswer} /> : "—"}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t("practice.correctAnswer")}
              </p>
              <div className="font-mono font-medium text-success-700 dark:text-success-300">
                <MathDisplay content={result.correctAnswer} />
              </div>
            </div>
          </div>
        )}

        {/* XP Earned */}
        {result.xpEarned > 0 && (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-success-100 dark:bg-success-900/30 rounded-md mb-3">
            <Icon icon="tabler:star-filled" height={14} className="text-success-500" />
            <span className="text-sm font-medium text-success-700 dark:text-success-300">
              +{result.xpEarned} XP
            </span>
          </div>
        )}

        {/* Solution Toggle */}
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          <Icon
            icon={showSolution ? "tabler:chevron-up" : "tabler:chevron-down"}
            height={16}
          />
          {showSolution ? t("practice.hideSolution") : t("practice.showSolution")}
        </button>

        {/* Solution Steps */}
        {showSolution && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("practice.solutionSteps")}:
            </p>
            <ol className="space-y-2">
              {solutionSteps.map((step, stepIndex) => (
                <li key={stepIndex} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-medium shrink-0">
                    {stepIndex + 1}
                  </span>
                  <MathDisplay
                    content={step}
                    className="text-sm text-gray-700 dark:text-gray-300"
                  />
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
