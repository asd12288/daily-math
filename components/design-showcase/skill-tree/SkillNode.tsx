"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Icon } from "@iconify/react";

export type TopicStatus = "locked" | "available" | "in_progress" | "mastered";

export interface SkillNodeData {
  label: string;
  status: TopicStatus;
  mastery: number;
  branchColor: string;
  branchName: string;
  description?: string;
}

// Mastery ring component - circular progress around status icon
function MasteryRing({ mastery, status }: { mastery: number; status: TopicStatus }) {
  const circumference = 2 * Math.PI * 18; // radius 18
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (mastery / 100) * circumference;

  const getColor = () => {
    if (status === "mastered") return "#22c55e"; // success-500
    if (status === "in_progress") return "#6366f1"; // primary-500
    return "#9ca3af"; // gray-400
  };

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      {/* Background circle */}
      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        {mastery > 0 && (
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke={getColor()}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        )}
      </svg>
      {/* Status icon */}
      <StatusIcon status={status} />
    </div>
  );
}

function StatusIcon({ status }: { status: TopicStatus }) {
  const iconConfig = {
    locked: { icon: "tabler:lock", className: "text-gray-400" },
    available: { icon: "tabler:circle", className: "text-gray-500" },
    in_progress: { icon: "tabler:loader-2", className: "text-primary-500 animate-spin" },
    mastered: { icon: "tabler:check", className: "text-success-500" },
  };

  const config = iconConfig[status];

  return <Icon icon={config.icon} className={`text-xl ${config.className}`} />;
}

function SkillNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as SkillNodeData;
  const { label, status, mastery, branchColor, branchName } = nodeData;

  const statusClasses = {
    locked: "border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed",
    available:
      "border-gray-400 dark:border-gray-500 hover:border-primary-400 hover:shadow-lg cursor-pointer",
    in_progress:
      "border-primary-500 shadow-lg shadow-primary-200/30 dark:shadow-primary-900/30 cursor-pointer",
    mastered: "border-success-500 bg-success-50/50 dark:bg-success-900/10 cursor-pointer",
  };

  return (
    <>
      {/* Target handle - Left side for LR layout */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-300 dark:!bg-gray-600 !border-2 !border-white dark:!border-gray-800"
      />

      <div
        className={`
          skill-node px-4 py-3 rounded-xl border-2 shadow-md transition-all duration-200
          bg-white dark:bg-gray-800 min-w-[160px]
          ${statusClasses[status]}
        `}
      >
        {/* Branch color indicator */}
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full"
          style={{ backgroundColor: branchColor }}
        />

        <div className="flex items-center gap-3">
          {/* Mastery ring with status icon */}
          <MasteryRing mastery={mastery} status={status} />

          {/* Topic info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {label}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{branchName}</p>
            {status !== "locked" && (
              <p className="text-xs font-medium mt-0.5" style={{ color: branchColor }}>
                {mastery}% mastery
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Source handle - Right side for LR layout */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-300 dark:!bg-gray-600 !border-2 !border-white dark:!border-gray-800"
      />
    </>
  );
}

export const SkillNode = memo(SkillNodeComponent);
