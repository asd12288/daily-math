// modules/skill-tree/index.ts
// Public API for the Skill Tree module

// Config
export * from "./config";

// Types
export * from "./types";

// Hooks (client-side only)
export * from "./hooks";

// UI Components
export { TopicNode, BranchCard, SkillTreeView } from "./ui";
export { SkillFlowNode, SkillTreeFlow, SkillTreeFlowContainer } from "./ui/components/flow";

// NOTE: Server-side exports (Router, Service) are in ./server/index.ts
// Import them separately: import { skillTreeRouter } from "@/modules/skill-tree/server"
