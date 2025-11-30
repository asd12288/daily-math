// modules/skill-tree/lib/flow-layout.ts
// Dagre layout utilities for skill tree React Flow visualization

import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";
import type { TopicStatus } from "../types";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;

export interface LayoutOptions {
  direction?: "LR" | "RL" | "TB" | "BT"; // LR for LTR, RL for RTL
  nodeSpacing?: number;
  rankSpacing?: number;
}

/**
 * Apply dagre layout to nodes and edges
 * Returns nodes with calculated positions
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  const { direction = "LR", nodeSpacing = 60, rankSpacing = 180 } = options;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(g);

  // Apply positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Get edge style based on topic status
 */
export function getEdgeStyle(
  sourceStatus: TopicStatus,
  targetStatus: TopicStatus,
  branchColor: string
): React.CSSProperties {
  // If target is not_started, show dashed gray line (visual hint only)
  if (targetStatus === "not_started") {
    return {
      stroke: "#9ca3af",
      strokeWidth: 2,
      strokeDasharray: "5,5",
    };
  }

  // If source is mastered, show glowing colored line
  if (sourceStatus === "mastered") {
    return {
      stroke: branchColor,
      strokeWidth: 3,
    };
  }

  // Default: solid line with branch color
  return {
    stroke: branchColor,
    strokeWidth: 2,
  };
}

/**
 * Get branch color from Tailwind class name
 */
export function getBranchHexColor(colorClass: string): string {
  const colorMap: Record<string, string> = {
    success: "#22c55e", // green-500
    primary: "#6366f1", // indigo-500
    secondary: "#a855f7", // purple-500
    warning: "#f59e0b", // amber-500
    error: "#ef4444", // red-500
  };

  return colorMap[colorClass] || "#6366f1";
}
