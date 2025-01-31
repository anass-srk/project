import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

export { router as authRoutes };