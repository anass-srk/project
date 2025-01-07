import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

import { errorHandler } from './middleware/errorHandler.js';
import { router } from './routes/index.js';
import { ServiceRegistry } from './lib/service-registry.js';
import { initializeDatabase } from './lib/init-db.js';

const app = express();
const port = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api', router);

// Error handling
app.use(errorHandler);

// Start server and register with service discovery
const startServer = async () => {
  try {
    // Initialize database schema if needed
    await initializeDatabase();
    
    const serviceRegistry = new ServiceRegistry();
    await serviceRegistry.register();
    
    app.listen(port, () => {
      console.log(`Subscription service running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();