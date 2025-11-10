Trials и Fingerprint
POST /trial

Позволяет проверить и зарегистрировать бесплатный пробный доступ пользователя по fingerprint.

Request Body (JSON):

{
"os": "string",
"browser": "string",
"resolution": "string",
"timezone": "string",
"language": "string",
"touch": "boolean"
}

Response (JSON):

Новый пробный доступ:

{
"allowed": true,
"reason": "NEW"
}

HARD MATCH (тот же fingerprint уже зарегистрирован):

{
"allowed": false,
"reason": "HARD_MATCH"
}

SOFT MATCH (похожий fingerprint найден, >= 70%):

{
"allowed": false,
"reason": "SOFT_MATCH",
"similarity": 0.75
}

Описание работы:

HARD MATCH — проверка точного совпадения хеша fingerprint.

SOFT MATCH — проверка похожести fingerprint (70% и выше) по основным характеристикам: OS, браузер, разрешение, таймзона, язык, touch.

Если fingerprint новый — создается запись в таблице trials.

Subscriptions
GET /getEndTime

Возвращает оставшееся время подписки пользователя в формате X days, Y hours или X hours.

Request Headers:

Authorization: Bearer <access_token>

Response:

{
"remaining": "24 days, 2 hours"
}

Если подписка истекла:

{
"remaining": "expired"
}

GET /getStatus

Возвращает статус подписки пользователя (active, canceled, trialing, past_due).

Request Headers:

Authorization: Bearer <access_token>

Response:

{
"status": "active"
}

Если подписка не найдена:

{
"message": "No subscription found"
}

GET /getPayedAmount

Возвращает сумму оплаченной подписки в долларах.

Request Headers:

Authorization: Bearer <access_token>

Response:

{
"amount": 25
}

Модели и таблицы

trials: хранит хеши и данные fingerprint пользователей, пробные периоды.
Поля: id, fp_hash, fp_data, user_ip, started_at, expires_at, created_at.

subscriptions: хранит активные подписки пользователей.
Поля: id, user_id, plan_id, status, payed_amount_cents, expires_at, created_at.

plans: хранит тарифные планы.
Поля: id, name, price_cents, interval, trial_days, created_at.

Алгоритм работы Free Trial

Пользователь кликает на "Try Free Trial".

Фронтенд собирает fingerprint (os, browser, resolution, timezone, language, touch) и IP.

Отправляет данные на /trial.

Backend проверяет:

HARD MATCH — 100% совпадение.

SOFT MATCH — ≥70% совпадение по основным полям.

Если не найдено совпадений — создается запись в trials.

После успешного прохождения проверки создается подписка типа trial на 1 день в subscriptions.
