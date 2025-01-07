import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

/**
 * @typedef {Object} StopData
 * @property {number} order - Order of the stop in the route
 * @property {string} name - Name of the stop
 * @property {number} latitude - Latitude coordinate of the stop
 * @property {number} longitude - Longitude coordinate of the stop
 * @property {string} arrivalTime - Arrival time at the stop (HH:mm format)
 */

/**
 * @typedef {Object} RouteData
 * @property {string} name - Name of the route
 * @property {string} duration - Duration of the route (HH:mm format)
 * @property {StopData[]} stops - Array of stops in the route
 */

const stopSchema = z.object({
  order: z.number().int().min(0),
  name: z.string().min(1, 'Stop name is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  arrivalTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
});

const routeSchema = z.object({
  name: z.string().min(3, 'Route name must be at least 3 characters'),
  duration: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid duration format (HH:mm)'),
  stops: z.array(stopSchema).min(2, 'Route must have at least 2 stops'),
});

/**
 * Validate route creation/update request middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
export const validateRoute = (req, res, next) => {
  try {
    const data = {
      ...req.body,
      stops: req.body.stops.map(stop => ({
        ...stop,
        order: Number(stop.order),
        latitude: Number(stop.latitude),
        longitude: Number(stop.longitude),
      })),
    };
    routeSchema.parse(data);
    req.validatedData = data;
    next();
  } catch (error) {
    next(new ValidationError(error.errors));
  }
};