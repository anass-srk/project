import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.NODE_ENV === 'test' 
        ? process.env.DATABASE_URL_TEST || "postgresql://postgres:postgres@localhost:5432/transport_user_test"
        : process.env.DATABASE_URL
    }
  },
  // Add error formatting for better cross-platform error messages
  errorFormat: 'pretty',
  // Add logging configuration that works on both platforms
  log: process.env.NODE_ENV === 'test' ? [] : ['warn', 'error'],
});

export default prisma;