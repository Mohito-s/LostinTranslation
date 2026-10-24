import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Terminal,
  Check,
  Copy,
  Play,
  RefreshCw,
  Zap,
  Shield,
  Key,
  AlertCircle,
  CheckCircle2,
  Layers,
  FileCode,
  Cpu,
  Sparkles,
  ExternalLink,
  Code2,
  Clock,
  RotateCcw
} from 'lucide-react';

interface ApiDocsProps {
  lang?: 'ru' | 'en';
  onNavigateToDashboard?: () => void;
}

export type EndpointId =
  | 'analyze'
  | 'compare'
  | 'optimize-prompt'
  | 'enhance'
  | 'chat-completions'
  | 'health';

export type SnippetLang = 'curl' | 'javascript' | 'python' | 'openai';

interface HeaderSpec {
  name: string;
  type: string;
  required: boolean;
  descriptionRu: string;
  descriptionEn: string;
  example: string;
}

interface ParamSpec {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  descriptionRu: string;
  descriptionEn: string;
  defaultVal?: string;
  example?: string;
}

interface StatusCodeSpec {
  code: number;
  label: string;
  descriptionRu: string;
  descriptionEn: string;
}

export interface EndpointDefinition {
  id: EndpointId;
  method: 'GET' | 'POST';
  path: string;
  titleRu: string;
  titleEn: string;
  summaryRu: string;
  summaryEn: string;
  descriptionRu: string;
  descriptionEn: string;
  badgeRu: string;
  badgeEn: string;
  headers: HeaderSpec[];
  bodyParams: ParamSpec[];
  statusCodes: StatusCodeSpec[];
  defaultPayload: any;
  sampleResponse: any;
}

