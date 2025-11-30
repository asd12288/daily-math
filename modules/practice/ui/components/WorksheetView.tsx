// modules/practice/ui/components/WorksheetView.tsx
// Main worksheet container showing all questions at once

"use client";

import React, { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, Button } from "@/shared/ui";
import { WorksheetQuestion } from "./WorksheetQuestion";
import type { Problem } from "../../types";
import type { WorksheetResults } from "../../lib/check-answers";
import { checkAllAnswers } from "../../lib/check-answers";

interface WorksheetViewProps {
  title: string;
  titleHe: string;
  subtitle?: string;
  subtitleHe?: string;
  problems: Problem[];
  streakDays?: number;
  onSubmit: (results: WorksheetResults, handworkImage: File | null) => void;
}

export function WorksheetView({
  title,
  titleHe,
  subtitle,
  subtitleHe,
  problems,
  streakDays,
  onSubmit,
}: WorksheetViewProps) {
  const t = useTranslations();
  const locale = useLocale();

  // State for all answers
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [handworkImage, setHandworkImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayTitle = locale === "he" ? titleHe : title;
  const displaySubtitle = locale === "he" ? subtitleHe : subtitle;

  // Count answered questions
  const answeredCount = Object.values(answers).filter((a) => a.trim()).length;
  const skippedCount = skipped.size;
  const progressCount = answeredCount + skippedCount;

  // Handle answer change for a specific question
  const handleAnswerChange = useCallback((problemId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [problemId]: value }));
    // If user types an answer, unmark as skipped
    if (value.trim()) {
      setSkipped((prev) => {
        const next = new Set(prev);
        next.delete(problemId);
        return next;
      });
    }
  }, []);

  // Handle skip toggle
  const handleSkipToggle = useCallback((problemId: string) => {
    setSkipped((prev) => {
      const next = new Set(prev);
      if (next.has(problemId)) {
        next.delete(problemId);
      } else {
        next.add(problemId);
        // Clear answer when skipping
        setAnswers((prevAnswers) => ({ ...prevAnswers, [problemId]: "" }));
      }
      return next;
    });
  }, []);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHandworkImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setHandworkImage(null);
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = () => {
    setIsSubmitting(true);

    // Check all answers client-side
    const results = checkAllAnswers(answers, skipped, problems);

    // Call parent handler with results
    onSubmit(results, handworkImage);
  };

  // Check if can submit (at least some interaction)
  const canSubmit = progressCount > 0 || handworkImage !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 border-0">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {displayTitle}
              </h1>
              {displaySubtitle && (
                <p className="text-primary-100">{displaySubtitle}</p>
              )}
            </div>
            {streakDays !== undefined && streakDays > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl">
                <Icon icon="tabler:flame" height={24} className="text-orange-300" />
                <span className="text-white font-bold">{streakDays}</span>
                <span className="text-primary-100 text-sm">
                  {t("practice.days")}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Icon icon="tabler:info-circle" height={18} />
        <span>{t("practice.worksheetInstructions")}</span>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {problems.map((problem, index) => (
          <WorksheetQuestion
            key={problem.id}
            problem={problem}
            index={index}
            answer={answers[problem.id] || ""}
            isSkipped={skipped.has(problem.id)}
            onAnswerChange={(value) => handleAnswerChange(problem.id, value)}
            onSkipToggle={() => handleSkipToggle(problem.id)}
          />
        ))}
      </div>

      {/* Optional Image Upload */}
      <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
        <CardContent className="py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <span className="text-sm font-medium px-2">
                {t("practice.optional")}
              </span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>

            {!imagePreview ? (
              <>
                <Icon
                  icon="tabler:camera-plus"
                  height={48}
                  className="mx-auto text-gray-400 dark:text-gray-600 mb-3"
                />
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                  {t("practice.uploadHandwork")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t("practice.uploadHandworkDesc")}
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Icon icon="tabler:upload" height={18} />
                  <span>{t("practice.chooseFile")}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </>
            ) : (
              <div className="space-y-3">
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Dynamic user-uploaded image with data URL */}
                  <img
                    src={imagePreview}
                    alt="Uploaded handwork"
                    className="max-w-full max-h-64 rounded-lg shadow-md"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-error-500 text-white rounded-full flex items-center justify-center hover:bg-error-600 transition-colors shadow-md"
                  >
                    <Icon icon="tabler:x" height={16} />
                  </button>
                </div>
                <p className="text-sm text-success-600 dark:text-success-400 flex items-center justify-center gap-1">
                  <Icon icon="tabler:check" height={16} />
                  {handworkImage?.name}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress & Submit */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("practice.progress")}:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {answeredCount}/{problems.length}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t("practice.answered")}
                </span>
              </div>
              {skippedCount > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({skippedCount} {t("practice.skipped").toLowerCase()})
                </span>
              )}
            </div>

            {/* Submit button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              isLoading={isSubmitting}
              icon="tabler:check"
              className="w-full sm:w-auto"
            >
              {t("practice.submitAll")}
            </Button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${(progressCount / problems.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
