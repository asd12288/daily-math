// modules/session/ui/views/session-results-view.tsx
// Session completion summary page

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Icon } from "@iconify/react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { trpc } from "@/trpc/client";

interface SessionResultsViewProps {
  sessionId: string;
}

export function SessionResultsView({ sessionId }: SessionResultsViewProps) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale() as "en" | "he";

  // Fetch session data
  const { data: session, isLoading } = trpc.session.getById.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );

  // Format time spent
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate time spent (memoized to avoid Date.now call during render)
  const timeSpentSeconds = useMemo(() => {
    if (!session) return 0;
    const completedTime = session.completedAt
      ? new Date(session.completedAt).getTime()
      : new Date(session.startedAt).getTime(); // Use start time if not completed
    return Math.round(
      (completedTime - new Date(session.startedAt).getTime()) / 1000
    );
  }, [session]);

  // Navigation handlers
  const handleBackToDashboard = () => {
    router.push(`/${locale}/dashboard`);
  };

  const handleStartNewSession = () => {
    if (session) {
      router.push(
        `/${locale}/session/start?source=${session.source}&id=${session.sourceId}`
      );
    }
  };

  const handleViewSource = () => {
    if (session) {
      if (session.source === "topic") {
        router.push(`/${locale}/topics/${session.sourceId}`);
      } else if (session.source === "homework") {
        router.push(`/${locale}/homework/${session.sourceId}`);
      }
    }
  };

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
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Icon icon="tabler:alert-circle" className="w-12 h-12 text-error-500" />
        <p className="text-gray-600 dark:text-gray-400">
          {t("session.errorLoading")}
        </p>
        <Button variant="primary" onClick={handleBackToDashboard}>
          {t("common.backToDashboard")}
        </Button>
      </div>
    );
  }

  // Source name
  const sourceName =
    locale === "he" && session.sourceNameHe
      ? session.sourceNameHe
      : session.sourceName;

  // Calculate completion percentage
  const completionPercent = Math.round(
    (session.viewedCount / session.totalQuestions) * 100
  );

  // Determine celebration level based on performance
  const isFullCompletion = session.viewedCount === session.totalQuestions;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Celebration Header */}
      <div className="text-center space-y-4 py-8">
        {isFullCompletion ? (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/30">
              <Icon
                icon="tabler:trophy"
                className="w-10 h-10 text-success-500"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("session.congratulations")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("session.completedAll")}
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30">
              <Icon
                icon="tabler:check-circle"
                className="w-10 h-10 text-primary-500"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("session.sessionComplete")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("session.goodProgress")}
            </p>
          </>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* XP Earned */}
        <Card className="bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800">
          <CardContent className="p-4 text-center">
            <Icon
              icon="tabler:star-filled"
              className="w-8 h-8 text-success-500 mx-auto mb-2"
            />
            <div className="text-3xl font-bold text-success-700 dark:text-success-400">
              +{session.xpEarned}
            </div>
            <div className="text-sm text-success-600 dark:text-success-500">
              {t("session.xpEarned")}
            </div>
          </CardContent>
        </Card>

        {/* Questions Viewed */}
        <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
          <CardContent className="p-4 text-center">
            <Icon
              icon="tabler:check-list"
              className="w-8 h-8 text-primary-500 mx-auto mb-2"
            />
            <div className="text-3xl font-bold text-primary-700 dark:text-primary-400">
              {session.viewedCount}/{session.totalQuestions}
            </div>
            <div className="text-sm text-primary-600 dark:text-primary-500">
              {t("session.questionsViewed")}
            </div>
          </CardContent>
        </Card>

        {/* Time Spent */}
        <Card>
          <CardContent className="p-4 text-center">
            <Icon
              icon="tabler:clock"
              className="w-8 h-8 text-gray-400 mx-auto mb-2"
            />
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {formatTime(timeSpentSeconds)}
            </div>
            <div className="text-sm text-gray-500">
              {t("session.timeSpent")}
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardContent className="p-4 text-center">
            <Icon
              icon="tabler:percentage"
              className="w-8 h-8 text-gray-400 mx-auto mb-2"
            />
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {completionPercent}%
            </div>
            <div className="text-sm text-gray-500">
              {t("session.completionRate")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t("session.sessionDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t("session.source")}</span>
            <span className="font-medium">{sourceName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t("session.mode")}</span>
            <span className="font-medium capitalize">{session.mode}</span>
          </div>
          {session.filters.difficulty && session.filters.difficulty !== "all" && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t("session.difficulty")}</span>
              <span className="font-medium capitalize">
                {session.filters.difficulty}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleStartNewSession}
        >
          <Icon icon="tabler:refresh" className="w-5 h-5 me-2" />
          {t("session.startAnotherSession")}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleViewSource}
        >
          <Icon icon="tabler:arrow-back" className="w-5 h-5 me-2" />
          {session.source === "topic"
            ? t("session.backToTopic")
            : t("session.backToHomework")}
        </Button>

        <Button
          variant="ghost"
          className="w-full"
          onClick={handleBackToDashboard}
        >
          {t("common.backToDashboard")}
        </Button>
      </div>
    </div>
  );
}
