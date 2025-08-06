// src/lib/prisma.ts
import { PrismaClient } from '@/generated/prisma'; // ✅ Import dari hasil generate

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Optional untuk debug query
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
