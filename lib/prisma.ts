// lib/prisma.ts
import { PrismaClient } from "./generated/prisma";

// Declare a global variable to store the PrismaClient instance in development.
// This prevents multiple instances from being created during hot-reloading.
declare global {
	var __prisma: PrismaClient | undefined;
}

// In production, always create a new PrismaClient instance.
// In development, reuse the global instance if it exists, otherwise create one.
const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalThis.__prisma = prisma;
}

export default prisma;
