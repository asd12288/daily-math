"use client";

import { Icon } from "@iconify/react";

interface TopicBadgeProps {
  topic: string;
  icon?: string;
  variant?: "default" | "active" | "completed" | "locked";
  size?: "sm" | "md";
}

export function TopicBadge({
  topic,
  icon,
  variant = "default",
  size = "md",
}: TopicBadgeProps) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    active: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 ring-2 ring-primary-500",
    completed: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300",
    locked: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
  };

  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
  };

  const statusIcons = {
    default: null,
    active: "tabler:player-play-filled",
    completed: "tabler:circle-check-filled",
    locked: "tabler:lock",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {icon && <Icon icon={icon} className={iconSizes[size]} />}
      {topic}
      {statusIcons[variant] && (
        <Icon icon={statusIcons[variant]!} className={`${iconSizes[size]} ms-1`} />
      )}
    </span>
  );
}

// Topic progress list
export function TopicList() {
  const topics = [
    { name: "Limits", status: "completed" as const, progress: 100 },
    { name: "Derivatives", status: "completed" as const, progress: 100 },
    { name: "Chain Rule", status: "active" as const, progress: 60 },
    { name: "Integrals", status: "locked" as const, progress: 0 },
    { name: "Integration by Parts", status: "locked" as const, progress: 0 },
  ];

  return (
    <div className="space-y-3">
      {topics.map((topic) => (
        <div
          key={topic.name}
          className={`flex items-center justify-between p-3 rounded-lg ${
            topic.status === "locked"
              ? "bg-gray-50 dark:bg-gray-800/50"
              : "bg-white dark:bg-gray-800"
          } border border-gray-200 dark:border-gray-700`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                topic.status === "completed"
                  ? "bg-success-100 text-success-600"
                  : topic.status === "active"
                  ? "bg-primary-100 text-primary-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Icon
                icon={
                  topic.status === "completed"
                    ? "tabler:check"
                    : topic.status === "active"
                    ? "tabler:player-play"
                    : "tabler:lock"
                }
                className="text-lg"
              />
            </div>
            <span
              className={`font-medium ${
                topic.status === "locked" ? "text-gray-400" : "text-gray-900 dark:text-white"
              }`}
            >
              {topic.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {topic.status !== "locked" && (
              <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    topic.status === "completed" ? "bg-success-500" : "bg-primary-500"
                  }`}
                  style={{ width: `${topic.progress}%` }}
                />
              </div>
            )}
            <span className="text-sm text-gray-500 w-10 text-end">{topic.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Showcase
export function TopicBadgeShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Topic Badges</p>
        <div className="flex flex-wrap gap-2">
          <TopicBadge topic="Derivatives" variant="default" />
          <TopicBadge topic="Chain Rule" variant="active" icon="tabler:flame" />
          <TopicBadge topic="Limits" variant="completed" />
          <TopicBadge topic="Integration" variant="locked" />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Topic Progress List</p>
        <TopicList />
      </div>
    </div>
  );
}