export const ENDPOINTS: EndpointDefinition[] = [
  {
    id: 'analyze',
    method: 'POST',
    path: '/api/analyze',
    titleRu: 'POST /api/analyze — Потери смысла',
    titleEn: 'POST /api/analyze — Cultural Meaning Loss',
    summaryRu: 'Детекция скрытых культурных маркеров, модальности, частиц и сарказма в исходном тексте.',
    summaryEn: 'Deep linguistic scan for hidden cultural nuances, modal particles, and passive refusal.',
    descriptionRu:
      'Анализирует произвольный исходный текст и выявляет скрытые модальные частицы («да нет наверное», «да ладно тебе»), идиоматические сдвиги, уровни вежливости и культурный подтекст, которые теряются при классическом машинном переводе.',
    descriptionEn:
      'Analyzes raw input text to identify implicit cultural markers, modal particles, polite refusals, and sarcastic shifts that standard NMT models routinely flatten.',
    badgeRu: 'Анализ смысла',
    badgeEn: 'Nuance Engine',
    headers: [
      {
        name: 'Content-Type',
        type: 'string',
        required: true,
        descriptionRu: 'Обязательный заголовок формата данных запроса (application/json).',
        descriptionEn: 'Required MIME payload type (application/json).',
        example: 'application/json'
      },
      {
        name: 'x-api-key',
        type: 'string',
        required: false,
        descriptionRu: 'Ключ доступа. Опционален для песочницы (10 req/24h), рекомендуется для прод-лимитов.',
        descriptionEn: 'API key. Optional for anonymous IP sandbox (10 req/24h), unlocks higher quotas.',
        example: 'lit_live_xxxxxxxxxxxxxxxx'
      },
      {
        name: 'Authorization',
        type: 'string',
        required: false,
        descriptionRu: 'Альтернативная передача ключа через Bearer токен.',
        descriptionEn: 'Alternative Bearer token authentication header.',
        example: 'Bearer lit_live_xxxxxxxxxxxxxxxx'
      }
    ],
    bodyParams: [
      {
        name: 'text',
        type: 'string',
        required: true,
        descriptionRu: 'Исходный текст для лингвистического анализа (максимальная длина: 5000 символов).',
        descriptionEn: 'Raw source text to be parsed for cultural subtleties (max 5,000 characters).',
        example: '"Да нет наверное, я лучше дома посижу"'
      },
      {
        name: 'target_language',
        type: 'string',
        required: false,
        descriptionRu: 'Целевой язык для сопоставления контекстных альтернатив (по умолчанию: "en").',
        descriptionEn: 'Target language code for loss analysis and recommendations (default: "en").',
        defaultVal: '"en"',
        example: '"en"'
      }
    ],
    statusCodes: [
      {
        code: 200,
        label: 'OK',
        descriptionRu: 'Успешный анализ. Возвращает буквальный перевод и массив обнаруженных культурных нюансов.',
        descriptionEn: 'Analysis succeeded. Returns literal translation and items array of detected nuances.'
      },
      {
        code: 400,
        label: 'Bad Request',
        descriptionRu: 'Параметр text отсутствует в теле запроса или не является строкой.',
        descriptionEn: 'Parameter text is missing or invalid in the request payload.'
      },
      {
        code: 401,
        label: 'Unauthorized',
        descriptionRu: 'Переданный в заголовках x-api-key или Bearer токен недействителен или отозван.',
        descriptionEn: 'Supplied API key is invalid or has been revoked.'
      },
      {
        code: 429,
        label: 'Rate Limit',
        descriptionRu: 'Исчерпан суточный лимит запросов (10 для анонимных IP, 50 для Sandbox, 1000 для Pro).',
        descriptionEn: 'Daily request quota exceeded for your IP or API key.'
      }
    ],
    defaultPayload: {
      text: 'Да нет наверное, я лучше дома посижу',
      target_language: 'en'
    },
    sampleResponse: {
      literal_translation: "Probably no, I'd rather stay home",
      items: [
        {
          fragment: 'Да нет наверное',
          short: 'Тройное противоречие и скрытая нерешительность',
          explanation:
            '«Да» — маркер размышления, «нет» — фактический отказ, «наверное» — смягчение категоричности.',
          alternative: "I appreciate the invite, but I'll probably pass and stay home."
        }
      ]
    }
  },
  {
    id: 'compare',
    method: 'POST',
    path: '/api/compare',
    titleRu: 'POST /api/compare — Cultural QA',
    titleEn: 'POST /api/compare — Cultural QA Linter',
    summaryRu: 'Сопоставление пары «исходник → перевод» с вычислением скора сохранения смысла (0–100).',
    summaryEn: 'Bilingual QA linter comparing source vs translation with 0–100 semantic retention scoring.',
    descriptionRu:
      'Автоматизированный линтер перевода: сопоставляет оригинальный текст с готовым переводом (DeepL, Google Translate, LLM), рассчитывает числовой индекс семантической точности (0–100) и формирует реестр найденных искажений тональности и модальности.',
    descriptionEn:
      'Automated Cultural QA: evaluates translation quality against source text, computing a 0–100 fidelity index and providing granular diagnostics on tone flattening, lost idioms, or shifted modality.',
    badgeRu: 'QA Линтер',
    badgeEn: 'Fidelity Linter',
    headers: [
      {
        name: 'Content-Type',
        type: 'string',
        required: true,
        descriptionRu: 'Обязательный заголовок формата данных (application/json).',
        descriptionEn: 'Required MIME payload type (application/json).',
        example: 'application/json'
      },
      {
        name: 'x-api-key',
        type: 'string',
        required: false,
        descriptionRu: 'Ключ доступа разработчика.',
        descriptionEn: 'Developer API key.',
        example: 'lit_live_xxxxxxxxxxxxxxxx'
      },
      {
        name: 'Authorization',
        type: 'string',
        required: false,
        descriptionRu: 'Bearer токен авторизации.',
        descriptionEn: 'Authorization Bearer header.',
        example: 'Bearer lit_live_xxxxxxxxxxxxxxxx'
      }
    ],
    bodyParams: [
      {
        name: 'source_text',
        type: 'string',
        required: true,
        descriptionRu: 'Оригинальный текст на исходном языке.',
        descriptionEn: 'Source text in the original language.',
        example: '"Да ладно тебе, всё нормально"'
      },
      {
        name: 'target_text',
        type: 'string',
        required: true,
        descriptionRu: 'Готовый машинно- или человеком переведённый текст для валидации.',
        descriptionEn: 'Translated text being evaluated for semantic drift.',
        example: '"Come on, everything is totally fine"'
      },
      {
        name: 'target_language',
        type: 'string',
        required: false,
        descriptionRu: 'Код языка перевода (по умолчанию: "en").',
        descriptionEn: 'Language code of the target translation (default: "en").',
        defaultVal: '"en"',
        example: '"en"'
      }
    ],
    statusCodes: [
      {
        code: 200,
        label: 'OK',
        descriptionRu: 'Успешное сравнение. Возвращает score (0–100), verdict и массив замечаний issues.',
        descriptionEn: 'QA evaluation succeeded with score, verdict, and detected issues.'
      },
      {
        code: 400,
        label: 'Bad Request',
        descriptionRu: 'Поля source_text или target_text не переданы.',
        descriptionEn: 'Required fields source_text or target_text are missing.'
      },
      {
        code: 401,
        label: 'Unauthorized',
        descriptionRu: 'Недействительный или отозванный API-ключ.',
        descriptionEn: 'Invalid or revoked API key.'
      },
      {
        code: 429,
        label: 'Rate Limit',
        descriptionRu: 'Исчерпан суточный лимит запросов.',
        descriptionEn: 'Daily rate limit exceeded.'
      }
    ],
    defaultPayload: {
      source_text: 'Да ладно тебе, всё нормально',
      target_text: 'Come on, everything is totally fine',
      target_language: 'en'
    },
    sampleResponse: {
      score: 85,
      verdict: 'Хороший перевод с легким сглаживанием модальности',
      issues: [
        {
          severity: 'medium',
          issue: 'Сглаживание ироничной модальности',
          original_phrase: 'Да ладно тебе',
          translated_phrase: 'Come on',
          recommendation: "Использовать более выразительное 'Don't worry about it'"
        }
      ]
    }
  },
  {
    id: 'optimize-prompt',
    method: 'POST',
    path: '/api/optimize-prompt',
    titleRu: 'POST /api/optimize-prompt — Token Saver',
    titleEn: 'POST /api/optimize-prompt — Token Saver',
    summaryRu: 'Перевод промпта в плотный семантический английский с экономией до 65% токенов.',
    summaryEn: 'Compresses Russian prompts into high-density English, cutting token consumption by up to 65%.',
    descriptionRu:
      'Переводит пространные кириллические промпты в компактные высокоплотные англоязычные инструкции с сохранением всех нюансов задачи и модальности. Снижает стоимость вызовов downstream LLM (Claude 3.5, GPT-4o) до 65%.',
    descriptionEn:
      'Translates high-overhead Cyrillic prompts into concise, high-density English instructions. Injects context directives so the target LLM responds in the intended language while slashing token bills.',
    badgeRu: 'Экономия токенов',
    badgeEn: 'Token Saver',
    headers: [
      {
        name: 'Content-Type',
        type: 'string',
        required: true,
        descriptionRu: 'Обязательный заголовок формата данных (application/json).',
        descriptionEn: 'Required MIME payload type (application/json).',
        example: 'application/json'
      },
      {
        name: 'x-api-key',
        type: 'string',
        required: false,
        descriptionRu: 'Ключ разработчика (опционален в песочнице).',
        descriptionEn: 'Developer API key (optional in sandbox).',
        example: 'lit_live_xxxxxxxxxxxxxxxx'
      },
      {
        name: 'Authorization',
        type: 'string',
        required: false,
        descriptionRu: 'Bearer токен авторизации.',
        descriptionEn: 'Authorization Bearer header.',
        example: 'Bearer lit_live_xxxxxxxxxxxxxxxx'
      }
    ],
    bodyParams: [
      {
        name: 'prompt',
        type: 'string',
        required: true,
        descriptionRu: 'Исходный промпт на естественном языке.',
        descriptionEn: 'Raw natural language prompt string.',
        example: '"Сделай мне вежливый, но твердый отказ подрядчику"'
      },
      {
        name: 'targetLanguage',
        type: 'string',
        required: false,
        descriptionRu: 'Желаемый язык ответа downstream модели (по умолчанию: "Russian").',
        descriptionEn: 'Target output language for the final response (default: "Russian").',
        defaultVal: '"Russian"',
        example: '"Russian"'
      }
    ],
    statusCodes: [
      {
        code: 200,
        label: 'OK',
        descriptionRu: 'Промпт оптимизирован. Возвращены english_prompt, token_stats и cultural_nuances_preserved.',
        descriptionEn: 'Prompt compressed with high-density English and token savings breakdown.'
      },
      {
        code: 400,
        label: 'Bad Request',
        descriptionRu: 'Поле prompt отсутствует или имеет пустую строку.',
        descriptionEn: 'Missing prompt parameter in the request body.'
      },
      {
        code: 401,
        label: 'Unauthorized',
        descriptionRu: 'Недействительный API-ключ.',
        descriptionEn: 'Invalid API key.'
      },
      {
        code: 429,
        label: 'Rate Limit',
        descriptionRu: 'Превышен суточный лимит запросов.',
        descriptionEn: 'Rate limit quota reached.'
      }
    ],
    defaultPayload: {
      prompt: 'Сделай мне вежливый, но твердый отказ подрядчику',
      targetLanguage: 'Russian'
    },
    sampleResponse: {
      original_prompt: 'Сделай мне вежливый, но твердый отказ подрядчику',
      english_prompt:
        'Draft a polite yet resolute rejection to a contractor, remaining courteous while firmly declining the offer.',
      token_stats: {
        original_claude_tokens: 42,
        optimized_claude_tokens: 18,
        saved_claude_percent: 57
      },
      cultural_nuances_preserved: [
        'Деловая вежливость',
        'Бескомпромиссная твердость решения'
      ]
    }
  },
  {
    id: 'enhance',
    method: 'POST',
    path: '/api/enhance',
    titleRu: 'POST /api/enhance — Обогащение промптов',
    titleEn: 'POST /api/enhance — Prompt Enrichment',
    summaryRu: 'Инъекция культурологического блока [Cultural context] перед вызовом LLM.',
    summaryEn: 'Injects calibrated cultural context blocks upstream of downstream LLMs to eliminate nuance flattening.',
    descriptionRu:
      'Флагманский эндпоинт LIT. Принимает ваш базовый системный промпт и пользовательский ввод с идиомами, выявляет культурные маркеры и инъецирует структурированный блок [Cultural context]. Требует обязательный API-ключ.',
    descriptionEn:
      'Core flagship LIT feature. Takes your base prompt and localized user input, discovers latent nuances, and prepends a calibrated [Cultural context] block for downstream LLM execution. Requires an API key.',
    badgeRu: 'Core Feature (Key Req)',
    badgeEn: 'Core Feature (Key Req)',
    headers: [
      {
        name: 'Content-Type',
        type: 'string',
        required: true,
        descriptionRu: 'Обязательный заголовок формата данных (application/json).',
        descriptionEn: 'Required MIME payload type (application/json).',
        example: 'application/json'
      },
      {
        name: 'x-api-key',
        type: 'string',
        required: true,
        descriptionRu: 'ОБЯЗАТЕЛЬНЫЙ API-ключ. Зарегистрируйтесь в Dashboard для получения бесплатного Sandbox-ключа.',
        descriptionEn: 'REQUIRED API key. Obtain a free key from the Developer Dashboard.',
        example: 'lit_live_xxxxxxxxxxxxxxxx'
      },
      {
        name: 'Authorization',
        type: 'string',
        required: false,
        descriptionRu: 'Альтернативная передача ключа через Bearer токен.',
        descriptionEn: 'Alternative Bearer token authentication header.',
        example: 'Bearer lit_live_xxxxxxxxxxxxxxxx'
      }
    ],
    bodyParams: [
      {
        name: 'prompt',
        type: 'string',
        required: true,
        descriptionRu: 'Базовый системный или пользовательский промпт.',
        descriptionEn: 'Base system or user instruction prompt.',
        example: '"Translate the user feedback and extract emotion"'
      },
      {
        name: 'text',
        type: 'string',
        required: true,
        descriptionRu: 'Локализованный фрагмент текста с культурным подтекстом.',
        descriptionEn: 'Localized text fragment containing cultural nuance.',
        example: '"行けたら行く"'
      }
    ],
    statusCodes: [
      {
        code: 200,
        label: 'OK',
        descriptionRu: 'Успешное обогащение промпта с готовым инъецированным блоком [Cultural context].',
        descriptionEn: 'Prompt successfully enriched with [Cultural context] block.'
      },
      {
        code: 400,
        label: 'Bad Request',
        descriptionRu: 'Отсутствует prompt или text.',
        descriptionEn: 'Missing prompt or text fields.'
      },
      {
        code: 401,
        label: 'Unauthorized',
        descriptionRu: 'Недействительный или отозванный API-ключ.',
        descriptionEn: 'Supplied API key is invalid or revoked.'
      },
      {
        code: 403,
        label: 'Forbidden',
        descriptionRu: 'API-ключ не передан в заголовках x-api-key или Authorization.',
        descriptionEn: 'API key is strictly mandatory for /api/enhance.'
      },
      {
        code: 429,
        label: 'Rate Limit',
        descriptionRu: 'Превышена квота тарифного плана.',
        descriptionEn: 'Tier quota limit reached.'
      }
    ],
    defaultPayload: {
      prompt: 'Translate the user feedback and extract emotion',
      text: '行けたら行く'
    },
    sampleResponse: {
      enhanced_prompt:
        "[Cultural context: Japanese '行けたら行く' literally means 'I will go if I can', but socially functions as a polite 90% refusal without burning bridges]\nTranslate the user feedback and extract emotion: 行けたら行く",
      losses_detected: 1,
      latency_ms: 112
    }
  },
  {
    id: 'chat-completions',
    method: 'POST',
    path: '/v1/chat/completions',
    titleRu: 'POST /v1/chat/completions — OpenAI Drop-in Proxy',
    titleEn: 'POST /v1/chat/completions — OpenAI Drop-in Proxy',
    summaryRu: 'Drop-in замена OpenAI API для Cursor, OpenCode, LibreChat с авто-оптимизацией токенов.',
    summaryEn: 'Drop-in OpenAI proxy for Cursor, OpenCode, and AI agents with automatic token savings.',
    descriptionRu:
      'Полностью совместимый с OpenAI API шлюз. Достаточно перенаправить baseURL на LostInTranslation: ваши запросы прозрачно переводятся на плотный английский, экономя до 65% стоимости токенов, а ответ возвращается на исходном языке пользователя.',
    descriptionEn:
      "100% OpenAI-compatible drop-in proxy. Simply point your client's baseURL to LostInTranslation. Prompts are automatically compressed to save tokens while preserving nuance, and responses are returned in standard OpenAI schema.",
    badgeRu: 'AI Gateway (Cursor / OpenCode)',
    badgeEn: 'AI Gateway (Cursor / OpenCode)',
    headers: [
      {
        name: 'Content-Type',
        type: 'string',
        required: true,
        descriptionRu: 'Обязательный заголовок формата данных (application/json).',
        descriptionEn: 'Required MIME payload type (application/json).',
        example: 'application/json'
      },
      {
        name: 'Authorization',
        type: 'string',
        required: false,
        descriptionRu: 'Bearer токен авторизации (API-ключ в продакшене).',
        descriptionEn: 'Bearer auth token header (your API key in production).',
        example: 'Bearer lit_live_xxxxxxxxxxxxxxxx'
      },
      {
        name: 'x-api-key',
        type: 'string',
        required: false,
        descriptionRu: 'Альтернативный заголовок API-ключа.',
        descriptionEn: 'Alternative API key header.',
        example: 'lit_live_xxxxxxxxxxxxxxxx'
      }
    ],
    bodyParams: [
      {
        name: 'model',
        type: 'string',
        required: false,
        descriptionRu: 'Идентификатор целевой модели (по умолчанию: "gpt-4o").',
        descriptionEn: 'Target model identifier (default: "gpt-4o").',
        defaultVal: '"gpt-4o"',
        example: '"gpt-4o"'
      },
      {
        name: 'messages',
        type: 'array',
        required: true,
        descriptionRu: 'Массив сообщений чата формата [{ role: "user", content: "..." }].',
        descriptionEn: 'Array of chat message objects with role and content.',
        example: '[{ "role": "user", "content": "Сделай мне отказ" }]'
      },
      {
        name: 'temperature',
        type: 'number',
        required: false,
        descriptionRu: 'Температура генерации от 0.0 до 2.0 (по умолчанию: 0.7).',
        descriptionEn: 'Sampling temperature between 0.0 and 2.0 (default: 0.7).',
        defaultVal: '0.7',
        example: '0.7'
      },
      {
        name: 'stream',
        type: 'boolean',
        required: false,
        descriptionRu: 'Включение потокового вывода Server-Sent Events (SSE) (по умолчанию: false).',
        descriptionEn: 'Enable Server-Sent Events (SSE) streaming (default: false).',
        defaultVal: 'false',
        example: 'false'
      }
    ],
    statusCodes: [
      {
        code: 200,
        label: 'OK',
        descriptionRu: 'Стандартный объект chat.completion или SSE поток с метаданными lit_token_savings.',
        descriptionEn: 'Standard OpenAI completion object or SSE stream with lit_token_savings metadata.'
      },
      {
        code: 400,
        label: 'Bad Request',
        descriptionRu: 'Некорректная структура messages или пустое тело запроса.',
        descriptionEn: 'Invalid messages array or empty request payload.'
      },
      {
        code: 401,
        label: 'Unauthorized',
        descriptionRu: 'Недействительный токен авторизации.',
        descriptionEn: 'Invalid auth token.'
      },
      {
        code: 429,
        label: 'Rate Limit',
        descriptionRu: 'Превышена суточная квота запросов.',
        descriptionEn: 'Rate limit exceeded.'
      }
    ],
    defaultPayload: {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: 'Сделай мне вежливый, но твердый отказ подрядчику'
        }
      ],
      temperature: 0.7
    },
    sampleResponse: {
      id: 'chatcmpl-lit-proxy',
      object: 'chat.completion',
      created: 1774300000,
      model: 'gpt-4o',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content:
              'Благодарим вас за детальное коммерческое предложение. После внимательного рассмотрения сообщаем, что в текущем квартале мы вынуждены отказаться...'
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 18,
        completion_tokens: 36,
        total_tokens: 54
      },
      lit_bridge: {
        tokens_saved: 24,
        percent_saved: 57,
        original_cyrillic_length: 42,
        english_prompt_length: 18
      },
      lit_token_savings: {
        saved_percent: 57,
        original_tokens: 42,
        optimized_tokens: 18
      }
    }
  },
  {
    id: 'health',
    method: 'GET',
    path: '/api/health',
    titleRu: 'GET /api/health — Мониторинг',
    titleEn: 'GET /api/health — Healthcheck',
    summaryRu: 'Проверка жизнеспособности сервера, аптайма и готовности шлюза к работе.',
    summaryEn: 'Healthcheck ping returning operational status, system uptime, and timestamp.',
    descriptionRu:
      'Легковесный эндпоинт для проверки статуса сервиса, балансировщиков нагрузки (health probes) и мониторинга непрерывной работы шлюза LostInTranslation.',
    descriptionEn:
      'Lightweight monitoring ping returning server operational status, system uptime in seconds, and ISO timestamp.',
    badgeRu: 'Healthcheck',
    badgeEn: 'Healthcheck',
    headers: [
      {
        name: 'Accept',
        type: 'string',
        required: false,
        descriptionRu: 'Ожидаемый формат ответа (application/json).',
        descriptionEn: 'Accepted response MIME type (application/json).',
        example: 'application/json'
      },
      {
        name: 'x-api-key',
        type: 'string',
        required: false,
        descriptionRu: 'Опциональный заголовок API-ключа.',
        descriptionEn: 'Optional API key header.',
        example: 'lit_live_xxxxxxxxxxxxxxxx'
      },
      {
        name: 'Authorization',
        type: 'string',
        required: false,
        descriptionRu: 'Опциональный Bearer токен авторизации.',
        descriptionEn: 'Optional Authorization Bearer header.',
        example: 'Bearer lit_live_xxxxxxxxxxxxxxxx'
      }
    ],
    bodyParams: [],
    statusCodes: [
      {
        code: 200,
        label: 'OK',
        descriptionRu: 'Сервис полностью функционирует и готов к приему запросов.',
        descriptionEn: 'Service is fully healthy and operational.'
      },
      {
        code: 500,
        label: 'Internal Error',
        descriptionRu: 'Внутренний сбой сервера.',
        descriptionEn: 'Internal server error.'
      }
    ],
    defaultPayload: null,
    sampleResponse: {
      status: 'ok',
      uptime: 1420.5,
      timestamp: '2026-10-23T00:00:00.000Z'
    }
  }
];

