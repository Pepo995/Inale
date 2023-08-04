import { PrismaClient, type Prisma } from "@prisma/client";

import { env } from "~/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

/***********************************/
/* SOFT DELETE MIDDLEWARE */
/***********************************/

type WithDeleted = { deleted: Date | null };
type CustomParams = Omit<Prisma.MiddlewareParams, "args"> & {
  args?: { where?: WithDeleted; data?: WithDeleted };
};
prisma.$use(async (params: CustomParams, next) => {
  if (params.args === undefined) params.args = {};
  if (
    params.model == "Dairy" ||
    params.model === "DairyCheeseType" ||
    params.model === "CheeseType"
  ) {
    switch (params.action) {
      case "delete":
        params.action = "update";
        params.args.data = { deleted: new Date() };
        break;
      case "deleteMany":
        params.action = "updateMany";
        if (params.args.data !== undefined) {
          params.args.data.deleted = new Date();
        } else {
          params.args.data = { deleted: new Date() };
        }
        break;
      case "findUnique":
        params.action = "findFirst";
        params.args.where = { deleted: null, ...(params.args.where ?? {}) };
        break;
      case "findMany":
        params.args.where = { deleted: null, ...(params.args.where ?? {}) };
        break;
    }
  }
  return next(params as Prisma.MiddlewareParams);
});

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
