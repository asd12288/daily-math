// modules/onboarding/ui/components/WelcomeStep.tsx
// Welcome screen for onboarding

"use client";

import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Button, Card, CardContent } from "@/shared/ui";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const t = useTranslations();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      {/* Logo/Icon */}
      <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6">
        <Icon
          icon="tabler:math-symbols"
          height={48}
          className="text-primary-600 dark:text-primary-400"
        />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        {t("onboarding.welcome.title")}
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-8">
        {t("onboarding.welcome.subtitle")}
      </p>

      {/* Features preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl w-full">
        <FeatureCard
          icon="tabler:calendar-check"
          title={t("onboarding.welcome.feature1Title")}
          description={t("onboarding.welcome.feature1Desc")}
        />
        <FeatureCard
          icon="tabler:robot"
          title={t("onboarding.welcome.feature2Title")}
          description={t("onboarding.welcome.feature2Desc")}
        />
        <FeatureCard
          icon="tabler:chart-line"
          title={t("onboarding.welcome.feature3Title")}
          description={t("onboarding.welcome.feature3Desc")}
        />
      </div>

      {/* CTA */}
      <Button variant="primary" size="lg" onClick={onNext}>
        {t("onboarding.welcome.getStarted")}
        <Icon icon="tabler:arrow-right" className="ms-2 rtl:rotate-180" />
      </Button>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="text-start">
      <CardContent className="p-4">
        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
          <Icon
            icon={icon}
            height={20}
            className="text-primary-600 dark:text-primary-400"
          />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
}
