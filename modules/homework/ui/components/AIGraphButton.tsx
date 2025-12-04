// modules/homework/ui/components/AIGraphButton.tsx
// Button that appears when AI detects a graphable equation
// Renders interactive graph on click using Mafs library

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { MathGraph } from "@/shared/ui/math-graph";
import { MathDisplay } from "@/shared/ui/math-display";
import type { AISuggestions, GraphType } from "../../types";

interface AIGraphButtonProps {
  aiSuggestions: AISuggestions | null;
  className?: string;
}

/**
 * Converts AI-extracted function string to JavaScript function
 * The AI returns functions in JS format like "x**2 + 2*x" or "Math.sin(x)"
 */
function parseAIFunction(funcStr: string): ((x: number) => number) | null {
  try {
    const fn = new Function("x", `return ${funcStr}`) as (x: number) => number;

    // Validate the function works with test values
    const testValues = [0, 1, 0.5];
    for (const x of testValues) {
      const result = fn(x);
      if (typeof result !== "number") {
        return null;
      }
    }

    return fn;
  } catch {
    return null;
  }
}

/**
 * Get icon for graph type
 */
function getGraphTypeIcon(graphType?: GraphType): string {
  switch (graphType) {
    case "trigonometric":
      return "tabler:wave-sine";
    case "exponential":
      return "tabler:trending-up";
    case "logarithmic":
      return "tabler:trending-down";
    case "limit":
      return "tabler:arrows-horizontal";
    case "derivative":
      return "tabler:math-function";
    case "integral":
      return "tabler:chart-area";
    default:
      return "tabler:chart-line";
  }
}

/**
 * AIGraphButton - Shows "Generate Graph" button when AI detects graphable equation
 *
 * @example
 * <AIGraphButton
 *   aiSuggestions={parseAISuggestions(question.aiSuggestions)}
 * />
 */
