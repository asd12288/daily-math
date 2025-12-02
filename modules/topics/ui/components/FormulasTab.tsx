// modules/topics/ui/components/FormulasTab.tsx
// Formulas tab content with LaTeX rendering and copy functionality

"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { MathBlock } from "@/shared/ui/math-display";
import { useTopicFormulas } from "../../hooks";
import type { FormulaDocument } from "../../server/services/formula.service";

interface FormulasTabProps {
  topicId: string;
}

export function FormulasTab({ topicId }: FormulasTabProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isHe = locale === "he";

  const { data: formulas, isLoading, error } = useTopicFormulas(topicId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon icon="tabler:loader-2" className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon icon="tabler:alert-circle" className="w-12 h-12 mx-auto text-error-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{t("errors.loadFailed")}</p>
      </div>
    );
  }

  if (!formulas || formulas.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon icon="tabler:math-off" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t("topics.noFormulas")}
        </h3>
        <p className="text-gray-500">{t("topics.noFormulasDesc")}</p>
      </div>
    );
  }

  // Group formulas by category
  const grouped = formulas.reduce((acc, formula) => {
    const category = formula.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(formula);
    return acc;
  }, {} as Record<string, FormulaDocument[]>);

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, categoryFormulas]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Icon icon="tabler:folder" className="w-5 h-5 text-primary-600" />
            {category}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {categoryFormulas.map((formula) => (
              <FormulaCard
                key={formula.$id}
                formula={formula}
                isHe={isHe}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface FormulaCardProps {
  formula: FormulaDocument;
  isHe: boolean;
}

function FormulaCard({ formula, isHe }: FormulaCardProps) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  const title = isHe && formula.titleHe ? formula.titleHe : formula.title;
  const explanation = isHe && formula.explanationHe ? formula.explanationHe : formula.explanation;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formula.latex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
          {formula.isCore && (
            <span className="px-2 py-0.5 text-xs font-medium bg-warning-100 text-warning-700 rounded-full">
              {t("topics.coreFormula")}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={`p-2 rounded-lg transition-colors ${
            copied
              ? "bg-success-100 text-success-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          }`}
          title={copied ? t("common.copied") : t("common.copy")}
        >
          <Icon icon={copied ? "tabler:check" : "tabler:copy"} className="w-4 h-4" />
        </button>
      </div>

      {/* Formula - LaTeX display */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-3 overflow-x-auto flex items-center justify-center min-h-[60px]">
        <MathBlock content={formula.latex} className="text-lg" />
      </div>

      {/* Explanation */}
      {explanation && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{explanation}</p>
      )}

      {/* Tags */}
      {formula.tags && formula.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {formula.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
