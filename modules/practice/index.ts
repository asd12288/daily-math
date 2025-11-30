// modules/practice/index.ts
// Public API for the Practice module

// Types
export * from "./types";

// Hooks (client-side only)
export * from "./hooks";

// UI Components
export { ProblemCard, AnswerInput, DailySetOverview, PracticeView } from "./ui";

// NOTE: Server-side exports (Router, Service) are in ./server/index.ts
// Import them separately: import { practiceRouter } from "@/modules/practice/server"
