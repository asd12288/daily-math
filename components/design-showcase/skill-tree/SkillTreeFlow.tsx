"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { SkillNode, type SkillNodeData } from "./SkillNode";
import { getLayoutedElements, getEdgeStyle } from "./skill-tree-layout";
import type { TopicStatus } from "@/modules/skill-tree/types";

// Register custom node types
const nodeTypes: NodeTypes = {
  skillNode: SkillNode,
};

export interface SkillTopic {
  id: string;
  name: string;
  status: TopicStatus;
  mastery: number;
  prerequisites: string[];
  description?: string;
}

export interface SkillBranch {
  id: string;
  name: string;
  color: string;
  topics: SkillTopic[];
}

interface SkillTreeFlowProps {
  branches: SkillBranch[];
  onTopicClick?: (topicId: string) => void;
}

/**
 * Convert branches with topics to React Flow nodes and edges
 */
function branchesToFlow(branches: SkillBranch[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create a map for quick topic lookup
  const topicMap = new Map<string, { topic: SkillTopic; branch: SkillBranch }>();
  branches.forEach((branch) => {
    branch.topics.forEach((topic) => {
      topicMap.set(topic.id, { topic, branch });
    });
  });

  branches.forEach((branch) => {
    branch.topics.forEach((topic) => {
      // Create node
      nodes.push({
        id: topic.id,
        type: "skillNode",
        position: { x: 0, y: 0 }, // Will be calculated by dagre
        data: {
          label: topic.name,
          status: topic.status,
          mastery: topic.mastery,
          branchColor: branch.color,
          branchName: branch.name,
          description: topic.description,
        } satisfies SkillNodeData,
      });

      // Create edges from prerequisites
      topic.prerequisites.forEach((prereqId) => {
        const prereq = topicMap.get(prereqId);
        if (prereq) {
          edges.push({
            id: `${prereqId}-${topic.id}`,
            source: prereqId,
            target: topic.id,
            animated: topic.status === "in_progress",
            style: getEdgeStyle(prereq.topic.status, topic.status, branch.color),
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: topic.status === "locked" ? "#9ca3af" : branch.color,
            },
          });
        }
      });
    });
  });

  return { nodes, edges };
}

export function SkillTreeFlow({ branches, onTopicClick }: SkillTreeFlowProps) {
  // Convert branches to nodes and edges
  const { nodes: initialNodes, edges } = useMemo(() => branchesToFlow(branches), [branches]);

  // Apply dagre layout
  const { nodes: layoutedNodes } = useMemo(
    () =>
      getLayoutedElements(initialNodes, edges, {
        direction: "LR",
        nodeSpacing: 80,
        rankSpacing: 200,
      }),
    [initialNodes, edges]
  );

  // Handle node click
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onTopicClick) {
        onTopicClick(node.id);
      }
    },
    [onTopicClick]
  );

  return (
    <div className="h-[500px] w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <ReactFlow
        nodes={layoutedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <Controls
          className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !rounded-lg !shadow-lg"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}

export default SkillTreeFlow;
