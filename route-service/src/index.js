import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import 'dotenv/config';

import { errorHandler } from './middleware/errorHandler.js';
import { router } from './routes/index.js';
import { rabbitmq } from './lib/rabbitmq.js';
import { TripService } from './services/trip.service.js';
import { ServiceRegistry } from './lib/service-registry.js';
import { socketService } from './lib/socket.js';
import { initializeDatabase } from './lib/init-db.js';

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3002;
const tripService = new TripService();

// Initialize Socket.IO
socketService.initialize(httpServer);

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/', router);

// Error handling
app.use(errorHandler);

// Initialize RabbitMQ, register with service discovery, and start server
async function startServer() {
  try {
    // Initialize database schema if needed
    await initializeDatabase();

    // Initialize RabbitMQ
    await rabbitmq.initialize();
    
    // Set up consumer for ticket purchase requests
    await rabbitmq.consume('TICKET_PURCHASE_Q', async (message) => {
      await tripService.verifyTicketAvailability(message);
    });

    // Set up consumer for ticket cancellation requests
    await rabbitmq.consume('TICKET_CANCELLING_Q', async (message) => {
      await tripService.handleTicketCancellation(message);
    });

    // Register with service discovery
    const serviceRegistry = new ServiceRegistry();
    await serviceRegistry.register();

    // Start server
    httpServer.listen(port, () => {
      console.log(`Transport service running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();