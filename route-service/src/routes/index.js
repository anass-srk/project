import { Router } from 'express';
import { busRoutes } from './bus.routes.js';
import { routeRoutes } from './route.routes.js';
import { tripRoutes } from './trip.routes.js';
import { healthRoutes } from './health.routes.js';

/**
 * Main router that combines all route modules
 * @type {import('express').Router}
 */
const router = Router();

/**
 * Mount route modules
 * @description
 * - /api/buses - Bus management routes
 * - /api/routes - Route management routes
 * - /api/trips - Trip management routes
 * - /health - Health check endpoint
 */
router.use('/api/buses', busRoutes);
router.use('/api/routes', routeRoutes);
router.use('/api/trips', tripRoutes);
router.use('/', healthRoutes);

export { router };