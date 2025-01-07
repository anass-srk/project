import { Router } from 'express';
import { getAllRoutes, getRouteById, createRoute, updateRoute, deleteRoute } from '../controllers/route.controller.js';
import { validateRoute } from '../validators/route.validator.js';

/**
 * Express router for route-related endpoints
 * @type {import('express').Router}
 */
const router = Router();

/**
 * GET /routes
 * @description Get all routes with their stops
 * @returns {Promise<Array<import('@prisma/client').Route & { stops: import('@prisma/client').Stop[] }>>}
 */
router.get('/', getAllRoutes);

/**
 * GET /routes/:id
 * @description Get a single route by ID with its stops
 * @param {string} id - Route ID
 * @returns {Promise<import('@prisma/client').Route & { stops: import('@prisma/client').Stop[] }>}
 */
router.get('/:id', getRouteById);

/**
 * POST /routes
 * @description Create a new route with stops
 * @param {import('../validators/route.validator.js').RouteData} body - Route data
 * @returns {Promise<import('@prisma/client').Route & { stops: import('@prisma/client').Stop[] }>}
 */
router.post('/', validateRoute, createRoute);

/**
 * PUT /routes/:id
 * @description Update an existing route and its stops
 * @param {string} id - Route ID
 * @param {import('../validators/route.validator.js').RouteData} body - Route data
 * @returns {Promise<import('@prisma/client').Route & { stops: import('@prisma/client').Stop[] }>}
 */
router.put('/:id', validateRoute, updateRoute);

/**
 * DELETE /routes/:id
 * @description Delete a route and its associated stops
 * @param {string} id - Route ID
 * @returns {Promise<void>}
 */
router.delete('/:id', deleteRoute);

export { router as routeRoutes };