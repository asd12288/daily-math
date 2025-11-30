"use client";

import { Icon } from "@iconify/react";

interface XPBadgeProps {
  xp: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  variant?: "default" | "earned" | "bonus";
}

export function XPBadge({ xp, size = "md", showIcon = true, variant = "default" }: XPBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  const variantClasses = {
    default: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
    earned: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300",
    bonus: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",
  };

  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {showIcon && <Icon icon="tabler:star-filled" className={iconSizes[size]} />}
      {variant === "earned" && "+"}
      {xp} XP
    </span>
  );
}
