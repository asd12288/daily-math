// modules/onboarding/ui/components/ResultsStep.tsx
// Diagnostic results display

"use client";

import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Button, Card, CardContent } from "@/shared/ui";
import type { DiagnosticResult } from "../../types";

interface ResultsStepProps {
  result: DiagnosticResult;
  onNext: () => void;
}

export function ResultsStep({ result, onNext }: ResultsStepProps) {
  const t = useTranslations();

  const getGradeInfo = () => {
    if (result.percentCorrect >= 80) {
      return {
        icon: "tabler:trophy",
        color: "text-warning-500",
        bgColor: "bg-warning-100 dark:bg-warning-900/30",
        message: t("onboarding.results.excellent"),
      };
    } else if (result.percentCorrect >= 60) {
      return {
        icon: "tabler:star",
        color: "text-success-500",
        bgColor: "bg-success-100 dark:bg-success-900/30",
        message: t("onboarding.results.good"),
      };
    } else if (result.percentCorrect >= 30) {
      return {
        icon: "tabler:thumb-up",
        color: "text-primary-500",
        bgColor: "bg-primary-100 dark:bg-primary-900/30",
        message: t("onboarding.results.developing"),
      };
    } else {
      return {
        icon: "tabler:heart",
        color: "text-secondary-500",
        bgColor: "bg-secondary-100 dark:bg-secondary-900/30",
        message: t("onboarding.results.starting"),
      };
    }
  };

  const gradeInfo = getGradeInfo();

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className={`w-20 h-20 rounded-full ${gradeInfo.bgColor} flex items-center justify-center mx-auto mb-4`}
        >
          <Icon icon={gradeInfo.icon} height={40} className={gradeInfo.color} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("onboarding.results.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{gradeInfo.message}</p>
      </div>

      {/* Score card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {result.correctCount}
              </p>
              <p className="text-sm text-gray-500">{t("onboarding.results.correct")}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {result.totalQuestions}
              </p>
              <p className="text-sm text-gray-500">{t("onboarding.results.total")}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-success-600 dark:text-success-400">
                {result.percentCorrect}%
              </p>
              <p className="text-sm text-gray-500">{t("onboarding.results.accuracy")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topic breakdown */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {t("onboarding.results.topicBreakdown")}
          </h3>
          <div className="space-y-3">
            {result.topicResults.map((topic) => (
              <div
                key={topic.topicId}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      topic.status === "mastered"
                        ? "bg-success-100 dark:bg-success-900/30"
                        : topic.status === "needs_practice"
                        ? "bg-warning-100 dark:bg-warning-900/30"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <Icon
                      icon={
                        topic.status === "mastered"
                          ? "tabler:check"
                          : topic.status === "needs_practice"
                          ? "tabler:pencil"
                          : "tabler:minus"
                      }
                      height={16}
                      className={
                        topic.status === "mastered"
                          ? "text-success-600 dark:text-success-400"
                          : topic.status === "needs_practice"
                          ? "text-warning-600 dark:text-warning-400"
                          : "text-gray-400"
                      }
                    />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {topic.topicName}
                  </span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    topic.status === "mastered"
                      ? "text-success-600 dark:text-success-400"
                      : topic.status === "needs_practice"
                      ? "text-warning-600 dark:text-warning-400"
                      : "text-gray-400"
                  }`}
                >
                  {topic.correctAnswers}/{topic.questionsAsked}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended start */}
      <Card className="mb-8 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
              <Icon
                icon="tabler:target-arrow"
                height={24}
                className="text-primary-600 dark:text-primary-400"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t("onboarding.results.recommendation")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("onboarding.results.recommendationText", {
                  topic: result.topicResults.find(
                    (t) => t.topicId === result.recommendedStartTopic
                  )?.topicName || "Foundations",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue button */}
      <div className="text-center">
        <Button variant="primary" size="lg" onClick={onNext}>
          {t("onboarding.results.continue")}
          <Icon icon="tabler:arrow-right" className="ms-2 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
