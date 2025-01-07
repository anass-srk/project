import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

const preferenceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  channel: z.enum(['EMAIL', 'SMS']),
  enabledNotificationTypes: z.array(z.enum(['TICKET_PURCHASE', 'TRIP_CANCELLATION'])).min(1, 'At least one notification type is required'),
});

/**
 * Validate notification preference update request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
export const validatePreferences = (req, res, next) => {
  try {
    const data = req.body;
    preferenceSchema.parse(data);
    req.validatedData = data;
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};