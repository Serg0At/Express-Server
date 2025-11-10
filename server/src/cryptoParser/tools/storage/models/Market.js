export class Market {
  constructor({ exchange, symbol, base, quote, active, precision, limits }) {
    this.exchange = exchange;
    this.symbol = symbol;
    this.base = base;
    this.quote = quote;
    this.active = active;
    this.precision = precision;
    this.limits = limits;
  }
}
