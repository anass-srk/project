import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

/**
 * @typedef {Object} SubscriptionData
 * @property {string} userId - User ID
 * @property {number} subscriptionTypeId - Subscription type ID
 */

const subscriptionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  subscriptionTypeId: z.number().int().positive('Subscription type ID is required'),
});

/**
 * Validate subscription creation request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
export const validateSubscription = (req, res, next) => {
  try {
    const data = {
      ...req.body,
      subscriptionTypeId: Number(req.body.subscriptionTypeId),
    };
    subscriptionSchema.parse(data);
    req.validatedData = data;
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};