import { NotificationService } from '../services/notification.service.js';
import { ValidationError } from '../utils/errors.js';

const notificationService = new NotificationService();

/**
 * Get user's notifications
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getUserNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const notifications = await notificationService.getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as seen
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const markNotificationAsSeen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsSeen(Number(id));
    res.json(notification);
  } catch (error) {
    next(error);
  }
};