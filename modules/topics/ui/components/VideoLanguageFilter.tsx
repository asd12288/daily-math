// modules/topics/ui/components/VideoLanguageFilter.tsx
// Language filter tabs for videos

"use client";

import { useTranslations } from "next-intl";
import type { VideoLanguage } from "@/lib/appwrite/types";

interface VideoLanguageFilterProps {
  selectedLanguage: "all" | VideoLanguage;
  onLanguageChange: (language: "all" | VideoLanguage) => void;
  counts: {
    all: number;
    en: number;
    he: number;
    other: number;
  };
}

/**
 * Tab-style language filter for videos
 */
export function VideoLanguageFilter({
  selectedLanguage,
  onLanguageChange,
  counts,
}: VideoLanguageFilterProps) {
  const t = useTranslations("topics.videos");

  const tabs: { key: "all" | VideoLanguage; label: string; count: number }[] = [
    { key: "all", label: t("filterAll"), count: counts.all },
    { key: "en", label: t("filterEnglish"), count: counts.en },
    { key: "he", label: t("filterHebrew"), count: counts.he },
  ];

  // Only show "Other" tab if there are videos in that category
  if (counts.other > 0) {
    tabs.push({ key: "other", label: t("filterOther"), count: counts.other });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isSelected = selectedLanguage === tab.key;
        const hasVideos = tab.count > 0;

        return (
          <button
            key={tab.key}
            onClick={() => onLanguageChange(tab.key)}
            disabled={!hasVideos && tab.key !== "all"}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${isSelected
                ? "bg-primary-600 text-white shadow-md"
                : hasVideos
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              }
            `}
          >
            <span>{tab.label}</span>
            {hasVideos && (
              <span
                className={`
                  inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs
                  ${isSelected
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }
                `}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
