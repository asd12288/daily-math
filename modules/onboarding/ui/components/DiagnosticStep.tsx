// modules/onboarding/ui/components/DiagnosticStep.tsx
// Diagnostic test component

"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Button, Card, CardContent, Input } from "@/shared/ui";
import { useDiagnosticTest } from "../../hooks";

interface DiagnosticStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function DiagnosticStep({ onComplete, onBack }: DiagnosticStepProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean | null;
    correctAnswer: string;
  } | null>(null);
  const prevIndexRef = useRef<number | null>(null);

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    isLastQuestion,
    isLoadingQuestions,
    isSubmitting,
    isCompleting,
    submitAnswer,
    nextQuestion,
    completeTest,
  } = useDiagnosticTest();

  // Reset answer when question changes - using ref to avoid synchronous setState in effect
  useEffect(() => {
    if (prevIndexRef.current !== null && prevIndexRef.current !== currentIndex) {
      // Batch state updates using requestAnimationFrame
      requestAnimationFrame(() => {
        setAnswer("");
        setShowResult(false);
        setLastResult(null);
      });
    }
    prevIndexRef.current = currentIndex;
  }, [currentIndex]);

  const handleSubmit = async () => {
    const result = await submitAnswer(answer || null);
    if (result) {
      setLastResult(result);
      setShowResult(true);
    }
  };

  const handleSkip = async () => {
    const result = await submitAnswer(null);
    if (result) {
      setLastResult(result);
      setShowResult(true);
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      await completeTest();
      onComplete();
    } else {
      nextQuestion();
    }
  };

  if (isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon
          icon="tabler:loader-2"
          height={48}
          className="animate-spin text-primary-500"
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("onboarding.diagnostic.noQuestions")}</p>
      </div>
    );
  }

  const questionText =
    locale === "he"
      ? currentQuestion.questionTextHe
      : currentQuestion.questionText;

  const hint =
    locale === "he" ? currentQuestion.hintHe : currentQuestion.hint;

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t("onboarding.diagnostic.progress", {
              current: currentIndex + 1,
              total: totalQuestions,
            })}
          </span>
          <span className="text-sm text-gray-500">
            {currentQuestion.topicName}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Difficulty badge */}
          <div className="flex items-center justify-between mb-4">
            <DifficultyBadge difficulty={currentQuestion.difficulty} />
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {questionText}
            </h3>
          </div>

          {/* Answer result or input */}
          {showResult && lastResult ? (
            <div
              className={`p-4 rounded-lg mb-4 ${
                lastResult.isCorrect === true
                  ? "bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800"
                  : lastResult.isCorrect === false
                  ? "bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800"
                  : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  icon={
                    lastResult.isCorrect === true
                      ? "tabler:circle-check"
                      : lastResult.isCorrect === false
                      ? "tabler:circle-x"
                      : "tabler:circle-minus"
                  }
                  height={20}
                  className={
                    lastResult.isCorrect === true
                      ? "text-success-600"
                      : lastResult.isCorrect === false
                      ? "text-error-600"
                      : "text-gray-500"
                  }
                />
                <span
                  className={`font-medium ${
                    lastResult.isCorrect === true
                      ? "text-success-700 dark:text-success-400"
                      : lastResult.isCorrect === false
                      ? "text-error-700 dark:text-error-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {lastResult.isCorrect === true
                    ? t("practice.correct")
                    : lastResult.isCorrect === false
                    ? t("practice.incorrect")
                    : t("practice.skipped")}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("onboarding.diagnostic.correctAnswer")}:{" "}
                <span className="font-mono font-medium">
                  {lastResult.correctAnswer}
                </span>
              </p>
            </div>
          ) : (
            <>
              {/* Answer input */}
              <div className="mb-4">
                <Input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={t("practice.enterAnswer")}
                  className="text-lg font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && answer) {
                      handleSubmit();
                    }
                  }}
                />
              </div>

              {/* Hint */}
              {hint && (
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
                  <div className="flex items-start gap-2">
                    <Icon
                      icon="tabler:bulb"
                      height={18}
                      className="text-primary-600 dark:text-primary-400 mt-0.5"
                    />
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                      {hint}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        {currentIndex === 0 && !showResult ? (
          <Button variant="ghost" onClick={onBack}>
            <Icon icon="tabler:arrow-left" className="me-2 rtl:rotate-180" />
            {t("common.back")}
          </Button>
        ) : (
          <div />
        )}

        {showResult ? (
          <Button
            variant="primary"
            onClick={handleNext}
            isLoading={isCompleting}
          >
            {isLastQuestion ? t("onboarding.diagnostic.seeResults") : t("common.next")}
            <Icon icon="tabler:arrow-right" className="ms-2 rtl:rotate-180" />
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              {t("practice.skip")}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!answer}
              isLoading={isSubmitting}
            >
              {t("common.submit")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const t = useTranslations();

  const colors: Record<string, string> = {
    easy: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400",
    medium:
      "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400",
    hard: "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400",
  };

  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
        colors[difficulty] || colors.medium
      }`}
    >
      {t(`practice.difficulty.${difficulty}`)}
    </span>
  );
}
