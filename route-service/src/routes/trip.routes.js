import { Router } from 'express';
import { getAllTrips, getTripById, getTripsByIds, createTrip, updateTrip, deleteTrip, getAvailableResources, getUpcomingTrips } from '../controllers/trip.controller.js';
import { validateTrip, validateTripUpdate } from '../validators/trip.validator.js';

/**
 * Express router for trip-related endpoints
 * @type {import('express').Router}
 */
const router = Router();

/**
 * GET /trips
 * @description Get all trips, optionally filtered by date
 * @param {string} [date] - Optional date filter (YYYY-MM-DD)
 * @returns {Promise<Array<import('@prisma/client').Trip & { route: import('@prisma/client').Route & { stops: import('@prisma/client').Stop[] }, bus: import('@prisma/client').Bus }>>}
 */
router.get('/', getAllTrips);

/**
 * GET /trips/by-ids
 * @description Get trips by IDs
 * @param {string} ids - Comma-separated list of trip IDs
 * @returns {Promise<Array<import('@prisma/client').Trip & { route: import('@prisma/client').Route & { stops: import('@prisma/client').Stop[] }, bus: import('@prisma/client').Bus }>>}
 */
router.get('/by-ids', getTripsByIds);

/**
 * GET /trips/available-resources
 * @description Get available drivers and buses for a specific date
 * @param {string} date - Date to check availability (YYYY-MM-DD)
 * @returns {Promise<{ busyDriverIds: string[], busyBusIds: number[], availableBuses: import('@prisma/client').Bus[] }>}
 */
router.get('/available-resources', getAvailableResources);

/**
 * GET /trips/upcoming
 * @description Get upcoming trips from a specific date
 * @param {string} startDate - Start date to filter trips (YYYY-MM-DD)
 * @returns {Promise<Array<import('@prisma/client').Trip & { route: import('@prisma/client').Route & { stops: import('@prisma/client').Stop[] }, bus: import('@prisma/client').Bus }>>}
 */
router.get('/upcoming', getUpcomingTrips);

/**
 * GET /trips/:id
 * @description Get a single trip by ID
 * @param {string} id - Trip ID
 * @returns {Promise<import('@prisma/client').Trip & { route: import('@prisma/client').Route & { stops: import('@prisma/client').Stop[] }, bus: import('@prisma/client').Bus }>}
 */
router.get('/:id', getTripById);


/**
 * POST /trips
 * @description Create a new trip
 * @param {import('../validators/trip.validator.js').TripData} body - Trip data
 * @returns {Promise<import('@prisma/client').Trip>}
 */
router.post('/', validateTrip, createTrip);

/**
 * PUT /trips/:id
 * @description Update an existing trip
 * @param {string} id - Trip ID
 * @param {import('../validators/trip.validator.js').TripUpdateData} body - Trip update data
 * @returns {Promise<import('@prisma/client').Trip>}
 */
router.put('/:id', validateTripUpdate, updateTrip);

/**
 * DELETE /trips/:id
 * @description Delete a trip
 * @param {string} id - Trip ID
 * @returns {Promise<void>}
 */
router.delete('/:id', deleteTrip);

export { router as tripRoutes };