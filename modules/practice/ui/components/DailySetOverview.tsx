// modules/practice/ui/components/DailySetOverview.tsx
// Overview of today's daily set

"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/shared/ui";
import type { DailySet, ProblemAttempt } from "../../types";
import { SLOT_INFO } from "../../types";

interface DailySetOverviewProps {
  dailySet: DailySet;
  attempts: ProblemAttempt[];
  onStartPractice: () => void;
  onResumePractice: (index: number) => void;
}

export function DailySetOverview({
  dailySet,
  attempts,
  onStartPractice,
  onResumePractice,
}: DailySetOverviewProps) {
  const t = useTranslations();
  const locale = useLocale();

  const attemptMap = new Map(attempts.map((a) => [a.problemId, a]));
  const hasStarted = dailySet.completedCount > 0;
  const isCompleted = dailySet.isCompleted;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-100 text-sm mb-1">
                {t("dashboard.todaysSet")}
              </p>
              <h1 className="text-2xl font-bold">
                {locale === "he" ? dailySet.focusTopicName : dailySet.focusTopicName}
              </h1>
            </div>
            <div className="text-end">
              <p className="text-3xl font-bold">
                {dailySet.completedCount}/{dailySet.totalProblems}
              </p>
              <p className="text-primary-100 text-sm">
                {t("practice.completed")}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{
                width: `${(dailySet.completedCount / dailySet.totalProblems) * 100}%`,
              }}
            />
          </div>

          {/* XP earned */}
          {dailySet.xpEarned > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <Icon icon="tabler:star-filled" height={18} />
              <span className="font-medium">
                {t("practice.xpEarned", { xp: dailySet.xpEarned })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Problems List */}
      <Card>
        <CardHeader bordered>
          <CardTitle>{t("dashboard.exercises")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailySet.problems.map((problem, index) => {
              const attempt = attemptMap.get(problem.id);
              const isAnswered = !!attempt;
              const isCorrect = attempt?.isCorrect;
              const slotInfo = SLOT_INFO[problem.slot];

              return (
                <button
                  key={problem.id}
                  onClick={() => onResumePractice(index)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isAnswered
                      ? isCorrect
                        ? "bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800"
                        : isCorrect === false
                        ? "bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800"
                        : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {/* Number/Status */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isAnswered
                        ? isCorrect
                          ? "bg-success-500 text-white"
                          : isCorrect === false
                          ? "bg-error-500 text-white"
                          : "bg-gray-400 text-white"
                        : "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    }`}
                  >
                    {isAnswered ? (
                      <Icon
                        icon={
                          isCorrect
                            ? "tabler:check"
                            : isCorrect === false
                            ? "tabler:x"
                            : "tabler:minus"
                        }
                        height={20}
                      />
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-start min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {locale === "he" ? problem.topicNameHe : problem.topicName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Icon icon={slotInfo.icon} height={14} />
                      {t(`practice.difficulty.${problem.difficulty}`)}
                    </p>
                  </div>

                  {/* XP */}
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                      isAnswered && isCorrect
                        ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    +{problem.xpReward} XP
                  </span>

                  {/* Arrow */}
                  <Icon
                    icon="tabler:chevron-right"
                    height={20}
                    className="text-gray-400 rtl:rotate-180"
                  />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Start/Continue Button */}
      {!isCompleted && (
        <Button
          variant="primary"
          size="lg"
          onClick={hasStarted ? () => onResumePractice(dailySet.currentIndex) : onStartPractice}
          className="w-full"
          icon={hasStarted ? "tabler:player-play" : "tabler:rocket"}
        >
          {hasStarted ? "Continue Practice" : t("dashboard.startPractice")}
        </Button>
      )}

      {/* Completed Message */}
      {isCompleted && (
        <Card className="bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800">
          <CardContent className="py-6 text-center">
            <Icon
              icon="tabler:trophy"
              height={48}
              className="mx-auto text-success-500 mb-3"
            />
            <h3 className="text-xl font-bold text-success-800 dark:text-success-200 mb-2">
              Daily Set Complete!
            </h3>
            <p className="text-success-600 dark:text-success-300">
              You earned {dailySet.xpEarned} XP today. Great job!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
