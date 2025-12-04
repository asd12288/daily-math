// shared/ui/math-graph/MathGraph.tsx
// Interactive math function graph using Mafs library

"use client";

import React, { useMemo } from "react";
import {
  Mafs,
  Coordinates,
  Plot,
  Theme,
  useMovablePoint,
  Text,
  Line,
  Vector,
  Point,
} from "mafs";
import "mafs/core.css";

// Graph display modes
export type GraphType =
  | "function"      // y = f(x)
  | "parametric"    // x(t), y(t)
  | "inequality"    // y < f(x), y > f(x)
  | "vector"        // Vector from origin
  | "line"          // Linear equation ax + by = c
  | "point";        // Single point

export interface FunctionDefinition {
  /** The function expression as a JS function */
  fn: (x: number) => number;
  /** Display label (optional) */
  label?: string;
  /** Color from Mafs Theme */
  color?: string;
  /** Line style */
  style?: "solid" | "dashed";
}

export interface ParametricDefinition {
  /** Parametric function returning [x, y] */
  xy: (t: number) => [number, number];
  /** Domain [start, end] for parameter t */
  domain: [number, number];
  /** Display label */
  label?: string;
  /** Color */
  color?: string;
}

export interface InequalityDefinition {
  /** Upper bound function (y <=) */
  upper?: (x: number) => number;
  /** Lower bound function (y >=) */
  lower?: (x: number) => number;
  /** Fill color */
  color?: string;
}

export interface VectorDefinition {
  /** Vector components [x, y] */
  components: [number, number];
  /** Starting point (default: origin) */
  tail?: [number, number];
  /** Label */
  label?: string;
  /** Color */
  color?: string;
}

export interface PointDefinition {
  /** Point coordinates [x, y] */
  coordinates: [number, number];
  /** Label */
  label?: string;
  /** Color */
  color?: string;
}

