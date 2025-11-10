import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import arbitrageRoutes from './routes/arbitrage.js';
import infoRoutes from './routes/info.js';
import { errorHandler, requestLogger } from './middleware/errorHandler.js';

// Настройка Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Arbitrage Scanner API',
      version: '1.0.0',
      description: 'API для получения арбитражных возможностей на криптовалютных биржах',
      contact: {
        name: 'API Support',
        email: 'support@arbitrage-scanner.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        ArbitrageOpportunity: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              example: 'ETH/USDT'
            },
            buy_exchange: {
              type: 'string',
              example: 'Binance'
            },
            buy_price: {
              type: 'number',
              example: 1620.50
            },
            sell_exchange: {
              type: 'string',
              example: 'Kraken'
            },
            sell_price: {
              type: 'number',
              example: 1635.20
            },
            spread_percent: {
              type: 'number',
              example: 0.91
            },
            gross_profit: {
              type: 'number',
              example: 14.70
            },
            net_profit_after_fees: {
              type: 'number',
              example: 12.84
            },
            volume: {
              type: 'number',
              example: 1.0
            },
            timestamp: {
              type: 'number',
              example: 1695555555
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string'
            },
            message: {
              type: 'string'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    }
  },
  apis: ['./api/routes/*.js', './api/index.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// Создание Express приложения
const apiRouter = express.Router();

// Middleware
apiRouter.use(requestLogger);
apiRouter.use(express.json());
apiRouter.use(express.urlencoded({ extended: true }));

// Swagger документация
apiRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Arbitrage Scanner API Documentation'
}));

// Роуты
apiRouter.use('/arbitrage', arbitrageRoutes);
apiRouter.use('/info', infoRoutes);

// Корневой роут API
apiRouter.get('/', (req, res) => {
  res.json({
    message: 'Arbitrage Scanner API v1.0.0',
    documentation: '/api/docs',
    endpoints: {
      arbitrage: '/api/arbitrage',
      info: '/api/info',
      websocket: 'ws://localhost:3003'
    },
    timestamp: new Date().toISOString()
  });
});

// Обработка ошибок
apiRouter.use(errorHandler);

export default apiRouter;
