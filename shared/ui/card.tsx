import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "flat";
}

export function Card({ className = "", variant = "default", children, ...props }: CardProps) {
  const variants = {
    default: "bg-white dark:bg-gray-900 shadow-md dark:shadow-dark-md",
    bordered: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
    flat: "bg-gray-50 dark:bg-gray-800",
  };

  return (
    <div
      className={`rounded-xl p-6 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export function CardHeader({ className = "", bordered = false, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={`mb-4 ${bordered ? "pb-4 border-b border-gray-200 dark:border-gray-700" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export function CardFooter({ className = "", bordered = false, children, ...props }: CardFooterProps) {
  return (
    <div
      className={`mt-6 ${bordered ? "pt-4 border-t border-gray-200 dark:border-gray-700" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