export interface MathGraphProps {
  /** Graph type */
  type: GraphType;
  /** Functions to plot (for function type) */
  functions?: FunctionDefinition[];
  /** Parametric curves (for parametric type) */
  parametric?: ParametricDefinition[];
  /** Inequalities to shade (for inequality type) */
  inequalities?: InequalityDefinition[];
  /** Vectors to display */
  vectors?: VectorDefinition[];
  /** Points to display */
  points?: PointDefinition[];
  /** X-axis range [min, max] */
  xRange?: [number, number];
  /** Y-axis range [min, max] */
  yRange?: [number, number];
  /** Width of the graph */
  width?: number | "auto";
  /** Height of the graph */
  height?: number;
  /** Show grid */
  showGrid?: boolean;
  /** Show coordinate labels */
  showLabels?: boolean;
  /** Allow pan/zoom */
  interactive?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * MathGraph - Interactive mathematical function visualization
 *
 * @example
 * // Simple function plot: y = x²
 * <MathGraph
 *   type="function"
 *   functions={[{ fn: (x) => x ** 2, label: "y = x²" }]}
 * />
 *
 * @example
 * // Multiple functions: y = sin(x) and y = cos(x)
 * <MathGraph
 *   type="function"
 *   functions={[
 *     { fn: Math.sin, label: "sin(x)", color: Theme.blue },
 *     { fn: Math.cos, label: "cos(x)", color: Theme.pink },
 *   ]}
 *   xRange={[-2 * Math.PI, 2 * Math.PI]}
 * />
 *
 * @example
 * // Parametric circle
 * <MathGraph
 *   type="parametric"
 *   parametric={[{
 *     xy: (t) => [Math.cos(t), Math.sin(t)],
 *     domain: [0, 2 * Math.PI],
 *     label: "Circle"
 *   }]}
 * />
 */
export function MathGraph({
  type,
  functions = [],
  parametric = [],
  inequalities = [],
  vectors = [],
  points = [],
  xRange = [-5, 5],
  yRange = [-5, 5],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  width = "auto",
  height = 300,
  showGrid = true,
  showLabels = true,
  interactive = true,
  className = "",
}: MathGraphProps) {
  // Calculate view box
  const viewBox = useMemo(() => ({
    x: xRange,
    y: yRange,
  }), [xRange, yRange]);

  return (
    <div
      className={`math-graph rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}
      style={{ height }}
    >
      <Mafs
        viewBox={viewBox}
        preserveAspectRatio={false}
        pan={interactive}
        zoom={interactive}
      >
        {/* Coordinate system */}
        {showGrid && <Coordinates.Cartesian />}

        {/* Render functions */}
        {type === "function" && functions.map((func, index) => (
          <Plot.OfX
            key={`fn-${index}`}
            y={func.fn}
            color={func.color || Theme.blue}
            style={func.style || "solid"}
          />
        ))}

        {/* Render parametric curves */}
        {type === "parametric" && parametric.map((param, index) => (
          <Plot.Parametric
            key={`param-${index}`}
            xy={param.xy}
            domain={param.domain}
            color={param.color || Theme.blue}
          />
        ))}

        {/* Render inequalities */}
        {type === "inequality" && inequalities.map((ineq, index) => (
          <Plot.Inequality
            key={`ineq-${index}`}
            y={{
              ...(ineq.upper && { "<=": ineq.upper }),
              ...(ineq.lower && { ">=": ineq.lower }),
            }}
            color={ineq.color || Theme.blue}
          />
        ))}

        {/* Render vectors */}
        {vectors.map((vec, index) => (
          <Vector
            key={`vec-${index}`}
            tail={vec.tail || [0, 0]}
            tip={[
              (vec.tail?.[0] || 0) + vec.components[0],
              (vec.tail?.[1] || 0) + vec.components[1],
            ]}
            color={vec.color || Theme.blue}
          />
        ))}

        {/* Render points */}
        {points.map((pt, index) => (
          <React.Fragment key={`pt-${index}`}>
            <Point
              x={pt.coordinates[0]}
              y={pt.coordinates[1]}
              color={pt.color || Theme.blue}
            />
            {pt.label && showLabels && (
              <Text
                x={pt.coordinates[0] + 0.3}
                y={pt.coordinates[1] + 0.3}
                size={12}
              >
                {pt.label}
              </Text>
            )}
          </React.Fragment>
        ))}

        {/* Function labels */}
        {showLabels && type === "function" && functions.map((func, index) => (
          func.label && (
            <Text
              key={`label-${index}`}
              x={xRange[1] - 1}
              y={func.fn(xRange[1] - 1)}
              size={14}
              color={func.color || Theme.blue}
            >
              {func.label}
            </Text>
          )
        ))}
      </Mafs>
    </div>
  );
}

/**
 * Interactive graph with a movable point on the function
 * Great for exploring function behavior
 */
export function InteractiveFunctionGraph({
  fn,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  label,
  xRange = [-5, 5],
  yRange = [-5, 5],
  initialX = 0,
  height = 300,
  className = "",
}: {
  fn: (x: number) => number;
  label?: string;
  xRange?: [number, number];
  yRange?: [number, number];
  initialX?: number;
  height?: number;
  className?: string;
}) {
  // Movable point that stays on the curve
  const point = useMovablePoint([initialX, fn(initialX)], {
    constrain: ([x]) => [x, fn(x)],
  });

  return (
    <div
      className={`math-graph rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}
      style={{ height }}
    >
      <Mafs
        viewBox={{ x: xRange, y: yRange }}
        preserveAspectRatio={false}
      >
        <Coordinates.Cartesian />

        {/* The function curve */}
        <Plot.OfX y={fn} color={Theme.blue} />

        {/* The movable point */}
        {point.element}

        {/* Coordinate display */}
        <Text x={point.point[0] + 0.5} y={point.point[1] + 0.5} size={12}>
          ({point.point[0].toFixed(2)}, {point.point[1].toFixed(2)})
        </Text>

        {/* Dotted lines to axes */}
        <Line.Segment
          point1={[point.point[0], 0]}
          point2={point.point}
          style="dashed"
          opacity={0.5}
        />
        <Line.Segment
          point1={[0, point.point[1]]}
          point2={point.point}
          style="dashed"
          opacity={0.5}
        />
      </Mafs>
    </div>
  );
}

export default MathGraph;
