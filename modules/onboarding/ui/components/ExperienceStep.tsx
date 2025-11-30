// modules/onboarding/ui/components/ExperienceStep.tsx
// Experience level selection

"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Button, Card, CardContent } from "@/shared/ui";
import type { ExperienceLevel } from "../../types";

interface ExperienceStepProps {
  onNext: (level: ExperienceLevel) => void;
  onBack: () => void;
}

const EXPERIENCE_OPTIONS: {
  level: ExperienceLevel;
  icon: string;
  color: string;
}[] = [
  { level: "beginner", icon: "tabler:seedling", color: "success" },
  { level: "some", icon: "tabler:plant", color: "primary" },
  { level: "comfortable", icon: "tabler:plant-2", color: "secondary" },
  { level: "advanced", icon: "tabler:tree", color: "warning" },
];

export function ExperienceStep({ onNext, onBack }: ExperienceStepProps) {
  const t = useTranslations();
  const [selected, setSelected] = useState<ExperienceLevel | null>(null);

  const handleContinue = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("onboarding.experience.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t("onboarding.experience.subtitle")}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {EXPERIENCE_OPTIONS.map((option) => (
          <ExperienceCard
            key={option.level}
            level={option.level}
            icon={option.icon}
            color={option.color}
            title={t(`onboarding.experience.${option.level}.title`)}
            description={t(`onboarding.experience.${option.level}.description`)}
            isSelected={selected === option.level}
            onSelect={() => setSelected(option.level)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <Icon icon="tabler:arrow-left" className="me-2 rtl:rotate-180" />
          {t("common.back")}
        </Button>
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={!selected}
        >
          {t("common.next")}
          <Icon icon="tabler:arrow-right" className="ms-2 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}

function ExperienceCard({
  level: _level,
  icon,
  color,
  title,
  description,
  isSelected,
  onSelect,
}: {
  level: ExperienceLevel;
  icon: string;
  color: string;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    success: {
      bg: "bg-success-100 dark:bg-success-900/30",
      icon: "text-success-600 dark:text-success-400",
      border: "border-success-500",
    },
    primary: {
      bg: "bg-primary-100 dark:bg-primary-900/30",
      icon: "text-primary-600 dark:text-primary-400",
      border: "border-primary-500",
    },
    secondary: {
      bg: "bg-secondary-100 dark:bg-secondary-900/30",
      icon: "text-secondary-600 dark:text-secondary-400",
      border: "border-secondary-500",
    },
    warning: {
      bg: "bg-warning-100 dark:bg-warning-900/30",
      icon: "text-warning-600 dark:text-warning-400",
      border: "border-warning-500",
    },
  };

  const colors = colorClasses[color] || colorClasses.primary;

  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected
          ? `border-2 ${colors.border} shadow-md`
          : "border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}
          >
            <Icon icon={icon} height={24} className={colors.icon} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
          {isSelected && (
            <Icon
              icon="tabler:circle-check-filled"
              height={24}
              className={colors.icon}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
