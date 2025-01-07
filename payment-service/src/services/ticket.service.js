import prisma from '../lib/prisma.js';
import { rabbitmq } from '../lib/rabbitmq.js';

/**
 * Service for handling ticket-related operations
 */
export class TicketService {
  /**
   * Initialize ticket purchase process
   * @param {Object} ticketData - Ticket purchase data
   * @returns {Promise<void>}
   */
  async initiatePurchase(ticketData) {
    await rabbitmq.sendToQueue('TICKET_PURCHASE_Q', {
      type: 'VERIFY_AVAILABILITY',
      data: ticketData
    });
  }

  /**
   * Handle ticket response from route service
   * @param {Object} message - Response message
   * @returns {Promise<void>}
   */
  async handleTicketResponse(message) {
    const { type, data, success } = message;

    if (type === 'VERIFY_AVAILABILITY_RESPONSE' && success) {
      const ticket = await prisma.ticket.create({
        data: {
          roundTrip: data.roundTrip,
          price: data.price,
          purchaseDate: new Date(),
          userId: data.userId,
          tripIds: data.tripIds,
        },
        include: {
          cancellation: true,
        },
      });

      // Send confirmation to other consumers
      await rabbitmq.sendToQueue('TICKET_RESPONSE_Q', {
        type: 'TICKET_CREATED',
        data: ticket
      });
    }
  }

  /**
   * Handle ticket cancellation
   * @param {number} ticketId - ID of the ticket to cancel
   * @param {string} reason - Cancellation reason
   * @returns {Promise<import('@prisma/client').Ticket>}
   */
  async cancelTicket(ticketId, reason) {
    const ticket = await prisma.ticket.update({
      where: { id: Number(ticketId) },
      data: {
        cancelled: true,
        cancellation: {
          create: {
            date: new Date(),
            reason,
          },
        },
      },
      include: {
        cancellation: true,
      },
    });

    // Notify route service about cancelled trips
    await rabbitmq.sendToQueue('TICKET_CANCELLING_Q', {
      type: 'TICKET_CANCELLED',
      data: {
        tripIds: ticket.tripIds
      }
    });

    return ticket;
  }

  /**
   * Handle trip cancellation from route service
   * @param {Object} message - Trip cancellation message
   * @returns {Promise<void>}
   */
  async handleTripCancellation(message) {
    const { data } = message;
    const { tripId } = data;

    try {
      // Find all non-cancelled tickets that include this trip
      const tickets = await prisma.ticket.findMany({
        where: {
          cancelled: false,
          tripIds: {
            has: tripId
          }
        }
      });

      // Cancel all affected tickets
      await Promise.all(tickets.map(ticket =>
        this.cancelTicket(ticket.id, "The trip was cancelled!")
      ));

      console.log(`Successfully cancelled ${tickets.length} tickets for trip ${tripId}`);
    } catch (error) {
      console.error('Error handling trip cancellation:', error);
    }
  }
}