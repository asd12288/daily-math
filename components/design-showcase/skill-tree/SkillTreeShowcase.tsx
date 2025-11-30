"use client";

import { SkillTreeFlow } from "./SkillTreeFlow";
import { mockSkillBranches } from "@/lib/mock-data";
import { CardBox } from "@/shared/ui";
import { Icon } from "@iconify/react";

function Legend() {
  const statuses = [
    { status: "mastered", label: "Mastered", color: "#22c55e", icon: "tabler:check" },
    { status: "in_progress", label: "In Progress", color: "#6366f1", icon: "tabler:loader-2" },
    { status: "available", label: "Available", color: "#9ca3af", icon: "tabler:circle" },
    { status: "locked", label: "Locked", color: "#d1d5db", icon: "tabler:lock" },
  ];

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {statuses.map(({ status, label, color, icon }) => (
        <div key={status} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          />
          <Icon icon={icon} className="text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

function BranchLegend() {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {mockSkillBranches.map((branch) => (
        <div key={branch.id} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: branch.color }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">{branch.name}</span>
        </div>
      ))}
    </div>
  );
}

export function SkillTreeShowcase() {
  const handleTopicClick = (topicId: string) => {
    console.log("Topic clicked:", topicId);
    // In real app, navigate to practice page
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <CardBox>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
            <Icon icon="tabler:binary-tree" className="text-2xl text-primary-600" />
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-1">Interactive Skill Tree</h4>
            <p className="text-gray-500 text-sm mb-3">
              Navigate your learning path! Topics are connected by prerequisites.
              Complete earlier topics to unlock advanced ones.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="text-sm">
                <span className="text-gray-500">Total Topics:</span>{" "}
                <span className="font-semibold">
                  {mockSkillBranches.reduce((sum, b) => sum + b.topics.length, 0)}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Mastered:</span>{" "}
                <span className="font-semibold text-success-600">
                  {mockSkillBranches.reduce(
                    (sum, b) => sum + b.topics.filter((t) => t.status === "mastered").length,
                    0
                  )}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">In Progress:</span>{" "}
                <span className="font-semibold text-primary-600">
                  {mockSkillBranches.reduce(
                    (sum, b) => sum + b.topics.filter((t) => t.status === "in_progress").length,
                    0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardBox>

      {/* Legends */}
      <div className="grid md:grid-cols-2 gap-4">
        <CardBox>
          <h5 className="font-medium text-sm text-gray-500 mb-3">Topic Status</h5>
          <Legend />
        </CardBox>
        <CardBox>
          <h5 className="font-medium text-sm text-gray-500 mb-3">Branches</h5>
          <BranchLegend />
        </CardBox>
      </div>

      {/* Skill Tree Flow */}
      <SkillTreeFlow branches={mockSkillBranches} onTopicClick={handleTopicClick} />

      {/* Usage Instructions */}
      <CardBox>
        <h5 className="font-medium mb-3">Controls</h5>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>
            <Icon icon="tabler:mouse" className="inline mr-2" />
            <strong>Pan:</strong> Click and drag the canvas
          </li>
          <li>
            <Icon icon="tabler:zoom-in" className="inline mr-2" />
            <strong>Zoom:</strong> Scroll or use the controls
          </li>
          <li>
            <Icon icon="tabler:pointer" className="inline mr-2" />
            <strong>Select:</strong> Click a topic node
          </li>
        </ul>
      </CardBox>
    </div>
  );
}

export default SkillTreeShowcase;
