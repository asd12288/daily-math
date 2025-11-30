"use server";

import { createCallerFactory } from "./init";
import { appRouter } from "./routers/_app";
import { createContext } from "./init";

// Create server-side caller
const createCaller = createCallerFactory(appRouter);

export const api = async () => {
  const context = await createContext();
  return createCaller(context);
};
