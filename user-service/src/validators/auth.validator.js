/**
 * @typedef {Object} RegisterValidationSchema
 * @property {string} email - User's email address
 * @property {string} password - User's password
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {('PASSENGER'|'DRIVER')} role - User's role
 */

/**
 * @typedef {Object} LoginValidationSchema
 * @property {string} email - User's email address
 * @property {string} password - User's password
 */

import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['PASSENGER', 'DRIVER']),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Validate registration request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const validateRegister = (req, res, next) => {
  try {
    registerSchema.parse(req.body);
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};

/**
 * Validate login request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const validateLogin = (req, res, next) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};