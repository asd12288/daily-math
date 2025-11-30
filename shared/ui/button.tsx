"use client";

import * as React from "react";
import { Icon } from "@iconify/react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: string;
  iconPosition?: "start" | "end";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading,
      icon,
      iconPosition = "start",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700",
      secondary:
        "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500 dark:bg-secondary-900/30 dark:text-secondary-300 dark:hover:bg-secondary-900/50",
      outline:
        "border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500 text-gray-700 dark:text-gray-300",
      ghost:
        "hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500 text-gray-700 dark:text-gray-300",
      destructive:
        "bg-error-600 text-white hover:bg-error-700 focus:ring-error-500",
      success:
        "bg-success-600 text-white hover:bg-success-700 focus:ring-success-500",
      warning:
        "bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2",
    };

    const iconSizes = {
      sm: 14,
      md: 16,
      lg: 18,
    };

    const renderIcon = () => {
      if (isLoading) {
        return (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      }
      if (icon) {
        return <Icon icon={icon} height={iconSizes[size]} />;
      }
      return null;
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {iconPosition === "start" && renderIcon()}
        {isLoading ? "Loading..." : children}
        {iconPosition === "end" && !isLoading && renderIcon()}
      </button>
    );
  }
);

Button.displayName = "Button";
