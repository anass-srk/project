import prisma from '../lib/prisma.js';
import { rabbitmq } from '../lib/rabbitmq.js';

/**
 * Service for handling trip-related operations
 */
export class TripService {
  /**
   * Verify ticket availability
   * @param {Object} message - Ticket purchase request message
   * @returns {Promise<void>}
   */
  async verifyTicketAvailability(message) {
    const { data } = message;
    const { tripIds } = data;

    try {
      // Check all trips
      const trips = await prisma.trip.findMany({
        where: {
          id: { in: tripIds },
        },
      });

      // Verify all trips exist and have available seats
      const allAvailable = trips.length === tripIds.length && 
        trips.every(trip => trip.availablePlaces > 0);

      if (allAvailable) {
        // Update available places
        await Promise.all(trips.map(trip => 
          prisma.trip.update({
            where: { id: trip.id },
            data: { availablePlaces: trip.availablePlaces - 1 },
          })
        ));
      }

      // Send response
      await rabbitmq.sendToQueue('TICKET_RESPONSE_Q', {
        type: 'VERIFY_AVAILABILITY_RESPONSE',
        success: allAvailable,
        data: message.data
      });
    } catch (error) {
      console.error('Error verifying ticket availability:', error);
      await rabbitmq.sendToQueue('TICKET_RESPONSE_Q', {
        type: 'VERIFY_AVAILABILITY_RESPONSE',
        success: false,
        data: message.data,
        error: error.message
      });
    }
  }

  /**
   * Handle ticket cancellation
   * @param {Object} message - Ticket cancellation message
   * @returns {Promise<void>}
   */
  async handleTicketCancellation(message) {
    const { data } = message;
    const { tripIds } = data;

    try {
      // Increase available places for each trip
      await Promise.all(tripIds.map(tripId =>
        prisma.trip.update({
          where: { id: tripId },
          data: {
            availablePlaces: {
              increment: 1
            }
          }
        })
      ));

      console.log(`Successfully updated available places for trips: ${tripIds.join(', ')}`);
    } catch (error) {
      console.error('Error handling ticket cancellation:', error);
    }
  }

  /**
   * Cancel a trip and notify payment service
   * @param {number} tripId - ID of the trip to cancel
   * @returns {Promise<void>}
   */
  async cancelTrip(tripId) {
    try {
      await rabbitmq.sendToQueue('TRIP_CANCELLING_Q', {
        type: 'TRIP_CANCELLED',
        data: {
          tripId
        }
      });
      console.log(`Sent trip cancellation notification for trip ${tripId}`);
    } catch (error) {
      console.error('Error sending trip cancellation notification:', error);
      throw error;
    }
  }
}