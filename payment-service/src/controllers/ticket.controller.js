import prisma from '../lib/prisma.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { TicketService } from '../services/ticket.service.js';

const ticketService = new TicketService();

/**
 * Get all tickets for a user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getAllTickets = async (req, res, next) => {
  try {
    const { userId } = req.query;

    const tickets = await prisma.ticket.findMany({
      where: {
        userId: userId,
      },
      include: {
        cancellation: true,
      },
      orderBy: {
        purchaseDate: 'desc',
      },
    });

    res.json(tickets);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single ticket by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(id) },
      include: {
        cancellation: true,
      },
    });

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new ticket
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const createTicket = async (req, res, next) => {
  try {
    const ticketData = req.validatedData;

    // Check for existing non-cancelled tickets with the same trips
    const existingTickets = await prisma.ticket.findMany({
      where: {
        userId: ticketData.userId,
        cancelled: false,
        OR: [
          {
            tripIds: {
              has: ticketData.tripIds[0]
            }
          },
          ...(ticketData.roundTrip && ticketData.tripIds[1] ? [{
            tripIds: {
              has: ticketData.tripIds[1]
            }
          }] : [])
        ]
      }
    });

    if (existingTickets.length > 0) {
      throw new ValidationError([{
        field: 'tripIds',
        message: 'You already have an active ticket for one or more of these trips'
      }]);
    }

    // Initiate ticket purchase through RabbitMQ
    await ticketService.initiatePurchase(ticketData);

    res.status(202).json({
      message: 'Ticket purchase initiated',
      status: 'PENDING'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a ticket
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const cancelTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const ticket = await ticketService.cancelTicket(id, reason);
    res.json(ticket);
  } catch (error) {
    if (error.code === 'P2025') {
      next(new NotFoundError('Ticket not found'));
    } else {
      next(error);
    }
  }
};