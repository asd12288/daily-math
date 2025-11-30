// modules/gamification/server/procedures.ts
// tRPC router for gamification (XP, levels, streaks)

import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/trpc/init";
import { UserProfileService, XP_LEVELS } from "./services/user-profile.service";

export const gamificationRouter = createTRPCRouter({
  /**
   * Get current user's gamification stats
   * Returns XP, level, streak, and progress to next level
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await UserProfileService.getUserStats(ctx.session.userId);

    if (!stats) {
      return {
        totalXp: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        levelTitle: "Beginner",
        levelTitleHe: "מתחיל",
        xpToNextLevel: 100,
        progressToNextLevel: 0,
      };
    }

    return stats;
  }),

  /**
   * Get all level definitions (public)
   * Used for displaying level progression UI
   */
  getLevels: publicProcedure.query(() => {
    return {
      levels: XP_LEVELS.map((level, index) => ({
        ...level,
        icon: getLevelIcon(level.level),
        xpToNext: index < XP_LEVELS.length - 1 ? XP_LEVELS[index + 1].xpRequired : null,
      })),
    };
  }),

  /**
   * Get level info for a specific level
   */
  getLevelInfo: publicProcedure
    .input((val: unknown) => {
      if (typeof val !== "number" || val < 1 || val > 10) {
        throw new Error("Level must be between 1 and 10");
      }
      return val;
    })
    .query(({ input }) => {
      const levelInfo = XP_LEVELS.find((l) => l.level === input);
      if (!levelInfo) {
        return XP_LEVELS[0];
      }
      return {
        ...levelInfo,
        icon: getLevelIcon(input),
      };
    }),
});

/**
 * Get icon for a level (matching design-showcase mock data)
 */
function getLevelIcon(level: number): string {
  const icons: Record<number, string> = {
    1: "tabler:seedling",
    2: "tabler:book",
    3: "tabler:brain",
    4: "tabler:target",
    5: "tabler:school",
    6: "tabler:award",
    7: "tabler:crown",
    8: "tabler:diamond",
    9: "tabler:star",
    10: "tabler:sun",
  };
  return icons[level] || "tabler:star";
}

export type GamificationRouter = typeof gamificationRouter;
