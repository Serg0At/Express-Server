// Middleware для обработки ошибок
export function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  // Ошибки валидации
  if (err.message && err.message.includes('Validation error')) {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Ошибки WebSocket
  if (err.message && err.message.includes('WebSocket validation error')) {
    return res.status(400).json({
      error: 'WebSocket Validation Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Общие ошибки сервера
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server',
    timestamp: new Date().toISOString()
  });
}

// Middleware для логирования запросов
export function requestLogger(req, res, next) {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
}
