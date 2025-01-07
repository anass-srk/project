import prisma from '../lib/prisma.js';
import { EmailService } from './email.service.js';
import { SmsService } from './sms.service.js';

const emailService = new EmailService();
const smsService = new SmsService();

/**
 * Service for handling notifications
 */
export class NotificationService {
  /**
   * Create and send a notification
   * @param {Object} params - Notification parameters
   * @param {string} params.userId - User ID
   * @param {import('@prisma/client').NotificationType} params.type - Notification type
   * @param {string} params.content - Notification content
   * @returns {Promise<import('@prisma/client').Notification>}
   */
  async createNotification({ userId, type, content }) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        content,
      },
    });

    // Get user's notification preferences
    const preference = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (preference && preference.enabledNotificationTypes.includes(type)) {
      if (preference.channel === 'EMAIL') {
        await emailService.sendEmail(userId, content);
      } else if (preference.channel === 'SMS') {
        await smsService.sendSms(userId, content);
      }
    }

    return notification;
  }

  /**
   * Handle ticket purchase notification
   * @param {Object} message - Message from RabbitMQ
   * @returns {Promise<void>}
   */
  async handleTicketPurchase(message) {
    if (message.type === 'TICKET_CREATED') {
      const { data } = message;
      await this.createNotification({
        userId: data.userId,
        type: 'TICKET_PURCHASE',
        content: `Your ticket purchase was successful! Trip IDs: ${data.tripIds.join(', ')}`,
      });
    }
  }

  /**
   * Handle trip cancellation notification
   * @param {Object} message - Message from RabbitMQ
   * @returns {Promise<void>}
   */
  async handleTripCancellation(message) {
    const { data } = message;
    const { tripId } = data;

    // Find all notifications for affected users
    const notifications = await prisma.notification.findMany({
      where: {
        type: 'TICKET_PURCHASE',
        content: {
          contains: tripId.toString(),
        },
      },
    });

    // Send cancellation notifications to affected users
    for (const notification of notifications) {
      await this.createNotification({
        userId: notification.userId,
        type: 'TRIP_CANCELLATION',
        content: `Trip ${tripId} has been cancelled. Please check your ticket status.`,
      });
    }
  }

  /**
   * Mark a notification as seen
   * @param {number} notificationId - Notification ID
   * @returns {Promise<import('@prisma/client').Notification>}
   */
  async markAsSeen(notificationId) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        seenDate: new Date(),
      },
    });
  }

  /**
   * Get user's notifications
   * @param {string} userId - User ID
   * @returns {Promise<Array<import('@prisma/client').Notification>>}
   */
  async getUserNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { sendingDate: 'desc' },
    });
  }
}