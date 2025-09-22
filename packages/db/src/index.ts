import { PrismaClient } from "@prisma/client";
export type { JsonObject } from "@prisma/client/runtime/library";

export const prisma = new PrismaClient();
