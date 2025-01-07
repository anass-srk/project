import { Router } from 'express';
import { getAllSubscriptionTypes, getSubscriptionTypeById, createSubscriptionType, updateSubscriptionType, deleteSubscriptionType } from '../controllers/subscription-type.controller.js';
import { validateSubscriptionType } from '../validators/subscription-type.validator.js';

/**
 * Express router for subscription type-related endpoints
 * @type {import('express').Router}
 */
const router = Router();

/**
 * GET /subscription-types
 * @description Get all subscription types
 * @returns {Promise<Array<import('@prisma/client').SubscriptionType>>}
 */
router.get('/', getAllSubscriptionTypes);

/**
 * GET /subscription-types/:id
 * @description Get a single subscription type by ID
 * @param {string} id - Subscription type ID
 * @returns {Promise<import('@prisma/client').SubscriptionType>}
 */
router.get('/:id', getSubscriptionTypeById);

/**
 * POST /subscription-types
 * @description Create a new subscription type
 * @param {import('../validators/subscription-type.validator.js').SubscriptionTypeData} body - Subscription type data
 * @returns {Promise<import('@prisma/client').SubscriptionType>}
 */
router.post('/', validateSubscriptionType, createSubscriptionType);

/**
 * PUT /subscription-types/:id
 * @description Update an existing subscription type
 * @param {string} id - Subscription type ID
 * @param {import('../validators/subscription-type.validator.js').SubscriptionTypeData} body - Subscription type data
 * @returns {Promise<import('@prisma/client').SubscriptionType>}
 */
router.put('/:id', validateSubscriptionType, updateSubscriptionType);

/**
 * DELETE /subscription-types/:id
 * @description Delete a subscription type
 * @param {string} id - Subscription type ID
 * @returns {Promise<void>}
 */
router.delete('/:id', deleteSubscriptionType);

export { router as subscriptionTypeRoutes };