import { WebSocketServer } from 'ws';
import { validateWebSocketParams, getUpdateInterval } from '../validation/arbitrageValidation.js';
import { calculateArbitrageOpportunities } from '../../tools/calculateProfit.js';
import { quoteMap } from '../../tools/storage/proccessAndStorage.js';

class ArbitrageWebSocketServer {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map(); // Map для хранения клиентов и их параметров
    this.intervals = new Map(); // Map для хранения интервалов обновления
    
    this.init();
  }

  init() {
    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket client connected');
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({
            error: 'Invalid message format',
            message: 'Message must be valid JSON'
          }));
        }
      });

      ws.on('close', () => {
        this.removeClient(ws);
        console.log('WebSocket client disconnected');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeClient(ws);
      });
    });
  }

  handleClientMessage(ws, data) {
    try {
      // Валидация параметров
      const validatedParams = validateWebSocketParams(data);
      
      // Сохраняем клиента и его параметры
      this.clients.set(ws, validatedParams);
      
      // Получаем интервал обновления для тарифа
      const updateInterval = getUpdateInterval(validatedParams.subscription_type);
      
      if (updateInterval === null) {
        ws.send(JSON.stringify({
          error: 'Subscription type not supported',
          message: 'Lite subscription only supports REST API'
        }));
        return;
      }

      // Отправляем подтверждение подключения
      ws.send(JSON.stringify({
        type: 'connection_confirmed',
        subscription_type: validatedParams.subscription_type,
        update_interval: updateInterval,
        message: 'WebSocket connection established successfully'
      }));

      // Запускаем периодические обновления
      this.startClientUpdates(ws, validatedParams, updateInterval);

    } catch (error) {
      ws.send(JSON.stringify({
        error: 'Validation Error',
        message: error.message
      }));
    }
  }

  startClientUpdates(ws, params, interval) {
    // Останавливаем предыдущий интервал, если он существует
    if (this.intervals.has(ws)) {
      clearInterval(this.intervals.get(ws));
    }

    // Создаем новый интервал обновлений
    const updateInterval = setInterval(async () => {
      try {
        if (ws.readyState === ws.OPEN) {
          const opportunities = await this.getArbitrageOpportunities(params);
          ws.send(JSON.stringify({
            type: 'arbitrage_update',
            data: opportunities,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('Error sending WebSocket update:', error);
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Error updating arbitrage data'
          }));
        }
      }
    }, interval);

    this.intervals.set(ws, updateInterval);
  }

  async getArbitrageOpportunities(params) {
    const marketData = Array.from(quoteMap.values());
    
    if (marketData.length === 0) {
      return [];
    }

    const opportunities = await calculateArbitrageOpportunities(
      marketData,
      params.min_spread,
      params.min_volume
    );

    // Форматируем данные для WebSocket
    return opportunities.map(opp => {
      const grossProfit = (opp.sellPrice - opp.buyPrice) * params.min_volume;
      const fees = grossProfit * 0.002; // Пример комиссии 0.2%
      const netProfit = grossProfit - fees;

      return {
        symbol: opp.symbol,
        buy_exchange: opp.buyExchange,
        buy_price: Number(opp.buyPrice.toFixed(2)),
        sell_exchange: opp.sellExchange,
        sell_price: Number(opp.sellPrice.toFixed(2)),
        spread_percent: Number(opp.spread),
        gross_profit: Number(grossProfit.toFixed(2)),
        net_profit_after_fees: Number(netProfit.toFixed(2)),
        volume: params.min_volume,
        timestamp: Math.floor(Date.now() / 1000)
      };
    }).filter(opp => opp.volume >= params.min_volume);
  }

  removeClient(ws) {
    // Останавливаем интервал обновлений
    if (this.intervals.has(ws)) {
      clearInterval(this.intervals.get(ws));
      this.intervals.delete(ws);
    }
    
    // Удаляем клиента
    this.clients.delete(ws);
  }

  // Метод для отправки данных всем подключенным клиентам
  broadcastToAll(data) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Получение статистики подключений
  getStats() {
    return {
      total_clients: this.clients.size,
      subscription_types: Array.from(this.clients.values()).reduce((acc, params) => {
        acc[params.subscription_type] = (acc[params.subscription_type] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

export default ArbitrageWebSocketServer;
