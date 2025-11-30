// trpc/init.ts
// tRPC initialization with Appwrite session integration

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { getSession, type SessionData } from "@/lib/dal";
import type { UserRole } from "@/lib/appwrite/types";

// Context type - session is null if not authenticated
export interface Context {
  session: SessionData | null;
}

/**
 * Create context - runs on every tRPC request
 * Fetches the session from Appwrite using the DAL
 */
export const createContext = async (): Promise<Context> => {
  const session = await getSession();
  return { session };
};

// Initialize tRPC with context and superjson transformer
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Export reusable router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Public procedure - no authentication required
 * Use for login, register, public data, etc.
 */
export const publicProcedure = t.procedure;

/**
 * Base procedure - alias for publicProcedure
 */
export const baseProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 * Throws UNAUTHORIZED if user is not logged in
 * ctx.session is guaranteed to be non-null in the handler
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session, // Now typed as non-null SessionData
    },
  });
});

/**
 * Role checker middleware factory
 * Creates a middleware that checks if the user has one of the allowed roles
 * Reusable for creating role-specific procedures
 */
const requireRole = (allowedRoles: UserRole[]) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      });
    }

    console.log(`[tRPC requireRole] User ${ctx.session.userId} has role: "${ctx.session.role}", allowed: ${JSON.stringify(allowedRoles)}`);

    if (!allowedRoles.includes(ctx.session.role)) {
      console.log(`[tRPC requireRole] FORBIDDEN - role "${ctx.session.role}" not in ${JSON.stringify(allowedRoles)}`);
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource",
      });
    }

    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
      },
    });
  });

/**
 * Admin procedure - requires admin role
 * Throws FORBIDDEN if user is not an admin
 * Use for admin-only operations like managing questions, users, etc.
 */
export const adminProcedure = protectedProcedure.use(requireRole(["admin"]));
