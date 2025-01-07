import prisma from '../lib/prisma.js';

export class NotificationPreferenceService {
  /**
   * Get user's notification preferences
   * @param {string} userId - User ID
   * @returns {Promise<import('@prisma/client').NotificationPreference | null>}
   */
  async getUserPreferences(userId) {
    return prisma.notificationPreference.findUnique({
      where: { userId },
    });
  }

  /**
   * Update notification preferences
   * @param {number} [id] - Preference ID for updates
   * @param {Object} data - Preference data
   * @returns {Promise<import('@prisma/client').NotificationPreference>}
   */
  async updatePreferences(id, data) {
    if (id) {
      return prisma.notificationPreference.update({
        where: { id },
        data,
      });
    }

    return prisma.notificationPreference.create({
      data,
    });
  }
}