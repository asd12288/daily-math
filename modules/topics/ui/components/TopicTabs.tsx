// modules/topics/ui/components/TopicTabs.tsx
// Tab navigation component for topic detail page

"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import type { TopicTab } from "../../types";

interface TopicTabsProps {
  activeTab: TopicTab;
  onTabChange: (tab: TopicTab) => void;
  formulaCount?: number;
  questionCount?: number;
}

const TABS: { id: TopicTab; icon: string; labelKey: string }[] = [
  { id: "learn", icon: "tabler:book", labelKey: "topics.tabs.learn" },
  { id: "formulas", icon: "tabler:math-function", labelKey: "topics.tabs.formulas" },
  { id: "practice", icon: "tabler:pencil", labelKey: "topics.tabs.practice" },
  { id: "videos", icon: "tabler:video", labelKey: "topics.tabs.videos" },
  { id: "stats", icon: "tabler:chart-bar", labelKey: "topics.tabs.stats" },
];

export function TopicTabs({
  activeTab,
  onTabChange,
  formulaCount,
  questionCount,
}: TopicTabsProps) {
  const t = useTranslations();

  const getBadgeCount = (tabId: TopicTab): number | undefined => {
    if (tabId === "formulas" && formulaCount) return formulaCount;
    if (tabId === "practice" && questionCount) return questionCount;
    return undefined;
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="flex gap-1 -mb-px overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const badge = getBadgeCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${
                  isActive
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300"
                }
              `}
            >
              <Icon icon={tab.icon} className="w-5 h-5" />
              <span>{t(tab.labelKey)}</span>
              {badge !== undefined && badge > 0 && (
                <span
                  className={`
                    px-2 py-0.5 text-xs rounded-full
                    ${
                      isActive
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800"
                    }
                  `}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
