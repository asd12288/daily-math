// modules/homework/ui/views/homework-detail-view.tsx
// Detail view for viewing homework questions and solutions

"use client";

import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent } from "@/shared/ui";
import { useHomeworkDetail, useViewQuestion } from "../../hooks";
import { QuestionGroupCard } from "../components/QuestionGroupCard";
import {
  STATUS_STYLES,
  XP_PER_QUESTION_VIEW,
} from "../../config/constants";
import { groupQuestionsByHierarchy } from "../../lib/utils";

interface HomeworkDetailViewProps {
  homeworkId: string;
}

export function HomeworkDetailView({ homeworkId }: HomeworkDetailViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const isHebrew = locale === "he";

  const { homework, isLoading, error, refetch } = useHomeworkDetail(homeworkId);
  const { viewQuestion, isLoading: isViewingQuestion } = useViewQuestion();

  // Track which question is currently generating
  const [generatingQuestionId, setGeneratingQuestionId] = useState<string | null>(null);

  // Get raw questions and group them - MUST be before any early returns (Rules of Hooks)
  const questions = homework?.questions || [];
  const questionGroups = useMemo(
    () => groupQuestionsByHierarchy(questions),
    [questions]
  );

  // Calculate progress (count all individual questions including sub-questions)
  const viewedCount = questions.filter((q) => q.isViewed).length;
  const totalQuestions = questions.length;
  const progressPercent =
    totalQuestions > 0 ? Math.round((viewedCount / totalQuestions) * 100) : 0;

  // Calculate XP stats
  const earnedXp = viewedCount * XP_PER_QUESTION_VIEW;
  const potentialXp = (totalQuestions - viewedCount) * XP_PER_QUESTION_VIEW;

  // Handle view solution (on-demand generation)
  const handleViewSolution = (questionId: string) => {
    setGeneratingQuestionId(questionId);
    viewQuestion(
      { questionId },
      {
        onSuccess: () => {
          setGeneratingQuestionId(null);
          // Refetch to update viewed status and get new solution
          refetch();
        },
        onError: () => {
          setGeneratingQuestionId(null);
        },
      }
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Icon
            icon="tabler:loader-2"
            height={40}
            className="mx-auto mb-4 text-primary-500 animate-spin"
          />
          <p className="text-gray-500 dark:text-gray-400">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !homework) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <Icon
              icon="tabler:alert-circle"
              height={40}
              className="mx-auto mb-4 text-error-500"
            />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("homework.notFound")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {error?.message || t("homework.notFoundDescription")}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/homework")}
              icon="tabler:arrow-left"
            >
              {t("homework.backToList")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get status config
  const statusConfig = STATUS_STYLES[homework.status];

  // Format date
  const formattedDate = new Date(homework.$createdAt).toLocaleDateString(
    isHebrew ? "he-IL" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/homework")}
        icon="tabler:arrow-left"
        className="mb-2"
      >
        {t("homework.backToList")}
      </Button>

      {/* Header card */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Left side - title and info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {homework.title || homework.originalFileName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                >
                  <Icon icon={statusConfig.icon} height={14} />
                  {isHebrew ? statusConfig.labelHe : statusConfig.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Icon icon="tabler:calendar" height={16} />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon icon="tabler:file" height={16} />
                  {homework.pageCount} {t("homework.pages")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon icon="tabler:list-numbers" height={16} />
                  {totalQuestions} {t("homework.questions")}
                </span>
              </div>
            </div>

            {/* Right side - stats */}
            <div className="flex items-center gap-6">
              {/* XP earned */}
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                  {earnedXp}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t("homework.xpEarned")}
                </div>
              </div>

              {/* Potential XP */}
              {potentialXp > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                    +{potentialXp}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t("homework.xpRemaining")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {totalQuestions > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("homework.progress")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {viewedCount}/{totalQuestions} ({progressPercent}%)
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPercent === 100
                      ? "bg-success-500"
                      : "bg-primary-500"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Original File Preview */}
      {homework.status === "completed" && (
        <Card>
          <CardContent>
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                {homework.fileType === "image" ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_USER_FILES_BUCKET || "user_images"}/files/${homework.fileId}/preview?width=200&project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                    alt={homework.originalFileName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-2">
                    <Icon icon="tabler:file-type-pdf" height={40} className="text-error-500 mb-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {homework.pageCount} {homework.pageCount === 1 ? t("homework.page") : t("homework.pages")}
                    </span>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  {t("homework.originalFile")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {homework.originalFileName}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {(homework.fileSize / 1024).toFixed(1)} KB
                </p>
                {/* View/Download button */}
                <div className="mt-3 flex gap-2">
                  <a
                    href={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/user_images/files/${homework.fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/30 dark:text-primary-400 rounded-lg transition-colors"
                  >
                    <Icon icon="tabler:external-link" height={16} />
                    {t("homework.viewFile")}
                  </a>
                  <a
                    href={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/user_images/files/${homework.fileId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                    download={homework.originalFileName}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    <Icon icon="tabler:download" height={16} />
                    {t("homework.downloadFile")}
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing state */}
      {homework.status === "processing" && (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <Icon
                icon="tabler:loader-2"
                height={40}
                className="mx-auto mb-4 text-primary-500 animate-spin"
              />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t("homework.processing")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("homework.processingDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed state */}
      {homework.status === "failed" && (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <Icon
                icon="tabler:alert-circle"
                height={40}
                className="mx-auto mb-4 text-error-500"
              />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t("homework.processingFailed")}
              </h3>
              <p className="text-sm text-error-600 dark:text-error-400 mb-4">
                {homework.errorMessage || t("homework.errors.processingFailed")}
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/homework")}
                icon="tabler:arrow-left"
              >
                {t("homework.backToList")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions list - grouped by hierarchy */}
      {homework.status === "completed" && questionGroups.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Icon icon="tabler:list-numbers" height={20} />
            {t("homework.questionsTitle")}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({questionGroups.length} {questionGroups.length === 1 ? t("homework.questionGroup") : t("homework.questionGroups")})
            </span>
          </h2>
          <div className="space-y-6">
            {questionGroups.map((group, index) => (
              <QuestionGroupCard
                key={group.parentQuestion.$id}
                group={group}
                groupNumber={index + 1}
                onViewSolution={handleViewSolution}
                isViewingSolution={isViewingQuestion}
                generatingQuestionId={generatingQuestionId}
              />
            ))}
          </div>
        </div>
      )}

      {/* All viewed celebration */}
      {progressPercent === 100 && totalQuestions > 0 && (
        <Card className="bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-900/10 border-success-200 dark:border-success-800">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success-200 dark:bg-success-900/40 flex items-center justify-center">
                <Icon
                  icon="tabler:trophy"
                  height={24}
                  className="text-success-600 dark:text-success-400"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-success-800 dark:text-success-300">
                  {t("homework.allComplete")}
                </h3>
                <p className="text-sm text-success-600 dark:text-success-400">
                  {t("homework.allCompleteMessage", { xp: earnedXp })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
