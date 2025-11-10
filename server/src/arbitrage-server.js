import 'dotenv/config';
import { createServer } from 'http';
import {
  app as arbitrageApp,
  initWebSocketServer,
  main,
} from './cryptoParser/index.js';

const server = createServer(arbitrageApp);
const WS_PORT = process.env.WS_PORT || 5001;

const start = async () => {
  try {
    // Initialize WebSocket server
    const wsServer = initWebSocketServer(server);

    // Start arbitrage logic
    await main();

    // Start server
    server.listen(WS_PORT, () => {
      console.log(
        `Арбитражный WebSocket сервер запущен на http://localhost:${WS_PORT}`,
      );
      console.log(`WebSocket доступен на ws://localhost:${WS_PORT}`);
    });
  } catch (error) {
    console.log('Ошибка при запуске арбитражного сервера:', error);
  }
};

start();
