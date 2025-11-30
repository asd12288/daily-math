"use client";

import { useToast } from "@/shared/hooks";
import { Icon } from "@iconify/react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

const variantIcons = {
  default: null,
  success: "tabler:check",
  error: "tabler:x",
  warning: "tabler:alert-triangle",
};

const variantIconColors = {
  default: "",
  success: "text-success-600 dark:text-success-400",
  error: "text-error-600 dark:text-error-400",
  warning: "text-warning-600 dark:text-warning-400",
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const variantKey = variant ?? "default";
        const icon = variantIcons[variantKey];
        const iconColor = variantIconColors[variantKey];

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              {icon && (
                <div className={`shrink-0 ${iconColor}`}>
                  <Icon icon={icon} className="h-5 w-5" />
                </div>
              )}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
