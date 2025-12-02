import { PrismaClient } from '@prisma/client';

export const prisma =
  globalThis.prisma ||
  new PrismaClient();

// Exporter PrismaClient pour l'authentification (sans omit pour vérifier le password)  
export const prismaAuth = 
  globalThis.prismaAuth ||
  new PrismaClient();

declare global {
  var prisma: PrismaClient | undefined;
  var prismaAuth: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma;
  globalThis.prismaAuth = prismaAuth;
}

// Exporter aussi la classe PrismaClient
export { PrismaClient } from '@prisma/client';
