// modules/session/ui/views/session-start-view.tsx
// Session start page with filter selection

"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Icon } from "@iconify/react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { useCreateSession } from "../../hooks/use-create-session";
import { SESSION_LENGTHS, DIFFICULTY_CONFIG, MODE_CONFIG } from "../../config/constants";
import type { SessionSource, SessionMode, SessionDifficulty } from "../../types/session.types";

interface SessionStartViewProps {
  source: SessionSource;
  sourceId: string;
}

export function SessionStartView({ source, sourceId }: SessionStartViewProps) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale() as "en" | "he";

  const {
    sourceInfo,
    questionCounts,
    isLoadingInfo,
    filters,
    setDifficulty,
    setCount,
    mode,
    setMode,
    presets,
    applyPreset,
    createSession,
    isCreating,
    availableQuestionCount,
  } = useCreateSession({
    source,
    sourceId,
    onSuccess: (sessionId) => {
      router.push(`/${locale}/session/${sessionId}`);
    },
  });

  const handleStartSession = async () => {
    try {
      await createSession();
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  // Get source name based on locale
  const sourceName = locale === "he" && sourceInfo?.nameHe
    ? sourceInfo.nameHe
    : sourceInfo?.name || "...";

  // Available modes based on source
  const availableModes: SessionMode[] = source === "homework"
    ? ["review"]
    : ["learn", "practice"];

  if (isLoadingInfo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin">
          <Icon icon="tabler:loader-2" className="w-8 h-8 text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("session.startSession")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {sourceName}
        </p>
      </div>

      {/* Question Counts */}
      {questionCounts && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              {t("session.availableQuestions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Icon icon="tabler:files" className="w-5 h-5 text-gray-400" />
                <span className="text-2xl font-bold">{questionCounts.total}</span>
                <span className="text-gray-500">{t("session.total")}</span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-success-600">
                  {questionCounts.easy} {t("session.easy")}
                </span>
                <span className="text-warning-600">
                  {questionCounts.medium} {t("session.medium")}
                </span>
                <span className="text-error-600">
                  {questionCounts.hard} {t("session.hard")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle>{t("session.quickStart")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {presets.map((preset) => {
              const name = locale === "he" ? preset.nameHe : preset.name;
              const description = locale === "he" ? preset.descriptionHe : preset.description;
              const isSelected =
                filters.count === preset.filters.count &&
                filters.difficulty === preset.filters.difficulty;

              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`
                    p-4 rounded-xl border-2 text-start transition-all
                    ${isSelected
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon={preset.icon} className="w-5 h-5 text-primary-500" />
                    <span className="font-medium">{name}</span>
                  </div>
                  <p className="text-sm text-gray-500">{description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Mode */}
      {availableModes.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("session.mode")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {availableModes.map((m) => {
                const config = MODE_CONFIG[m];
                const label = locale === "he" ? config.label.he : config.label.en;
                const description = locale === "he" ? config.description.he : config.description.en;

                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`
                      flex-1 p-4 rounded-xl border-2 text-start transition-all
                      ${mode === m
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon icon={config.icon} className="w-5 h-5 text-primary-500" />
                      <span className="font-medium">{label}</span>
                    </div>
                    <p className="text-sm text-gray-500">{description}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customize Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("session.customize")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t("session.sessionLength")}
            </label>
            <div className="flex gap-3">
              {Object.entries(SESSION_LENGTHS).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setCount(value.count)}
                  className={`
                    flex-1 p-3 rounded-lg border-2 text-center transition-all
                    ${filters.count === value.count
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                    }
                  `}
                >
                  <div className="font-semibold">{value.count}</div>
                  <div className="text-xs text-gray-500">~{value.estimatedMinutes} min</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t("session.difficulty")}
            </label>
            <div className="flex gap-2">
              {/* All difficulties */}
              <button
                onClick={() => setDifficulty("all")}
                className={`
                  px-4 py-2 rounded-lg border-2 transition-all
                  ${filters.difficulty === "all"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                  }
                `}
              >
                {t("session.allDifficulties")}
              </button>
              {/* Individual difficulties */}
              {(["easy", "medium", "hard"] as SessionDifficulty[]).map((diff) => {
                const config = DIFFICULTY_CONFIG[diff];
                const label = locale === "he" ? config.label.he : config.label.en;

                return (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`
                      px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2
                      ${filters.difficulty === diff
                        ? `border-${config.color}-500 ${config.bgClass}`
                        : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                      }
                    `}
                  >
                    <Icon icon={config.icon} className={`w-4 h-4 ${config.textClass}`} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleStartSession}
          isLoading={isCreating}
          disabled={availableQuestionCount === 0}
        >
          <Icon icon="tabler:player-play" className="w-5 h-5 me-2" />
          {t("session.startSession")}
          {availableQuestionCount > 0 && (
            <span className="ms-2 text-sm opacity-80">
              ({Math.min(filters.count, availableQuestionCount)} {t("session.questions")})
            </span>
          )}
        </Button>

        {availableQuestionCount === 0 && (
          <p className="text-center text-sm text-error-600">
            {t("session.noQuestionsAvailable")}
          </p>
        )}

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.back()}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
}
