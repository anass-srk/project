/**
 * Custom error for validation failures
 * @extends Error
 */
export class ValidationError extends Error {
  /**
   * Create a validation error
   * @param {Array<{field: string, message: string}>} details - Validation error details
   */
  constructor(details) {
    super('Validation Error');
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Custom error for not found resources
 * @extends Error
 */
export class NotFoundError extends Error {
  /**
   * Create a not found error
   * @param {string} message - Error message
   */
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}