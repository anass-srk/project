import { Router } from 'express';
import { getProfile, updateProfile, getDrivers, getDriversByIds, createDriver, updateDriver, deleteDriver, getUserEmail } from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.js';
import { validateUpdateProfile, validateCreateDriver, validateUpdateDriver } from '../validators/user.validator.js';

const router = Router();

// Profile routes
router.get('/profile', auth(), getProfile);
router.put('/profile', auth(), validateUpdateProfile, updateProfile);

// Driver management routes (admin only)
router.get('/drivers', auth(['ADMIN']), getDrivers);
router.get('/drivers/by-ids', getDriversByIds);
router.post('/drivers', auth(['ADMIN']), validateCreateDriver, createDriver);
router.put('/drivers/:id', auth(['ADMIN']), validateUpdateDriver, updateDriver);
router.delete('/drivers/:id', auth(['ADMIN']), deleteDriver);

// User email route
router.get('/:id/email', getUserEmail);

export { router as userRoutes };