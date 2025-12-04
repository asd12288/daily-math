// shared/ui/math-graph/SolutionGraph.tsx
// Auto-detects equations in solutions and renders interactive graphs

"use client";

import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { MathGraph, InteractiveFunctionGraph } from "./MathGraph";
import { extractEquationsFromText } from "./equation-parser";
import { Theme } from "mafs";

interface SolutionGraphProps {
  /** The question text (may contain equation) */
  questionText?: string;
  /** The final answer (often contains the key equation) */
  answer?: string;
  /** Solution steps (array of step strings) */
  solutionSteps?: string[];
  /** Show interactive mode (with movable point) */
  interactive?: boolean;
  /** Maximum graphs to show */
  maxGraphs?: number;
  /** Custom height */
  height?: number;
  /** Additional CSS class */
  className?: string;
}

/**
 * SolutionGraph - Automatically detects and graphs equations from homework solutions
 *
 * @example
 * <SolutionGraph
 *   questionText="Find the derivative of f(x) = x² + 2x"
 *   answer="f'(x) = 2x + 2"
 *   solutionSteps={["Take derivative", "f'(x) = 2x + 2"]}
 * />
 */
export function SolutionGraph({
  questionText = "",
  answer = "",
  solutionSteps = [],
  interactive = true,
  maxGraphs = 2,
  height = 250,
  className = "",
}: SolutionGraphProps) {
  const t = useTranslations();
  const [showGraph, setShowGraph] = useState(false);
  const [selectedEquationIndex, setSelectedEquationIndex] = useState(0);

  // Combine all text and extract graphable equations
  const detectedEquations = useMemo(() => {
    const allText = [
      questionText,
      answer,
      ...solutionSteps,
    ].join("\n");

    return extractEquationsFromText(allText).slice(0, maxGraphs);
  }, [questionText, answer, solutionSteps, maxGraphs]);

  // No equations detected
  if (detectedEquations.length === 0) {
    return null;
  }

  const selectedEquation = detectedEquations[selectedEquationIndex];
  const colors = [Theme.blue, Theme.pink, Theme.green, Theme.orange];

  return (
    <div className={`solution-graph ${className}`}>
      {/* Toggle button - collapsed state */}
      {!showGraph && (
        <button
          onClick={() => setShowGraph(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 dark:text-primary-400
                     bg-primary-50 dark:bg-primary-900/20 rounded-lg
                     hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
        >
          <Icon icon="tabler:chart-line" height={18} />
          <span>{t("homework.showGraph")}</span>
          <span className="text-xs text-gray-500">
            ({detectedEquations.length} {detectedEquations.length === 1 ? "equation" : "equations"})
          </span>
        </button>
      )}

      {/* Expanded graph view */}
      {showGraph && (
        <div className="space-y-3">
          {/* Header with close button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="tabler:chart-line" height={18} className="text-primary-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("homework.graphVisualization")}
              </span>
            </div>
            <button
              onClick={() => setShowGraph(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Icon icon="tabler:x" height={16} />
            </button>
          </div>

          {/* Equation selector (if multiple) */}
          {detectedEquations.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {detectedEquations.map((eq, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedEquationIndex(index)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    index === selectedEquationIndex
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {eq.label || `Equation ${index + 1}`}
                </button>
              ))}
            </div>
          )}

          {/* The graph */}
          {selectedEquation.fn && (
            <>
              {interactive ? (
                <InteractiveFunctionGraph
                  fn={selectedEquation.fn}
                  label={selectedEquation.label}
                  xRange={selectedEquation.suggestedXRange || [-5, 5]}
                  yRange={selectedEquation.suggestedYRange || [-5, 5]}
                  height={height}
                />
              ) : (
                <MathGraph
                  type="function"
                  functions={[
                    {
                      fn: selectedEquation.fn,
                      label: selectedEquation.label,
                      color: colors[selectedEquationIndex % colors.length],
                    },
                  ]}
                  xRange={selectedEquation.suggestedXRange || [-5, 5]}
                  yRange={selectedEquation.suggestedYRange || [-5, 5]}
                  height={height}
                />
              )}
            </>
          )}

          {/* Equation label */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            {selectedEquation.label}
          </div>

          {/* Interactive hint */}
          {interactive && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Icon icon="tabler:hand-move" height={14} />
              <span>{t("homework.dragToExplore")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SolutionGraph;