function serializeToPython(val: any, indentLevel = 0): string {
  const indent = '  '.repeat(indentLevel);
  const nextIndent = '  '.repeat(indentLevel + 1);

  if (val === null) return 'None';
  if (val === true) return 'True';
  if (val === false) return 'False';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') return JSON.stringify(val);

  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    const items = val.map((item) => `${nextIndent}${serializeToPython(item, indentLevel + 1)}`).join(',\n');
    return `[\n${items}\n${indent}]`;
  }

  if (typeof val === 'object') {
    const keys = Object.keys(val);
    if (keys.length === 0) return '{}';
    const entries = keys
      .map((k) => `${nextIndent}${JSON.stringify(k)}: ${serializeToPython(val[k], indentLevel + 1)}`)
      .join(',\n');
    return `{\n${entries}\n${indent}}`;
  }

  return JSON.stringify(val);
}

export function formatPythonPayload(payloadStr: string): string {
  try {
    const parsed = JSON.parse(payloadStr);
    return serializeToPython(parsed);
  } catch {
    return payloadStr
      .replace(/:\s*true\b/g, ': True')
      .replace(/:\s*false\b/g, ': False')
      .replace(/:\s*null\b/g, ': None');
  }
}

export function generateSnippetCode(
  ep: EndpointDefinition,
  langChoice: SnippetLang,
  origin: string,
  key: string,
  payloadStr: string
): string {
  const activeKey = key || 'lit_live_your_api_key';
  const effectivePayload = payloadStr || (ep.defaultPayload ? JSON.stringify(ep.defaultPayload, null, 2) : '{}');

  if (langChoice === 'openai') {
    let openAiBody = `{\n    model: 'gpt-4o',\n    messages: [\n      {\n        role: 'user',\n        content: 'Сделай мне вежливый, но твердый отказ подрядчику'\n      }\n    ],\n    temperature: 0.7\n  }`;
    try {
      const parsed = JSON.parse(effectivePayload);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length > 0) {
        openAiBody = JSON.stringify(parsed, null, 2)
          .split('\n')
          .map((line, idx) => (idx === 0 ? line : '  ' + line))
          .join('\n');
      }
    } catch {
      // Keep default openAiBody
    }

    return `import OpenAI from 'openai';

// LostInTranslation acts as a drop-in semantic proxy.
// It intercepts Cyrillic prompts, compresses them to high-density English (-65% tokens)
// and restores cultural tone on response.
const client = new OpenAI({
  baseURL: '${origin}/v1',
  apiKey: '${activeKey}', // Or Bearer session token
});

async function main() {
  const completion = await client.chat.completions.create(${openAiBody});

  console.log(completion.choices[0].message.content);
  // Token savings: completion.lit_token_savings -> { saved_percent: 57, ... }
}

main();`;
  }

  if (langChoice === 'curl') {
    if (ep.method === 'GET') {
      return `curl -X GET "${origin}${ep.path}" \\
  -H "Accept: application/json"`;
    }
    const authHeader =
      ep.id === 'chat-completions'
        ? `-H "Authorization: Bearer ${activeKey}"`
        : `-H "x-api-key: ${activeKey}"`;

    const escapedPayload = effectivePayload.replace(/'/g, "'\\''");
    return `curl -X POST "${origin}${ep.path}" \\
  -H "Content-Type: application/json" \\
  ${authHeader} \\
  -d '${escapedPayload}'`;
  }

  if (langChoice === 'javascript') {
    if (ep.method === 'GET') {
      return `const response = await fetch('${origin}${ep.path}', {
  headers: {
    'Accept': 'application/json'
  }
});

const data = await response.json();
console.log(data);`;
    }
    const authLine =
      ep.id === 'chat-completions'
        ? `    'Authorization': 'Bearer ${activeKey}'`
        : `    'x-api-key': '${activeKey}'`;

    const indentedPayload = effectivePayload
      .split('\n')
      .map((line, idx) => (idx === 0 ? line : '  ' + line))
      .join('\n');

    return `const response = await fetch('${origin}${ep.path}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
${authLine}
  },
  body: JSON.stringify(${indentedPayload})
});

const data = await response.json();
console.log(data);`;
  }

  if (langChoice === 'python') {
    if (ep.method === 'GET') {
      return `import requests

url = "${origin}${ep.path}"
headers = {"Accept": "application/json"}

response = requests.get(url, headers=headers)
print(response.json())`;
    }
    const authHeaderPy =
      ep.id === 'chat-completions'
        ? `    "Authorization": "Bearer ${activeKey}"`
        : `    "x-api-key": "${activeKey}"`;

    const pyPayload = formatPythonPayload(effectivePayload);

    return `import requests

url = "${origin}${ep.path}"
headers = {
    "Content-Type": "application/json",
${authHeaderPy}
}
payload = ${pyPayload}

response = requests.post(url, json=payload, headers=headers)
result = response.json()
print(result)`;
  }

  return '';
}

