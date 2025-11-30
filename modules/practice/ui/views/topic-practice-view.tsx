// modules/practice/ui/views/topic-practice-view.tsx
// Topic practice page view - Worksheet Mode

"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { WorksheetView, WorksheetResults } from "../components";
import { PRE_ALGEBRA_QUESTIONS } from "../../config/static-questions";
import type { WorksheetResults as WorksheetResultsType } from "../../lib/check-answers";

// Topic name mapping (MVP - static)
const TOPIC_NAMES: Record<string, { en: string; he: string }> = {
  "linear-equations": { en: "Linear Equations", he: "משוואות ליניאריות" },
  "fractions": { en: "Fractions", he: "שברים" },
  "order-of-operations": { en: "Order of Operations", he: "סדר פעולות חשבון" },
  "negative-numbers": { en: "Negative Numbers", he: "מספרים שליליים" },
  "word-problems": { en: "Word Problems", he: "בעיות מילוליות" },
  "pre-algebra": { en: "Pre-Algebra", he: "אלגברה בסיסית" },
  "algebra-basics": { en: "Algebra Basics", he: "יסודות אלגברה" },
};

interface TopicPracticeViewProps {
  topicId: string;
}

type ViewMode = "worksheet" | "results";

export function TopicPracticeView({ topicId }: TopicPracticeViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>("worksheet");
  const [results, setResults] = useState<WorksheetResultsType | null>(null);
  // uploadedImage state tracked for future use (image upload to storage)
  const [_uploadedImage, setUploadedImage] = useState<File | null>(null);

  // Get topic name
  const topicNames = TOPIC_NAMES[topicId] || TOPIC_NAMES["pre-algebra"];
  const topicName = locale === "he" ? topicNames.he : topicNames.en;

  // Handle worksheet submission
  const handleSubmit = (
    worksheetResults: WorksheetResultsType,
    handworkImage: File | null
  ) => {
    // Store results and image
    setResults(worksheetResults);
    setUploadedImage(handworkImage);

    // Switch to results view
    setViewMode("results");

    // Log for debugging (in MVP, we don't persist to DB)
    console.log("Topic practice submitted:", {
      topicId,
      results: worksheetResults,
      hasImage: !!handworkImage,
      imageName: handworkImage?.name,
    });
  };

  // Handle practice again
  const handlePracticeAgain = () => {
    setResults(null);
    setUploadedImage(null);
    setViewMode("worksheet");
  };

  // Handle back to course/skill tree
  const handleBackToCourse = () => {
    router.back();
  };

  // Render based on view mode
  if (viewMode === "results" && results) {
    return (
      <div className="max-w-3xl mx-auto">
        <WorksheetResults
          results={results}
          problems={PRE_ALGEBRA_QUESTIONS}
          onPracticeAgain={handlePracticeAgain}
          onBackToDashboard={handleBackToCourse}
        />
      </div>
    );
  }

  // Default: Worksheet view
  return (
    <div className="max-w-3xl mx-auto">
      <WorksheetView
        title={`${t("practice.topicPractice")}: ${topicName}`}
        titleHe={`${t("practice.topicPractice")}: ${topicNames.he}`}
        subtitle="5 Questions"
        subtitleHe="5 שאלות"
        problems={PRE_ALGEBRA_QUESTIONS}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
