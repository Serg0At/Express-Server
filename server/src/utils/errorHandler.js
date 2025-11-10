import logger from './logger.js';

export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  const logData = {
    userId: req.user?.id || 'guest',
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  };

  // JSON
  logger.error({ message, ...logData });

  res.status(status).json({
    status,
    message
  });
}
