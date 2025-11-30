// modules/onboarding/ui/components/PreferencesStep.tsx
// Final preferences selection before completing onboarding

"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Button, Card, CardContent } from "@/shared/ui";

interface PreferencesStepProps {
  onComplete: (dailyGoal: number, reminderTime: string | null) => void;
  isLoading: boolean;
}

export function PreferencesStep({ onComplete, isLoading }: PreferencesStepProps) {
  const t = useTranslations();
  const [dailyGoal, setDailyGoal] = useState(5);
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");

  const handleComplete = () => {
    onComplete(dailyGoal, enableReminder ? reminderTime : null);
  };

  return (
    <div className="max-w-xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4">
          <Icon
            icon="tabler:settings-check"
            height={32}
            className="text-success-600 dark:text-success-400"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("onboarding.preferences.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t("onboarding.preferences.subtitle")}
        </p>
      </div>

      {/* Daily goal */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {t("onboarding.preferences.dailyGoal")}
          </h3>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                {t("onboarding.preferences.problemsPerDay")}
              </span>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {dailyGoal}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Icon
              icon="tabler:clock"
              height={20}
              className="text-gray-400"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("onboarding.preferences.estimatedTime", {
                minutes: dailyGoal * 3,
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Reminder settings */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t("onboarding.preferences.reminder")}
            </h3>
            <button
              type="button"
              role="switch"
              aria-checked={enableReminder}
              onClick={() => setEnableReminder(!enableReminder)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                enableReminder
                  ? "bg-primary-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  enableReminder ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {enableReminder && (
            <div className="flex items-center gap-3">
              <Icon
                icon="tabler:bell"
                height={20}
                className="text-gray-400"
              />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">
                {t("onboarding.preferences.reminderNote")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete button */}
      <div className="text-center">
        <Button
          variant="success"
          size="lg"
          onClick={handleComplete}
          isLoading={isLoading}
        >
          <Icon icon="tabler:check" className="me-2" />
          {t("onboarding.preferences.startLearning")}
        </Button>
      </div>
    </div>
  );
}
