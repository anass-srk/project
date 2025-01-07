import { Router } from 'express';
import { getAllBuses, getBusById, createBus, updateBus, deleteBus } from '../controllers/bus.controller.js';
import { validateBus } from '../validators/bus.validator.js';

/**
 * Express router for bus-related endpoints
 * @type {import('express').Router}
 */
const router = Router();

/**
 * GET /buses
 * @description Get all buses
 * @returns {Promise<Array<import('@prisma/client').Bus>>}
 */
router.get('/', getAllBuses);

/**
 * GET /buses/:id
 * @description Get a single bus by ID
 * @param {string} id - Bus ID
 * @returns {Promise<import('@prisma/client').Bus>}
 */
router.get('/:id', getBusById);

/**
 * POST /buses
 * @description Create a new bus
 * @param {import('../validators/bus.validator.js').BusData} body - Bus data
 * @returns {Promise<import('@prisma/client').Bus>}
 */
router.post('/', validateBus, createBus);

/**
 * PUT /buses/:id
 * @description Update an existing bus
 * @param {string} id - Bus ID
 * @param {import('../validators/bus.validator.js').BusData} body - Bus data
 * @returns {Promise<import('@prisma/client').Bus>}
 */
router.put('/:id', validateBus, updateBus);

/**
 * DELETE /buses/:id
 * @description Delete a bus
 * @param {string} id - Bus ID
 * @returns {Promise<void>}
 */
router.delete('/:id', deleteBus);

export { router as busRoutes };