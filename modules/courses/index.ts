// Public API for the Courses module
// NOTE: Server-side exports (coursesRouter, coursesService) are in ./server/index.ts
// Import them separately: import { coursesRouter } from "@/modules/courses/server"

// Config
export * from "./config";

// Types
export * from "./types";

// Hooks
export * from "./hooks";

// UI Components
export { CourseCard } from "./ui/components";
export { CoursesView, CourseDetailView } from "./ui/views";
