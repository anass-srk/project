import { Router } from 'express';
import { ticketRoutes } from './ticket.routes.js';
import { healthRoutes } from './health.routes.js';

/**
 * Main router that combines all route modules
 * @type {import('express').Router}
 */
const router = Router();

/**
 * Mount route modules
 * @description
 * - /api/tickets - Ticket management routes
 * - /health - Health check endpoint
 */
router.use('/api/tickets', ticketRoutes);
router.use('/', healthRoutes);

export { router };