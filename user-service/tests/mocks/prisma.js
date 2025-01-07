import { vi } from 'vitest';

const prisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
  },
  $executeRawUnsafe: vi.fn(),
  $disconnect: vi.fn(),
};

export default prisma;