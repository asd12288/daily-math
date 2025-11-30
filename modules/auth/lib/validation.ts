import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
});

// Transform for service - map name to displayName
export type RegisterSchema = z.infer<typeof registerSchema> & { displayName?: string };

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

// i18n-aware schema factories
export const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().min(1, t("auth.errors.emailRequired")).email(t("auth.errors.emailInvalid")),
    password: z.string().min(1, t("auth.errors.passwordRequired")),
  });

export const createRegisterSchema = (t: (key: string) => string) =>
  z
    .object({
      email: z.string().min(1, t("auth.errors.emailRequired")).email(t("auth.errors.emailInvalid")),
      password: z
        .string()
        .min(1, t("auth.errors.passwordRequired"))
        .min(8, t("auth.errors.passwordMin")),
      confirmPassword: z.string().min(1, t("auth.errors.passwordRequired")),
      displayName: z.string().min(1, t("auth.errors.displayNameRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.errors.passwordMismatch"),
      path: ["confirmPassword"],
    });
