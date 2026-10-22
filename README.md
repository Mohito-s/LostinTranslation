# 🌐 LostInTranslation API (LIT API) 🛰️

<p align="center">
  <img src="https://img.shields.io/badge/License-AGPL%20v3-red.svg" alt="AGPL-3.0 License" />
  <img src="https://img.shields.io/badge/Node.js-v20%2B-emerald.svg" alt="Node.js Version" />
  <img src="https://img.shields.io/badge/Framework-React%2019%20%2B%20Vite-blue.svg" alt="React & Vite" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Supabase-darkblue.svg" alt="PostgreSQL / Supabase" />
  <img src="https://img.shields.io/badge/AI_Engine-Gemini%203.5-violet.svg" alt="Gemini Engine" />
  <a href="https://github.com/Mohito-s/LostinTranslation/actions/workflows/ci.yml"><img src="https://github.com/Mohito-s/LostinTranslation/actions/workflows/ci.yml/badge.svg" alt="CI Status" /></a>
</p>

---

### [RU] Описание проекта

**LostInTranslation API** — это умный лингвистический middleware-слой для обогащения промтов ИИ глубоким культурным, эмоциональным, вежливым и грамматическим контекстом на разных языках (включая русский, японский, немецкий, испанский и др.). Он улавливает тонкие оттенки смысла, скрытые намерения и вежливость собеседников, предотвращая смысловые потери при обычном машинном переводе.

### [EN] Project Description

**LostInTranslation API** is an intelligent linguistic middleware layer designed to enrich AI prompts with deep cultural, emotional, polite, and grammatical context across multiple languages (including Russian, Japanese, German, Spanish, etc.). It captures subtle nuances, hidden intents, and speaker politeness, preventing semantic erosion caused by standard machine translation.

---

## Содержание / Table of Contents

