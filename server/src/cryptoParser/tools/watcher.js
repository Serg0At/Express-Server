import { quoteMap } from './storage/proccessAndStorage.js';
import { Quote } from './storage/models/Quote.js';

/**
 * Запускает бесконечный процесс "прослушки" тикера для одного символа.
 */
async function watchSymbol(exchangeInstance, market) {
  // Бесконечный цикл для автоматического переподключения в случае ошибки
  while (true) {
    try {
      // watchBidsAsks будет сам в цикле отдавать новые данные, как только они появятся
      const ticker = await exchangeInstance.watchTicker(market.symbol);

      // Как только мы получили новый тикер, мы обновляем нашу карту
      const quote = new Quote({
        exchange: market.exchange,
        symbol: ticker.symbol,
        bid: ticker.bid,
        ask: ticker.ask,
        timestamp: Date.now(),
        fee_maker: market.taker || 0,
        fee_taker: market.maker || 0,
        precision: market.precision?.price || null
      });

      const key = `${quote.exchange}:${quote.symbol}`;
      quoteMap.set(key, quote);

      const date = new Date().toLocaleTimeString();
      console.log(`[WS ${date}] Обновлено: ${key}, Bid: ${ticker.bid}`);

    } catch (e) {
      console.error(`[WS] Ошибка прослушки ${market.symbol} на ${market.exchange}:`, e.message, 'Переподключение через 5 сек...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

/**
 * Запускает процессы прослушки для всех рынков.
 */
export function startWatchers(marketMap, state) {
  console.log(`[WS] Запуск ${marketMap.size} "слушателей" для всех рынков...`);

  for (const market of marketMap.values()) {
    const exchangeInstance = state[market.exchange]?.instance;

    if (exchangeInstance && exchangeInstance.has['watchBidsAsks']) {
      // Запускаем каждого "слушателя" как отдельный, неблокирующий процесс
      watchSymbol(exchangeInstance, market);
    }
  }
}
