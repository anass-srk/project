import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

/**
 * @typedef {Object} SubscriptionTypeData
 * @property {string} name - Name of the subscription type
 * @property {number} duration - Duration in days
 * @property {string} availabilityStartDate - Start date when the subscription type is available
 * @property {string} availabilityEndDate - End date when the subscription type is no longer available
 * @property {number} price - Price of the subscription type
 * @property {number} discount - Discount applicable to the subscription type
 */

const subscriptionTypeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  duration: z.number().int().positive('Duration must be a positive number'),
  availabilityStartDate: z.string().datetime('Invalid start date'),
  availabilityEndDate: z.string().datetime('Invalid end date'),
  price: z.number().positive('Price must be greater than 0'),
  discount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
}).refine((data) => {
  const startDate = new Date(data.availabilityStartDate);
  const endDate = new Date(data.availabilityEndDate);
  return startDate < endDate;
}, {
  message: 'End date must be after start date',
  path: ['availabilityEndDate'],
});

/**
 * Validate subscription type creation/update request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
export const validateSubscriptionType = (req, res, next) => {
  try {
    const data = {
      ...req.body,
      duration: Number(req.body.duration),
      price: Number(req.body.price),
      discount: Number(req.body.discount),
    };
    subscriptionTypeSchema.parse(data);
    req.validatedData = data;
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};