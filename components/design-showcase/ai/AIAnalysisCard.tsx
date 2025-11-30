"use client";

import { CardBox } from "@/shared/ui";
import { Icon } from "@iconify/react";
import { mockAIAnalysis } from "@/lib/mock-data";

interface AIAnalysisCardProps {
  analysis?: typeof mockAIAnalysis;
  isLoading?: boolean;
}

export function AIAnalysisCard({ analysis = mockAIAnalysis, isLoading = false }: AIAnalysisCardProps) {
  if (isLoading) {
    return (
      <CardBox className="border-2 border-primary-200 dark:border-primary-800">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Icon icon="tabler:brain" className="text-2xl text-primary-600 animate-pulse" />
          </div>
          <div>
            <p className="font-medium">Analyzing your solution...</p>
            <p className="text-sm text-gray-500">AI is checking your handwork</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
        </div>
      </CardBox>
    );
  }

  const confidencePercent = Math.round(analysis.confidence * 100);

  return (
    <CardBox
      className={`border-2 ${
        analysis.isCorrect
          ? "border-success-200 dark:border-success-800 bg-success-50/50 dark:bg-success-900/10"
          : "border-error-200 dark:border-error-800 bg-error-50/50 dark:bg-error-900/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`h-14 w-14 rounded-full flex items-center justify-center ${
            analysis.isCorrect
              ? "bg-success-100 dark:bg-success-900/30"
              : "bg-error-100 dark:bg-error-900/30"
          }`}
        >
          <Icon
            icon={analysis.isCorrect ? "tabler:circle-check" : "tabler:circle-x"}
            className={`text-3xl ${analysis.isCorrect ? "text-success-600" : "text-error-600"}`}
          />
        </div>
        <div className="flex-1">
          <h4
            className={`text-lg font-semibold ${
              analysis.isCorrect
                ? "text-success-800 dark:text-success-200"
                : "text-error-800 dark:text-error-200"
            }`}
          >
            {analysis.isCorrect ? "Correct!" : "Not Quite Right"}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{analysis.feedback}</p>
        </div>
        <div className="text-end">
          <p className="text-2xl font-bold text-primary-600">+{analysis.xpEarned} XP</p>
          <p className="text-xs text-gray-500">{confidencePercent}% confidence</p>
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="space-y-3 mb-4">
        <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300">Step-by-step analysis:</h5>
        {analysis.detailedFeedback.map((item) => (
          <div
            key={item.step}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50"
          >
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                item.status === "correct"
                  ? "bg-success-100 text-success-600"
                  : "bg-error-100 text-error-600"
              }`}
            >
              <Icon
                icon={item.status === "correct" ? "tabler:check" : "tabler:x"}
                className="text-sm"
              />
            </div>
            <div>
              <p className="text-sm font-medium">Step {item.step}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.comment}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
            <Icon icon="tabler:bulb" className="inline me-1 text-warning-500" />
            Suggestions:
          </h5>
          <ul className="space-y-1">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <Icon icon="tabler:point" className="text-gray-400 mt-1 shrink-0" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardBox>
  );
}

// Showcase
export function AIAnalysisCardShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Loading State</p>
        <AIAnalysisCard isLoading />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Correct Answer</p>
        <AIAnalysisCard />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Incorrect Answer</p>
        <AIAnalysisCard
          analysis={{
            ...mockAIAnalysis,
            isCorrect: false,
            feedback: "There's a small error in your calculation. Review step 2.",
            xpEarned: 5,
            detailedFeedback: [
              { step: 1, status: "correct", comment: "Correctly identified the approach" },
              { step: 2, status: "incorrect", comment: "Sign error in differentiation" },
              { step: 3, status: "incorrect", comment: "Final answer affected by step 2 error" },
            ],
          }}
        />
      </div>
    </div>
  );
}
