const logger = require('../logger');

/**
 * Handle and format error details for logging
 * @param {Error} error - Error object to handle
 * @param {Object} context - Additional context for the error
 * @returns {string} Formatted error details as JSON string
 */
const handleError = (error, context = {}) => {
  const errorDetails = {
    status: error.status || 'N/A',
    statusText: error.statusText || 'N/A',
    message: error.message || 'N/A',
    statusCode: error.statusCode || 'N/A',
    stack: error.stack || 'N/A',
    name: error.name || 'Error',
    code: error.code || 'N/A'
  };

  logger.error('Error handled', {
    ...errorDetails,
    ...context
  });

  return JSON.stringify(errorDetails, null, 2);
};

/**
 * Log and handle async errors with context
 * @param {Function} fn - Async function to wrap
 * @param {string} operationName - Name of the operation for logging
 * @returns {Function} Wrapped function with error handling
 */
const asyncErrorHandler = (fn, operationName) => {
  return async (...args) => {
    const startTime = Date.now();
    logger.debug(`Operation started: ${operationName}`);

    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      logger.debug(`Operation completed: ${operationName}`, {
        duration: `${duration}ms`,
        status: 'success'
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Operation failed: ${operationName}`, {
        duration: `${duration}ms`,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  };
};

module.exports = {
  handleError,
  asyncErrorHandler
};
