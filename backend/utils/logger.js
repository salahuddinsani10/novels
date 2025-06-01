/**
 * Enhanced logging utility for NovelistanAI
 * Provides consistent logging with timestamp, level, and context information
 * Particularly useful for Azure deployment troubleshooting
 */

// Environment-aware logging levels
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Log a message with various severity levels and context information
 * @param {string} level - Log level (info, warn, error, debug)
 * @param {string} message - Main log message
 * @param {Object} data - Optional data to include in the log
 * @param {Error} error - Optional error object for error logs
 */
function log(level, message, data = {}, error = null) {
  const timestamp = new Date().toISOString();
  const context = data.context || 'general';
  
  // Create the base log object
  const logObject = {
    timestamp,
    level,
    message,
    context,
    environment: process.env.NODE_ENV || 'development',
    ...data
  };
  
  // Add error details if provided
  if (error) {
    logObject.error = {
      name: error.name,
      message: error.message,
      stack: isDevelopment ? error.stack : undefined
    };
  }
  
  // Format the message for console output
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
  
  // Log based on level
  switch (level.toLowerCase()) {
    case 'error':
      console.error(formattedMessage, error ? error.stack : '', data);
      break;
    case 'warn':
      console.warn(formattedMessage, data);
      break;
    case 'debug':
      if (isDevelopment) {
        console.debug(formattedMessage, data);
      }
      break;
    case 'info':
    default:
      console.log(formattedMessage, data);
  }
  
  // In a production implementation, you could add additional logging here:
  // - Send logs to Azure Application Insights
  // - Write to a log file
  // - Send to a logging service
}

// Convenience methods for different log levels
const logger = {
  info: (message, data) => log('info', message, data),
  warn: (message, data) => log('warn', message, data),
  error: (message, data, error) => log('error', message, data, error),
  debug: (message, data) => log('debug', message, data),
  
  // Special method for startup diagnostics
  startup: (component, status, details = {}) => {
    log('info', `STARTUP: ${component} - ${status}`, {
      context: 'startup',
      component,
      status,
      ...details
    });
  },
  
  // Method specifically for Azure diagnostics
  azure: (operation, status, details = {}) => {
    log('info', `AZURE: ${operation} - ${status}`, {
      context: 'azure',
      operation,
      status,
      ...details
    });
  },
  
  // Method for critical system issues
  critical: (message, data, error) => {
    const criticalMessage = `⚠️ CRITICAL: ${message}`;
    log('error', criticalMessage, { context: 'critical', ...data }, error);
    
    // You could add alerts or notifications for critical errors here
  }
};

module.exports = logger;
