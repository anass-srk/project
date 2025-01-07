import { Router } from 'express';
import { getUserPreferences, updatePreferences } from '../controllers/notification-preference.controller.js';
import { validatePreferences } from '../validators/notification-preference.validator.js';

const router = Router();

router.get('/preferences/:userId', getUserPreferences);
router.post('/preferences', validatePreferences, updatePreferences);
router.put('/preferences/:id', validatePreferences, updatePreferences);

export { router as preferenceRoutes };