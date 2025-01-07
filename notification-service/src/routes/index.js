import { Router } from 'express';
import { notificationRoutes } from './notification.routes.js';
import { preferenceRoutes } from './notification-preference.routes.js';

const router = Router();

router.use('/notifications', notificationRoutes);
router.use('/notifications', preferenceRoutes);

export { router };