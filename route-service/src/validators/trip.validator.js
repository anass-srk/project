import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

/**
 * @typedef {Object} TripData
 * @property {number} routeId - ID of the route for this trip
 * @property {string} departureTime - Departure time (ISO datetime)
 * @property {string} duration - Duration of the trip (HH:mm format)
 * @property {number} price - Price of the trip
 * @property {string} driverId - ID of the assigned driver
 * @property {number} busId - ID of the assigned bus
 */

/**
 * @typedef {Object} TripUpdateData
 * @property {number} [routeId] - ID of the route for this trip
 * @property {string} [departureTime] - Departure time (ISO datetime)
 * @property {string} [duration] - Duration of the trip (HH:mm format)
 * @property {number} [price] - Price of the trip
 * @property {string} [driverId] - ID of the assigned driver
 * @property {number} [busId] - ID of the assigned bus
 * @property {('PENDING'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED')} [status] - Status of the trip
 * @property {number} [availablePlaces] - Number of available places
 */

const tripSchema = z.object({
  routeId: z.number().int().positive('Route ID is required'),
  departureTime: z.string().datetime('Invalid departure time'),
  duration: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid duration format (HH:mm)'),
  price: z.number().positive('Price must be greater than 0'),
  driverId: z.string().min(1, 'Driver ID is required'),
  busId: z.number().int().positive('Bus ID is required'),
});

const tripUpdateSchema = tripSchema.partial().extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  availablePlaces: z.number().int().min(0, 'Available places cannot be negative').optional(),
});

/**
 * Validate trip creation request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
export const validateTrip = (req, res, next) => {
  try {
    const data = {
      ...req.body,
      routeId: Number(req.body.routeId),
      price: Number(req.body.price),
      busId: Number(req.body.busId),
    };
    tripSchema.parse(data);
    req.validatedData = data;
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};

/**
 * Validate trip update request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
export const validateTripUpdate = (req, res, next) => {
  try {
    const data = {
      ...req.body,
      routeId: req.body.routeId ? Number(req.body.routeId) : undefined,
      price: req.body.price ? Number(req.body.price) : undefined,
      busId: req.body.busId ? Number(req.body.busId) : undefined,
      availablePlaces: req.body.availablePlaces ? Number(req.body.availablePlaces) : undefined,
    };
    tripUpdateSchema.parse(data);
    req.validatedData = data;
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};