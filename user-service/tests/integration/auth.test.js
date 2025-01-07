import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';

describe.sequential('Auth Integration Tests', () => {
  describe.sequential('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test2@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'PASSENGER'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      });
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('id');
    });

    it('should return validation error for invalid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123',
          firstName: '',
          lastName: '',
          role: 'INVALID'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should prevent duplicate email registration', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'PASSENGER'
      };

      // First registration
      const resp = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Attempt duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Error');
      expect(response.body.details[0].field).toBe('email');
    });
  });
});