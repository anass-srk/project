import { ConsulService } from './consul.js';
import { KongService } from './kong.js';

export class ServiceRegistry {
  constructor() {
    this.consulService = new ConsulService();
    this.kongService = new KongService();
  }

  async register() {
    try {
      await this.consulService.registerService();
      await this.kongService.registerService();
    } catch (error) {
      console.error('Service registration failed:', error);
      throw error;
    }
  }
}