export function AIGraphButton({
  aiSuggestions,
  className = "",
}: AIGraphButtonProps) {
  const t = useTranslations("homework");
  const [showGraph, setShowGraph] = useState(false);

  // Check if we can show the graph button
  const canShowGraph = useMemo(() => {
    if (!aiSuggestions?.graphable || !aiSuggestions?.graphableFunction) {
      return false;
    }
    // Validate the function can be parsed
    const fn = parseAIFunction(aiSuggestions.graphableFunction);
    return fn !== null;
  }, [aiSuggestions]);

  // Parse the function
  const parsedFunction = useMemo(() => {
    if (!aiSuggestions?.graphableFunction) return null;
    return parseAIFunction(aiSuggestions.graphableFunction);
  }, [aiSuggestions]);

  const handleToggleGraph = useCallback(() => {
    setShowGraph((prev) => !prev);
  }, []);

  // Don't render anything if no graphable function detected
  if (!canShowGraph) {
    return null;
  }

  const domain = aiSuggestions?.graphDomain || [-5, 5];
  const graphType = aiSuggestions?.graphType;
  const graphTypeKey = graphType || "other";

  return (
    <div className={`ai-graph-section space-y-3 ${className}`}>
      {/* Toggle button */}
      <button
        onClick={handleToggleGraph}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
          showGraph
            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-700"
            : "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/30"
        }`}
      >
        <Icon icon={getGraphTypeIcon(graphType)} height={18} />
        <span>{showGraph ? t("hideGraph") : t("generateGraph")}</span>
        <span className="px-1.5 py-0.5 text-xs bg-primary-200/50 dark:bg-primary-800/50 rounded">
          {t(`graphTypes.${graphTypeKey}`)}
        </span>
        <Icon
          icon={showGraph ? "tabler:chevron-up" : "tabler:chevron-down"}
          height={16}
          className="ms-auto"
        />
      </button>

      {/* Graph display */}
      {showGraph && parsedFunction && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Function label with LaTeX - shown above graph */}
          <div className="flex items-center justify-center py-2 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <MathDisplay
              content={`$f(x) = ${formatFunctionForLatex(aiSuggestions?.graphableFunction || "")}$`}
              size="xl"
            />
          </div>

          {/* Graph container */}
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <MathGraph
              type="function"
              functions={[
                {
                  fn: parsedFunction,
                  label: "",
                },
              ]}
              xRange={calculateSmartXRange(parsedFunction, domain as [number, number])}
              yRange={calculateSmartYRange(parsedFunction, domain as [number, number])}
              height={280}
              interactive={true}
            />
          </div>

          {/* Interaction hint */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <Icon icon="tabler:hand-move" height={14} />
            <span>{t("dragToExplore")}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Format function string for LaTeX display
 * Converts JS format to proper LaTeX notation
 */
function formatFunctionForLatex(funcStr: string): string {
  return funcStr
    // Handle powers: x**2 -> x^{2}
    .replace(/\*\*(\d+)/g, "^{$1}")
    .replace(/\*\*\(([^)]+)\)/g, "^{$1}")
    // Handle Math functions
    .replace(/Math\.sin\(([^)]+)\)/g, "\\sin($1)")
    .replace(/Math\.cos\(([^)]+)\)/g, "\\cos($1)")
    .replace(/Math\.tan\(([^)]+)\)/g, "\\tan($1)")
    .replace(/Math\.sqrt\(([^)]+)\)/g, "\\sqrt{$1}")
    .replace(/Math\.log\(([^)]+)\)/g, "\\ln($1)")
    .replace(/Math\.log10\(([^)]+)\)/g, "\\log($1)")
    .replace(/Math\.exp\(([^)]+)\)/g, "e^{$1}")
    .replace(/Math\.PI/g, "\\pi")
    .replace(/Math\.E/g, "e")
    // Handle multiplication: 2*x -> 2x, but keep fractions
    .replace(/(\d)\*([a-z])/g, "$1$2")
    .replace(/([a-z])\*([a-z])/g, "$1 \\cdot $2")
    // Handle division for fractions
    .replace(/\(([^)]+)\)\/\(([^)]+)\)/g, "\\frac{$1}{$2}")
    .replace(/(\d+)\/(\d+)/g, "\\frac{$1}{$2}");
}

/**
 * Find critical points (min/max) of the function
 */
function findCriticalPoints(
  fn: (x: number) => number,
  xRange: [number, number]
): { x: number; y: number; type: "min" | "max" | "point" }[] {
  const samples = 100;
  const step = (xRange[1] - xRange[0]) / samples;
  const points: { x: number; y: number; type: "min" | "max" | "point" }[] = [];

  let prevY: number | null = null;
  let prevSlope: number | null = null;

  for (let x = xRange[0]; x <= xRange[1]; x += step) {
    try {
      const y = fn(x);
      if (!isFinite(y) || isNaN(y)) continue;

      if (prevY !== null) {
        const slope = y - prevY;

        // Detect sign change in slope (critical point)
        if (prevSlope !== null) {
          if (prevSlope > 0 && slope < 0) {
            // Local maximum
            points.push({ x: x - step, y: prevY, type: "max" });
          } else if (prevSlope < 0 && slope > 0) {
            // Local minimum
            points.push({ x: x - step, y: prevY, type: "min" });
          }
        }
        prevSlope = slope;
      }
      prevY = y;
    } catch {
      prevY = null;
      prevSlope = null;
    }
  }

  return points;
}

/**
 * Calculate smart X range that centers on interesting parts of the function
 */
function calculateSmartXRange(
  fn: (x: number) => number,
  suggestedRange: [number, number]
): [number, number] {
  const criticalPoints = findCriticalPoints(fn, suggestedRange);

  // If we found critical points, center around them
  if (criticalPoints.length > 0) {
    const xValues = criticalPoints.map((p) => p.x);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);

    // Add padding around critical points
    const range = maxX - minX || 4;
    const padding = range * 0.5;

    return [
      Math.max(suggestedRange[0], minX - padding - 2),
      Math.min(suggestedRange[1], maxX + padding + 2),
    ];
  }

  // Default: use suggested range but ensure it includes origin if close
  const [min, max] = suggestedRange;
  if (min > -2 && min < 2) {
    return [Math.min(-3, min), max];
  }
  if (max > -2 && max < 2) {
    return [min, Math.max(3, max)];
  }

  return suggestedRange;
}

/**
 * Calculate smart Y range that centers on the function's values
 */
function calculateSmartYRange(
  fn: (x: number) => number,
  xRange: [number, number]
): [number, number] {
  const samples = 100;
  const step = (xRange[1] - xRange[0]) / samples;
  const yValues: number[] = [];

  for (let x = xRange[0]; x <= xRange[1]; x += step) {
    try {
      const y = fn(x);
      if (isFinite(y) && !isNaN(y) && Math.abs(y) < 1000) {
        yValues.push(y);
      }
    } catch {
      // Skip invalid points
    }
  }

  if (yValues.length === 0) {
    return [-5, 5];
  }

  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const range = maxY - minY || 2;

  // Add symmetric padding to center the function
  const centerY = (minY + maxY) / 2;
  const halfRange = Math.max(range * 0.6, 2); // At least 2 units each direction

  // Ensure we include y=0 if function crosses it
  let finalMin = centerY - halfRange;
  let finalMax = centerY + halfRange;

  // If zero is close, include it
  if (minY <= 0 && maxY >= 0) {
    // Function crosses zero - make sure it's visible
    finalMin = Math.min(finalMin, minY - range * 0.2);
    finalMax = Math.max(finalMax, maxY + range * 0.2);
  } else if (Math.abs(minY) < range || Math.abs(maxY) < range) {
    // Zero is nearby - extend to include it
    if (minY > 0) {
      finalMin = Math.min(0, finalMin);
    } else {
      finalMax = Math.max(0, finalMax);
    }
  }

  // Clamp to reasonable bounds
  return [
    Math.max(-50, finalMin),
    Math.min(50, finalMax),
  ];
}

export default AIGraphButton;
