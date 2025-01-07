import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

/**
 * @typedef {Object} ProfileUpdateData
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} email - User's email address
 * @property {string} [currentPassword] - Current password (required for password change)
 * @property {string} [newPassword] - New password (must be at least 6 characters)
 */

/**
 * @typedef {Object} CreateDriverData
 * @property {string} email - Driver's email address
 * @property {string} password - Driver's password
 * @property {string} firstName - Driver's first name
 * @property {string} lastName - Driver's last name
 */

/**
 * @typedef {Object} UpdateDriverData
 * @property {string} email - Driver's email address
 * @property {string} firstName - Driver's first name
 * @property {string} lastName - Driver's last name
 * @property {string} [password] - Optional new password
 */

const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required when setting a new password',
  path: ['currentPassword'],
});

const createDriverSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

const updateDriverSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

/**
 * Validate profile update request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const validateUpdateProfile = (req, res, next) => {
  try {
    updateProfileSchema.parse(req.body);
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};

/**
 * Validate create driver request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const validateCreateDriver = (req, res, next) => {
  try {
    createDriverSchema.parse(req.body);
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};

/**
 * Validate update driver request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const validateUpdateDriver = (req, res, next) => {
  try {
    updateDriverSchema.parse(req.body);
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};