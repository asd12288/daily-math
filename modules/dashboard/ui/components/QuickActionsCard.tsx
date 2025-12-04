"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui";

const QUICK_ACTIONS = [
  {
    icon: "tabler:upload",
    href: "/homework",
    labelKey: "dashboard.uploadHomework",
    descriptionKey: "dashboard.uploadHomeworkDesc",
    color: "primary",
  },
  {
    icon: "tabler:pencil",
    href: "/practice",
    labelKey: "dashboard.startPractice",
    descriptionKey: "dashboard.startPracticeDesc",
    color: "success",
  },
  {
    icon: "tabler:book",
    href: "/courses",
    labelKey: "dashboard.browseTopics",
    descriptionKey: "dashboard.browseTopicsDesc",
    color: "secondary",
  },
  {
    icon: "tabler:settings",
    href: "/settings",
    labelKey: "nav.settings",
    descriptionKey: "dashboard.settingsDesc",
    color: "warning",
  },
];

const COLOR_CLASSES = {
  primary: {
    bg: "bg-primary-50 dark:bg-primary-900/20",
    icon: "text-primary-600 dark:text-primary-400",
    hover: "group-hover:text-primary-500",
  },
  success: {
    bg: "bg-success-50 dark:bg-success-900/20",
    icon: "text-success-600 dark:text-success-400",
    hover: "group-hover:text-success-500",
  },
  secondary: {
    bg: "bg-secondary-50 dark:bg-secondary-900/20",
    icon: "text-secondary-600 dark:text-secondary-400",
    hover: "group-hover:text-secondary-500",
  },
  warning: {
    bg: "bg-warning-50 dark:bg-warning-900/20",
    icon: "text-warning-600 dark:text-warning-400",
    hover: "group-hover:text-warning-500",
  },
};

export function QuickActionsCard() {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader bordered>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="tabler:bolt" height={20} className="text-warning-500" />
          {t("dashboard.quickActions")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {QUICK_ACTIONS.map((action) => {
            const colorClass = COLOR_CLASSES[action.color as keyof typeof COLOR_CLASSES];

            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className={`w-10 h-10 ${colorClass.bg} rounded-xl flex items-center justify-center`}>
                  <Icon icon={action.icon} height={20} className={colorClass.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {t(action.labelKey)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {t(action.descriptionKey)}
                  </p>
                </div>
                <Icon
                  icon="tabler:chevron-right"
                  height={18}
                  className={`text-gray-400 ${colorClass.hover} transition-colors`}
                />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
