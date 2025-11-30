// modules/auth/server/procedures.ts
// tRPC auth router with procedures for login, register, logout

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from "../lib/validation";
import { AuthService } from "./services/auth.service";

export const authRouter = createTRPCRouter({
  /**
   * Login with email and password
   * Public procedure - no auth required
   */
  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    const result = await AuthService.login(input);

    if (result.error) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: result.error,
      });
    }

    return { success: true };
  }),

  /**
   * Register a new user
   * Public procedure - no auth required
   */
  register: publicProcedure.input(registerSchema).mutation(async ({ input }) => {
    const result = await AuthService.register({
      ...input,
      displayName: input.name,
    });

    if (result.error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: result.error,
      });
    }

    return { success: true };
  }),

  /**
   * Logout current user
   * Public procedure - handles its own session cleanup
   */
  logout: publicProcedure.mutation(async () => {
    await AuthService.logout();
    return { success: true };
  }),

  /**
   * Send password reset email
   * Public procedure - no auth required
   */
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input }) => {
      await AuthService.sendPasswordReset(input.email);
      // Always return success for security (don't reveal if email exists)
      return { success: true };
    }),

  /**
   * Get current authenticated user
   * Protected procedure - requires authentication
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    // ctx.session is guaranteed to exist due to protectedProcedure middleware
    return ctx.session;
  }),

  /**
   * Check if user is authenticated (for client-side checks)
   * Public procedure - returns session or null
   */
  getSession: publicProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),
});
