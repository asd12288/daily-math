// modules/topics/ui/views/topic-detail-view.tsx
// Main view for topic detail page

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { useTopicDetail, useTopicFormulas } from "../../hooks";
import {
  TopicHeader,
  TopicTabs,
  LearnTab,
  FormulasTab,
  PracticeTab,
  VideosTab,
  StatsTab,
} from "../components";
import type { TopicTab, TopicUserStats } from "../../types";

interface TopicDetailViewProps {
  topicId: string;
  courseId: string;
}

export function TopicDetailView({ topicId, courseId }: TopicDetailViewProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<TopicTab>("learn");

  const { data: topic, isLoading, error } = useTopicDetail(topicId);
  const { data: formulas } = useTopicFormulas(topicId);

  // Placeholder stats - in a real app, fetch from user_topic_stats
  const mockStats = null as TopicUserStats | null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon
            icon="tabler:loader-2"
            className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4"
          />
          <p className="text-gray-500">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon
            icon="tabler:alert-circle"
            className="w-12 h-12 text-error-500 mx-auto mb-4"
          />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("errors.topicNotFound")}
          </h3>
          <p className="text-gray-500">{t("errors.topicNotFoundDesc")}</p>
        </div>
      </div>
    );
  }

  // Calculate mastery (mock for now)
  const mastery = mockStats?.mastery ?? 0;

  const renderTabContent = () => {
    switch (activeTab) {
      case "learn":
        return <LearnTab topic={topic} courseId={courseId} />;
      case "formulas":
        return <FormulasTab topicId={topicId} />;
      case "practice":
        return <PracticeTab topic={topic} courseId={courseId} />;
      case "videos":
        return <VideosTab topicId={topicId} />;
      case "stats":
        return <StatsTab topicId={topicId} stats={mockStats} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-full lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header with topic info and mastery */}
      <TopicHeader topic={topic} courseId={courseId} mastery={mastery} />

      {/* Tab navigation */}
      <TopicTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        formulaCount={formulas?.length}
        questionCount={0} // Will be updated when question bank is implemented
      />

      {/* Tab content */}
      <div className="mt-6">{renderTabContent()}</div>
    </div>
  );
}
