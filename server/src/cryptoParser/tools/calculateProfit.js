import ccxt from 'ccxt';

export async function calculateArbitrageOpportunities(
  marketData,
  minSpreadPercent = 0.1,
  tradeAmount = 1,
) {
  console.log(
    `[ARBITRAGE] Новый запуск: котировок = ${marketData.length}, объем = ${tradeAmount}`,
  );

  // Конфигурация бирж с API ключами
  const exchangesConfig = {
    binance: {
      apiKey:
        'Dcwm4h9nhswRqEg9XB0IaMWMBO63VPXo9Ve5mNrNVtxzLakB6lckjnocBwBHedwm',
      secret:
        'X2nNB8MFOGyCVouaFXOy2a2L5rJ1zLecTopa9P2NoMTgwA1HJ6uAiI5iX2XO097I',
    },
    kucoin: {
      apiKey: '68803a9cc714e80001eee173',
      secret: '9cab2d96-b4dc-4a3a-bcd6-9114ea3a36d1',
      password: '/7&g74lHLxd4',
    },
    okx: {
      apiKey: 'a402d02a-3fb9-4ff6-a73a-beed19097b76',
      secret: '89D1615C9445964E1CF3FF772544B699',
      password: '/7&g74lHLxd4',
    },
    bitget: {
      apiKey: 'bg_579b0737deef0a758a99a5c7cc508228',
      secret:
        '38e3195be07ab1229eb99ea9b9551df0f6b52130b91c088e0ff9a564acd97b5c',
      password: '7g74lHLxd4',
    },
    bybit: {
      apiKey: 'PYeSht5oU2s4Zn39UD',
      secret: '67C4Wc5fJ4jYdLscT3CCZSzEAwBv4TeblF9n',
    },
    mexc: {
      apiKey: 'mx0vgl6KfvFdjr3rhf',
      secret: 'b2e131c856e9439d82c9f4c3533dc65c',
    },
    huobi: {
      apiKey: '6c8a52a3-0482e468-7d4c9b3b-7yngd7gh5g',
      secret: '7b0c2a6c-80b2092b-ec7ac755-200b3',
    },
    bitmart: {
      apiKey: 'bd8dd254f52559e44aaed2dcb59d102ff706ce8e',
      secret:
        'd8a7828ddbeffd5a14d5a1994c87990612eb5a55ba860c9a392ada03a44d2e30',
    },
    lbank: {
      apiKey: '625651d8-7a1f-472e-8378-90ce7023013f',
      secret: '5DCA963DDC42138457313208767584AD',
    },
    poloniex: {
      apiKey: '4RA5FEB5-08C4J8O1-411F3WW3-PAB90O1K',
      secret:
        '6a6756186b3693da19180f0a77870cd5b6b3c21e44c84a07a8b2c744461a110f44d406243fa50c10af60b161ee0062f349f239605d15551c14592c5a9bf0afee',
    },
  };

  // Default fees (base rates, adjust based on your VIP level)
  const defaultFees = {
    kucoin: {
      trading: { taker: 0.001, maker: 0.0008 },
      withdraw: 0.001,
      deposit: 0,
    },
    okx: {
      trading: { taker: 0.001, maker: 0.0008 },
      withdraw: 0.0005,
      deposit: 0,
    },
    huobi: {
      trading: { taker: 0.002, maker: 0.002 },
      withdraw: 0.002,
      deposit: 0,
    },
    mexc: { trading: { taker: 0.0005, maker: 0 }, withdraw: 0, deposit: 0 },
    bitmart: {
      trading: { taker: 0.0025, maker: 0.0015 },
      withdraw: 0.002,
      deposit: 0,
    },
    poloniex: {
      trading: { taker: 0.00125, maker: 0.00075 },
      withdraw: 0.001,
      deposit: 0,
    },
    // Add for others if needed
  };

  // Инициализация бирж
  const exchanges = {};
  const feesCache = {};
  for (const [exchangeId, config] of Object.entries(exchangesConfig)) {
    exchanges[exchangeId] = new ccxt[exchangeId]({
      apiKey: config.apiKey,
      secret: config.secret,
      password: config.password, // Включили для бирж, где требуется
      enableRateLimit: true,
    });

    try {
      const tradingFees = await exchanges[exchangeId].fetchTradingFees();
      const withdrawFees =
        await exchanges[exchangeId].fetchDepositWithdrawFees();
      feesCache[exchangeId] = {
        trading: tradingFees,
        withdraw: withdrawFees,
      };
      console.log(`[ARBITRAGE] Комиссии загружены для ${exchangeId} (unified)`);
    } catch (error) {
      console.error(
        `[ARBITRAGE] Ошибка unified для ${exchangeId}: ${error.message}`,
      );

      // Custom fallback
      let customTrading = null;
      let customWithdraw = null;
      try {
        if (exchangeId === 'binance') {
          const response = await exchanges[
            exchangeId
          ].privateGetSapiV1AssetTradeFee({ symbol: 'BTCUSDT' }); // Example symbol, adjust if needed
          customTrading = {
            '*': {
              taker: parseFloat(response.data[0].taker),
              maker: parseFloat(response.data[0].maker),
            },
          };
          const withdrawResponse =
            await exchanges[exchangeId].privateGetSapiV1CapitalConfigGetall();
          customWithdraw = {};
          for (const asset of withdrawResponse.data) {
            if (asset.networkList && asset.networkList[0]) {
              customWithdraw[asset.coin] = {
                withdraw: {
                  fee: parseFloat(asset.networkList[0].withdrawFee),
                  percentage: false,
                },
              };
            }
          }
          console.log(
            `[ARBITRAGE] Binance custom fees parsed: trading=${JSON.stringify(customTrading)}, withdraw=${JSON.stringify(customWithdraw)}`,
          );
        } else if (exchangeId === 'kucoin') {
          const response = await exchanges[exchangeId].privateGetTradeFees();
          customTrading = {
            '*': {
              taker: parseFloat(response.data[0].takerFeeRate),
              maker: parseFloat(response.data[0].makerFeeRate),
            },
          };
          const withdrawResponse = await exchanges[
            exchangeId
          ].privateGetWithdrawalsQuotas({ currency: 'USDT' }); // Adjust per base later
          customWithdraw = {
            USDT: {
              withdraw: {
                fee: parseFloat(withdrawResponse.data.withdrawMinFee),
                percentage: false,
              },
            },
          };
          console.log(
            `[ARBITRAGE] KuCoin custom fees parsed: trading=${JSON.stringify(customTrading)}, withdraw=${JSON.stringify(customWithdraw)}`,
          );
        } else if (exchangeId === 'okx') {
          const response = await exchanges[
            exchangeId
          ].privateGetAccountTradeFee({ instType: 'SPOT' });
          customTrading = {
            '*': {
              taker: parseFloat(response.data[0].taker),
              maker: parseFloat(response.data[0].maker),
            },
          };
          const withdrawResponse =
            await exchanges[exchangeId].privateGetAssetCurrencies();
          customWithdraw = {};
          for (const currency of withdrawResponse.data) {
            if (currency.chains && currency.chains[0]) {
              customWithdraw[currency.ccy] = {
                withdraw: {
                  fee: parseFloat(currency.chains[0].withdrawFee),
                  percentage: false,
                },
              };
            }
          }
          console.log(
            `[ARBITRAGE] OKX custom fees parsed: trading=${JSON.stringify(customTrading)}, withdraw=${JSON.stringify(customWithdraw)}`,
          );
        } else if (exchangeId === 'huobi') {
          const response = await exchanges[
            exchangeId
          ].privateGetV2FeeFeeRateGet({ symbols: 'btcusdt' });
          customTrading = {
            '*': {
              taker: parseFloat(response.data[0].actualTakerRate),
              maker: parseFloat(response.data[0].actualMakerRate),
            },
          };
          const withdrawResponse =
            await exchanges[exchangeId].privateGetV2ReferenceCurrencies();
          customWithdraw = {};
          for (const currency of withdrawResponse.data) {
            if (currency.chains && currency.chains[0]) {
              customWithdraw[currency.currency] = {
                withdraw: {
                  fee: parseFloat(currency.chains[0].transactFeeWithdraw),
                  percentage: false,
                },
              };
            }
          }
          console.log(
            `[ARBITRAGE] Huobi custom fees parsed: trading=${JSON.stringify(customTrading)}, withdraw=${JSON.stringify(customWithdraw)}`,
          );
        } else if (exchangeId === 'mexc') {
          const response =
            await exchanges[exchangeId].privateGetCapitalConfigGetall();
          customTrading = { '*': { taker: 0.0005, maker: 0 } }; // Static fallback, adjust if response provides user-specific fees
          customWithdraw = {};
          for (const currency of response.data) {
            if (currency.networkList && currency.networkList[0]) {
              customWithdraw[currency.currency] = {
                withdraw: {
                  fee: parseFloat(currency.networkList[0].withdrawFee),
                  percentage: false,
                },
              };
            }
          }
          console.log(
            `[ARBITRAGE] MEXC custom fees parsed: trading=${JSON.stringify(customTrading)}, withdraw=${JSON.stringify(customWithdraw)}`,
          );
        } else if (exchangeId === 'bitmart') {
          const response = await exchanges[exchangeId].privateGetAccountV1Fee();
          customTrading = {
            '*': {
              taker: parseFloat(response.data.taker_fee_rate),
              maker: parseFloat(response.data.maker_fee_rate),
            },
          };
          const withdrawResponse =
            await exchanges[exchangeId].privateGetAccountV1WithdrawCharge();
          customWithdraw = {};
          for (const currency of withdrawResponse.data) {
            customWithdraw[currency.currency] = {
              withdraw: {
                fee: parseFloat(currency.withdraw_fee),
                percentage: false,
              },
            };
          }
          console.log(
            `[ARBITRAGE] BitMart custom fees parsed: trading=${JSON.stringify(customTrading)}, withdraw=${JSON.stringify(customWithdraw)}`,
          );
        } else if (exchangeId === 'poloniex') {
          const response =
            await exchanges[exchangeId].privatePostReturnFeeInfo();
          customTrading = {
            '*': {
              taker: parseFloat(response.data.takerFee),
              maker: parseFloat(response.data.makerFee),
            },
          };
          const withdrawResponse =
            await exchanges[exchangeId].privatePostReturnCurrencies();
          customWithdraw = {};
          for (const [currency, details] of Object.entries(
            withdrawResponse.data,
          )) {
            customWithdraw[currency] = {
              withdraw: {
                fee: parseFloat(details.withdrawalFee),
                percentage: false,
              },
            };
          }
          console.log(
            `[ARBITRAGE] Poloniex custom fees parsed: trading=${JSON.stringify(customTrading)}, withdraw=${JSON.stringify(customWithdraw)}`,
          );
        }

        if (customTrading && customWithdraw) {
          feesCache[exchangeId] = {
            trading: customTrading,
            withdraw: customWithdraw,
          };
          console.log(
            `[ARBITRAGE] Custom комиссии загружены для ${exchangeId}`,
          );
        } else {
          console.error(
            `[ARBITRAGE] Не удалось загрузить custom комиссии для ${exchangeId}: trading=${!!customTrading}, withdraw=${!!customWithdraw}`,
          );
        }
      } catch (customError) {
        console.error(
          `[ARBITRAGE] Custom ошибка для ${exchangeId}: ${customError.message}`,
        );
      }

      // Ultimate fallback to defaults
      if (!feesCache[exchangeId] && defaultFees[exchangeId]) {
        feesCache[exchangeId] = {
          trading: { '*': defaultFees[exchangeId].trading },
          withdraw: {
            '*': {
              withdraw: { percentage: defaultFees[exchangeId].withdraw },
              deposit: { percentage: defaultFees[exchangeId].deposit },
            },
          },
        };
        console.log(`[ARBITRAGE] Использую default комиссии для ${exchangeId}`);
      }
    }
  }

  // Сгруппируем котировки по символам
  const groupedBySymbol = {};
  for (const d of marketData) {
    if (!d.symbol) continue;
    if (!groupedBySymbol[d.symbol]) groupedBySymbol[d.symbol] = {};
    groupedBySymbol[d.symbol][d.exchange] = {
      bid: d.bid,
      ask: d.ask,
    };
  }

  const results = [];
  let checkedSymbols = 0;

  const symbols = Object.keys(groupedBySymbol);
  console.log(`[ARBITRAGE] Символов для анализа: ${symbols.length}`);

  for (const symbol of symbols) {
    const data = groupedBySymbol[symbol];
    if (!data) continue;

    let bestAsk = null;
    let bestBid = null;

    for (const [exchangeId, { bid, ask }] of Object.entries(data)) {
      if (ask && (!bestAsk || ask < bestAsk.price)) {
        bestAsk = { exchangeId, price: ask };
      }
      if (bid && (!bestBid || bid > bestBid.price)) {
        bestBid = { exchangeId, price: bid };
      }
    }

    if (!bestAsk || !bestBid || bestAsk.exchangeId === bestBid.exchangeId) {
      continue;
    }

    // Получаем комиссии для бирж покупки и продажи
    const buyExchangeFees = feesCache[bestAsk.exchangeId];
    const sellExchangeFees = feesCache[bestBid.exchangeId];
    if (!buyExchangeFees || !sellExchangeFees) {
      console.log(
        `[ARBITRAGE] Пропуск ${symbol}: нет комиссий для ${bestAsk.exchangeId} или ${bestBid.exchangeId}`,
      );
      continue;
    }

    // Предполагаем, что symbol типа 'BTC/USDT', base = 'BTC', quote = 'USDT'
    const [base, quote] = symbol.split('/');

    // Trading fees: используем taker для buy/sell (conservative)
    const buyTakerFee =
      buyExchangeFees.trading[symbol]?.taker ||
      buyExchangeFees.trading['*']?.taker ||
      0.001;
    const sellTakerFee =
      sellExchangeFees.trading[symbol]?.taker ||
      sellExchangeFees.trading['*']?.taker ||
      0.001;

    // Withdrawal fee from buyExchange (withdraw base asset), deposit to sellExchange usually 0
    let withdrawFeePercent =
      buyExchangeFees.withdraw[base]?.withdraw?.percentage ||
      buyExchangeFees.withdraw['*']?.withdraw?.percentage ||
      0;
    const withdrawFeeFixed =
      buyExchangeFees.withdraw[base]?.withdraw?.fee ||
      buyExchangeFees.withdraw['*']?.withdraw?.fee ||
      0;
    if (withdrawFeeFixed > 0) {
      withdrawFeePercent = withdrawFeeFixed / (bestAsk.price * tradeAmount); // Convert fixed to %
    }
    const depositFeePercent =
      sellExchangeFees.withdraw[base]?.deposit?.percentage ||
      sellExchangeFees.withdraw['*']?.deposit?.percentage ||
      0;

    // Расчёт эффективных цен с учётом trading fees
    const effectiveBuyPrice = bestAsk.price * (1 + buyTakerFee); // Buy ask + fee
    const effectiveSellPrice = bestBid.price * (1 - sellTakerFee); // Sell bid - fee

    // Transfer costs in % (approximate)
    const transferCostPercent = withdrawFeePercent + depositFeePercent;

    // Эффективный спред в % с учётом всех комиссий
    const netSpread =
      ((effectiveSellPrice - effectiveBuyPrice) / effectiveBuyPrice) * 100 -
      transferCostPercent;

    if (netSpread >= minSpreadPercent) {
      // Генерация ссылок на монеты (примеры; настройте под ваши биржи)
      let buyLink = `https://${bestAsk.exchangeId}.com/trade/${symbol}`;
      let sellLink = `https://${bestBid.exchangeId}.com/trade/${symbol}`;
      switch (bestAsk.exchangeId) {
        case 'binance':
          buyLink = `https://www.binance.com/en/trade/${symbol.replace('/', '_')}`;
          break;
        case 'bybit':
          buyLink = `https://www.bybit.com/en/trade/spot/${symbol.replace('/', '')}`;
          break;
        case 'kucoin':
          buyLink = `https://www.kucoin.com/trade/${symbol.replace('/', '-')}`;
          break;
        case 'okx':
          buyLink = `https://www.okx.com/trade-spot/${symbol.toLowerCase().replace('/', '-')}`;
          break;
        case 'huobi':
          buyLink = `https://www.htx.com/en-us/trade/${symbol.toLowerCase().replace('/', '_')}`;
          break;
        case 'mexc':
          buyLink = `https://www.mexc.com/exchange/${symbol.replace('/', '_')}`;
          break;
        case 'bitmart':
          buyLink = `https://www.bitmart.com/trade/en-US?symbol=${symbol.replace('/', '_')}`;
          break;
        case 'poloniex':
          buyLink = `https://www.poloniex.com/trade/${symbol.replace('/', '_')}`;
          break;
        case 'bitget':
          buyLink = `https://www.bitget.com/spot/${symbol.replace('/', '_')}?type=spot`;
          break;
        case 'lbank':
          buyLink = `https://www.lbank.com/trade/${symbol.toLowerCase().replace('/', '_')}`;
          break;
      }
      switch (bestBid.exchangeId) {
        case 'binance':
          sellLink = `https://www.binance.com/en/trade/${symbol.replace('/', '_')}`;
          break;
        case 'bybit':
          sellLink = `https://www.bybit.com/en/trade/spot/${symbol.replace('/', '')}`;
          break;
        case 'kucoin':
          sellLink = `https://www.kucoin.com/trade/${symbol.replace('/', '-')}`;
          break;
        case 'okx':
          sellLink = `https://www.okx.com/trade-spot/${symbol.toLowerCase().replace('/', '-')}`;
          break;
        case 'huobi':
          sellLink = `https://www.htx.com/en-us/trade/${symbol.toLowerCase().replace('/', '_')}`;
          break;
        case 'mexc':
          sellLink = `https://www.mexc.com/exchange/${symbol.replace('/', '_')}`;
          break;
        case 'bitmart':
          sellLink = `https://www.bitmart.com/trade/en-US?symbol=${symbol.replace('/', '_')}`;
          break;
        case 'poloniex':
          sellLink = `https://www.poloniex.com/trade/${symbol.replace('/', '_')}`;
          break;
        case 'bitget':
          sellLink = `https://www.bitget.com/spot/${symbol.replace('/', '_')}?type=spot`;
          break;
        case 'lbank':
          sellLink = `https://www.lbank.com/trade/${symbol.toLowerCase().replace('/', '_')}`;
          break;
      }

      results.push({
        symbol,
        buyExchange: bestAsk.exchangeId,
        buyPrice: bestAsk.price,
        sellExchange: bestBid.exchangeId,
        sellPrice: bestBid.price,
        netSpread: netSpread.toFixed(2),
        buyLink,
        sellLink,
      });
    }

    checkedSymbols++;
    if (checkedSymbols % 50 === 0) {
      console.log(
        `[ARBITRAGE] Прогресс: ${checkedSymbols}/${symbols.length} символов проверено...`,
      );
    }
  }

  console.log(`[ARBITRAGE] Анализ завершен.`);
  console.log(`[ARBITRAGE] Всего проверено символов: ${symbols.length}`);
  console.log(`[ARBITRAGE] Найдено возможностей: ${results.length}`);

  if (results.length === 0) {
    console.log(`[ARBITRAGE] Возможностей для арбитража не найдено.`);
  } else {
    console.log(`[ARBITRAGE] Топ-5 возможностей:`);
    results.slice(0, 5).forEach(r => {
      console.log(
        `- ${r.symbol}: купить на ${r.buyExchange} (${r.buyPrice}, link: ${r.buyLink}), продать на ${r.sellExchange} (${r.sellPrice}, link: ${r.sellLink}), чистый спред=${r.netSpread}%`,
      );
    });
  }

  return results;
}
