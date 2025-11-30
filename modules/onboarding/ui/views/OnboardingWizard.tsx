// modules/onboarding/ui/views/OnboardingWizard.tsx
// Main onboarding wizard that orchestrates all steps

"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Icon } from "@iconify/react";
import {
  WelcomeStep,
  ExperienceStep,
  DiagnosticStep,
  ResultsStep,
  PreferencesStep,
} from "../components";
import { useOnboarding, useCompleteOnboarding } from "../../hooks";
import type { ExperienceLevel } from "../../types";

export function OnboardingWizard() {
  const router = useRouter();
  const locale = useLocale();
  const { state, currentStep, isLoading, goToStep } = useOnboarding();
  const { complete, isCompleting } = useCompleteOnboarding();

  const handleWelcomeNext = () => {
    goToStep("experience");
  };

  const handleExperienceNext = (level: ExperienceLevel) => {
    goToStep("diagnostic", level);
  };

  const handleExperienceBack = () => {
    goToStep("welcome");
  };

  const handleDiagnosticComplete = () => {
    goToStep("results");
  };

  const handleDiagnosticBack = () => {
    goToStep("experience");
  };

  const handleResultsNext = () => {
    goToStep("complete");
  };

  const handlePreferencesComplete = async (
    dailyGoal: number,
    reminderTime: string | null
  ) => {
    await complete(dailyGoal, reminderTime);
    router.push(`/${locale}/dashboard`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon
          icon="tabler:loader-2"
          height={48}
          className="animate-spin text-primary-500"
        />
      </div>
    );
  }

  // Already completed - redirect to dashboard
  if (state?.isCompleted) {
    router.push(`/${locale}/dashboard`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      {/* Progress indicators */}
      <div className="max-w-2xl mx-auto px-4 mb-8">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Step content */}
      <div className="py-8">
        {currentStep === "welcome" && (
          <WelcomeStep onNext={handleWelcomeNext} />
        )}

        {currentStep === "experience" && (
          <ExperienceStep
            onNext={handleExperienceNext}
            onBack={handleExperienceBack}
          />
        )}

        {currentStep === "diagnostic" && (
          <DiagnosticStep
            onComplete={handleDiagnosticComplete}
            onBack={handleDiagnosticBack}
          />
        )}

        {currentStep === "results" && state?.diagnosticResult && (
          <ResultsStep
            result={state.diagnosticResult}
            onNext={handleResultsNext}
          />
        )}

        {currentStep === "complete" && (
          <PreferencesStep
            onComplete={handlePreferencesComplete}
            isLoading={isCompleting}
          />
        )}
      </div>
    </div>
  );
}

function StepIndicator({
  currentStep,
}: {
  currentStep: string;
}) {
  const steps = [
    { id: "welcome", icon: "tabler:home" },
    { id: "experience", icon: "tabler:user-scan" },
    { id: "diagnostic", icon: "tabler:clipboard-check" },
    { id: "results", icon: "tabler:chart-bar" },
    { id: "complete", icon: "tabler:check" },
  ];

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isActive
                  ? "bg-primary-600 text-white"
                  : isCompleted
                  ? "bg-success-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400"
              }`}
            >
              {isCompleted ? (
                <Icon icon="tabler:check" height={20} />
              ) : (
                <Icon icon={step.icon} height={20} />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-1 mx-1 rounded ${
                  isCompleted
                    ? "bg-success-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
