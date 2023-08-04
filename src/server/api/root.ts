import { createTRPCRouter } from "@api/trpc";
import { batchesRouter } from "./routers/batches";
import { dairiesRouter } from "./routers/dairies";
import { cheeseTypesRouter } from "./routers/cheeseTypes";
import { usersRouter } from "./routers/users";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  batches: batchesRouter,
  dairies: dairiesRouter,
  cheeseTypes: cheeseTypesRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