- [Возможности / Features](#-возможности--features)
- [Архитектура / System Architecture](#-архитектура--system-architecture)
- [API Endpoints](#-api-endpoints)
- [Конфигурация / Configuration](#-конфигурация--configuration)
- [Быстрый старт / Quick Start](#-быстрый-старт--quick-start)
- [Структура проекта / Project Structure](#-структура-проекта--project-structure)
- [База данных / Database](#-база-данных--database)
- [Разработка и контрибьюция / Contributing](#-разработка-и-контрибьюция--contributing)
- [Лицензия / License (AGPL-3.0)](#-лицензия--license-agpl-30)

---

## ✨ Возможности / Features

- **Двойной режим анализа:** `POST /api/analyze` — находит «потери смысла» в тексте; `POST /api/enhance` — обогащает исходный промт контекстным блоком перед отправкой в целевую LLM.
- **Cultural QA & Compare:** `POST /api/compare` — оценивает пару «оригинал → перевод», рассчитывает процент сохраненного смысла (Severity Score) и формирует рекомендации.
- **Token Saver & OpenAI Proxy:** `POST /v1/chat/completions` — drop-in совместимый прокси для экосистемы OpenAI / LangChain / Cursor, сжимающий промты до 65% токенов с сохранением культурной выразительности.
- **Культурная глубина:** модальные частицы, вежливость, хеджирование, умаление (understatement), суффиксы и видовые формы глаголов (RU, JA, DE, ES, FR и др.).
- **Многоязычность:** глубокий анализ русского, японского, немецкого, испанского, французского и китайского языков.
- **Разработческий шлюз:** выдача API-ключей (free / paid), rate-limiting (по IP и токенам), статистика вызовов, PBKDF2/HMAC-аутентификация.
- **Встраиваемый виджет:** готовый JavaScript-скрипт (`public/widget.js`) для вставки анализа на любой внешний сайт или блог в 2 строки.
- **PWA & Мобильная поддержка:** Progressive Web App с оффлайн-кэшированием и поддержкой мобильных экранов.

---

## 🏗 Архитектура / System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   CLIENT (SPA / PWA)                   │
│         React 19 + Tailwind CSS + Lucide Icons         │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON
┌───────────────────────────▼────────────────────────────┐
│                   EXPRESS GATEWAY                      │
│               - Rate Limiter (IP & API Keys)           │
│               - Crypto Auth Module (PBKDF2 + HMAC)     │
│               - OpenAPI / Swagger UI (/docs)           │
└───────────────────────────┬────────────────────────────┘
                            ├────────────────────────────┐
┌───────────────────────────▼────────────┐  ┌────────────▼────────────┐
│             AI ENGINE                  │  │    PERSISTENCE LAYER    │
│       - Gemini 3.5 SDK Integration     │  │  - Primary: Supabase/PG │
│       - Semantic Loss Analysis         │  │  - Fallback: Local JSON │
│       - Token Saver / Prompt Optimizer │  │    (Fully Git-Ignored!) │
└────────────────────────────────────────┘  └─────────────────────────┘
```

---

## 🔌 API Endpoints

| Метод | URL | Авторизация | Описание |
|-------|-----|-------------|----------|
| `GET`  | `/api/health` | — | Системный healthcheck, аптайм сервера |
| `POST` | `/api/analyze` | опционально (ключ или JWT) | Анализ текста на культурные потери смысла |
| `POST` | `/api/compare` | опционально (ключ или JWT) | Cultural QA: сравнение «исходник → перевод», severity + скоринг |
| `POST` | `/api/enhance` | **обязателен API-ключ** (`x-api-key` / `Bearer`) | Обогащение промта культурным контекстом |
| `POST` | `/api/optimize-prompt` | опционально (ключ или JWT) | Token Saver: перевод промта в high-density English (до 65% экономии токенов) |
| `POST` | `/v1/chat/completions` | опционально (ключ или JWT) | Drop-in OpenAI-совместимый прокси с культурной оптимизацией |
| `GET`  | `/api/growth/benchmark` | — | Публичный бенчмарк и сравнение моделей LLM |
| `GET`  | `/api/growth/badge` | — | Динамический SVG-бейдж статуса для GitHub |
| `POST` | `/api/auth/register` | — | Регистрация разработчика |
| `POST` | `/api/auth/login` | — | Вход, получение JWT |
| `GET`  | `/api/auth/me` | JWT | Профиль текущего пользователя |
| `GET`  | `/api/keys` | JWT | Список ключей разработчика |
| `POST` | `/api/keys` | JWT | Генерация нового ключа `{ name, tier }` |
| `POST` | `/api/keys/revoke` | JWT | Отзыв ключа `{ key }` |
| `GET`  | `/api/dashboard/stats` | JWT | Статистика дашборда |

### Пример: `POST /api/enhance`

```bash
curl -X POST http://localhost:3000/api/enhance \
  -H "Content-Type: application/json" \
  -H "x-api-key: ltk_your_api_key" \
  -d '{
    "prompt": "Translate the following message and summarize the sender intention",
    "text": "行けたら行く"
  }'
```

---

## ⚙️ Конфигурация / Configuration

| Переменная | Обязательна | Описание |
|------------|-------------|----------|
| `GEMINI_API_KEY` | да (для реальных вызовов ИИ) | Ключ Google AI Studio |
| `SESSION_SECRET` | **да в проде** | Секрет подписи сессионных токенов. Без него прод не запустится |
| `DATABASE_URL` | нет | PostgreSQL/Supabase строка подключения. Пусто → локальный JSON |
| `OPENAI_API_KEY` | нет | Ключ OpenAI для прокси `/v1/chat/completions` |
| `APP_URL` | нет | Публичный URL приложения (инжектируется AI Studio) |
| `SEED_DEMO_KEYS` | нет | `true` = сидировать общеизвестные демо-ключи для локальных тестов |

---

## 🚀 Быстрый старт / Quick Start

### 1. Подготовка окружения
```bash
cp .env.example .env
```
Укажите ваш `GEMINI_API_KEY` в файле `.env`.

### 2. Установка зависимостей
```bash
npm install
```

### 3. Запуск в режиме разработки
```bash
npm run dev
```
Сервер и фронтенд запустятся на [http://localhost:3000](http://localhost:3000).

### 4. Проверка качества (Zero-Regression Gate)
```bash
npm run check          # Запуск проверки типов (tsc) и всех тестов (vitest)
```

### 5. Сборка и запуск в production
```bash
npm run build
npm start
```

### 6. Docker Compose (API + PostgreSQL)
```bash
docker compose up          # запуск API + PostgreSQL
docker compose up -d       # то же самое, в фоне
docker compose down        # остановка
```
> Для использования PostgreSQL раскомментируйте `DATABASE_URL` в `docker-compose.yml`.

### 7. API-документация (Swagger UI)
После запуска сервера откройте:
```
http://localhost:3000/docs
```
Интерактивная документация на базе OpenAPI-спецификации (`src/openapi.yaml`).

### 8. PWA (Progressive Web App)
Приложение поддерживает установку как PWA:
- Автоматическая регистрация Service Worker
- Кэширование статики и API-запросов (NetworkFirst)
- Manifest с иконками для добавления на домашний экран

Откройте DevTools → Application → Manifest для проверки.

### 9. Встраиваемый виджет (Embeddable Widget)
Виджет культурного анализа можно встроить на любой внешний сайт или блог без сторонних зависимостей:
```html
<!-- Вставка в HTML страницу -->
<div id="lit-widget" data-theme="dark"></div>
<script src="/widget.js" defer></script>
```
Для интерактивного тестирования откройте: `http://localhost:3000/widget-demo.html`.

---

## 📁 Структура проекта / Project Structure

```text
server.ts                  — Express-гейтвей (auth, keys, rate limit, статика, swagger)
src/
├── lib/
│   ├── auth.ts            — PBKDF2-хэширование, HMAC-токены (timingSafeEqual)
│   ├── db.ts              — хранилище: локальный JSON или PostgreSQL/Supabase
│   ├── analyze.ts         — /api/analyze, /api/compare: поиск культурных потерь
│   ├── enhance.ts         — /api/enhance, /api/optimize-prompt: обогащение промтов
│   ├── chatProxy.ts       — /v1/chat/completions: OpenAI drop-in Token Saver
│   ├── growth.ts          — бенчмарки, автогенерация постов и бейджей
│   └── rateLimit.ts       — лимиты по IP и API-ключам
├── components/            — React-компоненты (DemoWidget, ApiDocs, Integrations и др.)
├── openapi.yaml           — OpenAPI 3.0 спецификация
├── App.tsx                — SPA-оболочка
├── main.tsx
└── index.css
public/                    — статические ассеты (виджет, og-карточки, robots.txt)
docker-compose.yml         — оркестрация контейнеров
Dockerfile                 — мультистейдж сборка
```

---

## 💾 База данных / Database

- **Локальный режим (по умолчанию):** при отсутствии `DATABASE_URL` сервер создаёт `local_db.json` (`.gitignore`). При первом запуске сидируются демо-ключи, **только если** `SEED_DEMO_KEYS=true`.
- **PostgreSQL / Supabase:** укажите `DATABASE_URL` — сервер сам создаст таблицы `users`, `api_keys`, `usage_logs` при первом запуске.
- **Firebase Firestore:** правила в `firestore.rules`.

---

## 🤝 Разработка и контрибьюция / Contributing

Проект открыт для сообщества! Подробные правила и инструкции по участию описаны в [CONTRIBUTING.md](CONTRIBUTING.md) и [ROADMAP.md](ROADMAP.md). Шаблоны для создания issues находятся в [.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE/).

---

## ⚖️ Лицензия / License (AGPL-3.0)

Этот проект распространяется под свободной лицензией **GNU Affero General Public License v3.0 (AGPL-3.0)**.

- **SaaS Clause:** если вы запускаете этот проект как сетевой сервис/API, вы обязаны предоставить пользователям доступ к полному исходному коду (включая ваши изменения) под AGPL-3.0.
- **Раскрытие изменений:** любые модификации и производные работы также должны быть открыты под AGPL-3.0.

---

<p align="center" style="color: #64748b; font-size: 12px; margin-top: 50px;">
  Разработано с заботой о культурных смыслах © 2026 LostInTranslation API. Распространяется под лицензией AGPL-3.0.<br>
  Сделано с помощью Google Gemini • Built with Google Gemini
</p>
