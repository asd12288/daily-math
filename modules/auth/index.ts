// Public API for the Auth module
// NOTE: Server-side exports (authRouter, AuthService) are in ./server/index.ts
// Import them separately: import { authRouter } from "@/modules/auth/server"

// Config
export * from "./config";

// Types
export * from "./types";

// Validation
export * from "./lib/validation";

// Hooks
export * from "./hooks";

// UI Components
export { LoginForm, RegisterForm, ForgotPasswordForm } from "./ui/components/forms";
export { LoginView, RegisterView, ForgotPasswordView } from "./ui/views";
