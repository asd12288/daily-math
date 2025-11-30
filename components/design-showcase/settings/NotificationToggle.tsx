"use client";

import { CardBox } from "@/shared/ui";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { mockNotificationSettings } from "../mock-data";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ enabled, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      disabled={disabled}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? "translate-x-6" : "translate-x-0"
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
  timeValue?: string;
  onTimeChange?: (time: string) => void;
}

function NotificationItem({
  icon,
  title,
  description,
  enabled,
  onChange,
  timeValue,
  onTimeChange,
}: NotificationItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
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
          <ToggleSwitch enabled={enabled} onChange={onChange} />
        </div>
        <p className="text-sm text-gray-500">{description}</p>
        {timeValue && enabled && (
          <div className="mt-3">
            <label className="text-xs text-gray-500 block mb-1">Time:</label>
            <input
              type="time"
              value={timeValue}
              onChange={(e) => onTimeChange?.(e.target.value)}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function NotificationToggle() {
  const [settings, setSettings] = useState(mockNotificationSettings);

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <CardBox>
      <h4 className="font-semibold mb-4">Notification Settings</h4>

      <div className="space-y-4">
        <NotificationItem
          icon="tabler:bell"
          title="Daily Reminder"
          description="Get reminded to complete your daily exercises"
          enabled={settings.dailyReminder}
          onChange={(v) => updateSetting("dailyReminder", v)}
          timeValue={settings.dailyReminderTime}
          onTimeChange={(v) => updateSetting("dailyReminderTime", v)}
        />

        <NotificationItem
          icon="tabler:flame"
          title="Streak Warning"
          description="Get notified before your streak is about to break"
          enabled={settings.streakWarning}
          onChange={(v) => updateSetting("streakWarning", v)}
          timeValue={settings.streakWarningTime}
          onTimeChange={(v) => updateSetting("streakWarningTime", v)}
        />

        <NotificationItem
          icon="tabler:chart-bar"
          title="Weekly Report"
          description="Receive a weekly summary of your progress"
          enabled={settings.weeklyReport}
          onChange={(v) => updateSetting("weeklyReport", v)}
        />

        <NotificationItem
          icon="tabler:mail"
          title="Email Notifications"
          description="Send notifications to your email address"
          enabled={settings.emailNotifications}
          onChange={(v) => updateSetting("emailNotifications", v)}
        />
      </div>
    </CardBox>
  );
}

// Language selector
export function LanguageSelector() {
  const [language, setLanguage] = useState<"en" | "he">("en");

  return (
    <CardBox>
      <h4 className="font-semibold mb-4">Language Settings</h4>
      <div className="flex gap-3">
        <button
          onClick={() => setLanguage("en")}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            language === "en"
              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="text-2xl mb-2">🇺🇸</div>
          <p className="font-medium">English</p>
          <p className="text-xs text-gray-500">Left-to-Right</p>
        </button>
        <button
          onClick={() => setLanguage("he")}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            language === "he"
              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="text-2xl mb-2">🇮🇱</div>
          <p className="font-medium">עברית</p>
          <p className="text-xs text-gray-500">Right-to-Left</p>
        </button>
      </div>
    </CardBox>
  );
}

// Showcase
export function NotificationToggleShowcase() {
  return (
    <div className="space-y-6 max-w-lg">
      <NotificationToggle />
      <LanguageSelector />
    </div>
  );
}
