// modules/onboarding/index.ts
// Public API for the Onboarding module

// Types
export * from "./types";

// Hooks (client-side only)
export * from "./hooks";

// UI Components
export { OnboardingWizard } from "./ui";

// NOTE: Server-side exports (Router, Services) are in ./server/index.ts
// Import them separately: import { onboardingRouter } from "@/modules/onboarding/server"
