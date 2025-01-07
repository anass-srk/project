import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { userRoutes } from '../../src/routes/user.routes.js';
import prisma from '../../src/lib/prisma.js';
import bcrypt from 'bcryptjs';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Mock user for tests
const TEST_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'ADMIN',
  password: '$2a$10$mockHashedPassword'
};

describe('User Routes Integration Tests', () => {
  let authToken;

  beforeAll(() => {
    // Generate auth token for tests
    authToken = jwt.sign(
      { id: TEST_USER.id, email: TEST_USER.email, role: TEST_USER.role },
      process.env.JWT_SECRET
    );
  });

  beforeEach(async () => {
    // Clear database and create test user
    await prisma.user.deleteMany();
    await prisma.user.create({
      data: {...TEST_USER,password: await bcrypt.hash(TEST_USER.password,10)}
    });
  });

  describe('Profile Management', () => {
    describe('GET /api/users/profile', () => {
      it('should get user profile', async () => {
        const response = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          email: TEST_USER.email,
          firstName: TEST_USER.firstName,
          lastName: TEST_USER.lastName
        });
      });

      it('should return 401 without auth token', async () => {
        const response = await request(app)
          .get('/api/users/profile');

        expect(response.status).toBeGreaterThanOrEqual(401);
      });
    });

    describe('PUT /api/users/profile', () => {
      it('should update user profile', async () => {
        const updateData = {
          email: 'updated@example.com',
          firstName: 'Updated',
          lastName: 'User'
        };

        const response = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(updateData);
      });

      it('should update password when provided', async () => {
        const updateData = {
          email: TEST_USER.email,
          firstName: TEST_USER.firstName,
          lastName: TEST_USER.lastName,
          currentPassword: TEST_USER.password,
          newPassword: 'newpass123'
        };

        const response = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
      });
    });
  });

  describe('Driver Management', () => {
    describe('GET /api/users/drivers', () => {
      beforeEach(async () => {
        // Create test drivers
        await prisma.user.createMany({
          data: [
            {
              id: 'driver-1',
              email: 'driver1@example.com',
              firstName: 'Driver',
              lastName: 'One',
              role: 'DRIVER',
              password: TEST_USER.password
            },
            {
              id: 'driver-2',
              email: 'driver2@example.com',
              firstName: 'Driver',
              lastName: 'Two',
              role: 'DRIVER',
              password: TEST_USER.password
            }
          ]
        });
      });

      it('should get all drivers', async () => {
        const response = await request(app)
          .get('/api/users/drivers')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(2);
      });

      it('should require admin role', async () => {
        const userToken = jwt.sign(
          { id: 'user-id', email: 'user@example.com', role: 'PASSENGER' },
          process.env.JWT_SECRET
        );

        const response = await request(app)
          .get('/api/users/drivers')
          .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBeGreaterThanOrEqual(401);
      });
    });

    describe('POST /api/users/drivers', () => {
      it('should create a new driver', async () => {
        const newDriver = {
          email: 'newdriver@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'Driver'
        };

        const response = await request(app)
          .post('/api/users/drivers')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newDriver);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          email: newDriver.email,
          firstName: newDriver.firstName,
          lastName: newDriver.lastName,
          role: 'DRIVER'
        });
      });

      it('should validate duplicate email', async () => {
        const newDriver = {
          email: TEST_USER.email, // Duplicate email
          password: 'password123',
          firstName: 'New',
          lastName: 'Driver'
        };

        const response = await request(app)
          .post('/api/users/drivers')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newDriver);

        expect(response.status).toBeGreaterThanOrEqual(400);
      });
    });

    describe('PUT /api/users/drivers/:id', () => {
      let driverId;

      beforeEach(async () => {
        // Create test driver
        const driver = await prisma.user.create({
          data: {
            email: 'driver@example.com',
            password: TEST_USER.password,
            firstName: 'Test',
            lastName: 'Driver',
            role: 'DRIVER'
          }
        });
        driverId = driver.id;
      });

      it('should update a driver', async () => {
        const updateData = {
          email: 'updated@example.com',
          firstName: 'Updated',
          lastName: 'Driver'
        };

        const response = await request(app)
          .put(`/api/users/drivers/${driverId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(updateData);
      });
    });

    describe('DELETE /api/users/drivers/:id', () => {
      let driverId;

      beforeEach(async () => {
        // Create test driver
        const driver = await prisma.user.create({
          data: {
            email: 'driver@example.com',
            password: TEST_USER.password,
            firstName: 'Test',
            lastName: 'Driver',
            role: 'DRIVER'
          }
        });
        driverId = driver.id;
      });

      it('should delete a driver', async () => {
        const response = await request(app)
          .delete(`/api/users/drivers/${driverId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(204);

        // Verify deletion
        const driver = await prisma.user.findUnique({
          where: { id: driverId }
        });
        expect(driver).toBeNull();
      });
    });
  });
});