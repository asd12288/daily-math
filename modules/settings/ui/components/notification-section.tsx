"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui";
import { useAutoSaveSetting } from "../../hooks";

interface NotificationSectionProps {
  emailReminders: boolean;
  streakWarnings: boolean;
  weeklyReport: boolean;
}

function ToggleSwitch({
  enabled,
  onChange,
  isPending,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  isPending?: boolean;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      disabled={isPending}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"
      } ${isPending ? "opacity-50" : ""}`}
    >
      <span
        className={`absolute top-1 start-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? "translate-x-6 rtl:-translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

interface NotificationItemProps {
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  isPending?: boolean;
  colorClass?: string;
}

function NotificationItem({
  icon,
  title,
  description,
  enabled,
  onChange,
  isPending,
  colorClass = "primary",
}: NotificationItemProps) {
  // Dynamic color classes based on colorClass prop and enabled state
  const _bgClass = enabled
    ? `bg-${colorClass}-100 dark:bg-${colorClass}-900/30`
    : "bg-gray-200 dark:bg-gray-700";
  const _textClass = enabled ? `text-${colorClass}-600` : "text-gray-400";

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
          enabled
            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600"
            : "bg-gray-200 dark:bg-gray-700 text-gray-400"
        }`}
      >
        <Icon icon={icon} className="text-xl" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h5 className="font-medium">{title}</h5>
          <ToggleSwitch enabled={enabled} onChange={onChange} isPending={isPending} />
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export function NotificationSection({
  emailReminders: initialEmail,
  streakWarnings: initialStreak,
  weeklyReport: initialWeekly,
}: NotificationSectionProps) {
  const t = useTranslations("settings");
  // Initialize state with callbacks to avoid stale props issues
  const [emailReminders, setEmailReminders] = useState(() => initialEmail);
  const [streakWarnings, setStreakWarnings] = useState(() => initialStreak);
  const [weeklyReport, setWeeklyReport] = useState(() => initialWeekly);
  const { save, isPending } = useAutoSaveSetting();

  const handleToggle = (field: "emailReminders" | "streakWarnings" | "weeklyReport", value: boolean) => {
    switch (field) {
      case "emailReminders":
        setEmailReminders(value);
        break;
      case "streakWarnings":
        setStreakWarnings(value);
        break;
      case "weeklyReport":
        setWeeklyReport(value);
        break;
    }
    save(field, value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
            <Icon icon="tabler:bell" className="text-xl text-secondary-600" />
          </div>
          <div>
            <CardTitle>{t("notifications.title")}</CardTitle>
            <p className="text-sm text-gray-500">{t("notifications.description")}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <NotificationItem
            icon="tabler:bell-ringing"
            title={t("notifications.dailyReminder")}
            description={t("notifications.dailyReminderDesc")}
            enabled={emailReminders}
            onChange={(v) => handleToggle("emailReminders", v)}
            isPending={isPending}
          />

          <NotificationItem
            icon="tabler:flame"
            title={t("notifications.streakWarning")}
            description={t("notifications.streakWarningDesc")}
            enabled={streakWarnings}
            onChange={(v) => handleToggle("streakWarnings", v)}
            isPending={isPending}
          />

          <NotificationItem
            icon="tabler:chart-bar"
            title={t("notifications.weeklyReport")}
            description={t("notifications.weeklyReportDesc")}
            enabled={weeklyReport}
            onChange={(v) => handleToggle("weeklyReport", v)}
            isPending={isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
