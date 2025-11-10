import { Quote } from "./models/Quote.js";
import { Market } from "./models/Market.js"

export const quoteMap = new Map();
export const marketMap = new Map();

export async function proccessAndStorageQuote(data) {
  if (!Array.isArray(data)) {
    console.error("Data of Quote is not an array");
    return
  }

  for (const quoteData of data) {
    const quote = new Quote(quoteData);

    const key = `${quote.exchange}: ${quote.symbol}`
    quoteMap.set(key, quote);
  }

  console.log("Data of quote successfully saved!")
}

export async function proccessAndStorageMarket(data) {

  if (!Array.isArray(data)) {
    console.error("Data of market is not an array");
    return
  }

  for (const marketData of data) {
    const market = new Market(marketData);
    const key = `${market.exchange}: ${market.symbol}`
    marketMap.set(key, market);
  }

  console.log("Data of market successfully saved!")
}
