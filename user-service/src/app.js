import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { healthRoutes } from './routes/health.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/', healthRoutes);

// Error handling
app.use(errorHandler);

export default app;