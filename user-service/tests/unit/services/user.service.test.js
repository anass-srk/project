import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import prisma from '../../mocks/prisma.js';
import { getProfile, updateProfile, getDrivers, createDriver, updateDriver, deleteDriver } from '../../../src/controllers/user.controller.js';
import { ValidationError, NotFoundError } from '../../../src/utils/errors.js';

vi.mock('bcryptjs');
vi.mock('../../../src/lib/prisma.js', () => {
  return { default: prisma };
});

describe('User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'PASSENGER',
        createdAt: new Date()
      };

      prisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const req = { user: { id: '123' } };
      const res = { json: vi.fn() };

      await getProfile(req, res, () => {});

      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error if user not found', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);

      const req = { user: { id: '123' } };
      const res = {};
      const next = vi.fn();

      await getProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUser = {
        id: '123',
        password: 'oldHash'
      };

      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@example.com'
      };

      prisma.user.update.mockResolvedValueOnce({
        ...mockUser,
        ...updateData
      });

      const req = {
        user: { id: '123' },
        body: updateData
      };
      const res = { json: vi.fn() };

      await updateProfile(req, res, () => {});

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: expect.objectContaining(updateData),
        select: expect.any(Object)
      });
    });

    it('should validate current password when changing password', async () => {
      const mockUser = {
        id: '123',
        password: 'oldHash'
      };

      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(false);

      const req = {
        user: { id: '123' },
        body: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          currentPassword: 'wrong',
          newPassword: 'newpass123'
        }
      };
      const res = {};
      const next = vi.fn();

      await updateProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('Driver Management', () => {
    describe('getDrivers', () => {
      it('should return all drivers', async () => {
        const mockDrivers = [
          { id: '1', role: 'DRIVER' },
          { id: '2', role: 'DRIVER' }
        ];

        prisma.user.findMany.mockResolvedValueOnce(mockDrivers);

        const req = {};
        const res = { json: vi.fn() };

        await getDrivers(req, res, () => {});

        expect(res.json).toHaveBeenCalledWith(mockDrivers);
      });
    });

    describe('createDriver', () => {
      it('should create a new driver', async () => {
        const mockDriver = {
          email: 'driver@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'Driver'
        };

        prisma.user.findUnique.mockResolvedValueOnce(null);
        bcrypt.hash.mockResolvedValueOnce('hashedPassword');
        prisma.user.create.mockResolvedValueOnce({
          ...mockDriver,
          id: '123',
          role: 'DRIVER'
        });

        const req = { body: mockDriver };
        const res = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn()
        };

        await createDriver(req, res, () => {});

        expect(res.status).toHaveBeenCalledWith(201);
        expect(prisma.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            ...mockDriver,
            password: 'hashedPassword',
            role: 'DRIVER'
          }),
          select: expect.any(Object)
        });
      });
    });

    describe('updateDriver', () => {
      it('should update driver details', async () => {
        const updateData = {
          email: 'updated@example.com',
          firstName: 'Updated',
          lastName: 'Driver'
        };

        prisma.user.update.mockResolvedValueOnce({
          id: '123',
          ...updateData,
          role: 'DRIVER'
        });

        const req = {
          params: { id: '123' },
          body: updateData
        };
        const res = { json: vi.fn() };

        await updateDriver(req, res, () => {});

        expect(prisma.user.update).toHaveBeenCalledWith({
          where: {
            id: '123',
            role: 'DRIVER'
          },
          data: expect.objectContaining(updateData),
          select: expect.any(Object)
        });
      });
    });

    describe('deleteDriver', () => {
      it('should delete a driver', async () => {
        prisma.user.delete.mockResolvedValueOnce({ id: '123' });

        const req = { params: { id: '123' } };
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() };

        await deleteDriver(req, res, () => {});

        expect(res.status).toHaveBeenCalledWith(204);
        expect(prisma.user.delete).toHaveBeenCalledWith({
          where: {
            id: '123',
            role: 'DRIVER'
          }
        });
      });
    });
  });
});