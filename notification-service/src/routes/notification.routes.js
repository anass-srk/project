import { Router } from 'express';
import { getUserNotifications, markNotificationAsSeen } from '../controllers/notification.controller.js';

/**
 * Express router for notification-related endpoints
 * @type {import('express').Router}
 */
const router = Router();

/**
 * GET /notifications/user/:userId
 * @description Get user's notifications
 * @param {string} userId - User ID
 * @returns {Promise<Array<import('@prisma/client').Notification>>}
 */
router.get('/user/:userId', getUserNotifications);

/**
 * POST /notifications/:id/seen
 * @description Mark a notification as seen
 * @param {string} id - Notification ID
 * @returns {Promise<import('@prisma/client').Notification>}
 */
router.post('/:id/seen', markNotificationAsSeen);

export { router as notificationRoutes };