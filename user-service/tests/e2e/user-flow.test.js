import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index.js';

describe('User Flow E2E Tests', () => {
  let authToken;
  let userId;

  describe('Complete User Journey', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'e2e@example.com',
          password: 'password123',
          firstName: 'E2E',
          lastName: 'Test',
          role: 'PASSENGER'
        });

      expect(response.status).toBe(201);
      userId = response.body.id;
    });

    it('should login with the registered user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'e2e@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });

    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        email: 'e2e@example.com',
        firstName: 'E2E',
        lastName: 'Test'
      });
    });

    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'e2e@example.com',
          firstName: 'Updated',
          lastName: 'Name',
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        firstName: 'Updated',
        lastName: 'Name'
      });
    });

    it('should login with new password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'e2e@example.com',
          password: 'newpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });
});