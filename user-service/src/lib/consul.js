import Consul from 'consul';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config.js';

export class ConsulService {
  constructor() {
    this.serviceId = uuidv4();
    this.serviceName = config.service.name;
    this.servicePort = config.service.port;
    
    this.client = new Consul({
      host: config.consul.host,
      port: config.consul.port,
    });
  }

  async registerService() {
    try {
      await this.client.agent.service.register({
        id: this.serviceId,
        name: this.serviceName,
        port: this.servicePort,
        check: {
          http: `http://localhost:${this.servicePort}/health`,
          interval: '10s',
          timeout: '5s',
        },
        tags: ['user', 'auth'],
      });

      console.log(`Service registered with Consul: ${this.serviceName} (${this.serviceId})`);
      this.setupGracefulShutdown();
    } catch (error) {
      console.error('Failed to register with Consul:', error);
      throw error;
    }
  }

  setupGracefulShutdown() {
    process.on('SIGINT', async () => {
      try {
        await this.deregisterService();
        process.exit(0);
      } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });
  }

  async deregisterService() {
    try {
      await this.client.agent.service.deregister(this.serviceId);
      console.log('Service deregistered from Consul');
    } catch (error) {
      console.error('Failed to deregister from Consul:', error);
      throw error;
    }
  }

  async getServiceInstance(serviceName) {
    try {
      const services = await this.client.catalog.service.nodes(serviceName);
      if (services?.length > 0) {
        // Simple round-robin load balancing
        const instance = services[Math.floor(Math.random() * services.length)];
        return {
          address: instance.ServiceAddress,
          port: instance.ServicePort,
        };
      }
      throw new Error(`No instances found for service: ${serviceName}`);
    } catch (error) {
      console.error('Error getting service instance:', error);
      throw error;
    }
  }
}