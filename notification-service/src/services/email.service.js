import nodemailer from "nodemailer";
import fetch from "node-fetch";

/**
 * Service for handling email notifications
 */
export class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Ignore self-signed certificates
      },
      connectionTimeout: 5000, // Connection timeout in milliseconds
      greetingTimeout: 3000, // Greeting timeout in milliseconds
      socketTimeout: 5000, // Socket timeout in milliseconds
    });
  }

  /**
   * Get user's email from user service
   * @param {string} userId - User ID
   * @returns {Promise<string>}
   */
  async getUserEmail(userId) {
    try {
      const response = await fetch(
        process.env.KONG_URL + `/api/users/${userId}/email`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user email");
      }
      const data = await response.json();
      return data.email;
    } catch (error) {
      console.error("Error fetching user email:", error);
      throw error;
    }
  }

  /**
   * Send an email notification
   * @param {string} userId - User ID
   * @param {string} content - Email content
   * @returns {Promise<void>}
   */
  async sendEmail(userId, content) {
    try {
      const userEmail = await this.getUserEmail(userId);

      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: userEmail,
        subject: "Transport Platform Notification",
        text: content,
      });

      console.log(`Email sent to ${userEmail}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }
}
