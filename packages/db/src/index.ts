import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __tracePrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__tracePrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__tracePrisma = prisma;
}

export type { Prisma } from "@prisma/client";
