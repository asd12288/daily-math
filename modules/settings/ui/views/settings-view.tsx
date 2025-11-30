"use client";

import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useUserSettings } from "../../hooks";
import {
  ProfileSection,
  PracticeSection,
  NotificationSection,
  LanguageSection,
  ComingSoonSection,
} from "../components";

export function SettingsView() {
  const t = useTranslations("settings");
  const { data: settings, isLoading, error } = useUserSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Icon
            icon="tabler:loader-2"
            className="text-4xl text-primary-500 animate-spin"
          />
          <p className="text-gray-500">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <Icon
            icon="tabler:alert-circle"
            className="text-4xl text-error-500"
          />
          <p className="text-gray-700 dark:text-gray-300">{t("error")}</p>
          <p className="text-sm text-gray-500">
            {error?.message || t("errorDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Icon icon="tabler:settings" className="text-white" height={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-gray-500">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile */}
        <ProfileSection
          displayName={settings.displayName}
          email={settings.email}
          avatarUrl={settings.avatarUrl}
        />

        {/* Practice Preferences */}
        <PracticeSection
          dailyExerciseCount={settings.dailyExerciseCount}
          preferredTime={settings.preferredTime}
        />

        {/* Notifications */}
        <NotificationSection
          emailReminders={settings.emailReminders}
          streakWarnings={settings.streakWarnings}
          weeklyReport={settings.weeklyReport}
        />

        {/* Language & Appearance */}
        <LanguageSection />

        {/* Coming Soon */}
        <ComingSoonSection />
      </div>
    </div>
  );
}
