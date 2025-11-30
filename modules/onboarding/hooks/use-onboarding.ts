// modules/onboarding/hooks/use-onboarding.ts
// React hooks for onboarding flow

"use client";

import { useState, useCallback } from "react";
import { trpc } from "@/trpc/client";
import type { OnboardingStep, ExperienceLevel } from "../types";

/**
 * Main hook for onboarding state and navigation
 */
export function useOnboarding() {
  const utils = trpc.useUtils();

  const { data: state, isLoading } = trpc.onboarding.getState.useQuery();

  const updateStepMutation = trpc.onboarding.updateStep.useMutation({
    onSuccess: () => {
      utils.onboarding.getState.invalidate();
    },
  });

  const goToStep = useCallback(
    (step: OnboardingStep, experienceLevel?: ExperienceLevel) => {
      updateStepMutation.mutate({ step, experienceLevel });
    },
    [updateStepMutation]
  );

  return {
    state,
    isLoading,
    currentStep: state?.currentStep ?? "welcome",
    isCompleted: state?.isCompleted ?? false,
    goToStep,
    isUpdating: updateStepMutation.isPending,
  };
}

/**
 * Hook for checking if onboarding is needed
 */
export function useOnboardingCheck() {
  const { data, isLoading } = trpc.onboarding.isComplete.useQuery();

  return {
    needsOnboarding: !isLoading && !data?.isComplete,
    isLoading,
    isComplete: data?.isComplete ?? false,
  };
}

/**
 * Hook for the diagnostic test
 */
export function useDiagnosticTest() {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Use callback to avoid impure function call during render
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [answers, setAnswers] = useState<
    Array<{ questionId: string; isCorrect: boolean | null }>
  >([]);

  const { data: questions, isLoading: isLoadingQuestions } =
    trpc.onboarding.getDiagnosticQuestions.useQuery();

  const submitAnswerMutation = trpc.onboarding.submitDiagnosticAnswer.useMutation();
  const completeDiagnosticMutation = trpc.onboarding.completeDiagnostic.useMutation();

  const currentQuestion = questions?.[currentIndex] ?? null;
  const totalQuestions = questions?.length ?? 0;
  const isLastQuestion = currentIndex >= totalQuestions - 1;

  const submitAnswer = useCallback(
    async (userAnswer: string | null) => {
      if (!currentQuestion) return null;

      const timeSpent = Math.round((Date.now() - startTime) / 1000);

      const result = await submitAnswerMutation.mutateAsync({
        questionId: currentQuestion.id,
        userAnswer,
        timeSpentSeconds: timeSpent,
      });

      setAnswers((prev) => [
        ...prev,
        { questionId: currentQuestion.id, isCorrect: result.isCorrect },
      ]);

      return result;
    },
    [currentQuestion, startTime, submitAnswerMutation]
  );

  const nextQuestion = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
    setStartTime(Date.now());
  }, []);

  const completeTest = useCallback(async () => {
    const result = await completeDiagnosticMutation.mutateAsync();
    return result;
  }, [completeDiagnosticMutation]);

  return {
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    isLastQuestion,
    answers,
    isLoadingQuestions,
    isSubmitting: submitAnswerMutation.isPending,
    isCompleting: completeDiagnosticMutation.isPending,
    submitAnswer,
    nextQuestion,
    completeTest,
  };
}

/**
 * Hook for completing onboarding
 */
export function useCompleteOnboarding() {
  const utils = trpc.useUtils();

  const completeOnboardingMutation = trpc.onboarding.completeOnboarding.useMutation({
    onSuccess: () => {
      utils.onboarding.getState.invalidate();
      utils.onboarding.isComplete.invalidate();
    },
  });

  const complete = useCallback(
    (dailyGoal: number, reminderTime: string | null) => {
      return completeOnboardingMutation.mutateAsync({ dailyGoal, reminderTime });
    },
    [completeOnboardingMutation]
  );

  return {
    complete,
    isCompleting: completeOnboardingMutation.isPending,
    error: completeOnboardingMutation.error,
  };
}
