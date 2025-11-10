export class Quote {
  constructor({ exchange, symbol, base, quote, bid, ask, timestamp, fee_maker, fee_taker, liquid_metric }) {
    this.exchange = exchange; // Биржа
    this.symbol = symbol; // пара (Например: ETH/USDT)
    this.base = base; // Базовый токен
    this.quote = quote; // Котировачный валюта всегда USDT 
    this.bid = bid; //Лучшная цена для покупки
    this.ask = ask; // Лучшая цена для продажи 
    this.timestamp = timestamp; // Время получения
    this.fee_maker = fee_maker;
    this.fee_taker = fee_taker;
    this.liquid_metric = liquid_metric; // Оценка ликвидности по стакану
  }
}
