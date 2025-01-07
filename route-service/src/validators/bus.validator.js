import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

/**
 * @typedef {Object} BusData
 * @property {string} registrationNumber - Unique registration number of the bus
 * @property {number} seats - Number of seats in the bus
 */

const busSchema = z.object({
  registrationNumber: z.string().min(3, 'Registration number must be at least 3 characters'),
  seats: z.number().int().min(1, 'Number of seats must be at least 1'),
});

/**
 * Validate bus creation/update request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
export const validateBus = (req, res, next) => {
  try {
    const data = {
      ...req.body,
      seats: Number(req.body.seats),
    };
    busSchema.parse(data);
    req.validatedData = data;
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};