export function parseSseResponse(textResponse: string): {
  stream: boolean;
  events_count: number;
  events: any[];
  note?: string;
} {
  const lines = textResponse
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const parsedEvents = lines.slice(0, 8).map((line) => {
    if (line.startsWith('data:')) {
      const raw = line.slice(5).trim();
      if (raw === '[DONE]') return { event: '[DONE]' };
      try {
        return JSON.parse(raw);
      } catch {
        return { rawData: raw };
      }
    }
    return line;
  });

  return {
    stream: true,
    events_count: lines.length,
    events: parsedEvents,
    note: lines.length > 8 ? `... and ${lines.length - 8} more SSE chunks` : undefined
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Continue to legacy fallback
  }

  try {
    if (typeof document !== 'undefined' && document.body) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      try {
        textarea.select();
        textarea.setSelectionRange(0, text.length);
        const success = document.execCommand('copy');
        return success;
      } finally {
        if (textarea.parentNode) {
          textarea.parentNode.removeChild(textarea);
        }
      }
    }
  } catch {
    return false;
  }
  return false;
}

export default function ApiDocs({ lang = 'ru', onNavigateToDashboard }: ApiDocsProps) {
  // Navigation & View state
  const [activeEndpointId, setActiveEndpointId] = useState<EndpointId>('analyze');
  const [activeView, setActiveView] = useState<'endpoint' | 'overview' | 'limits'>('endpoint');

  // Interactive Console state
  const [snippetLang, setSnippetLang] = useState<SnippetLang>('curl');
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Editable payloads per endpoint
  const [payloads, setPayloads] = useState<Record<EndpointId, string>>({
    analyze: JSON.stringify(ENDPOINTS[0].defaultPayload, null, 2),
    compare: JSON.stringify(ENDPOINTS[1].defaultPayload, null, 2),
    'optimize-prompt': JSON.stringify(ENDPOINTS[2].defaultPayload, null, 2),
    enhance: JSON.stringify(ENDPOINTS[3].defaultPayload, null, 2),
    'chat-completions': JSON.stringify(ENDPOINTS[4].defaultPayload, null, 2),
    health: ''
  });

  // Live Runner Execution state
  const [runnerLoading, setRunnerLoading] = useState(false);
  const [runnerResponse, setRunnerResponse] = useState<any>(null);
  const [runnerStatus, setRunnerStatus] = useState<number | null>(null);
  const [runnerTimeMs, setRunnerTimeMs] = useState<number | null>(null);
  const [runnerCopied, setRunnerCopied] = useState(false);

  // Cancellation and timeout cleanup refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const snippetCopiedTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);
  const runnerCopiedTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (snippetCopiedTimeoutRef.current) {
        clearTimeout(snippetCopiedTimeoutRef.current as any);
      }
      if (runnerCopiedTimeoutRef.current) {
        clearTimeout(runnerCopiedTimeoutRef.current as any);
      }
    };
  }, []);

  const activeEndpoint = ENDPOINTS.find((e) => e.id === activeEndpointId) || ENDPOINTS[0];

  const handleSelectEndpoint = (id: EndpointId) => {
    // Abort in-flight request if user switches endpoint
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setRunnerLoading(false);
    }

    setActiveEndpointId(id);
    setActiveView('endpoint');
    // If switching away from chat-completions while openai snippet was active,
    // switch to curl so that the console doesn't display OpenAI SDK completion code for non-completion endpoints
    if (id !== 'chat-completions' && snippetLang === 'openai') {
      setSnippetLang('curl');
    }
    // Clear previous live test when switching endpoint
    setRunnerResponse(null);
    setRunnerStatus(null);
    setRunnerTimeMs(null);

    // Smooth scroll on mobile/tablet viewports
    if (typeof window !== 'undefined' && window.innerWidth < 1200) {
      const specEl = document.getElementById('api-spec-column');
      if (specEl) {
        specEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSelectSection = (section: 'overview' | 'limits') => {
    setActiveView(section);
    if (typeof window !== 'undefined' && window.innerWidth < 1200) {
      const specEl = document.getElementById('api-spec-column');
      if (specEl) {
        specEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleResetPayload = () => {
    if (activeEndpoint.defaultPayload) {
      setPayloads((prev) => ({
        ...prev,
        [activeEndpointId]: JSON.stringify(activeEndpoint.defaultPayload, null, 2)
      }));
    }
  };

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:3000';
  };

  const executeLiveTest = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const currentAbortController = new AbortController();
    abortControllerRef.current = currentAbortController;

    setRunnerLoading(true);
    setRunnerResponse(null);
    setRunnerStatus(null);
    setRunnerTimeMs(null);

    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${activeEndpoint.path}`;
    const start = performance.now();

    try {
      let res: Response;

      if (activeEndpoint.method === 'GET') {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (apiKeyInput.trim()) {
          headers['x-api-key'] = apiKeyInput.trim();
          headers['Authorization'] = `Bearer ${apiKeyInput.trim()}`;
        }
        res = await fetch(url, { headers, signal: currentAbortController.signal });
      } else {
        const rawPayload = payloads[activeEndpointId];
        let parsedBody: any;
        try {
          parsedBody = JSON.parse(rawPayload);
          if (parsedBody === null || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
            throw new Error('Payload must be a JSON object (not array)');
          }
        } catch (jsonErr: any) {
          setRunnerStatus(400);
          setRunnerResponse({
            error: 'Invalid JSON payload in editor',
            details: jsonErr.message
          });
          setRunnerTimeMs(0);
          setRunnerLoading(false);
          return;
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        if (apiKeyInput.trim()) {
          headers['x-api-key'] = apiKeyInput.trim();
          headers['Authorization'] = `Bearer ${apiKeyInput.trim()}`;
        }

        res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(parsedBody),
          signal: currentAbortController.signal
        });
      }

      const end = performance.now();
      const elapsed = Math.round(end - start);
      setRunnerTimeMs(elapsed);
      setRunnerStatus(res.status);

      let data: any;
      const textResponse = await res.text();
      const isSse =
        res.headers.get('content-type')?.includes('text/event-stream') ||
        textResponse.startsWith('data:');

      if (isSse) {
        data = parseSseResponse(textResponse);
      } else {
        try {
          data = JSON.parse(textResponse);
        } catch {
          data = { rawResponse: textResponse };
        }
      }
      setRunnerResponse(data);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      const end = performance.now();
      setRunnerTimeMs(Math.round(end - start));
      setRunnerStatus(500);
      setRunnerResponse({
        error: err.message || 'Network request failed',
        hint:
          lang === 'ru'
            ? 'Проверьте соединение с локальным сервером LostInTranslation (порт 3000).'
            : 'Check connection to local LostInTranslation server (port 3000).'
      });
    } finally {
      if (abortControllerRef.current === currentAbortController) {
        abortControllerRef.current = null;
        setRunnerLoading(false);
      }
    }
  };

  const copyResponseJson = async () => {
    if (!runnerResponse) return;
    const ok = await copyToClipboard(JSON.stringify(runnerResponse, null, 2));
    if (ok) {
      setRunnerCopied(true);
      if (runnerCopiedTimeoutRef.current) {
        clearTimeout(runnerCopiedTimeoutRef.current as any);
      }
      runnerCopiedTimeoutRef.current = setTimeout(() => setRunnerCopied(false), 2000);
    }
  };

  const generateSnippet = (langChoice: SnippetLang): string => {
    return generateSnippetCode(
      activeEndpoint,
      langChoice,
      getBaseUrl(),
      apiKeyInput.trim(),
      payloads[activeEndpointId]
    );
  };

  const copyCodeSnippet = async () => {
    const code = generateSnippet(snippetLang);
    const ok = await copyToClipboard(code);
    if (ok) {
      setSnippetCopied(true);
      if (snippetCopiedTimeoutRef.current) {
        clearTimeout(snippetCopiedTimeoutRef.current as any);
      }
      snippetCopiedTimeoutRef.current = setTimeout(() => setSnippetCopied(false), 2000);
    }
  };

  const t = {
    ru: {
      tagline: 'API SPECIFICATION & INTERACTIVE RUNNER',
      heading: 'Документация разработчика (API v1)',
      subheading:
        'Трёхколоночный пульт API в стиле Stripe/Mintlify: интерактивная консоль, живое тестирование локального сервера и готовые сниппеты.',
      navTitle: 'Эндпоинты API',
      guidesTitle: 'Руководство',
      interactiveConsole: 'Интерактивная консоль',
      requestBody: 'Тело запроса (Request Body)',
      resetBody: 'Сбросить',
      apiKeyLabel: 'API-ключ (опционально для песочницы):',
      apiKeyPlaceholder: 'lit_live_xxxxxxxxxxxxxxxx',
      sendRequest: 'Отправить запрос',
      sending: 'Выполняется запрос...',
      responseWaiting: 'Нажмите «Отправить запрос» для тестирования ответа сервера в реальном времени.',
      statusLabel: 'HTTP Статус',
      latencyLabel: 'Время',
      copySnippet: 'Скопировать код',
      copyJson: 'Скопировать JSON',
      copied: 'Скопировано!',
      headersTableTitle: 'Заголовки запроса (Headers)',
      schemaTableTitle: 'Спецификация параметров тела (Request Body Schema)',
      statusCodesTitle: 'Таблица HTTP статус-кодов',
      colParam: 'Параметр',
      colType: 'Тип',
      colRequired: 'Обязательность',
      colDescription: 'Назначение и пример',
      colHeader: 'Заголовок',
      colCode: 'Код',
      colMeaning: 'Значение',
      requiredBadge: 'required',
      optionalBadge: 'optional',
      navDashboard: 'Панель разработчика',
      getKeyBtn: 'Получить API-ключ',
      sampleResponseTitle: 'Пример ответа (JSON Schema)',
      guides: {
        overview: '1. Архитектура и Аутентификация',
        limits: '2. Квоты, Лимиты и Коды ошибок'
      }
    },
    en: {
      tagline: 'API SPECIFICATION & INTERACTIVE RUNNER',
      heading: 'Developer Documentation (API v1)',
      subheading:
        'Stripe/Mintlify 3-column reference console with live local HTTP runner, schema specs, and drop-in gateway integration snippets.',
      navTitle: 'API Endpoints',
      guidesTitle: 'Guides',
      interactiveConsole: 'Interactive Console',
      requestBody: 'Request Body (JSON)',
      resetBody: 'Reset',
      apiKeyLabel: 'API Key (optional for sandbox demo):',
      apiKeyPlaceholder: 'lit_live_xxxxxxxxxxxxxxxx',
      sendRequest: 'Send Request',
      sending: 'Dispatching request...',
      responseWaiting: 'Click "Send Request" to test this live endpoint directly against your server.',
      statusLabel: 'HTTP Status',
      latencyLabel: 'Latency',
      copySnippet: 'Copy Code',
      copyJson: 'Copy JSON',
      copied: 'Copied!',
      headersTableTitle: 'Request Headers',
      schemaTableTitle: 'Request Body Schema Specification',
      statusCodesTitle: 'HTTP Status Codes & Error Responses',
      colParam: 'Parameter',
      colType: 'Type',
      colRequired: 'Requirement',
      colDescription: 'Description & Example',
      colHeader: 'Header',
      colCode: 'Status',
      colMeaning: 'Condition & Meaning',
      requiredBadge: 'required',
      optionalBadge: 'optional',
      navDashboard: 'Developer Dashboard',
      getKeyBtn: 'Get API Key',
      sampleResponseTitle: 'Sample Response (JSON)',
      guides: {
        overview: '1. Architecture & Authentication',
        limits: '2. Quotas, Rate Limits & Errors'
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header Banner */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-300 bg-sky-400/10 px-3 py-1 rounded-full border border-sky-400/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              {t[lang].tagline}
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              v1.0.0 STABLE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-sans font-bold text-white tracking-tight">
            {t[lang].heading}
          </h1>
          <p className="text-sm text-slate-400 font-sans max-w-2xl mt-1.5">
            {t[lang].subheading}
          </p>
        </div>

        {onNavigateToDashboard && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNavigateToDashboard}
              className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-sky-300 border border-white/10 hover:border-sky-400/50 text-xs font-sans font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-98"
            >
              <Key size={14} className="text-sky-400" />
              <span>{t[lang].getKeyBtn}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3-COLUMN INTERACTIVE API DOCS CONSOLE (Stripe / Mintlify Layout) */}
      <div className="grid grid-cols-1 min-[1200px]:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            COLUMN 1 (LEFT): Sticky Navigation Menu
           ========================================================================= */}
        <aside className="w-full min-[1200px]:col-span-3 min-[1200px]:sticky min-[1200px]:top-24 flex flex-col gap-4">
          <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-xl">
            {/* Endpoints Group */}
            <div className="mb-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-2 block mb-2">
                {t[lang].navTitle}
              </span>
              <nav className="flex flex-col gap-1">
                {ENDPOINTS.map((ep) => {
                  const isActive = activeView === 'endpoint' && activeEndpointId === ep.id;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => handleSelectEndpoint(ep.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-sans transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-sky-500/20 text-white font-bold border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden truncate">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                            ep.method === 'GET'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <span className="truncate font-mono text-[11px]">{ep.path}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1 hidden sm:inline">
                        {lang === 'ru' ? ep.badgeRu : ep.badgeEn}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Guides & General Reference */}
            <div className="pt-3 border-t border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-2 block mb-2">
                {t[lang].guidesTitle}
              </span>
              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => handleSelectSection('overview')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-sans transition-all text-left cursor-pointer ${
                    activeView === 'overview'
                      ? 'bg-sky-500/20 text-white font-bold border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <BookOpen size={13} className="text-sky-400 shrink-0" />
                  <span className="truncate">{t[lang].guides.overview}</span>
                </button>
                <button
                  onClick={() => handleSelectSection('limits')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-sans transition-all text-left cursor-pointer ${
                    activeView === 'limits'
                      ? 'bg-sky-500/20 text-white font-bold border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <Shield size={13} className="text-amber-300 shrink-0" />
                  <span className="truncate">{t[lang].guides.limits}</span>
                </button>
              </nav>
            </div>

            {/* Developer Dashboard Shortcut */}
            {onNavigateToDashboard && (
              <div className="pt-4 mt-3 border-t border-white/10">
                <button
                  onClick={onNavigateToDashboard}
                  className="w-full py-2 bg-black/40 hover:bg-black/60 text-sky-300 border border-white/10 hover:border-sky-400/40 text-xs font-sans font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key size={13} className="text-sky-400" />
                  <span>{t[lang].navDashboard}</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* =========================================================================
            COLUMN 2 (CENTER): Endpoint Specification & Schema Reference
           ========================================================================= */}
        <section id="api-spec-column" className="w-full min-[1200px]:col-span-5 flex flex-col gap-6 font-sans scroll-mt-24">
          {activeView === 'endpoint' && (
            <>
              {/* Endpoint Header & Description Card */}
              <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg ${
                      activeEndpoint.method === 'GET'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                    }`}
                  >
                    {activeEndpoint.method}
                  </span>
                  <h2 className="text-lg sm:text-xl font-mono font-bold text-white tracking-tight">
                    {activeEndpoint.path}
                  </h2>
                </div>

                <p className="text-sm font-sans font-medium text-sky-200/90 leading-relaxed">
                  {lang === 'ru' ? activeEndpoint.summaryRu : activeEndpoint.summaryEn}
                </p>

                <p className="text-xs font-sans text-slate-300/80 leading-relaxed border-t border-white/10 pt-3">
                  {lang === 'ru' ? activeEndpoint.descriptionRu : activeEndpoint.descriptionEn}
                </p>
              </div>

              {/* 1. Request Headers Table */}
              <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <Shield size={14} className="text-sky-400" />
                    {t[lang].headersTableTitle}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeEndpoint.headers.length} headers
                  </span>
                </div>

                <div className="w-full overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-xs font-sans border-collapse">
                    <thead>
                      <tr className="bg-white/[0.04] text-slate-400 font-mono text-[11px] border-b border-white/10">
                        <th className="py-2.5 px-3 font-semibold">{t[lang].colHeader}</th>
                        <th className="py-2.5 px-3 font-semibold">{t[lang].colType}</th>
                        <th className="py-2.5 px-3 font-semibold">{t[lang].colRequired}</th>
                        <th className="py-2.5 px-3 font-semibold">{t[lang].colDescription}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {activeEndpoint.headers.map((h) => (
                        <tr key={h.name} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 px-3 font-mono text-sky-300 font-medium whitespace-nowrap">
                            {h.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-cyan-300 text-[11px]">
                            {h.type}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                                h.required
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-slate-500/15 text-slate-400 border border-slate-500/25'
                              }`}
                            >
                              {h.required ? t[lang].requiredBadge : t[lang].optionalBadge}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 text-[11px] leading-relaxed min-w-[200px]">
                            <div>{lang === 'ru' ? h.descriptionRu : h.descriptionEn}</div>
                            {h.example && (
                              <div className="mt-1 font-mono text-[10px] text-slate-400 truncate">
                                e.g. <span className="text-amber-300/80">{h.example}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Request Body Schema Specification */}
              <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <Code2 size={14} className="text-cyan-400" />
                    {t[lang].schemaTableTitle}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeEndpoint.bodyParams.length > 0
                      ? `${activeEndpoint.bodyParams.length} fields`
                      : 'No payload (GET)'}
                  </span>
                </div>

                {activeEndpoint.bodyParams.length === 0 ? (
                  <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-xs font-mono text-slate-400 text-center">
                    {lang === 'ru'
                      ? 'Данный GET-эндпоинт не требует тела запроса (Request Body).'
                      : 'This GET endpoint requires no request body payload.'}
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-left text-xs font-sans border-collapse">
                      <thead>
                        <tr className="bg-white/[0.04] text-slate-400 font-mono text-[11px] border-b border-white/10">
                          <th className="py-2.5 px-3 font-semibold">{t[lang].colParam}</th>
                          <th className="py-2.5 px-3 font-semibold">{t[lang].colType}</th>
                          <th className="py-2.5 px-3 font-semibold">{t[lang].colRequired}</th>
                          <th className="py-2.5 px-3 font-semibold">{t[lang].colDescription}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {activeEndpoint.bodyParams.map((p) => (
                          <tr key={p.name} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-2.5 px-3 font-mono text-sky-200 font-medium whitespace-nowrap">
                              {p.name}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-cyan-300 text-[11px]">
                              {p.type}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                                  p.required
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-slate-500/15 text-slate-400 border border-slate-500/25'
                                }`}
                              >
                                {p.required ? t[lang].requiredBadge : t[lang].optionalBadge}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 text-[11px] leading-relaxed min-w-[220px]">
                              <div>{lang === 'ru' ? p.descriptionRu : p.descriptionEn}</div>
                              {p.defaultVal && (
                                <div className="mt-1 font-mono text-[10px] text-slate-400">
                                  Default: <span className="text-amber-300">{p.defaultVal}</span>
                                </div>
                              )}
                              {p.example && (
                                <div className="mt-0.5 font-mono text-[10px] text-slate-400 truncate">
                                  Example: <span className="text-sky-300/80">{p.example}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 3. HTTP Status Codes Table */}
              <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    {t[lang].statusCodesTitle}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeEndpoint.statusCodes.length} codes
                  </span>
                </div>

                <div className="w-full overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-xs font-sans border-collapse">
                    <thead>
                      <tr className="bg-white/[0.04] text-slate-400 font-mono text-[11px] border-b border-white/10">
                        <th className="py-2.5 px-3 font-semibold">{t[lang].colCode}</th>
                        <th className="py-2.5 px-3 font-semibold">{t[lang].colMeaning}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {activeEndpoint.statusCodes.map((sc) => (
                        <tr key={sc.code} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] inline-flex items-center gap-1.5 ${
                                sc.code === 200
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : sc.code === 400 || sc.code === 429
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              <span>{sc.code}</span>
                              <span className="font-sans font-semibold text-[10px]">{sc.label}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 text-[11px] leading-relaxed">
                            {lang === 'ru' ? sc.descriptionRu : sc.descriptionEn}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Sample Response Preview */}
              <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    {t[lang].sampleResponseTitle}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    HTTP 200 OK
                  </span>
                </div>
                <pre className="p-3.5 bg-black/60 rounded-xl border border-white/10 text-amber-300/90 font-mono text-xs overflow-x-auto leading-relaxed max-h-56">
                  {JSON.stringify(activeEndpoint.sampleResponse, null, 2)}
                </pre>
              </div>
            </>
          )}

          {/* GUIDE 1: Architecture & Auth */}
          {activeView === 'overview' && (
            <div className="flex flex-col gap-6">
              <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                <span className="text-xs font-mono text-sky-300 uppercase tracking-widest font-bold">
                  § 1. ARCHITECTURE & AUTHENTICATION
                </span>
                <h2 className="text-2xl font-sans font-bold text-white">
                  {lang === 'ru' ? 'Архитектура и Аутентификация' : 'Architecture & Authentication'}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {lang === 'ru'
                    ? 'LostInTranslation (LIT) — это контекстный семантический шлюз (Linguistic Middleware), который встраивается в цепочку перед целевой LLM (Claude, GPT-4, Gemini) или CAT-системой локализации. Сервис выявляет культурные потери, оптимизирует расход токенов до 65% и обогащает промпты контекстом.'
                    : 'LostInTranslation (LIT) is a linguistic middleware layer operating upstream of large language models (Claude, GPT-4o, Gemini) and localization pipelines. It detects cultural nuance loss, saves up to 65% on prompt tokens, and enriches LLMs with grounded intent.'}
                </p>

                <div className="mt-2 bg-black/50 p-4 rounded-xl border border-white/10 flex flex-col gap-2 font-mono text-xs text-sky-200">
                  <div className="text-slate-400 uppercase text-[10px] font-bold">Headers Authentication</div>
                  <div>x-api-key: lit_live_xxxxxxxxxxxxxxxx</div>
                  <div>Authorization: Bearer lit_live_xxxxxxxxxxxxxxxx</div>
                </div>
              </div>

              <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-3">
                <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                  {lang === 'ru' ? 'Быстрый старт за 3 шага' : 'Quickstart in 3 Steps'}
                </h3>
                <ol className="flex flex-col gap-2.5 text-xs text-slate-300 leading-relaxed font-sans list-decimal list-inside">
                  <li>
                    {lang === 'ru'
                      ? 'Получите бесплатный Sandbox-ключ в Панели разработчика.'
                      : 'Generate your free Sandbox API key in Developer Dashboard.'}
                  </li>
                  <li>
                    {lang === 'ru'
                      ? 'Перенаправьте ваш OpenAI SDK baseURL на http://localhost:3000/v1.'
                      : 'Point your OpenAI SDK client baseURL to http://localhost:3000/v1.'}
                  </li>
                  <li>
                    {lang === 'ru'
                      ? 'Отправляйте промпты на русском языке: шлюз автоматически сожмет токены и вернет результат без потери культурного подтекста.'
                      : 'Send natural language prompts: the gateway automatically compresses tokens and preserves cultural tone.'}
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* GUIDE 2: Quotas & Limits */}
          {activeView === 'limits' && (
            <div className="flex flex-col gap-6">
              <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                <span className="text-xs font-mono text-amber-300 uppercase tracking-widest font-bold">
                  § 2. QUOTAS & RATE LIMITS
                </span>
                <h2 className="text-2xl font-sans font-bold text-white">
                  {lang === 'ru' ? 'Квоты, Тарифы и Коды ошибок' : 'Quotas, Tiers & Rate Limits'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <div className="bg-black/40 border border-white/10 p-4 rounded-xl">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">ANONYMOUS (IP)</span>
                    <span className="text-2xl font-sans font-bold text-white mt-1 block">10 req</span>
                    <span className="text-xs text-slate-400 font-sans">/ 24 hours</span>
                  </div>
                  <div className="bg-sky-500/10 border border-sky-400/30 p-4 rounded-xl">
                    <span className="text-[10px] font-mono uppercase text-sky-300 block">FREE SANDBOX</span>
                    <span className="text-2xl font-sans font-bold text-sky-200 mt-1 block">50 req</span>
                    <span className="text-xs text-sky-300/80 font-sans">/ 24 hours</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block">PRODUCTION PRO</span>
                    <span className="text-2xl font-sans font-bold text-emerald-400 mt-1 block">1,000 req</span>
                    <span className="text-xs text-emerald-400/80 font-sans">/ 24 hours</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex flex-col gap-2 text-xs font-sans text-slate-300 leading-relaxed">
                  <div className="font-bold text-white">Rate Limit Headers:</div>
                  <div className="font-mono text-sky-300 bg-black/40 p-2.5 rounded-lg border border-white/10">
                    X-RateLimit-Limit: 50{"\n"}
                    X-RateLimit-Remaining: 49
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =========================================================================
            COLUMN 3 (RIGHT): Interactive Sticky Console & Live Local HTTP Runner
           ========================================================================= */}
        <aside className="w-full min-[1200px]:col-span-4 min-[1200px]:sticky min-[1200px]:top-24 flex flex-col gap-5">
          <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            
            {/* Console Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-sky-400" />
                <h3 className="font-sans font-bold text-white text-xs uppercase tracking-wider">
                  {t[lang].interactiveConsole}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    activeEndpoint.method === 'GET'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                  }`}
                >
                  {activeEndpoint.method}
                </span>
                <span className="text-slate-400 font-mono text-[11px] truncate max-w-[130px]">
                  {activeEndpoint.path}
                </span>
              </div>
            </div>

            {activeView !== 'endpoint' && (
              <div className="bg-sky-500/10 border border-sky-400/20 rounded-xl p-2.5 flex items-center justify-between text-xs font-sans">
                <span className="text-sky-200 text-[11px]">
                  {lang === 'ru'
                    ? `Песочница: ${activeEndpoint.path}`
                    : `Sandbox: ${activeEndpoint.path}`}
                </span>
                <button
                  onClick={() => setActiveView('endpoint')}
                  className="text-[10px] font-mono text-sky-300 hover:text-white underline cursor-pointer"
                >
                  {lang === 'ru' ? 'К спецификации' : 'View Spec'}
                </button>
              </div>
            )}

            {/* Language Selector Tabs */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-mono">
                <button
                  onClick={() => setSnippetLang('curl')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    snippetLang === 'curl'
                      ? 'bg-sky-500/20 text-sky-200 font-bold border border-sky-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal size={12} />
                  <span>cURL</span>
                </button>
                <button
                  onClick={() => setSnippetLang('javascript')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    snippetLang === 'javascript'
                      ? 'bg-sky-500/20 text-sky-200 font-bold border border-sky-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode size={12} />
                  <span>JavaScript</span>
                </button>
                <button
                  onClick={() => setSnippetLang('python')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    snippetLang === 'python'
                      ? 'bg-sky-500/20 text-sky-200 font-bold border border-sky-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu size={12} />
                  <span>Python</span>
                </button>
              </div>

              {/* R3 Requirement: Neutral universal title */}
              <button
                onClick={() => {
                  setSnippetLang('openai');
                  if (activeEndpointId !== 'chat-completions') {
                    handleSelectEndpoint('chat-completions');
                  }
                }}
                className={`w-full py-1.5 px-2.5 rounded-xl text-left text-xs font-mono transition-all cursor-pointer flex items-center justify-between border ${
                  snippetLang === 'openai'
                    ? 'bg-sky-500/20 text-sky-100 font-bold border-sky-400/40 shadow-sm'
                    : 'bg-black/30 text-slate-400 hover:text-white border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Layers size={13} className="text-cyan-400 shrink-0" />
                  <span className="truncate">OpenAI SDK / Drop-in AI Gateway (Cursor, OpenCode, LibreChat)</span>
                </div>
                <span className="text-[10px] text-cyan-300 font-bold shrink-0 ml-1">Drop-in</span>
              </button>
            </div>

            {/* Code Snippet Box with Copy Button */}
            <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden font-mono text-xs flex flex-col">
              <div className="bg-white/[0.04] px-3.5 py-2 border-b border-white/10 flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                  <span className="w-2 h-2 rounded-full bg-amber-400/80" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 uppercase tracking-wider text-[10px] text-slate-400">
                    {snippetLang}
                  </span>
                </span>
                <button
                  onClick={copyCodeSnippet}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer transition-colors"
                >
                  {snippetCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{snippetCopied ? t[lang].copied : t[lang].copySnippet}</span>
                </button>
              </div>
              <pre className="p-3 text-sky-200/90 overflow-x-auto max-h-52 leading-relaxed text-[11px] whitespace-pre select-all">
                {generateSnippet(snippetLang)}
              </pre>
            </div>

            {/* LIVE HTTP RUNNER (Test against Local Server) */}
            <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-sans font-bold text-white">
                    Live HTTP Runner
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  localhost:3000
                </span>
              </div>

              {/* Optional API Key Input */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="runner-api-key-input" className="text-[10px] font-mono uppercase text-slate-400">
                    {activeEndpointId === 'enhance'
                      ? (lang === 'ru' ? 'API-ключ (обязателен для /api/enhance):' : 'API Key (required for /api/enhance):')
                      : t[lang].apiKeyLabel}
                  </label>
                  {activeEndpointId === 'enhance' && !apiKeyInput.trim() && (
                    <span className="text-rose-400 font-mono text-[9px] uppercase font-bold tracking-wider">
                      {lang === 'ru' ? 'Обязательно' : 'Required'}
                    </span>
                  )}
                </div>
                <input
                  id="runner-api-key-input"
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={t[lang].apiKeyPlaceholder}
                  className="font-mono text-xs bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-sky-200 placeholder-slate-600 focus:outline-none focus:border-sky-400/50 w-full"
                />
              </div>

              {/* Editable Request Body for POST endpoints */}
              {activeEndpoint.method === 'POST' && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="runner-request-body" className="text-[10px] font-mono uppercase text-slate-400">
                      {t[lang].requestBody}
                    </label>
                    <button
                      type="button"
                      onClick={handleResetPayload}
                      className="text-[10px] font-mono text-sky-300 hover:text-sky-200 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={10} />
                      <span>{t[lang].resetBody}</span>
                    </button>
                  </div>
                  <textarea
                    id="runner-request-body"
                    rows={4}
                    value={payloads[activeEndpointId]}
                    onChange={(e) =>
                      setPayloads((prev) => ({
                        ...prev,
                        [activeEndpointId]: e.target.value
                      }))
                    }
                    className="font-mono text-xs bg-black/60 border border-white/10 rounded-xl p-2.5 text-sky-200 focus:outline-none focus:border-sky-400/50 w-full resize-y leading-relaxed text-[11px]"
                  />
                </div>
              )}

              {/* Action Button: celestial-btn-primary */}
              <button
                onClick={executeLiveTest}
                disabled={runnerLoading}
                className="celestial-btn-primary w-full py-2.5 px-4 bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 border border-sky-400/40 font-sans font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {runnerLoading ? (
                  <RefreshCw size={14} className="animate-spin text-sky-200" />
                ) : (
                  <Play size={14} className="text-sky-200" />
                )}
                <span>
                  {runnerLoading
                    ? t[lang].sending
                    : `${t[lang].sendRequest} (${activeEndpoint.method} ${activeEndpoint.path})`}
                </span>
              </button>

              {/* Live Response Container */}
              {runnerResponse ? (
                <div className="mt-1 bg-black/60 border border-white/10 rounded-xl overflow-hidden font-mono text-xs">
                  <div className="bg-white/[0.04] px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          runnerStatus === 200
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : runnerStatus === 400 || runnerStatus === 429
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {runnerStatus} {runnerStatus === 200 ? 'OK' : 'RESPONSE'}
                      </span>
                      {runnerTimeMs !== null && (
                        <span className="text-slate-400 text-[10px] flex items-center gap-1">
                          <Clock size={11} className="text-amber-300" />
                          <span className="text-amber-300 font-bold">{runnerTimeMs} ms</span>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={copyResponseJson}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] cursor-pointer transition-colors"
                    >
                      {runnerCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{runnerCopied ? t[lang].copied : t[lang].copyJson}</span>
                    </button>
                  </div>
                  <pre className="p-3 text-amber-300/90 overflow-x-auto max-h-56 leading-relaxed text-[11px] whitespace-pre">
                    {JSON.stringify(runnerResponse, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-[11px] font-sans text-slate-400 bg-black/30 border border-white/[0.06] rounded-xl p-3 text-center">
                  {t[lang].responseWaiting}
                </div>
              )}
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}
