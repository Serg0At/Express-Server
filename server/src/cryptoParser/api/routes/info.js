import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/info/subscription-plans:
 *   get:
 *     summary: Получить информацию о тарифных планах
 *     description: Возвращает детальную информацию о доступных тарифных планах
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 plans:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Lite"
 *                       price:
 *                         type: string
 *                         example: "Free"
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 *                       api_access:
 *                         type: object
 *                         properties:
 *                           rest:
 *                             type: boolean
 *                           websocket:
 *                             type: boolean
 *                           update_interval:
 *                             type: string
 *                             nullable: true
 */
router.get('/subscription-plans', (req, res) => {
  const plans = [
    {
      name: 'Lite',
      price: 'Free',
      features: [
        'REST API доступ',
        'Базовые фильтры',
        'Обновления каждые 30 секунд'
      ],
      api_access: {
        rest: true,
        websocket: false,
        update_interval: null
      }
    },
    {
      name: 'Standard',
      price: '$29/month',
      features: [
        'REST API доступ',
        'WebSocket стриминг',
        'Обновления каждые 5 секунд',
        'Расширенные фильтры',
        'Приоритетная поддержка'
      ],
      api_access: {
        rest: true,
        websocket: true,
        update_interval: '5 seconds'
      }
    },
    {
      name: 'Pro',
      price: '$99/month',
      features: [
        'REST API доступ',
        'WebSocket стриминг',
        'Обновления каждые 1-3 секунды',
        'Все фильтры',
        'Эксклюзивные возможности',
        '24/7 поддержка'
      ],
      api_access: {
        rest: true,
        websocket: true,
        update_interval: '1-3 seconds'
      }
    }
  ];

  res.json({
    success: true,
    plans,
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/info/status:
 *   get:
 *     summary: Получить статус сервера
 *     description: Возвращает текущий статус сервера и статистику
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                   example: "running"
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 market_data:
 *                   type: object
 *                   properties:
 *                     total_markets:
 *                       type: number
 *                     total_quotes:
 *                       type: number
 *                 websocket:
 *                   type: object
 *                   properties:
 *                     total_clients:
 *                       type: number
 *                     subscription_types:
 *                       type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/status', (req, res) => {
  // Здесь можно добавить реальную статистику из WebSocket сервера
  const status = {
    success: true,
    status: 'running',
    uptime: process.uptime(),
    market_data: {
      total_markets: 0, // Будет заполнено из реальных данных
      total_quotes: 0   // Будет заполнено из реальных данных
    },
    websocket: {
      total_clients: 0,
      subscription_types: {}
    },
    timestamp: new Date().toISOString()
  };

  res.json(status);
});

export default router;
