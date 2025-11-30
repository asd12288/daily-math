import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;

export interface LayoutOptions {
  direction?: "LR" | "TB"; // Left-to-Right or Top-to-Bottom
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
  sourceStatus: string,
  targetStatus: string,
  branchColor: string
): React.CSSProperties {
  // If target is locked, show dashed gray line
  if (targetStatus === "locked") {
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
