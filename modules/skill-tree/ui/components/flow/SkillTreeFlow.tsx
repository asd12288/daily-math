// modules/skill-tree/ui/components/flow/SkillTreeFlow.tsx
// React Flow skill tree visualization with RTL support

"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { SkillFlowNode, type SkillNodeData } from "./SkillFlowNode";
import { getLayoutedElements, getEdgeStyle, getBranchHexColor } from "@/modules/skill-tree/lib/flow-layout";
import type { BranchWithTopics, TopicWithProgress } from "@/modules/skill-tree/types";

// Register custom node types
const nodeTypes: NodeTypes = {
  skillNode: SkillFlowNode,
};

interface SkillTreeFlowProps {
  branches: BranchWithTopics[];
  onTopicClick?: (topicId: string) => void;
  isRtl?: boolean;
}

/**
 * Convert branches with topics to React Flow nodes and edges
 */
function branchesToFlow(
  branches: BranchWithTopics[],
  isRtl: boolean
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create a map for quick topic lookup
  const topicMap = new Map<string, { topic: TopicWithProgress; branch: BranchWithTopics }>();
  branches.forEach((branch) => {
    branch.topics.forEach((topic) => {
      topicMap.set(topic.id, { topic, branch });
    });
  });

  branches.forEach((branch) => {
    const branchHexColor = getBranchHexColor(branch.color);

    branch.topics.forEach((topic) => {
      // Create node
      nodes.push({
        id: topic.id,
        type: "skillNode",
        position: { x: 0, y: 0 }, // Will be calculated by dagre
        data: {
          label: topic.name,
          labelHe: topic.nameHe,
          status: topic.status,
          mastery: topic.mastery,
          branchColor: branchHexColor,
          branchName: branch.name,
          branchNameHe: branch.nameHe,
          description: topic.description,
          isRtl,
        } satisfies SkillNodeData,
      });

      // Create edges from prerequisites
      topic.prerequisites.forEach((prereqId) => {
        const prereq = topicMap.get(prereqId);
        if (prereq) {
          const prereqBranchColor = getBranchHexColor(prereq.branch.color);
          edges.push({
            id: `${prereqId}-${topic.id}`,
            source: prereqId,
            target: topic.id,
            animated: topic.status === "in_progress",
            style: getEdgeStyle(prereq.topic.status, topic.status, prereqBranchColor),
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: topic.status === "locked" ? "#9ca3af" : branchHexColor,
            },
          });
        }
      });
    });
  });

  return { nodes, edges };
}

export function SkillTreeFlow({ branches, onTopicClick, isRtl = false }: SkillTreeFlowProps) {
  // Convert branches to nodes and edges
  const { nodes: initialNodes, edges } = useMemo(
    () => branchesToFlow(branches, isRtl),
    [branches, isRtl]
  );

  // Apply dagre layout - use RL direction for RTL languages
  const { nodes: layoutedNodes } = useMemo(
    () =>
      getLayoutedElements(initialNodes, edges, {
        direction: isRtl ? "RL" : "LR",
        nodeSpacing: 80,
        rankSpacing: 200,
      }),
    [initialNodes, edges, isRtl]
  );

  // Find focus node IDs - prioritize in_progress, then first available
  // "use no memo" - Tell React Compiler to skip optimization for this complex computation
  const focusNodeIds = (() => {
    const inProgressNodes = layoutedNodes.filter(
      (n) => (n.data as unknown as SkillNodeData).status === "in_progress"
    );
    if (inProgressNodes.length > 0) {
      return inProgressNodes.map((n) => n.id);
    }

    const availableNodes = layoutedNodes.filter(
      (n) => (n.data as unknown as SkillNodeData).status === "available"
    );
    if (availableNodes.length > 0) {
      // Return first 2 available nodes
      return availableNodes.slice(0, 2).map((n) => n.id);
    }

    // Fallback: return first few nodes
    return layoutedNodes.slice(0, 3).map((n) => n.id);
  })();

  // Handle node click - only for non-locked topics
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const nodeData = node.data as unknown as SkillNodeData;
      if (nodeData.status !== "locked" && onTopicClick) {
        onTopicClick(node.id);
      }
    },
    [onTopicClick]
  );

  return (
    <div className="h-[calc(100vh-220px)] min-h-[400px] w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <ReactFlow
        nodes={layoutedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{
          padding: 0.3,
          nodes: layoutedNodes.filter((n) => focusNodeIds.includes(n.id)),
        }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !rounded-lg !shadow-lg"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}

export default SkillTreeFlow;
