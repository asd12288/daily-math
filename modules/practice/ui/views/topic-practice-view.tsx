// modules/practice/ui/views/topic-practice-view.tsx
// Topic practice page view - Worksheet Mode with real database exercises

"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button, Card, CardContent } from "@/shared/ui";
import { WorksheetView, WorksheetResults } from "../components";
import { useStartTopicSession, usePracticeSession, useCompleteSession } from "../../hooks";
import { useGamification } from "@/modules/gamification/ui/context";
import type { WorksheetResults as WorksheetResultsType } from "../../lib/check-answers";

interface TopicPracticeViewProps {
  topicId: string;
}

type ViewMode = "loading" | "empty" | "worksheet" | "results";

export function TopicPracticeView({ topicId }: TopicPracticeViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>("loading");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [results, setResults] = useState<WorksheetResultsType | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  // Start a new session
  const { startSessionAsync, isStarting } = useStartTopicSession();

  // Get session data once we have a sessionId
  const { session, isLoading: isLoadingSession } = usePracticeSession(sessionId || undefined);

  // Complete session mutation for XP sync
  const { completeSessionAsync } = useCompleteSession();

  // Gamification toasts
  const { showXpToast, showLevelUp } = useGamification();

  // Start session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const newSession = await startSessionAsync({ topicId });
        if (newSession && newSession.problems.length > 0) {
          setSessionId(newSession.id);
          setViewMode("worksheet");
        } else {
          setViewMode("empty");
        }
      } catch (error) {
        console.error("Failed to start session:", error);
        setViewMode("empty");
      }
    };

    initSession();
  }, [topicId, startSessionAsync]);

  // Get topic name from session or fallback
  const topicName = session
    ? (locale === "he" ? session.topicNameHe : session.topicName)
    : topicId;

  // Handle worksheet submission
  const handleSubmit = async (
    worksheetResults: WorksheetResultsType,
    handworkImage: File | null
  ) => {
    setResults(worksheetResults);
    setUploadedImage(handworkImage);
    setViewMode("results");

    // Show XP toast IMMEDIATELY based on client-side results
    if (worksheetResults.totalXp > 0) {
      showXpToast(worksheetResults.totalXp, "earned");
    }

    // Check for perfect score and show bonus toast
    const totalAnswered = worksheetResults.correctCount + worksheetResults.incorrectCount;
    if (totalAnswered > 0 && worksheetResults.correctCount === totalAnswered) {
      showXpToast(15, "bonus", "Perfect score!");
    }

    // Sync XP to database in background (don't await for UI)
    if (sessionId) {
      completeSessionAsync({
        sessionId,
        results: {
          totalXp: worksheetResults.totalXp,
          correctCount: worksheetResults.correctCount,
          incorrectCount: worksheetResults.incorrectCount,
          skippedCount: worksheetResults.skippedCount,
          results: worksheetResults.results.map((r) => ({
            problemId: r.problemId,
            isCorrect: r.isCorrect,
            isSkipped: r.isSkipped,
            xpEarned: r.xpEarned,
          })),
        },
      })
        .then((completionResult) => {
          if (completionResult.success) {
            // Show streak bonus toast if applicable
            if (completionResult.streakBonus > 0) {
              showXpToast(
                completionResult.streakBonus,
                "streak",
                `${completionResult.newStreak}-day streak!`
              );
            }

            // Show level up celebration if leveled up
            if (completionResult.leveledUp) {
              showLevelUp(completionResult.newLevel, completionResult.newLevelTitle);
            }

            // Update results with actual total (including bonuses)
            setResults((prev) =>
              prev ? { ...prev, totalXp: completionResult.totalXp } : prev
            );
          }
        })
        .catch((error) => {
          console.error("Failed to complete session:", error);
        });
    }
  };

  // Handle practice again
  const handlePracticeAgain = async () => {
    setResults(null);
    setUploadedImage(null);
    setViewMode("loading");

    // Start a new session
    try {
      const newSession = await startSessionAsync({ topicId });
      if (newSession && newSession.problems.length > 0) {
        setSessionId(newSession.id);
        setViewMode("worksheet");
      } else {
        setViewMode("empty");
      }
    } catch (error) {
      console.error("Failed to start new session:", error);
      setViewMode("empty");
    }
  };

  // Handle back to course/skill tree
  const handleBackToCourse = () => {
    router.back();
  };

  // Loading state
  if (viewMode === "loading" || isStarting || isLoadingSession) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <Icon
              icon="tabler:loader-2"
              height={48}
              className="mx-auto text-primary-500 animate-spin mb-4"
            />
            <p className="text-gray-600 dark:text-gray-400">
              {locale === "he" ? "טוען שאלות..." : "Loading questions..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state - no exercises available
  if (viewMode === "empty") {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <Icon
              icon="tabler:book-off"
              height={64}
              className="mx-auto text-gray-400 mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {locale === "he" ? "אין שאלות זמינות" : "No Questions Available"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {locale === "he"
                ? "עדיין לא נוספו שאלות לנושא זה. השאלות יתווספו בקרוב!"
                : "No questions have been added for this topic yet. Questions will be added soon!"}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleBackToCourse}>
                <Icon icon="tabler:arrow-left" height={18} className="rtl:rotate-180" />
                {locale === "he" ? "חזרה" : "Go Back"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results view
  if (viewMode === "results" && results && session) {
    return (
      <div className="max-w-3xl mx-auto">
        <WorksheetResults
          results={results}
          problems={session.problems}
          onPracticeAgain={handlePracticeAgain}
          onBackToDashboard={handleBackToCourse}
        />
      </div>
    );
  }

  // Worksheet view
  if (session && session.problems.length > 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <WorksheetView
          title={`${t("practice.topicPractice")}: ${topicName}`}
          titleHe={`${t("practice.topicPractice")}: ${session.topicNameHe}`}
          subtitle={`${session.problems.length} Questions`}
          subtitleHe={`${session.problems.length} שאלות`}
          problems={session.problems}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  // Fallback to empty
  return null;
}
