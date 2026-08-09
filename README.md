# 🌐 LostInTranslation API (LIT API) 🛰️

<p align="center">
  <img src="https://img.shields.io/badge/License-AGPL%20v3-red.svg" alt="AGPL-3.0 License" />
  <img src="https://img.shields.io/badge/Node.js-v18%2B-emerald.svg" alt="Node.js Version" />
  <img src="https://img.shields.io/badge/Framework-React%2018%20%2B%20Vite-blue.svg" alt="React & Vite" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Supabase-darkblue.svg" alt="PostgreSQL / Supabase" />
  <img src="https://img.shields.io/badge/AI_Engine-Gemini-violet.svg" alt="Gemini Engine" />
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
- **Культурная глубина:** модальные частицы, вежливость, хеджирование, умаление (understatement), суффиксы и видовые формы глаголов (RU, JA, DE, ES, FR и др.).
- **Портал разработчика:** регистрация, JWT-сессия, генерация/отзыв API-ключей, дашборд со статистикой использования.
- **Rate limiting** по IP и по ключам (free: 10/день по IP, 50/день free-ключ, 1000/день paid-ключ).
- **Двойное хранилище:** локальный JSON-файл (fallback) или PostgreSQL/Supabase.
- **Гарантированный дев-режим:** без `GEMINI_API_KEY` сервер работает на качественных mock-ответах.

---

## 🎨 Архитектура / System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   КЛИЕНТСКИЙ ИНТЕРФЕЙС                 │
│              (React + Vite + Tailwind CSS)             │
└───────────────────────────┬────────────────────────────┘
                            │
              POST /api/analyze  OR  POST /api/enhance
                            │
┌───────────────────────────▼────────────────────────────┐
│                  EXPRESS BACKEND GATEWAY               │
│               - Rate Limiter (IP & API Keys)           │
│               - Crypto Auth Module (PBKDF2 + HMAC)     │
└───────────────────────────┬────────────────────────────┘
                            ├────────────────────────────┐
┌───────────────────────────▼────────────┐  ┌────────────▼────────────┐
│             AI ENGINE                  │  │    PERSISTENCE LAYER    │
│       - Gemini SDK Integration         │  │  - Primary: Supabase/PG │
│       - Semantic Loss Analysis         │  │  - Fallback: Local JSON │
│       - Real-time Context Injector     │  │    (Fully Git-Ignored!) │
└────────────────────────────────────────┘  └─────────────────────────┘
```

---

## 🔌 API Endpoints

| Метод | URL | Авторизация | Описание |
|-------|-----|-------------|----------|
| `POST` | `/api/analyze` | опционально (ключ или JWT) | Анализ текста на культурные потери смысла |
| `POST` | `/api/enhance` | **обязателен API-ключ** (`x-api-key` / `Bearer`) | Обогащение промта культурным контекстом |
| `POST` | `/api/auth/register` | — | Регистрация разработчика |
| `POST` | `/api/auth/login` | — | Вход, получение JWT |
| `GET`  | `/api/auth/me` | JWT | Профиль текущего пользователя |
| `GET`  | `/api/keys` | JWT | Список ключей |
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
| `DATABASE_URL` | нет | PostgreSQL/Supabase. Пусто → локальный JSON |
| `APP_URL` | нет | Публичный URL приложения (инжектится AI Studio) |
| `SEED_DEMO_KEYS` | нет | `true` = сидировать общеизвестные демо-ключи |

---

## 🚀 Быстрый старт / Quick Start

### 1. Подготовка окружения
```bash
cp .env.example .env
```
Заполните обязательные переменные: `GEMINI_API_KEY` и `SESSION_SECRET` (для прода).

### 2. Установка и запуск
```bash
npm install          # установка зависимостей
npm run dev          # запуск разработки (React HMR + Node server)
```
Откройте `http://localhost:3000`.

### 3. Проверка качества
```bash
npm run lint         # tsc --noEmit
npm test             # vitest run
```

### 4. Сборка для Production
```bash
npm run build        # сборка клиента и бэкенда в dist/
npm run start        # запуск собранного сервера
```

### 5. Docker
```bash
docker build -t lost-in-translation .
docker run -p 3000:3000 --env-file .env lost-in-translation
```

---

## 📁 Структура проекта / Project Structure

```text
server.ts                  — Express-гейтвей (auth, keys, rate limit, статика)
src/
├── lib/
│   ├── auth.ts            — PBKDF2-хэширование, HMAC-токены, middleware
│   ├── db.ts              — хранилище: локальный JSON или PostgreSQL/Supabase
│   ├── analyze.ts         — /api/analyze: поиск культурных потерь (Gemini + mock)
│   ├── enhance.ts         — /api/enhance: обогащение промтов (Gemini + mock)
│   └── rateLimit.ts       — лимиты по IP и API-ключам
├── components/            — UI-компоненты (DemoWidget, PromptSimulator и др.)
├── App.tsx                — SPA-оболочка
├── main.tsx
└── index.css
.dockerignore              — исключения для Docker-сборки
.github/                   — CI-воркфлоу и шаблоны issue/PR
```

---

## 💾 База данных / Database

- **Локальный режим (по умолчанию):** при отсутствии `DATABASE_URL` сервер создаёт `local_db.json` (`.gitignore`). При первом запуске сидируются демо-ключи, **только если** `SEED_DEMO_KEYS=true`.
- **PostgreSQL / Supabase:** укажите `DATABASE_URL` — сервер сам создаст таблицы `users`, `api_keys`, `usage_logs` при первом запуске.
- **Firebase Firestore:** правила в `firestore.rules`; шаблон интеграции — в `TMA_DB_GUIDE.md`.

---

## 🤝 Разработка и контрибьюция / Contributing

Проект открыт для вклада. Смотрите [CONTRIBUTING.md](CONTRIBUTING.md) и [ROADMAP.md](ROADMAP.md). Используйте шаблоны [issues](.github/ISSUE_TEMPLATE/) и [PR](.github/PULL_REQUEST_TEMPLATE.md).

---

## ⚖️ Лицензия / License (AGPL-3.0)

Этот проект распространяется под свободной лицензией **GNU Affero General Public License v3.0 (AGPL-3.0)**.

- **SaaS Clause:** если вы запускаете этот проект как сетевой сервис/API, вы обязаны предоставить пользователям доступ к полному исходному коду (включая ваши изменения) под AGPL-3.0.
- **Раскрытие изменений:** любые модификации и производные работы также должны быть открыты под AGPL-3.0.

---

<p align="center" style="color: #64748b; font-size: 12px; margin-top: 50px;">
  Разработано с заботой о культурных смыслах © 2026 LostInTranslation API. Распространяется под лицензией AGPL-3.0.
</p>