// modules/homework/ui/views/homework-detail-view.tsx
// Detail view for viewing homework questions and solutions

"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent } from "@/shared/ui";
import { useHomeworkDetail, useViewQuestion } from "../../hooks";
import { QuestionGroupCard } from "../components/QuestionGroupCard";
// Removed: STATUS_STYLES, XP_PER_QUESTION_VIEW (simplified UI)
import { groupQuestionsByHierarchy } from "../../lib/utils";

interface HomeworkDetailViewProps {
  homeworkId: string;
}

export function HomeworkDetailView({ homeworkId }: HomeworkDetailViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const { homework, isLoading, error, refetch } = useHomeworkDetail(homeworkId);
  const { viewQuestion, isLoading: isViewingQuestion } = useViewQuestion();

  // Track which question is currently generating
  const [generatingQuestionId, setGeneratingQuestionId] = useState<string | null>(null);

  // Get raw questions and group them - MUST be before any early returns (Rules of Hooks)
  const questions = useMemo(
    () => homework?.questions || [],
    [homework?.questions]
  );
  const questionGroups = useMemo(
    () => groupQuestionsByHierarchy(questions),
    [questions]
  );

  // Calculate progress
  const viewedCount = questions.filter((q) => q.isViewed).length;
  const totalQuestions = questions.length;
  const progressPercent =
    totalQuestions > 0 ? Math.round((viewedCount / totalQuestions) * 100) : 0;

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

  return (
    <div className="space-y-6">
      {/* Compact header */}
      <div className="flex items-center justify-between">
        {/* Back + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/homework")}
            className="p-2 -ms-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Icon icon="tabler:arrow-left" height={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {homework.title || homework.originalFileName}
          </h1>
          {progressPercent === 100 && (
            <Icon icon="tabler:circle-check-filled" height={20} className="text-success-500 flex-shrink-0" />
          )}
        </div>

        {/* Right side - progress + actions */}
        <div className="flex items-center gap-4">
          {/* Inline progress */}
          {totalQuestions > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {viewedCount}/{totalQuestions}
            </span>
          )}

          {/* View original file */}
          {homework.status === "completed" && (
            <a
              href={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/user_images/files/${homework.fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title={t("homework.viewFile")}
            >
              <Icon icon="tabler:file-text" height={20} />
            </a>
          )}

          {/* Start session button */}
          {totalQuestions > 0 && homework.status === "completed" && (
            <Link href={`/${locale}/session/start?source=homework&id=${homeworkId}`}>
              <Button variant="primary" size="sm">
                <Icon icon="tabler:player-play" height={16} className="me-1.5" />
                {t("session.start")}
              </Button>
            </Link>
          )}
        </div>
      </div>

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

      {/* Questions - no section header, straight to cards */}
      {homework.status === "completed" && questionGroups.length > 0 && (
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
      )}
    </div>
  );
}
