import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

/**
 * @typedef {Object} TicketData
 * @property {boolean} roundTrip - Whether the ticket is round trip
 * @property {number} price - Ticket price
 * @property {string} userId - ID of the user purchasing the ticket
 * @property {number[]} tripIds - Array of trip IDs
 */

/**
 * @typedef {Object} CancellationData
 * @property {string} reason - Reason for cancellation
 */

const ticketSchema = z.object({
  roundTrip: z.boolean(),
  price: z.number().positive('Price must be greater than 0'),
  userId: z.string().min(1, 'User ID is required'),
  tripIds: z.array(z.number().int().positive()).min(1, 'At least one trip is required'),
});

const cancellationSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
});

/**
 * Validate ticket creation request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
export const validateTicket = (req, res, next) => {
  try {
    const data = {
      ...req.body,
      price: Number(req.body.price),
      tripIds: req.body.tripIds.map(Number),
    };
    ticketSchema.parse(data);
    req.validatedData = data;
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};

/**
 * Validate ticket cancellation request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
export const validateCancellation = (req, res, next) => {
  try {
    cancellationSchema.parse(req.body);
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};