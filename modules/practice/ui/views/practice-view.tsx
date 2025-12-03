// modules/practice/ui/views/practice-view.tsx
// Main practice page view - Worksheet Mode with Backend Integration

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Card, CardContent, Button } from "@/shared/ui";
import { WorksheetView, WorksheetResults } from "../components";
import { useTodaySet, useSubmitAnswer, useUploadAnswerImage } from "../../hooks/use-practice";
import { trpc } from "@/trpc/client";
import { useGamification } from "@/modules/gamification/ui/context/GamificationContext";
import type { WorksheetResults as WorksheetResultsType } from "../../lib/check-answers";

type ViewMode = "loading" | "worksheet" | "submitting" | "results";

export function PracticeView() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  // Fetch daily set from backend
  const { dailySet, isLoading, error, refetch } = useTodaySet();
  const { submitAnswerAsync } = useSubmitAnswer();
  const { uploadImageAsync } = useUploadAnswerImage();

  // Fetch user profile for streak display
  const { data: userProfile } = trpc.dashboard.getUserProfile.useQuery();

  // Gamification toasts
  const { showDailyComplete } = useGamification();

  const [viewMode, setViewMode] = useState<ViewMode>("loading");
  const [results, setResults] = useState<WorksheetResultsType | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0 });

  // Track previous state to avoid synchronous setState in effect
  const prevStateRef = useRef<{ isLoading: boolean; dailySetId: string | null; hasResults: boolean }>({
    isLoading: true,
    dailySetId: null,
    hasResults: false,
  });

  // Update view mode based on loading state - using requestAnimationFrame to batch updates
  useEffect(() => {
    const prevState = prevStateRef.current;
    const currentState = {
      isLoading,
      dailySetId: dailySet?.id || null,
      hasResults: results !== null,
    };

    // Only update if state actually changed
    const stateChanged =
      prevState.isLoading !== currentState.isLoading ||
      prevState.dailySetId !== currentState.dailySetId ||
      prevState.hasResults !== currentState.hasResults;

    if (stateChanged) {
      prevStateRef.current = currentState;
      requestAnimationFrame(() => {
        if (isLoading) {
          setViewMode("loading");
        } else if (dailySet && !results) {
          if (dailySet.isCompleted) {
            setViewMode("results");
          } else {
            setViewMode("worksheet");
          }
        }
      });
    }
  }, [isLoading, dailySet, results]);

  // Handle worksheet submission - save each answer to backend
  const handleSubmit = async (
    worksheetResults: WorksheetResultsType,
    handworkImage: File | null
  ) => {
    if (!dailySet) return;

    setViewMode("submitting");
    setUploadedImage(handworkImage);
    setSubmitProgress({ current: 0, total: worksheetResults.results.length });

    let totalXpEarned = 0;

    // Upload handwork image if provided
    let uploadedImageUrl: string | null = null;
    if (handworkImage) {
      try {
        // Convert file to base64
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(handworkImage);
        });

        const uploadResult = await uploadImageAsync({
          base64Data,
          fileName: handworkImage.name,
          mimeType: handworkImage.type,
        });

        if (uploadResult.success && uploadResult.fileUrl) {
          uploadedImageUrl = uploadResult.fileUrl;
        }
      } catch {
        // Silently handle upload error - user can still submit without image
      }
    }

    // Submit each answer to the backend
    let completionBonus = 0;
    let streakBonus = 0;

    for (let i = 0; i < worksheetResults.results.length; i++) {
      const result = worksheetResults.results[i];
      setSubmitProgress({ current: i + 1, total: worksheetResults.results.length });

      try {
        const response = await submitAnswerAsync({
          dailySetId: dailySet.id,
          problemId: result.problemId,
          answerText: result.userAnswer || null,
          // Use the uploaded image URL for the first non-skipped answer (worksheet mode shares one image)
          answerImageUrl: (!result.isSkipped && i === worksheetResults.results.findIndex(r => !r.isSkipped) && uploadedImageUrl)
            ? uploadedImageUrl
            : null,
          isSkipped: result.isSkipped,
        });

        if (response.xpEarned) {
          totalXpEarned += response.xpEarned;
        }

        // Track bonuses from set completion (only comes with last answer)
        if (response.completionBonus) {
          completionBonus = response.completionBonus;
        }
        if (response.streakBonus) {
          streakBonus = response.streakBonus;
        }
      } catch {
        // Continue with next answer even if one fails
      }
    }

    // Show XP toast if any XP was earned
    if (totalXpEarned > 0) {
      // Show daily completion toast with bonuses
      const questionXp = totalXpEarned - completionBonus - streakBonus;
      showDailyComplete(questionXp, completionBonus + streakBonus);
    }

    // Update results with actual XP earned from backend
    const updatedResults: WorksheetResultsType = {
      ...worksheetResults,
      totalXp: totalXpEarned,
    };

    setResults(updatedResults);
    setViewMode("results");

    // Refetch to get updated daily set state
    await refetch();
  };

  // Handle practice again
  const handlePracticeAgain = () => {
    setResults(null);
    setUploadedImage(null);
    setViewMode("worksheet");
    refetch();
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  // Loading state
  if (viewMode === "loading" || isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center animate-pulse">
              <Icon icon="tabler:math" height={32} className="text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("practice.loadingExercises")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t("practice.preparingYourSet")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-error-200 dark:border-error-800">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
              <Icon icon="tabler:alert-circle" height={32} className="text-error-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("practice.errorLoadingSet")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message}
            </p>
            <Button variant="primary" onClick={() => refetch()}>
              {t("common.tryAgain")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No daily set available
  if (!dailySet) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
              <Icon icon="tabler:calendar-off" height={32} className="text-warning-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("practice.noSetAvailable")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t("practice.setGenerating")}
            </p>
            <Button variant="primary" onClick={() => refetch()}>
              {t("common.refresh")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Submitting state
  if (viewMode === "submitting") {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Icon icon="tabler:loader-2" height={32} className="text-primary-500 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("practice.savingAnswers")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t("practice.savingProgress", {
                current: submitProgress.current,
                total: submitProgress.total
              })}
            </p>
            {/* Progress bar */}
            <div className="w-64 mx-auto h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${(submitProgress.current / submitProgress.total) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results view (with local results from just-submitted session)
  if (viewMode === "results" && results) {
    return (
      <div className="max-w-3xl mx-auto">
        <WorksheetResults
          results={results}
          problems={dailySet.problems}
          onPracticeAgain={handlePracticeAgain}
          onBackToDashboard={handleBackToDashboard}
        />
      </div>
    );
  }

  // Already completed state (returning to a completed daily set)
  if (dailySet.isCompleted) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-success-200 dark:border-success-800">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
              <Icon icon="tabler:check" height={32} className="text-success-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("practice.alreadyCompleted")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {t("practice.comeBackTomorrow")}
            </p>
            <p className="text-success-600 dark:text-success-400 font-semibold mb-6">
              {t("history.xpEarned", { xp: dailySet.xpEarned })}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/history")}>
                {t("practice.viewHistory")}
              </Button>
              <Button variant="primary" onClick={handleBackToDashboard}>
                {t("practice.backToDashboard")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default: Worksheet view
  const focusTopicName = locale === "he"
    ? dailySet.problems[0]?.topicNameHe || dailySet.focusTopicName
    : dailySet.problems[0]?.topicName || dailySet.focusTopicName;

  return (
    <div className="max-w-3xl mx-auto">
      <WorksheetView
        title={t("practice.todaysPractice")}
        titleHe={t("practice.todaysPractice")}
        subtitle={`${focusTopicName} - ${dailySet.totalProblems} ${t("practice.questions")}`}
        subtitleHe={`${focusTopicName} - ${dailySet.totalProblems} ${t("practice.questions")}`}
        problems={dailySet.problems}
        streakDays={userProfile?.currentStreak || 0}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
