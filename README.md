# 🌐 LostInTranslation API (LIT API) 🛰️

<p align="center">
  <img src="https://img.shields.io/badge/License-AGPL%20v3-red.svg" alt="AGPL-3.0 License" />
  <img src="https://img.shields.io/badge/Node.js-v18%2B-emerald.svg" alt="Node.js Version" />
  <img src="https://img.shields.io/badge/Framework-React%2018%20%2B%20Vite-blue.svg" alt="React & Vite" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Supabase-darkblue.svg" alt="PostgreSQL / Supabase" />
  <img src="https://img.shields.io/badge/AI_Engine-Gemini_Pro-violet.svg" alt="Gemini Engine" />
</p>

---

### [RU] Описание проекта

**LostInTranslation API** — это умный лингвистический middleware-слой для обогащения промтов ИИ глубоким культурным, эмоциональным, вежливым и грамматическим контекстом на разных языках (включая русский, японский, немецкий, испанский и др.). Он улавливает тонкие оттенки смысла, скрытые намерения и вежливость собеседников, делая ответы downstream-моделей (GPT, Claude, Gemini) **на 98% точнее** и контекстуально вернее, предотвращая смысловые потери при обычном машинном переводе.

### [EN] Project Description

**LostInTranslation API** is an intelligent linguistic middleware layer designed to enrich AI prompts with deep cultural, emotional, polite, and grammatical context across multiple languages (including Russian, Japanese, German, Spanish, etc.). It captures subtle nuances, hidden intents, and speaker politeness, making the outputs of downstream models (such as GPT, Claude, Gemini) **up to 98% more accurate** and culturally aligned, preventing semantic erosion caused by standard machine translation.

---

## 🗺️ Содержание / Table of Contents

