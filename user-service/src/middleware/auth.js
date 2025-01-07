/**
 * Authentication middleware factory
 * @param {string[]} [roles=[]] - Array of roles allowed to access the route
 * @returns {import('express').RequestHandler} Express middleware function
 */
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors.js';

export const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        throw new UnauthorizedError('Authentication required');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        throw new UnauthorizedError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(new UnauthorizedError('Invalid token'));
    }
  };
};