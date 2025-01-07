import { config } from './config.js';

export class KongService {
  constructor() {
    this.adminUrl = config.kong.adminUrl;
    this.serviceName = config.service.name;
    this.servicePort = config.service.port;
  }

  async registerService() {
    try {
      // Create Kong service
      await fetch(`${this.adminUrl}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.serviceName,
          url: `http://localhost:${this.servicePort}`,
        }),
      });

      // Create Kong route
      await fetch(`${this.adminUrl}/services/${this.serviceName}/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${this.serviceName}-route`,
          paths: ['/api/subscription-types', '/api/subscriptions'],
          strip_path: false,
        }),
      });

      console.log(`Service registered with Kong: ${this.serviceName}`);
    } catch (error) {
      console.error('Failed to register with Kong:', error);
      throw error;
    }
  }
}