import ccxt from 'ccxt';

const exchangesList = [
  'binance', 'huobi', 'bitfinex', 'bitget', 'bitmart',
  'bybit', 'coinbase', 'gate', 'kraken', 'kucoin',
  'lbank', 'mexc', 'okx', 'poloniex', 'xt'
];

const state = {};

function initExchanges() {
  for (const id of exchangesList) {
    if (!ccxt[id]) continue;
    const ex = new ccxt[id]({ enableRatelimit: true });
    state[id] = { instance: ex };
  }
}

async function loadMarkets() {
  const allMarkets = [];
  for (const id in state) {
    try {
      const ex = state[id].instance;
      const markets = await ex.load_markets();
      for (const sym in markets) {
        const m = markets[sym];
        if (m.active && m.quote?.toUpperCase() === 'USDT') {
          allMarkets.push({ ...m, exchange: id });
        }
      }
    } catch (err) {
      console.error(`Ошибка загрузки рынков ${id}:`, err.message);
    }
  }
  return allMarkets;
}

// Эта функция нужна для получения ПЕРВОНАЧАЛЬНОГО снимка цен
async function getMarketSnapshot(marketMap) {
  const allMarkets = Array.from(marketMap.values());
  console.log(`[Snapshot] Запускаем один параллельный запрос для ${allMarkets.length} рынков...`);

  const promises = allMarkets.map(market => {
    const ex = state[market.exchange]?.instance;
    if (!ex) return Promise.reject(new Error(`No instance for ${market.exchange}`));
    return ex.fetchTicker(market.symbol);
  });

  const outcomes = await Promise.allSettled(promises);

  const allResults = [];
  outcomes.forEach((outcome, index) => {
    if (outcome.status === 'fulfilled') {
      const ticker = outcome.value;
      const originalMarket = allMarkets[index];

      if (ticker && originalMarket) {
        allResults.push({
          exchange: originalMarket.exchange,
          symbol: ticker.symbol,
          bid: ticker.bid,
          ask: ticker.ask,
          timestamp: ticker.timestamp || Date.now(),
          fee_maker: originalMarket.taker || 0,
          fee_taker: originalMarket.maker || 0,
          precision: originalMarket.precision?.price || null
        });
      }
    }
  });

  return allResults;
}

export { initExchanges, loadMarkets, getMarketSnapshot, state };
