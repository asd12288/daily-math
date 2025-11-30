// modules/gamification/index.ts
// Public API for the gamification module

// Types
export * from "./types/gamification.types";

// Hooks
export * from "./hooks";

// UI Components and Context
export * from "./ui";

// Server procedures (for tRPC router composition)
export { gamificationRouter } from "./server/procedures";
