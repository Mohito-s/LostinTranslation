# Руководство разработчика: Telegram Mini App и Облачные базы данных
*Персональное руководство по масштабированию LostInTranslation (LIT) API*

В этом документе собраны лучшие архитектурные практики по подключению баз данных, развертыванию Telegram Mini App (TMA) и запуску ИИ-агента для автоматического продвижения и монетизации вашего сервиса.

---

## 1. Подключение облачной базы данных (Database Scaling)

Чтобы перейти от демонстрационных встроенных хранилищ к реальному использованию, рекомендуется подключить облачную базу данных. Ниже представлены два лучших варианта для инди-разработчиков: **Firebase Firestore (NoSQL)** и **PostgreSQL / Supabase (SQL)**.

### Вариант А: Firebase Firestore (Рекомендуемый NoSQL-стек)
Firestore идеален для быстрого старта, не требует написания SQL-миграций, а бесплатного лимита (50 000 операций чтения в день) хватит для тысяч активных пользователей.

#### Шаблон интеграции на Node.js / TypeScript:

```typescript
// src/lib/firebaseDb.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

let db: FirebaseFirestore.Firestore;

export function getFirebaseDb() {
  if (!db) {
    // В продакшене обязательно используйте переменные окружения!
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
    
    initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore();
  }
  return db;
}

// Пример: Получение всех API-ключей
export async function getApiKeysFromFirebase() {
  const firestore = getFirebaseDb();
  const snapshot = await firestore.collection('api_keys').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Пример: Запись лога использования с атомарным обновлением счетчика
export async function addUsageLogToFirebase(log: any) {
  const firestore = getFirebaseDb();
  const logRef = firestore.collection('usage_logs').doc();
  
  await logRef.set({
    ...log,
    timestamp: new Date().toISOString()
  });
  
  // Обновляем счетчик использования ключа атомарно
  if (log.apiKey && log.apiKey !== 'free') {
    const keyQuery = await firestore.collection('api_keys')
      .where('key', '==', log.apiKey)
      .limit(1)
      .get();
      
    if (!keyQuery.empty) {
      const keyDoc = keyQuery.docs[0];
      await keyDoc.ref.update({
        usageCount: FieldValue.increment(1)
      });
    }
  }
}
```

---

### Вариант Б: PostgreSQL (Supabase / Neon)
Если вы предпочитаете реляционную структуру данных и хотите делать аналитические SQL-запросы, PostgreSQL будет отличным выбором.

#### 1. SQL Schema (Структура таблиц):

```sql
-- Создание таблицы API-ключей
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(50) PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active' или 'revoked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tier VARCHAR(20) DEFAULT 'free', -- 'free' или 'paid'
    usage_count INTEGER DEFAULT 0
);

-- Создание таблицы логов использования
CREATE TABLE IF NOT EXISTS usage_logs (
    id SERIAL PRIMARY KEY,
    api_key VARCHAR(100) NOT NULL,
    endpoint VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    text_length INTEGER NOT NULL,
    losses_detected INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT TRUE,
    ip_address VARCHAR(45)
);

-- Создание индексов для быстрой выборки данных
CREATE INDEX idx_keys_key ON api_keys(key);
CREATE INDEX idx_logs_apikey ON usage_logs(api_key);
```

#### 2. Пример подключения на Node.js:

```typescript
// src/lib/postgresDb.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Вставляется из Supabase / Neon / Render
  ssl: { rejectUnauthorized: false }
});

// Проверка валидности API-ключа
export async function validateApiKeyInPostgres(keyString: string) {
  const result = await pool.query(
    'SELECT * FROM api_keys WHERE key = $1 AND status = \'active\'', 
    [keyString]
  );
  return result.rows[0] || null;
}

// Запись лога и транзакционное увеличение счетчика вызовов
export async function addUsageLogToPostgres(log: any) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Вставка лога транзакции
    await client.query(
      `INSERT INTO usage_logs (api_key, endpoint, text_length, losses_detected, success, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [log.apiKey, log.endpoint, log.textLength, log.lossesDetected, log.success, log.ipAddress]
    );
    
    // Инкремент счетчика использования ключа
    if (log.apiKey && log.apiKey !== 'free') {
      await client.query(
        'UPDATE api_keys SET usage_count = usage_count + 1 WHERE key = $1',
        [log.apiKey]
      );
    }
    
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

