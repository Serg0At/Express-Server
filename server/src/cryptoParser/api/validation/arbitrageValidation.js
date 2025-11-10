import Joi from 'joi';

// Схема валидации для REST API параметров
export const arbitrageQuerySchema = Joi.object({
  min_spread: Joi.number().min(0).default(0.1),
  risk: Joi.boolean().default(false),
  interval: Joi.number().valid(5, 10, 15, 30).default(5),
  min_volume: Joi.number().min(0.001).default(0.001),
});

// Схема валидации для WebSocket параметров
export const websocketParamsSchema = Joi.object({
  subscription_type: Joi.string().valid('lite', 'standard', 'pro').required(),
  min_spread: Joi.number().min(0).default(0.1),
  risk: Joi.boolean().default(false),
  min_volume: Joi.number().min(0.001).default(0.001),
});

// Функция валидации параметров
export function validateArbitrageParams(params) {
  const { error, value } = arbitrageQuerySchema.validate(params);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }
  return value;
}

// Функция валидации WebSocket параметров
export function validateWebSocketParams(params) {
  const { error, value } = websocketParamsSchema.validate(params);
  if (error) {
    throw new Error(`WebSocket validation error: ${error.details[0].message}`);
  }
  return value;
}

// Получение интервала обновления для тарифа
export function getUpdateInterval(planId) {
  switch (planId.toLowerCase()) {
    case 'lite':
      return null; // Только REST
    case 'standard':
      return 5000; // 5 секунд
    case 'pro':
      return 2000; // 2 секунды (между 1-3)
    default:
      throw new Error('Invalid subscription type');
  }
}
