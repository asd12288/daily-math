"use client";

import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "./routers/_app";

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();
