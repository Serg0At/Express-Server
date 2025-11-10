import express from 'express';
import cors from 'cors';
import {
  initExchanges,
  loadMarkets,
  getMarketSnapshot,
  state,
} from './tools/exchange/exchange.js';
import {
  marketMap,
  quoteMap,
  proccessAndStorageMarket,
  proccessAndStorageQuote,
} from './tools/storage/proccessAndStorage.js';
import { startWatchers } from './tools/watcher.js';
import { calculateArbitrageOpportunities } from './tools/calculateProfit.js';
import apiRouter from './api/index.js';
import ArbitrageWebSocketServer from './api/websocket/arbitrageWebSocket.js';

const app = express();
let wsServer = null;

// Middleware
app.use(cors());
app.use(express.json());

// API маршруты
app.use('/api', apiRouter);

// WebSocket сервер будет инициализирован в main index.js
function initWebSocketServer(server) {
  wsServer = new ArbitrageWebSocketServer(server);
  return wsServer;
}

// Маршрут статуса
app.get('/api/info/status', (req, res) => {
  const status = {
    success: true,
    status: 'running',
    uptime: process.uptime(),
    market_data: {
      total_markets: marketMap.size,
      total_quotes: quoteMap.size,
    },
    websocket: wsServer
      ? wsServer.getStats()
      : { total_clients: 0, subscription_types: {} },
    timestamp: new Date().toISOString(),
  };
  res.json(status);
});

// Основная логика арбитража
async function main() {
  console.log('Инициализация бирж');
  initExchanges();

  console.log('Загрузка рынков (может занять до минуты)...');
  const allMarketsArray = await loadMarkets();
  proccessAndStorageMarket(allMarketsArray);
  console.log(
    `=> Успешно загружено ${marketMap.size} рынков для отслеживания.`,
  );

  console.log('Получение первоначального снимка цен (может занять время)...');
  const initialSnapshot = await getMarketSnapshot(marketMap);
  proccessAndStorageQuote(initialSnapshot);
  console.log(
    `=> Первоначальный снимок получен, загружено ${quoteMap.size} котировок.`,
  );

  startWatchers(marketMap, state);

  setInterval(async () => {
    const marketData = Array.from(quoteMap.values());
    const opportunities = await calculateArbitrageOpportunities(
      marketData,
      1.0,
    );
    if (opportunities.length > 0) {
      console.log('\n[ARBITRAGE] Найдены сделки:');
      console.log(JSON.stringify(opportunities, null, 2));
      if (wsServer) {
        wsServer.broadcastToAll({
          type: 'arbitrage_opportunity',
          data: opportunities,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      console.log('[INFO] Пока арбитражных возможностей нет');
    }
  }, 3000);

  console.log("\nВсе 'слушатели' запущены. Ожидаем обновлений от бирж...");
}

// Экспорт приложения, функции инициализации WebSocket и функции main
export { app, initWebSocketServer, main };
