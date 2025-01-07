import { NotificationPreferenceService } from '../services/notification-preference.service.js';
import { ValidationError } from '../utils/errors.js';

const preferenceService = new NotificationPreferenceService();

/**
 * Get user's notification preferences
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getUserPreferences = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const preferences = await preferenceService.getUserPreferences(userId);
    res.json(preferences);
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update notification preferences
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const updatePreferences = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.validatedData;
    const preferences = await preferenceService.updatePreferences(id ? Number(id) : undefined, data);
    res.json(preferences);
  } catch (error) {
    next(error);
  }
};