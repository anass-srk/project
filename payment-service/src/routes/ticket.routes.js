import { Router } from 'express';
import { getAllTickets, getTicketById, createTicket, cancelTicket } from '../controllers/ticket.controller.js';
import { validateTicket, validateCancellation } from '../validators/ticket.validator.js';

/**
 * Express router for ticket-related endpoints
 * @type {import('express').Router}
 */
const router = Router();

/**
 * GET /tickets
 * @description Get all tickets for a user
 * @param {string} userId - User ID from authentication
 * @returns {Promise<Array<import('@prisma/client').Ticket>>}
 */
router.get('/', getAllTickets);

/**
 * GET /tickets/:id
 * @description Get a single ticket by ID
 * @param {string} id - Ticket ID
 * @returns {Promise<import('@prisma/client').Ticket>}
 */
router.get('/:id', getTicketById);

/**
 * POST /tickets
 * @description Create a new ticket
 * @param {import('../validators/ticket.validator.js').TicketData} body - Ticket data
 * @returns {Promise<import('@prisma/client').Ticket>}
 */
router.post('/', validateTicket, createTicket);

/**
 * POST /tickets/:id/cancel
 * @description Cancel a ticket
 * @param {string} id - Ticket ID
 * @param {import('../validators/ticket.validator.js').CancellationData} body - Cancellation data
 * @returns {Promise<import('@prisma/client').Ticket>}
 */
router.post('/:id/cancel', validateCancellation, cancelTicket);

export { router as ticketRoutes };