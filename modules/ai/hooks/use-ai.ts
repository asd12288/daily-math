// modules/ai/hooks/use-ai.ts
// React hooks for AI services

"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import type { ImageAnalysisResponse, GeneratedQuestion } from "../types";

/**
 * Hook for getting Socratic hints
 */
export function useHint() {
  const [hints, setHints] = useState<string[]>([]);

  const hintMutation = trpc.ai.getHint.useMutation({
    onSuccess: (data) => {
      setHints((prev) => [...prev, data.hint]);
    },
  });

  const getHint = (params: {
    questionText: string;
    correctAnswer: string;
    userAttempt?: string;
    locale?: "en" | "he";
  }) => {
    hintMutation.mutate({
      ...params,
      previousHints: hints,
    });
  };

  const resetHints = () => {
    setHints([]);
  };

  return {
    hints,
    currentHint: hints[hints.length - 1] || null,
    hintCount: hints.length,
    getHint,
    resetHints,
    isLoading: hintMutation.isPending,
    error: hintMutation.error,
  };
}

/**
 * Hook for image analysis
 * Accepts imageData as URL or base64 data URL
 */
export function useImageAnalysis() {
  const [analysis, setAnalysis] = useState<ImageAnalysisResponse | null>(null);

  const analyzeMutation = trpc.ai.analyzeImage.useMutation({
    onSuccess: (data) => {
      setAnalysis(data);
    },
  });

  const validateMutation = trpc.ai.validateImage.useMutation();

  const analyzeImage = async (params: {
    imageData: string; // URL or base64 data URL
    questionText: string;
    correctAnswer: string;
    locale?: "en" | "he";
  }) => {
    // First validate the image
    const validation = await validateMutation.mutateAsync({
      imageData: params.imageData,
    });

    if (!validation.isReadable) {
      throw new Error(validation.suggestion || "Image is not readable");
    }

    // Then analyze
    return analyzeMutation.mutate(params);
  };

  const resetAnalysis = () => {
    setAnalysis(null);
  };

  return {
    analysis,
    analyzeImage,
    resetAnalysis,
    isAnalyzing: analyzeMutation.isPending || validateMutation.isPending,
    error: analyzeMutation.error || validateMutation.error,
  };
}

/**
 * Hook for generating questions
 */
export function useQuestionGeneration() {
  const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestion | null>(null);

  const generateMutation = trpc.ai.generateQuestion.useMutation({
    onSuccess: (data) => {
      setGeneratedQuestion(data);
    },
  });

  const generateQuestion = (params: {
    topicId: string;
    difficulty: "easy" | "medium" | "hard";
    questionType?: string;
    locale?: "en" | "he";
  }) => {
    generateMutation.mutate(params);
  };

  const resetQuestion = () => {
    setGeneratedQuestion(null);
  };

  return {
    question: generatedQuestion,
    generateQuestion,
    resetQuestion,
    isGenerating: generateMutation.isPending,
    error: generateMutation.error,
  };
}

/**
 * Hook for attempt analysis (partial credit)
 */
export function useAttemptAnalysis() {
  const analyzeMutation = trpc.ai.analyzeAttempt.useMutation();

  const analyzeAttempt = (params: {
    questionText: string;
    correctAnswer: string;
    userAttempt: string;
  }) => {
    return analyzeMutation.mutateAsync(params);
  };

  return {
    analyzeAttempt,
    isAnalyzing: analyzeMutation.isPending,
    result: analyzeMutation.data,
    error: analyzeMutation.error,
  };
}

/**
 * Hook for getting encouragement messages
 */
export function useEncouragement(questionText: string, locale: "en" | "he" = "en") {
  const { data, isLoading } = trpc.ai.getEncouragement.useQuery(
    { questionText, locale },
    { enabled: !!questionText }
  );

  return {
    message: data?.message || null,
    isLoading,
  };
}
