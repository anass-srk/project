import app from './app.js';
import { ServiceRegistry } from './lib/service-registry.js';
import { initializeDatabase } from './lib/init-db.js';

const port = process.env.PORT || 3001;

// Start server and register with service discovery
const startServer = async () => {
  try {
    // Initialize database schema if needed
    await initializeDatabase();
    
    if (process.env.NODE_ENV !== 'test') {
      const serviceRegistry = new ServiceRegistry();
      await serviceRegistry.register();
    }
    
    app.listen(port, () => {
      console.log(`User service running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();