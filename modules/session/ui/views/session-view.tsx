// modules/session/ui/views/session-view.tsx
// Main session page - displays current question and controls

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Icon } from "@iconify/react";
import { Button, Card, CardContent } from "@/shared/ui";
import {
  SessionQuestion,
  SessionSolution,
  SessionSolutionToggle,
  SessionHeader,
  SessionNavigation,
  SessionQuickNav,
} from "@/shared/ui/session";
import { useSession } from "../../hooks/use-session";
import { DIFFICULTY_CONFIG, MODE_CONFIG } from "../../config/constants";
import type { SessionDifficulty } from "../../types/session.types";

interface SessionViewProps {
  sessionId: string;
}

export function SessionView({ sessionId }: SessionViewProps) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale() as "en" | "he";

  const [showSolution, setShowSolution] = useState(false);
  const [xpAnimation, setXpAnimation] = useState<number | null>(null);

  const {
    session,
    isLoading,
    error,
    currentQuestion,
    currentIndex,
    totalQuestions,
    viewedCount,
    completedIndices,
    xpEarned,
    isCompleted,
    revealSolution,
    goToNext,
    goToPrevious,
    goToIndex,
    completeSession,
    isCompleting,
  } = useSession({
    sessionId,
    onXpAwarded: (xp) => {
      setXpAnimation(xp);
      setTimeout(() => setXpAnimation(null), 2000);
    },
    onComplete: () => {
      router.push(`/${locale}/session/${sessionId}/results`);
    },
  });

  // Handle solution reveal - NOW INSTANT
  const handleReveal = useCallback(() => {
    revealSolution(); // Instant - no await needed
    setShowSolution(true);
  }, [revealSolution]);

  // Handle navigation - NOW INSTANT (no await)
  const handleNext = useCallback(() => {
    setShowSolution(false);
    goToNext(); // Instant - no await needed
  }, [goToNext]);

  const handlePrevious = useCallback(() => {
    setShowSolution(false);
    goToPrevious(); // Instant - no await needed
  }, [goToPrevious]);

  const handleGoToIndex = useCallback(
    (index: number) => {
      setShowSolution(false);
      goToIndex(index); // Instant - no await needed
    },
    [goToIndex]
  );

  // Handle completion
  const handleComplete = useCallback(async () => {
    await completeSession();
  }, [completeSession]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Handle close/exit
  const handleClose = useCallback(() => {
    router.push(`/${locale}/dashboard`);
  }, [router, locale]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin">
          <Icon icon="tabler:loader-2" className="w-8 h-8 text-primary-500" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Icon icon="tabler:alert-circle" className="w-12 h-12 text-error-500" />
        <p className="text-gray-600 dark:text-gray-400">
          {t("session.errorLoading")}
        </p>
        <Button variant="primary" onClick={handleBack}>
          {t("common.goBack")}
        </Button>
      </div>
    );
  }

  // Completed state - redirect to results
  if (isCompleted) {
    router.push(`/${locale}/session/${sessionId}/results`);
    return null;
  }

  // Get source name
  const sourceName = locale === "he" && session.sourceNameHe
    ? session.sourceNameHe
    : session.sourceName;

  // Get mode config
  const modeConfig = MODE_CONFIG[session.mode];
  const modeLabel = locale === "he" ? modeConfig.label.he : modeConfig.label.en;

  // Current question data
  const questionContent = locale === "he" && currentQuestion?.contentHe
    ? currentQuestion.contentHe
    : currentQuestion?.content || "";

  const difficultyConfig = currentQuestion
    ? DIFFICULTY_CONFIG[currentQuestion.difficulty as SessionDifficulty]
    : null;
  const _difficultyLabel = difficultyConfig
    ? locale === "he" ? difficultyConfig.label.he : difficultyConfig.label.en
    : "";
  void _difficultyLabel; // Available for future use

  // Solution data
  const solutionSteps = currentQuestion?.solution?.steps || [];
  const solutionAnswer = currentQuestion?.solution?.answer || "";
  const solutionTip = currentQuestion?.solution?.tip;

  // Check if current question is viewed (using local state via completedIndices)
  const isCurrentViewed = completedIndices.includes(currentIndex);

  // Can show solution (already viewed or user clicked reveal)
  const canShowSolution = isCurrentViewed || showSolution;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Header */}
      <SessionHeader
        title={sourceName}
        subtitle={modeLabel}
        currentIndex={currentIndex}
        total={totalQuestions}
        completedIndices={completedIndices}
        xpEarned={xpEarned}
        onBack={handleBack}
        onClose={handleClose}
        onDotClick={handleGoToIndex}
      />

      {/* XP Animation */}
      {xpAnimation !== null && (
        <div className="fixed top-20 right-8 animate-bounce">
          <div className="bg-success-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
            +{xpAnimation} XP
          </div>
        </div>
      )}

      {/* Quick Navigation */}
      <SessionQuickNav
        total={totalQuestions}
        currentIndex={currentIndex}
        completedIndices={completedIndices}
        onNavigate={handleGoToIndex}
      />

      {/* Question Card */}
      {currentQuestion && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <SessionQuestion
              number={currentIndex + 1}
              total={totalQuestions}
              content={questionContent}
              difficulty={currentQuestion.difficulty as SessionDifficulty}
              xpReward={currentQuestion.xpReward}
              isCompleted={isCurrentViewed}
              locale={locale}
            />
          </CardContent>
        </Card>
      )}

      {/* Solution Section */}
      {canShowSolution ? (
        currentQuestion?.solution ? (
          <SessionSolution
            answer={solutionAnswer}
            steps={solutionSteps}
            tip={solutionTip}
            aiConfidence={currentQuestion.solution.aiConfidence}
            locale={locale}
            onHide={() => setShowSolution(false)}
          />
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Icon icon="tabler:file-unknown" className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t("session.noSolutionAvailable")}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSolution(false)}
                className="mt-4"
              >
                {t("session.hideSolution")}
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="flex justify-center">
          <SessionSolutionToggle
            isVisible={false}
            hasBeenViewed={isCurrentViewed}
            isLoading={false}
            onToggle={handleReveal}
            xpOnReveal={isCurrentViewed ? undefined : currentQuestion?.xpReward}
          />
        </div>
      )}

      {/* Navigation - instant, no loading state */}
      <SessionNavigation
        currentIndex={currentIndex}
        total={totalQuestions}
        isCurrentCompleted={isCurrentViewed}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onComplete={handleComplete}
        allCompleted={viewedCount >= totalQuestions}
        isCompleting={isCompleting}
        isLoading={false}
      />

      {/* Progress Summary */}
      <div className="text-center text-sm text-gray-500">
        {t("session.progressSummary", {
          viewed: viewedCount,
          total: totalQuestions,
          xp: xpEarned,
        })}
      </div>
    </div>
  );
}
