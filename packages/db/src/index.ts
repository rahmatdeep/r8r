import { PrismaClient } from "@prisma/client";
export type { JsonObject } from "@prisma/client/runtime/library.js";

export const prisma = new PrismaClient();
