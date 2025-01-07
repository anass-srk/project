import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

import { errorHandler } from './middleware/errorHandler.js';
import { router } from './routes/index.js';
import { rabbitmq } from './lib/rabbitmq.js';
import { TicketService } from './services/ticket.service.js';
import { ServiceRegistry } from './lib/service-registry.js';
import { initializeDatabase } from './lib/init-db.js';

const app = express();
const port = process.env.PORT || 3003;
const ticketService = new TicketService();

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
    
    // Set up consumer for ticket responses
    await rabbitmq.consume('TICKET_RESPONSE_Q', async (message) => {
      await ticketService.handleTicketResponse(message);
    });

    // Set up consumer for trip cancellations
    await rabbitmq.consume('TRIP_CANCELLING_Q', async (message) => {
      await ticketService.handleTripCancellation(message);
    });

    // Register with service discovery
    const serviceRegistry = new ServiceRegistry();
    await serviceRegistry.register();

    // Start server
    app.listen(port, () => {
      console.log(`Payment service running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();