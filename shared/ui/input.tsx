"use client";

import * as React from "react";
import { Icon } from "@iconify/react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: string;
  iconPosition?: "start" | "end";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, icon, iconPosition = "start", id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const baseInputStyles = `
      block w-full py-2.5
      border rounded-lg
      text-gray-900 dark:text-white
      placeholder-gray-400 dark:placeholder-gray-500
      bg-white dark:bg-gray-900
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
      disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
      transition-colors
    `;

    const errorStyles = error
      ? "border-error-500 focus:ring-error-500 focus:border-error-500"
      : "border-gray-300 dark:border-gray-600";

    const paddingStyles = icon
      ? iconPosition === "start"
        ? "ps-10 pe-4"
        : "ps-4 pe-10"
      : "px-4";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "start" && (
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Icon
                icon={icon}
                height={18}
                className={error ? "text-error-500" : "text-gray-400 dark:text-gray-500"}
              />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`${baseInputStyles} ${errorStyles} ${paddingStyles} ${className}`}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {icon && iconPosition === "end" && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
              <Icon
                icon={icon}
                height={18}
                className={error ? "text-error-500" : "text-gray-400 dark:text-gray-500"}
              />
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-error-600 dark:text-error-400">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
