"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui";
import { useAutoSaveSetting } from "../../hooks";

interface PracticeSectionProps {
  dailyExerciseCount: number;
  preferredTime?: string;
}

export function PracticeSection({
  dailyExerciseCount: initialCount,
  preferredTime: initialTime,
}: PracticeSectionProps) {
  const t = useTranslations("settings");
  // Initialize state with callbacks to avoid stale props issues
  const [count, setCount] = useState(() => initialCount);
  const [time, setTime] = useState(() => initialTime || "09:00");
  const { save, isPending } = useAutoSaveSetting();

  const handleCountChange = (newCount: number) => {
    setCount(newCount);
    save("dailyExerciseCount", newCount);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    save("preferredTime", newTime);
  };

  const getEstimatedTime = (exerciseCount: number) => exerciseCount * 4;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
            <Icon icon="tabler:target" className="text-xl text-success-600" />
          </div>
          <div>
            <CardTitle>{t("practice.title")}</CardTitle>
            <p className="text-sm text-gray-500">{t("practice.description")}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exercise Count */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium">{t("practice.exerciseCount")}</h4>
              <p className="text-sm text-gray-500">{t("practice.exerciseCountDesc")}</p>
            </div>
            <div className="text-end">
              <p className="text-3xl font-bold text-primary-600">{count}</p>
              <p className="text-xs text-gray-500">{t("practice.perDay")}</p>
            </div>
          </div>

          {/* Slider */}
          <div className="mb-4">
            <input
              type="range"
              min={1}
              max={10}
              value={count}
              onChange={(e) => handleCountChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          {/* Quick select buttons */}
          <div className="flex gap-2 mb-4">
            {[3, 5, 7, 10].map((value) => (
              <button
                key={value}
                onClick={() => handleCountChange(value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  count === value
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="tabler:clock" className="text-gray-400" />
                <span className="text-sm text-gray-500">{t("practice.estimatedTime")}</span>
              </div>
              <p className="font-semibold">~{getEstimatedTime(count)} {t("practice.minutes")}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="tabler:star" className="text-gray-400" />
                <span className="text-sm text-gray-500">{t("practice.potentialXp")}</span>
              </div>
              <p className="font-semibold">{count * 15}-{count * 25} XP</p>
            </div>
          </div>

          {/* Warning for high count */}
          {count >= 7 && (
            <div className="mt-4 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg flex items-start gap-2">
              <Icon icon="tabler:info-circle" className="text-warning-600 mt-0.5 shrink-0" />
              <p className="text-sm text-warning-700 dark:text-warning-300">
                {t("practice.highCountWarning")}
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Preferred Time */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t("practice.preferredTime")}</h4>
              <p className="text-sm text-gray-500">{t("practice.preferredTimeDesc")}</p>
            </div>
            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {isPending && (
                <div className="absolute end-2 top-1/2 -translate-y-1/2">
                  <Icon
                    icon="tabler:loader-2"
                    className="text-primary-500 animate-spin"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
