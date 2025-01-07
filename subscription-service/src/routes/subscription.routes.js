import { Router } from 'express';
import { getAllSubscriptions, getSubscriptionById, createSubscription, getUserSubscription, cancelSubscription } from '../controllers/subscription.controller.js';
import { validateSubscription } from '../validators/subscription.validator.js';

/**
 * Express router for subscription-related endpoints
 * @type {import('express').Router}
 */
const router = Router();

/**
 * GET /subscriptions
 * @description Get all subscriptions
 * @returns {Promise<Array<import('@prisma/client').Subscription>>}
 */
router.get('/', getAllSubscriptions);

/**
 * GET /subscriptions/user/:userId
 * @description Get user's subscription
 * @param {string} userId - User ID
 * @returns {Promise<import('@prisma/client').Subscription>}
 */
router.get('/user/:userId', getUserSubscription);

/**
 * GET /subscriptions/:id
 * @description Get a single subscription by ID
 * @param {string} id - Subscription ID
 * @returns {Promise<import('@prisma/client').Subscription>}
 */
router.get('/:id', getSubscriptionById);

/**
 * POST /subscriptions
 * @description Create a new subscription
 * @param {import('../validators/subscription.validator.js').SubscriptionData} body - Subscription data
 * @returns {Promise<import('@prisma/client').Subscription>}
 */
router.post('/', validateSubscription, createSubscription);

/**
 * POST /subscriptions/:id/cancel
 * @description Cancel a subscription
 * @param {string} id - Subscription ID
 * @returns {Promise<void>}
 */
router.post('/:id/cancel', cancelSubscription);

export { router as subscriptionRoutes };