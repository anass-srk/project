import amqp from 'amqplib';

/**
 * RabbitMQ connection wrapper
 */
class RabbitMQ {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  /**
   * Initialize RabbitMQ connection and channel
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      this.channel = await this.connection.createChannel();

      // Declare queues
      await this.channel.assertQueue('TICKET_RESPONSE_Q', { durable: true });
      await this.channel.assertQueue('TRIP_CANCELLING_Q', { durable: true });

      console.log('RabbitMQ connection established');
    } catch (error) {
      console.error('RabbitMQ connection error:', error);
      throw error;
    }
  }

  /**
   * Consume messages from a queue
   * @param {string} queue - Queue name
   * @param {Function} callback - Callback function to handle messages
   * @returns {Promise<void>}
   */
  async consume(queue, callback) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    await this.channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          this.channel.nack(msg);
        }
      }
    });
  }

  /**
   * Close RabbitMQ connection
   * @returns {Promise<void>}
   */
  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}

export const rabbitmq = new RabbitMQ();