---

## 2. Развертывание внутри Telegram как Mini App (TMA)

Ваше приложение готово для работы прямо внутри Telegram на смартфонах. Чтобы Mini App выглядел нативно и общался с мессенджером, выполните следующие шаги:

### 1. Подключение Telegram WebApp SDK
Добавьте этот скрипт в секцию `<head>` вашего файла `/index.html`:

```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>

<script>
  window.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Сообщаем Telegram, что приложение готово к рендерингу
      tg.ready();
      
      // Раскрываем Mini App на всю доступную высоту экрана
      tg.expand();
      
      // Синхронизируем цвета интерфейса с темой Telegram пользователя
      document.body.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
      document.body.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
      
      console.log('Пользователь Telegram:', tg.initDataUnsafe.user);
    }
  });
</script>
```

### 2. Регистрация Mini App через @BotFather
1. Откройте `@BotFather` в Telegram и введите `/newapp`.
2. Выберите вашего бота, к которому хотите прикрепить приложение.
3. Укажите имя приложения и краткое описание.
4. Загрузите квадратную иконку (150x150) и GIF-демонстрацию.
5. В качестве **Web App URL** укажите ваш публичный домен приложения (например, `https://your-app-domain.com`).
6. Готово! Вы получите прямую ссылку формата `t.me/your_bot/app_name`.

---

## 3. Настройка ИИ-агента Hermes для Telegram-канала

Чтобы не тратить время на маркетинг, вы можете поручить привлечение аудитории ИИ-агенту Hermes. Вот оптимизированный промт для его настройки:

```text
Ты — ИИ-агент Hermes, экспертный маркетолог и лингвистический ассистент проекта LostInTranslation (LIT) API.
Твоя цель — общаться с подписчиками Telegram-канала, рассказывать про "культурные потери" генеративных моделей и предлагать попробовать API.

Паттерн диалога:
1. Заметь, когда пользователи пишут о странностях машинного перевода или о том, что LLM не понимают иронию, вежливый отказ или тонкий юмор.
2. Приведи яркий пример! Например, японское "行けたら行く" (пойду если смогу), которое в 99% случаев означает вежливый отказ "я не приду", но обычные ИИ переводят буквально как согласие "я приду, если смогу".
3. Дай ссылку на Telegram Mini App LostInTranslation и предложи выпустить бесплатный API-ключ в Дашборде разработчика.
4. Будь профессиональным, пиши на легком, живом языке (вайб "дружелюбный эксперт").

Ссылка на Mini App: [Ваша Ссылка на TMA]
Доступные эндпоинты:
- GET /api/dashboard/stats — статистика предотвращенных потерь смысла
- POST /api/analyze — глубокий анализ текста для извлечения культурных потерь
- POST /api/enhance — обогащение исходных промтов специальной лингвистической разметкой
```

### Вайб-хак (Автоматизация раздачи ключей)
Вы можете настроить webhook для ИИ-агента. Если лояльный подписчик пишет боту или в канал фразу вроде *"Дай ключ для тестов"*, ИИ-агент может программно отправить POST-запрос на ваш эндпоинт `/api/keys` и выдать сгенерированный токен пользователю в ЛС. Это создаст потрясающий вау-эффект у аудитории!

---

## 4. Безопасность и хранение секретов (Secrets Management)

Поскольку ваш GitHub-репозиторий является открытым, соблюдайте важные правила безопасности:

1. **Никогда не хардкодьте секреты:** API-ключи (включая `GEMINI_API_KEY`) всегда должны считываться из переменных окружения (`process.env.GEMINI_API_KEY`).
2. **Файл `.env` добавлен в `.gitignore`:** Файлы с локальными секретами (`.env`, `.env.local`) защищены от случайного коммита. Шаблоны конфигурации хранятся в `.env.example` без значений.
3. **Хеширование ключей в БД (Опционально):** Храните в базе данных только хеши (sha256) выданных ключей. При входящем запросе вычисляйте хеш присланного заголовка `X-LIT-API-KEY` и сопоставляйте с базой. Это гарантирует, что даже при утечке всей БД никто не сможет воспользоваться ключами ваших пользователей.
