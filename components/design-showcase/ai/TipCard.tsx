"use client";

import { Icon } from "@iconify/react";
import { MathRenderer } from "../shared/MathRenderer";

interface TipCardProps {
  tip: string;
  variant?: "default" | "warning" | "success";
  title?: string;
}

export function TipCard({ tip, variant = "default", title = "Tip" }: TipCardProps) {
  const variantStyles = {
    default: {
      container: "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800",
      border: "border-primary-500",
      icon: "text-primary-600",
      title: "text-primary-800 dark:text-primary-200",
      text: "text-primary-700 dark:text-primary-300",
      iconName: "tabler:bulb",
    },
    warning: {
      container: "bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800",
      border: "border-warning-500",
      icon: "text-warning-600",
      title: "text-warning-800 dark:text-warning-200",
      text: "text-warning-700 dark:text-warning-300",
      iconName: "tabler:alert-triangle",
    },
    success: {
      container: "bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800",
      border: "border-success-500",
      icon: "text-success-600",
      title: "text-success-800 dark:text-success-200",
      text: "text-success-700 dark:text-success-300",
      iconName: "tabler:circle-check",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`p-4 rounded-lg border-s-4 ${styles.border} ${styles.container}`}>
      <div className="flex items-start gap-3">
        <Icon icon={styles.iconName} className={`text-xl mt-0.5 shrink-0 ${styles.icon}`} />
        <div>
          <p className={`font-medium text-sm mb-1 ${styles.title}`}>{title}</p>
          <MathRenderer content={tip} className={`text-sm ${styles.text}`} />
        </div>
      </div>
    </div>
  );
}

// Hint reveal component
export function HintReveal({ hints }: { hints: string[] }) {
  return (
    <div className="space-y-3">
      {hints.map((hint, index) => (
        <details key={index} className="group">
          <summary className="flex items-center gap-2 cursor-pointer p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Icon
              icon="tabler:chevron-right"
              className="text-gray-400 transition-transform group-open:rotate-90"
            />
            <span className="text-sm font-medium">Hint {index + 1}</span>
            <span className="text-xs text-gray-400 ms-auto">Click to reveal</span>
          </summary>
          <div className="mt-2 ps-8">
            <TipCard tip={hint} variant="default" title={`Hint ${index + 1}`} />
          </div>
        </details>
      ))}
    </div>
  );
}

// AI suggestion cards
export function AISuggestionCard() {
  return (
    <div className="p-4 bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-900/20 dark:to-primary-900/20 rounded-xl border border-secondary-200 dark:border-secondary-800">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-secondary-500 to-primary-500 flex items-center justify-center">
          <Icon icon="tabler:sparkles" className="text-xl text-white" />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">AI Study Assistant</p>
          <p className="text-xs text-gray-500">Powered by Gemini</p>
        </div>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Based on your recent exercises, you might want to practice more{" "}
        <span className="font-medium text-primary-600">chain rule</span> problems.
        Would you like me to add some to your next daily set?
      </p>
      <div className="flex gap-2 mt-4">
        <button className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors">
          Yes, add them
        </button>
        <button className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  );
}

// Showcase
export function TipCardShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Tip Variants</p>
        <div className="space-y-3">
          <TipCard
            tip="Remember the power rule: $\frac{d}{dx}(x^n) = nx^{n-1}$"
            variant="default"
          />
          <TipCard
            tip="Be careful with sign changes when differentiating negative terms!"
            variant="warning"
            title="Common Mistake"
          />
          <TipCard
            tip="Your approach using the chain rule is correct!"
            variant="success"
            title="Great Job"
          />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Progressive Hints</p>
        <HintReveal
          hints={[
            "Start by identifying what type of function this is",
            "Think about which differentiation rule applies here",
            "Apply the chain rule: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$",
          ]}
        />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">AI Suggestion</p>
        <AISuggestionCard />
      </div>
    </div>
  );
}
