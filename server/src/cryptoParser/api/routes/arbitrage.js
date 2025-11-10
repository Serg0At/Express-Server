import express from 'express';
import { validateArbitrageParams } from '../validation/arbitrageValidation.js';
import { calculateArbitrageOpportunities } from '../../tools/calculateProfit.js';
import { quoteMap } from '../../tools/storage/proccessAndStorage.js';

const router = express.Router();

/**
 * @swagger
 * /api/arbitrage:
 *   get:
 *     summary: Получить актуальные арбитражные возможности
 *     description: Возвращает список арбитражных возможностей на основе заданных параметров
 *     parameters:
 *       - in: query
 *         name: min_spread
 *         schema:
 *           type: number
 *           minimum: 0
 *           default: 0.1
 *         description: Минимальный спред в процентах
 *       - in: query
 *         name: risk
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Учитывать ли риск (true/false)
 *       - in: query
 *         name: interval
 *         schema:
 *           type: number
 *           enum: [5, 10, 15, 30]
 *           default: 5
 *         description: Интервал в секундах
 *       - in: query
 *         name: min_volume
 *         schema:
 *           type: number
 *           minimum: 0.001
 *           default: 0.001
 *         description: Минимальный объем для торговли
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                         example: "ETH/USDT"
 *                       buy_exchange:
 *                         type: string
 *                         example: "Binance"
 *                       buy_price:
 *                         type: number
 *                         example: 1620.50
 *                       sell_exchange:
 *                         type: string
 *                         example: "Kraken"
 *                       sell_price:
 *                         type: number
 *                         example: 1635.20
 *                       spread_percent:
 *                         type: number
 *                         example: 0.91
 *                       gross_profit:
 *                         type: number
 *                         example: 14.70
 *                       net_profit_after_fees:
 *                         type: number
 *                         example: 12.84
 *                       volume:
 *                         type: number
 *                         example: 1.0
 *                       timestamp:
 *                         type: number
 *                         example: 1695555555
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Ошибка валидации параметров
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/', async (req, res, next) => {
  try {
    // Валидация параметров
    const validatedParams = validateArbitrageParams(req.query);

    // Получаем текущие данные рынка
    const marketData = Array.from(quoteMap.values());

    if (marketData.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No market data available',
        timestamp: new Date().toISOString(),
      });
    }

    // Рассчитываем арбитражные возможности
    const opportunities = await calculateArbitrageOpportunities(
      marketData,
      validatedParams.min_spread,
      validatedParams.min_volume,
    );

    // Форматируем данные для ответа
    const formattedOpportunities = opportunities.map(opp => {
      const grossProfit = (opp.sellPrice - opp.buyPrice) * validatedParams.min_volume;
      // const fees = grossProfit * 0.002; // Пример комиссии 0.2%
      const netProfit = opp.netSpread;

      return {
        symbol: opp.symbol,
        buy_exchange: opp.buyExchange,
        buy_price: Number(opp.buyPrice),
        sell_exchange: opp.sellExchange,
        sell_price: Number(opp.sellPrice),
        spread_percent: Number(opp.spread),
        gross_profit: Number(Number(grossProfit).toFixed(2)),
        net_profit_after_fees: Number(Number(netProfit).toFixed(2)),
        volume: validatedParams.min_volume,
        timestamp: Math.floor(Date.now() / 1000),
      };
    });

    // Фильтруем по минимальному объему
    const filteredOpportunities = formattedOpportunities.filter(
      opp => opp.volume >= validatedParams.min_volume,
    );

    res.json({
      success: true,
      data: filteredOpportunities,
      count: filteredOpportunities.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
