// modules/courses/ui/components/CourseSettingsModal.tsx
// Modal for configuring course-specific settings

"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Icon } from "@iconify/react";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui";
import type { CourseSettings } from "../../types";
import { DEFAULT_COURSE_SETTINGS } from "../../types";
import { useUnenrollCourse } from "../../hooks";

interface CourseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  courseColor?: string;
  courseIcon?: string;
  currentSettings?: CourseSettings;
  onSave?: (settings: Partial<CourseSettings>) => void;
  showUnenroll?: boolean;
}

export function CourseSettingsModal({
  isOpen,
  onClose,
  courseId,
  courseName,
  courseColor = "#3B82F6",
  courseIcon = "tabler:book",
  currentSettings,
  onSave,
  showUnenroll = true,
}: CourseSettingsModalProps) {
  const t = useTranslations();
  useLocale(); // For potential RTL handling
  const { unenroll, isUnenrolling } = useUnenrollCourse();

  // Local state for form values
  const [dailyQuestionCount, setDailyQuestionCount] = useState(
    currentSettings?.dailyQuestionCount ?? DEFAULT_COURSE_SETTINGS.dailyQuestionCount
  );
  const [difficulty, setDifficulty] = useState(
    currentSettings?.difficulty ?? DEFAULT_COURSE_SETTINGS.difficulty
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    currentSettings?.notificationsEnabled ?? DEFAULT_COURSE_SETTINGS.notificationsEnabled
  );
  const [showConfirmUnenroll, setShowConfirmUnenroll] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave({
        courseId,
        dailyQuestionCount,
        difficulty,
        notificationsEnabled,
      });
    }
    onClose();
  };

  const handleUnenroll = async () => {
    try {
      await unenroll({ courseId });
      setShowConfirmUnenroll(false);
      onClose();
    } catch (error) {
      console.error("Failed to unenroll:", error);
    }
  };

  // Reset confirm state when modal closes
  const handleClose = () => {
    setShowConfirmUnenroll(false);
    onClose();
  };

  const difficultyOptions = [
    { value: "adaptive", label: t("courses.settings.adaptive"), icon: "tabler:chart-arrows" },
    { value: "easy", label: t("difficulty.easy"), icon: "tabler:leaf" },
    { value: "medium", label: t("difficulty.medium"), icon: "tabler:flame" },
    { value: "hard", label: t("difficulty.hard"), icon: "tabler:meteor" },
  ] as const;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("courses.settings.title")}
      size="md"
    >
      <div className="space-y-6">
        {/* Course header with icon */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${courseColor}20` }}
          >
            <Icon
              icon={courseIcon}
              height={20}
              style={{ color: courseColor }}
            />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{courseName}</span>
        </div>

        {/* Daily Question Count */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("courses.settings.dailyQuestions")}
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={10}
              value={dailyQuestionCount}
              onChange={(e) => setDailyQuestionCount(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-500"
            />
            <div className="w-12 h-10 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg font-bold text-lg">
              {dailyQuestionCount}
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("courses.settings.dailyQuestionsDesc", { count: dailyQuestionCount })}
          </p>
        </div>

        {/* Difficulty Level */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("courses.settings.difficultyLevel")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDifficulty(option.value)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
                  ${difficulty === option.value
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }
                `}
              >
                <Icon
                  icon={option.icon}
                  height={18}
                  className={difficulty === option.value ? "text-primary-500" : "text-gray-400"}
                />
                <span className={`text-sm font-medium ${
                  difficulty === option.value
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("courses.settings.adaptiveDesc")}
          </p>
        </div>

        {/* Notifications Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Icon
              icon="tabler:bell"
              height={20}
              className="text-gray-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("courses.settings.dailyReminders")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("courses.settings.dailyRemindersDesc")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`
              relative w-11 h-6 rounded-full transition-colors
              ${notificationsEnabled ? "bg-primary-500" : "bg-gray-300 dark:bg-gray-600"}
            `}
          >
            <span
              className={`
                absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform
                ${notificationsEnabled ? "translate-x-6" : "translate-x-1"}
              `}
            />
          </button>
        </div>

        {/* Coming Soon Badge */}
        <div className="flex items-center gap-2 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
          <Icon
            icon="tabler:sparkles"
            height={18}
            className="text-warning-500"
          />
          <p className="text-sm text-warning-700 dark:text-warning-400">
            {t("courses.settings.moreSettings")}
          </p>
        </div>

        {/* Unenroll Section */}
        {showUnenroll && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            {!showConfirmUnenroll ? (
              <button
                type="button"
                onClick={() => setShowConfirmUnenroll(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-error-600 dark:text-error-400 border border-error-200 dark:border-error-800 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
              >
                <Icon icon="tabler:logout" height={18} />
                {t("courses.settings.unenroll")}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {t("courses.settings.unenrollConfirm")}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConfirmUnenroll(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleUnenroll}
                    isLoading={isUnenrolling}
                  >
                    {t("courses.settings.unenrollButton")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            {t("common.cancel")}
          </Button>
          <Button variant="primary" onClick={handleSave} className="flex-1">
            {t("courses.settings.saveSettings")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
