import { PrismaClient } from '@prisma/client';

/**
 * Prisma client instance for database operations
 * @type {import('@prisma/client').PrismaClient}
 */
const prisma = new PrismaClient();

export default prisma;