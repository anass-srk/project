import 'dotenv/config';

export const config = {
  service: {
    name: process.env.SERVICE_NAME || 'user-service',
    port: parseInt(process.env.PORT || '3001'),
  },
  consul: {
    host: process.env.CONSUL_HOST || 'localhost',
    port: process.env.CONSUL_PORT || '8500',
  },
  kong: {
    adminUrl: process.env.KONG_ADMIN_URL || 'http://localhost:8001',
  },
};