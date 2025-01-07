import { Router } from 'express';
import { subscriptionTypeRoutes } from './subscription-type.routes.js';
import { subscriptionRoutes } from './subscription.routes.js';

/**
 * Main router that combines all route modules
 * @type {import('express').Router}
 */
const router = Router();

/**
 * Mount route modules
 * @description
 * - /api/subscription-types - Subscription type management routes
 * - /api/subscriptions - Subscription management routes
 */
router.use('/subscription-types', subscriptionTypeRoutes);
router.use('/subscriptions', subscriptionRoutes);

export { router };