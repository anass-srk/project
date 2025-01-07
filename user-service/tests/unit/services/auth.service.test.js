import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../mocks/prisma.js';
import { register, login } from '../../../src/controllers/auth.controller.js';
import { ValidationError } from '../../../src/utils/errors.js';

vi.mock('bcryptjs');
vi.mock('jsonwebtoken');
vi.mock('../../../src/lib/prisma.js', () => {
  return {
    default: prisma
  };
});

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'PASSENGER'
      };

      const mockCreatedUser = {
        id: '123',
        ...mockUser,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prisma.user.findUnique.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce('hashedPassword');
      prisma.user.create.mockResolvedValueOnce(mockCreatedUser);

      const req = { body: mockUser };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      await register(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(201);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: mockUser.email,
          password: 'hashedPassword'
        }),
        select: expect.any(Object)
      });
    });

    it('should throw error if email already exists', async () => {
      const mockUser = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'PASSENGER'
      };

      prisma.user.findUnique.mockResolvedValueOnce({ id: '123', ...mockUser });

      const req = { body: mockUser };
      const res = {};
      const next = vi.fn();

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'PASSENGER'
      };

      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('mockToken');

      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const res = { json: vi.fn() };

      await login(req, res, () => {});

      expect(res.json).toHaveBeenCalledWith({
        token: 'mockToken',
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email
        })
      });
    });

    it('should throw error for invalid credentials', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);

      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      };
      const res = {};
      const next = vi.fn();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should throw error for incorrect password', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'PASSENGER'
      };

      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(false);

      const req = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      };
      const res = {};
      const next = vi.fn();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});