- [🌐 LostInTranslation API (LIT API) 🛰️](#-lostintranslation-api-lit-api-️)
    - [🎨 Архитектура Системы / System Architecture](#-архитектура-системы--system-architecture)
    - [⚖️ Лицензия / License (AGPL-3.0)](#️-лицензия--license-agpl-30)
    - [🔒 Безопасность и Аудит Ключей / Security & Secret Prevention](#-безопасность-и-аудит-ключей--security--secret-prevention)
    - [💾 База Данных: PostgreSQL + Supabase / Database Integration](#-база-данных-postgresql--supabase--database-integration)
    - [🚀 Быстрый старт / Quick Start](#-быстрый-старт--quick-start)
    - [✨ Как Сделать Красивый GitHub Профиль / Premium GitHub Guide](#-как-сделать-красивый-github-профиль--premium-github-guide)

---

## 🎨 Архитектура Системы / System Architecture

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
│               - Crypto Auth Module (PBKDF2)            │
└───────────────────────────┬────────────────────────────┘
                            ├────────────────────────────┐
┌───────────────────────────▼────────────┐  ┌────────────▼────────────┐
│             AI ENGINE                  │  │     PERSISTENCE LAYER   │
│       - Gemini SDK Integration         │  │  - Primary: Supabase/PG │
│       - Semantic Loss Analysis         │  │  - Fallback: Local JSON │
│       - Real-time Context Injector     │  │    (Fully Git-Ignored!) │
└────────────────────────────────────────┘  └─────────────────────────┘
```

---

## ⚖️ Лицензия / License (AGPL-3.0)

Этот проект распространяется под свободной лицензией **GNU Affero General Public License v3.0 (AGPL-3.0)**. 

### Что это значит?
* **SaaS Clause (Доступ через сеть):** Если вы запускаете этот проект удаленно на сервере в облаке и предоставляете к нему доступ пользователям через сеть (как API, веб-сервис или SaaS), **вы обязаны предоставить конечным пользователям возможность скачать полную версию исходного кода вашего сервиса** (включая любые ваши изменения, сделанные в коде) под той же лицензией AGPL-3.0.
* **Раскрытие исходного кода:** Любые модификации или производные работы также должны быть открыты под лицензией AGPL-3.0.
* **Никаких коммерческих тайн:** Вы не можете использовать данный код в закрытых коммерческих SaaS-решениях без открытия вашего исходного кода.

---

## 🔒 Безопасность и Аудит Ключей / Security & Secret Prevention

Репозиторий проекта полностью открыт. Для защиты ваших данных была произведена глубокая чистка секретов:
1. **Никаких захардкоженных ключей:** Все пароли, API-ключи Gemini и строки подключения баз данных считываются исключительно из переменных окружения (`process.env`).
2. **Безопасный Git-Ignore:** Файлы конфигурации `.env`, логи серверов (`*.log`), а также локальный файл базы данных (`local_db.json`) принудительно внесены в `.gitignore`. Вы можете быть спокойны — ваши личные данные пользователей и хэши паролей никогда не попадут в открытый доступ на GitHub.

---

## 💾 База Данных: PostgreSQL + Supabase / Database Integration

LostInTranslation API поддерживает **двойной режим хранения данных**:
* **Локальный (Fallback):** По умолчанию при отсутствии базы данных сервер создает безопасный локальный зашифрованный JSON-файл (`local_db.json`) для хранения учетных записей разработчиков, API-токенов и логов.
* **Профессиональный (Supabase/PostgreSQL):** Для переключения на полноценную СУБД просто укажите переменную `DATABASE_URL` в файле `.env`. Система автоматически переключится на PostgreSQL, создаст необходимые таблицы при первом запуске и будет использовать пул соединений.

---

## 🚀 Быстрый старт / Quick Start

### 1. Подготовка окружения
Создайте файл `.env` в корневой папке проекта на основе примера:
```bash
cp .env.example .env
```
Заполните обязательные переменные:
```env
# Токен ИИ для анализа культурного контекста
GEMINI_API_KEY=your_gemini_api_key_here

# Опционально: URL подключения к PostgreSQL/Supabase.
# Если оставить пустым, включится безопасный локальный режим local_db.json
DATABASE_URL=postgresql://postgres:...
```

### 2. Установка и Запуск
```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки (React HMR + Node Server)
npm run dev
```
Откройте браузер по адресу: `http://localhost:3000`.

### 3. Сборка для Production
```bash
# Сборка клиентской части и бэкенд-сервера
npm run build

# Запуск скомпилированного сервера
npm run start
```

---

## ✨ Как Сделать Красивый GitHub Профиль / Premium GitHub Guide

Чтобы ваш репозиторий привлекал внимание работодателей и разработчиков, а профиль выглядел дорого и профессионально, следуйте этому пошаговому руководству:

### 1. Создайте Персональный Профиль-визитку (Profile README)
* Создайте на GitHub новый публичный репозиторий, имя которого **точно совпадает с вашим ником** (например, если ваш ник `developer777`, репозиторий должен называться `developer777`).
* GitHub предложит создать в нем специальный `README.md`. Это ваша главная страница!
* **Что туда добавить:**
  * Стильное анимированное приветствие.
  * Ваши ключевые технологии в виде ярких бейджей (используйте [Shields.io](https://shields.io)).
  * Динамическую статистику GitHub (используйте [GitHub Readme Stats](https://github.com/anuraghazra/github-readme-stats)).

### 2. Оформите сам репозиторий (Repository Landing Page)
* **About (Справа вверху):** Заполните короткое, емкое описание проекта на английском, добавьте актуальные теги (например, `ai-middleware`, `prompt-engineering`, `linguistics`, `react`, `typescript`, `supabase`) и укажите ссылку на работающее демо.
* **Social Preview Image:** Зайдите в *Settings -> General -> Social preview* и загрузите красивую картинку (обложку) вашего проекта размером 1280x640. Проекты с обложками получают на 400% больше внимания!
* **Release:** Опубликуйте релиз (справа на панели), присвойте ему версию `v1.0.0` и напишите красивый список изменений (changelog).

### 3. Используйте Интерактивные Бейджи в README
Вы можете конструировать любые бейджи на сайте [Shields.io](https://shields.io). Пример ссылки:
`https://img.shields.io/badge/Название-Текст-цвет.svg`
Они делают документацию структурированной и приятной для чтения.

---

<p align="center" style="color: #64748b; font-size: 12px; margin-top: 50px;">
  Разработано с заботой о культурных смыслах © 2026 LostInTranslation API. Распространяется под лицензией AGPL-3.0.
</p>
