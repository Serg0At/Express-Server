# Arbitrage Scanner API Documentation

## Обзор

API для получения арбитражных возможностей на криптовалютных биржах с поддержкой REST и WebSocket.

## Быстрый старт

### REST API

#### Получение арбитражных возможностей

```bash
GET /api/arbitrage?min_spread=0.5&min_volume=1.0
```

**Параметры:**
- `min_spread` (number, optional): Минимальный спред в процентах (по умолчанию: 0.1)
- `risk` (boolean, optional): Учитывать ли риск (по умолчанию: false)
- `interval` (number, optional): Интервал в секундах (5, 10, 15, 30, по умолчанию: 5)
- `min_volume` (number, optional): Минимальный объем для торговли (по умолчанию: 0.001)

**Пример ответа:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "ETH/USDT",
      "buy_exchange": "Binance",
      "buy_price": 1620.50,
      "sell_exchange": "Kraken",
      "sell_price": 1635.20,
      "spread_percent": 0.91,
      "gross_profit": 14.70,
      "net_profit_after_fees": 12.84,
      "volume": 1.0,
      "timestamp": 1695555555
    }
  ],
  "count": 1,
  "timestamp": "2023-09-25T10:30:00.000Z"
}
```

#### Информация о тарифах

```bash
GET /api/info/subscription-plans
```

#### Статус сервера

```bash
GET /api/info/status
```

### WebSocket API

#### Подключение

```javascript
const ws = new WebSocket('ws://localhost:3003');

ws.onopen = function() {
  // Отправляем параметры подписки
  ws.send(JSON.stringify({
    subscription_type: 'standard', // 'lite', 'standard', 'pro'
    min_spread: 0.5,
    risk: false,
    min_volume: 1.0
  }));
};

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'connection_confirmed':
      console.log('Подключение подтверждено:', data);
      break;
      
    case 'arbitrage_update':
      console.log('Новые возможности:', data.data);
      break;
      
    case 'error':
      console.error('Ошибка:', data.message);
      break;
  }
};
```

## Тарифные планы

### Lite (Бесплатно)
- ✅ REST API доступ
- ❌ WebSocket недоступен
- 📊 Обновления каждые 30 секунд
- 🔍 Базовые фильтры

### Standard ($29/месяц)
- ✅ REST API доступ
- ✅ WebSocket стриминг
- 📊 Обновления каждые 5 секунд
- 🔍 Расширенные фильтры
- 🎯 Приоритетная поддержка

### Pro ($99/месяц)
- ✅ REST API доступ
- ✅ WebSocket стриминг
- 📊 Обновления каждые 1-3 секунды
- 🔍 Все фильтры
- 🚀 Эксклюзивные возможности
- 🆘 24/7 поддержка

## Примеры использования

### JavaScript/Node.js

```javascript
// REST API
const response = await fetch('http://localhost:3003/api/arbitrage?min_spread=1.0');
const data = await response.json();
console.log(data);

// WebSocket
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3003');

ws.on('message', (data) => {
  const message = JSON.parse(data);
  if (message.type === 'arbitrage_update') {
    console.log('Новые возможности:', message.data);
  }
});
```

### Python

```python
import requests
import websocket
import json

# REST API
response = requests.get('http://localhost:3003/api/arbitrage', params={
    'min_spread': 1.0,
    'min_volume': 0.1
})
data = response.json()
print(data)

# WebSocket
def on_message(ws, message):
    data = json.loads(message)
    if data['type'] == 'arbitrage_update':
        print('Новые возможности:', data['data'])

ws = websocket.WebSocketApp('ws://localhost:3003',
                           on_message=on_message)
ws.run_forever()
```

### cURL

```bash
# Получить арбитражные возможности
curl "http://localhost:3004/api/arbitrage?min_spread=0.5&min_volume=1.0"

# Получить информацию о тарифах
curl "http://localhost:3004/api/info/subscription-plans"

# Получить статус сервера
curl "http://localhost:3004/api/info/status"
```

## Swagger документация

Полная документация API доступна по адресу:
```
http://localhost:3004/api/docs
```

## Обработка ошибок

### REST API ошибки

```json
{
  "error": "Validation Error",
  "message": "Validation error: \"min_spread\" must be greater than or equal to 0",
  "timestamp": "2023-09-25T10:30:00.000Z"
}
```

### WebSocket ошибки

```json
{
  "error": "Validation Error",
  "message": "WebSocket validation error: \"subscription_type\" is required"
}
```

## Коды ошибок

- `400` - Ошибка валидации параметров
- `500` - Внутренняя ошибка сервера

## Лимиты и ограничения

- **Lite**: Максимум 100 запросов в час
- **Standard**: Максимум 1000 запросов в час
- **Pro**: Без ограничений

## Поддержка

Для получения поддержки:
- Email: support@arbitrage-scanner.com
- Документация: http://localhost:5000/api/docs
- GitHub Issues: [ссылка на репозиторий]
