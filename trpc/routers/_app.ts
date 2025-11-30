import { createTRPCRouter } from "../init";
import { authRouter } from "@/modules/auth/server/procedures";
import { dashboardRouter } from "@/modules/dashboard/server/procedures";
import { skillTreeRouter } from "@/modules/skill-tree/server/procedures";
import { practiceRouter } from "@/modules/practice/server/procedures";
import { aiRouter } from "@/modules/ai/server/procedures";
import { onboardingRouter } from "@/modules/onboarding/server/procedures";
import { coursesRouter } from "@/modules/courses/server/procedures";
import { settingsRouter } from "@/modules/settings/server/procedures";
import { adminRouter } from "@/modules/admin/server/procedures";
import { gamificationRouter } from "@/modules/gamification/server/procedures";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  dashboard: dashboardRouter,
  skillTree: skillTreeRouter,
  practice: practiceRouter,
  ai: aiRouter,
  onboarding: onboardingRouter,
  courses: coursesRouter,
  settings: settingsRouter,
  admin: adminRouter,
  gamification: gamificationRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
