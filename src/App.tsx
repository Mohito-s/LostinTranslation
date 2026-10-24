import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Globe, 
  Terminal, 
  Shield, 
  Key, 
  AlertTriangle, 
  Play, 
  Settings, 
  Database, 
  Activity, 
  Code, 
  Layers, 
  DollarSign, 
  Check, 
  Copy, 
  ArrowRight, 
  BookOpen, 
  Trash2, 
  Plus, 
  ArrowUpRight,
  Info,
  RefreshCw,
  Send,
  Menu,
  X,
  Users,
  LogOut,
  User
} from 'lucide-react';
import DemoWidget from './components/DemoWidget';
import { MattkaOrbCanvas } from './components/MattkaOrbCanvas';
import { RemixHud } from './components/RemixHud';

// Lazy loaded code-split routes and modals for optimized bundle size
const Integrations = React.lazy(() => import('./components/Integrations'));
const ApiDocs = React.lazy(() => import('./components/ApiDocs'));
const SupportModal = React.lazy(() => import('./components/SupportModal'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));

// Types for stats
interface DashboardStats {
  totalRequests: number;
  successRate: number;
  lossesAvg: number;
  endpointsUsage: {
    enhance: number;
    analyze: number;
  };
  apiKeys: {
    id: string;
    key: string;
    name: string;
    status: 'active' | 'revoked';
    createdAt: string;
    tier: 'free' | 'paid';
    usageCount: number;
  }[];
  recentLogs: {
    id: string;
    apiKey: string;
    endpoint: 'analyze' | 'enhance';
    timestamp: string;
    textLength: number;
    lossesDetected: number;
    success: boolean;
    ipAddress?: string;
  }[];
}

const TRANSLATIONS = {
  ru: {
    navHome: "Главная",
    navSandbox: "Песочница",
    navDocs: "Документация API",
    navIntegrations: "Интеграции",
    navDashboard: "Кабинет",
    navLangRu: "Русский",
    navLangEn: "English",
    
    heroTitle: "Ваша LLM понимает слова.",
    heroTitleHighlight: "Мы даём ей культурный смысл.",
    heroSubtitle: "LostInTranslation (LIT) — это контекстный семантический слой для глобальных AI-приложений. Мы выявляем скрытые потери контекста при дословном переводе и обогащаем промты глубинными культурными маркерами.",
    heroBtnSandbox: "Попробовать в песочнице",
    heroBtnDocs: "Документация API",
    
    howTitle: "Как это устроено?",
    howSubtitle: "Традиционные переводчики передают лишь форму. LostInTranslation извлекает скрытые модальности, иронию и социальные подтексты.",
    howStep1Title: "1. Анализ текста",
    howStep1Desc: "Gemini-движок сканирует сообщение на наличие 15+ лингвистических маркеров (частицы, вежливость, пассивная агрессия).",
    howStep2Title: "2. Выявление потерь",
    howStep2Desc: "Формируется точный JSON-реестр утерянных смыслов с указанием критичности искажения (от Low до Extreme).",
    howStep3Title: "3. Инъекция промта",
    howStep3Desc: "Интегрированный API обогащает ваш оригинальный промт защитным контекстом, гарантируя безошибочную интерпретацию любой LLM.",

    archTitle: "Схема интеграции в ваш ИИ-ассистент",
    archSubtitle: "Посмотрите, как семантический шлюз LIT встраивается в цепочку выполнения запросов перед отправкой в целевую LLM:",
    archBoxUser: "Пользователь",
    archBoxLit: "LIT Семантический Шлюз",
    archBoxLlm: "Ваша Целевая LLM (GPT-4, Gemini, Claude)",
    archLabelInput: "Оригинальный текст",
    archLabelContext: "Обогащенный промт",
    archLabelOutput: "Идеально точный ответ",

    matrixTitle: "Что именно извлекает наша модель?",
    matrixSubtitle: "Каждый язык обладает уникальной глубиной за счет грамматических и культурных механизмов, которые ломают дословный перевод:",
    matrix1Title: "Модальные частицы и маркеры",
    matrix1Desc: "Частицы вроде русского «же, ну, ведь» или японских эмоциональных окончаний радикально смещают степень иронии или вежливости.",
    matrix2Title: "Вежливость и суффиксы",
    matrix2Desc: "Суффиксы вежливости, уменьшительно-ласкательные формы или пассивная агрессия, замаскированная под дружелюбие.",
    matrix3Title: "Культурный Understatement",
    matrix3Desc: "Отрицания там, где другие языки требуют прямых утверждений (например, немецкое «nicht schlecht» или русское «неплохо»).",
    matrix4Title: "Хеджирование и маскировка",
    matrix4Desc: "Специальные конструкции («ну в принципе», «да нет наверное») для сохранения лица или вежливого, но категоричного отказа.",
    matrix5Title: "Видовые формы глаголов",
    matrix5Desc: "Окончательный выбор совершенного или несовершенного вида глагола полностью переопределяет статус завершенности или намерения собеседника.",
    matrix6Title: "Порядок слов и акценты",
    matrix6Desc: "Свободный порядок слов, перенос подлежащего или сказуемого в конец фразы для выражения иронии, сарказма или тревоги.",

    pricingTitle: "Гибкие тарифные планы",
    pricingSubtitle: "Начните тестировать в песочнице бесплатно и переходите на безлимитный продакшн, когда будете готовы:",
    pricingFreeTitle: "SANDBOX FREE",
    pricingFreePrice: "$0",
    pricingFreePeriod: "/ навсегда",
    pricingFreeDesc: "Идеально подходит для локальной разработки, тестирования концепций и демонстрационных стендов.",
    pricingFreeBullet1: "Доступ к API /api/analyze",
    pricingFreeBullet2: "50 запросов в день по бесплатному ключу",
    pricingFreeBullet3: "Доступ к API /api/enhance",
    pricingFreeBullet4: "Поддержка боевых LLM промтов",
    pricingFreeBtn: "Создать бесплатный ключ",
    pricingProTitle: "PRODUCTION PRO",
    pricingProPrice: "$5",
    pricingProPeriod: "/ месяц",
    pricingProDesc: "Для полноценных боевых ИИ-приложений, умных ассистентов, CRM-анализа и ботов поддержки.",
    pricingProBullet1: "Полный доступ к обоим эндпоинтам",
    pricingProBullet2: "1000 запросов в день по каждому ключу",
    pricingProBullet3: "Синтез промтов /api/enhance",
    pricingProBullet4: "Приоритетная скорость обработки Gemini",
    pricingProBtn: "Создать Production-ключ",

    sandboxHeading: "Интерактивная песочница",
    sandboxDesc: "Здесь вы можете вживую проверить, как работает LostInTranslation API. Выберите один из готовых примеров ниже или напишите собственную фразу, чтобы выявить культурные потери смысла.",
    demoTitle: "Интерактивная песочница",
    demoSubtitle: "Здесь вы можете вживую проверить, как работает LostInTranslation API. Выберите один из готовых примеров ниже или напишите собственную фразу, чтобы выявить культурные потери смысла.",

    docsHeading: "Документация разработчика (API v1)",
    docsDesc: "LostInTranslation предоставляет лаконичный и быстрый JSON REST API, который легко интегрируется в любой бэкенд на Node.js, Python, Go или прямо в LangChain цепочки.",
    docsIntro: "Введение в API",
    docsIntroText: "Служба LostInTranslation решает фундаментальную проблему межкультурных коммуникаций в искусственном интеллекте. Локальные языковые паттерны (ирония, смягчение, скрытое согласие) часто дословно переводятся базовыми LLM с полной потерей изначального намерения. Наш API предоставляет разработчикам два мощных шлюза: анализ текста и обогащение промтов.",
    docsBaseUrl: "Базовый URL",
    docsBaseUrlDesc: "Все запросы должны выполняться с заголовком",
    docsHeaderKey: "X-LIT-API-KEY",
    docsQuickStart: "Быстрый старт: Анализ текста",
    docsQuickStartDesc: "Эндпоинт служит для глубокого семантического разбора сообщения пользователя перед обработкой в вашей системе.",
    docsRequestHeaders: "Заголовки запроса:",
    docsRequestBody: "Тело запроса (JSON):",
    docsResponseSuccess: "Успешный ответ (JSON):",
    docsQuickStartEnhance: "Быстрый старт: Обогащение промтов",
    docsQuickStartEnhanceDesc: "Этот эндпоинт принимает ваш оригинальный промт, извлекает лингвистические особенности обрабатываемого текста и возвращает обогащённый промт с инъецированными защитными инструкциями.",
    docsResponseCodes: "Коды ответов сервера:",

    dashboardHeading: "Консоль разработчика LIT API",
    dashboardDesc: "Управляйте вашими API-ключами, отслеживайте статистику вызовов, нагрузку на шлюзы и анализируйте логи потерь в реальном времени.",
    dashKeyGenTitle: "Выпуск нового API-токена",
    dashKeyGenDesc: "Создайте токен для авторизации запросов к шлюзу LostInTranslation.",
    dashKeyNameLabel: "Название ключа (для идентификации):",
    dashKeyNamePlaceholder: "Например: Prod App Assistant, Mobile Bot",
    dashKeyTierLabel: "Тарифный план для ключа:",
    dashKeyTierFree: "Sandbox Free (50 запр/день)",
    dashKeyTierPaid: "Production Pro ($5/мес - 1000 запр/день)",
    dashKeyGenBtn: "Выпустить ключ",
    dashKeyGenBtnLoading: "Генерация...",
    dashKeyGenSuccess: "Ваш API-ключ успешно создан!",
    dashKeyGenSuccessDesc: "Скопируйте его прямо сейчас. Из соображений безопасности он не будет показан повторно.",
    dashKeyGenClose: "Я сохранил ключ, закрыть",
    dashStatsTitle: "Статистика использования шлюза",
    dashStatsTotal: "Всего запросов",
    dashStatsSuccess: "Индекс успешности",
    dashStatsLosses: "Среднее число потерь смыслов",
    dashKeysListTitle: "Активные API-ключи проекта",
    dashKeysTableHeaderName: "НАЗВАНИЕ КЛЮЧА",
    dashKeysTableHeaderTier: "ТАРИФ",
    dashKeysTableHeaderStatus: "СТАТУС",
    dashKeysTableHeaderCreated: "ДАТА СОЗДАНИЯ",
    dashKeysTableHeaderCalls: "КОЛИЧЕСТВО ВЫЗОВОВ",
    dashKeysTableHeaderAction: "ДЕЙСТВИЕ",
    dashKeysTableRevokeBtn: "Отозвать",
    dashKeysTableRevoked: "Revoked",
    dashKeysEmpty: "Ключи отсутствуют. Сгенерируйте токен слева.",
    dashLogsTitle: "Логи транзакций API шлюза (Аудит в реальном времени)",
    dashLogsTableEndpoint: "ЭНДПОИНТ",
    dashLogsTableToken: "API-ТОКЕН",
    dashLogsTableLosses: "СЕРВЕРНОЕ ЧИСЛО ПОТЕРЬ",
    dashLogsTableLength: "ДЛИНА ТЕКСТА",
    dashLogsTableIp: "IP АДРЕС",
    dashLogsTableTime: "ВРЕМЯ ТРАНЗАКЦИИ",
    dashLogsEmpty: "Логи транзакций пока пусты.",
    charsLabel: "символов",
    errorLoadingStats: "Ошибка при получении статистики.",
    dashBtnRefresh: "Обновить статистику",
    dashStatsTotalLabel: "ВСЕГО ЗАПРОСОВ (24H)",
    dashStatsSyncRealtime: "Синхронизировано в реальном времени",
    dashStatsLossesPrevented: "ПРЕДОТВРАЩЕНО ПОТЕРЬ",
    dashStatsLossesAvgLabel: "В среднем {avg} потерь смыслов на запрос",
    dashStatsSuccessRate: "УСПЕШНЫЕ ТРАНЗАКЦИИ",
    dashStatsUptimeLabel: "Uptime шлюза составляет 99.9%",
    dashStatsActiveKeys: "ДЕЙСТВУЮЩИЕ КЛЮЧИ",
    dashStatsRevokedLabel: "Отозвано (Revoked):",
    dashKeysTableCreatedLabel: "Создан:",
    dashKeysTableCopyTooltip: "Скопировать полный ключ",
    dashKeysTableHeaderToken: "API ТОКЕН",
    dashKeysTableHeaderCallsCount: "ЗАПРОСЫ",
    dashKeysTableHeaderActionManage: "УПРАВЛЕНИЕ"
  },
  en: {
    navHome: "Home",
    navSandbox: "Sandbox",
    navDocs: "API Docs",
    navIntegrations: "Integrations",
    navDashboard: "Dashboard",
    navLangRu: "Русский",
    navLangEn: "English",

    heroTitle: "Your LLM reads local words.",
    heroTitleHighlight: "We give it cultural meaning.",
    heroSubtitle: "LostInTranslation (LIT) is a context-rich semantic layer for global AI applications. We detect hidden context loss in literal translations and enrich prompts with deep cultural markers.",
    heroBtnSandbox: "Try Interactive Sandbox",
    heroBtnDocs: "View API Docs",

    howTitle: "How It Works",
    howSubtitle: "Traditional translators transfer only structure. LostInTranslation extracts hidden modalities, irony, and deep social undercurrents.",
    howStep1Title: "1. Text Analysis",
    howStep1Desc: "Our Gemini-backed engine scans messages for 15+ linguistic markers (particles, modesty modifiers, passive aggression).",
    howStep2Title: "2. Loss Identification",
    howStep2Desc: "A precise JSON registry of lost meanings is formed, specifying severity scores from Low to Extreme.",
    howStep3Title: "3. Prompt Injection",
    howStep3Desc: "Our integrated API enriches your raw prompt with protective context, ensuring perfect interpretation by any LLM.",

    archTitle: "Integration Flow in Your AI Assistant",
    archSubtitle: "See how the LIT semantic gateway inserts into the prompt execution pipeline before hitting your target LLM:",
    archBoxUser: "User Client",
    archBoxLit: "LIT Semantic Gateway",
    archBoxLlm: "Your Target LLM (GPT-4, Gemini, Claude)",
    archLabelInput: "Original Localized Text",
    archLabelContext: "Context-Enriched Prompt",
    archLabelOutput: "Perfect Culturally-Accurate Response",

    matrixTitle: "What Markers Do We Extract?",
    matrixSubtitle: "Every language carries unique depth through grammatical and cultural mechanisms that break literal translations:",
    matrix1Title: "Modal Particles & Markers",
    matrix1Desc: "Subtle particles like Russian 'zhe', 'nu', 'ved' or Japanese emotional sentence endings dramatically shift degrees of irony or politeness.",
    matrix2Title: "Politeness & Suffixes",
    matrix2Desc: "Honorific suffixes, diminutive forms, or complex passive-aggression disguised as superficial friendliness.",
    matrix3Title: "Cultural Understatement",
    matrix3Desc: "Negation structures where other languages demand positive claims (e.g. German 'nicht schlecht' or Russian 'neploho').",
    matrix4Title: "Hedging & Mitigation",
    matrix4Desc: "Special phrases (e.g., 'well in principle', 'yes no probably') used to save face or express polite but firm rejection.",
    matrix5Title: "Grammatical Verb Aspects",
    matrix5Desc: "Perfective vs. imperfective verb selection completely redefines completion status or the speaker's true commitment.",
    matrix6Title: "Word Order & Focus Focus",
    matrix6Desc: "Free word order, transferring subjects or verbs to the end of sentences to convey sarcasm, anxiety, or disbelief.",

    pricingTitle: "Flexible Developer Pricing",
    pricingSubtitle: "Start testing in the sandbox for free, and move to unlimited production scale when you are ready:",
    pricingFreeTitle: "SANDBOX FREE",
    pricingFreePrice: "$0",
    pricingFreePeriod: "/ forever",
    pricingFreeDesc: "Perfect for local development, building proofs of concept, and hackathon prototypes.",
    pricingFreeBullet1: "Access to /api/analyze API endpoint",
    pricingFreeBullet2: "50 requests per day on free tier sandbox key",
    pricingFreeBullet3: "Access to /api/enhance API endpoint",
    pricingFreeBullet4: "Production LLM prompt synthesis support",
    pricingFreeBtn: "Generate Free Sandbox Key",
    pricingProTitle: "PRODUCTION PRO",
    pricingProPrice: "$5",
    pricingProPeriod: "/ month",
    pricingProDesc: "For high-performance AI applications, smart travel agents, CRM translation channels, and support bots.",
    pricingProBullet1: "Full access to both API endpoints",
    pricingProBullet2: "1000 requests per day per generated token",
    pricingProBullet3: "Advanced prompt synthesis via /api/enhance",
    pricingProBullet4: "Priority low-latency Gemini request routing",
    pricingProBtn: "Generate Production Key",

    sandboxHeading: "Interactive Playground Sandbox",
    sandboxDesc: "Experience how the LostInTranslation API performs in real-time. Select a preset below or type your own colloquial phrases to scan for cultural loss.",
    demoTitle: "Interactive Playground Sandbox",
    demoSubtitle: "Experience how the LostInTranslation API performs in real-time. Select a preset below or type your own colloquial phrases to scan for cultural loss.",

    docsHeading: "Developer Documentation & SDK (v1)",
    docsDesc: "LostInTranslation provides a low-latency, stateless JSON REST API that easily integrates into any Node.js, Python, Go backend, or LangChain pipelines.",
    docsIntro: "API Introduction",
    docsIntroText: "The LostInTranslation engine addresses the fundamental problem of intercultural nuance loss in generative AI. Local language patterns (irony, modesty, mitigation) are often translated literally by vanilla models, completely stripping the user's intent. Our API provides two powerful interfaces: raw semantic analysis and automated prompt enrichment.",
    docsBaseUrl: "Base API URL",
    docsBaseUrlDesc: "All requests must be authenticated using the request header",
    docsHeaderKey: "X-LIT-API-KEY",
    docsQuickStart: "Quick Start: Text Analysis (/api/analyze)",
    docsQuickStartDesc: "Use this endpoint to inspect a user's raw message and extract cultural markers before sending it to your database or primary model.",
    docsRequestHeaders: "HTTP Request Headers:",
    docsRequestBody: "Request Body Parameters (JSON):",
    docsResponseSuccess: "Successful JSON Response:",
    docsQuickStartEnhance: "Quick Start: Prompt Enrichment (/api/enhance)",
    docsQuickStartEnhanceDesc: "This endpoint takes your primary LLM prompt and the localized text, then returns an augmented prompt injected with protective cultural instructions.",
    docsResponseCodes: "HTTP Response Status Codes:",

    dashboardHeading: "LIT API Developer Console",
    dashboardDesc: "Generate and revoke API tokens, monitor endpoint throughput metrics, success index rates, and audit real-time transaction logs.",
    dashKeyGenTitle: "Generate New API Token",
    dashKeyGenDesc: "Issue a secure token to authenticate requests against the LIT semantic gateway.",
    dashKeyNameLabel: "Token Name (For identification):",
    dashKeyNamePlaceholder: "e.g., Production Travel Assistant, Mobile Support Bot",
    dashKeyTierLabel: "Select Subscription Tier Plan:",
    dashKeyTierFree: "Sandbox Free (50 requests/day)",
    dashKeyTierPaid: "Production Pro ($5/mo - 1000 requests/day)",
    dashKeyGenBtn: "Generate Token",
    dashKeyGenBtnLoading: "Generating...",
    dashKeyGenSuccess: "Your API Key has been successfully generated!",
    dashKeyGenSuccessDesc: "Make sure to copy it now. For security purposes, it will not be displayed again.",
    dashKeyGenClose: "I have saved the key, close",
    dashStatsTitle: "LIT Gateway Consumption Statistics",
    dashStatsTotal: "Total Transactions",
    dashStatsSuccess: "Gateway Success Index",
    dashStatsLosses: "Avg Mean Cultural Losses Detected",
    dashKeysListTitle: "Active API Credentials",
    dashKeysTableHeaderName: "CREDENTIAL NAME",
    dashKeysTableHeaderTier: "TIER",
    dashKeysTableHeaderStatus: "STATUS",
    dashKeysTableHeaderCreated: "ISSUED AT",
    dashKeysTableHeaderCalls: "CALLS TRACKED",
    dashKeysTableHeaderAction: "ACTION",
    dashKeysTableRevokeBtn: "Revoke Key",
    dashKeysTableRevoked: "Revoked",
    dashKeysEmpty: "No API keys generated yet. Use the control panel on the left.",
    dashLogsTitle: "Gateway Transaction Audit Logs (Real-time)",
    dashLogsTableEndpoint: "ENDPOINT METHOD",
    dashLogsTableToken: "API TOKEN",
    dashLogsTableLosses: "LOSSES PREVENTED",
    dashLogsTableLength: "PAYLOAD LENGTH",
    dashLogsTableIp: "INGRESS IP",
    dashLogsTableTime: "TIMESTAMP",
    dashLogsEmpty: "Gateway audit stream is currently empty.",
    charsLabel: "characters",
    errorLoadingStats: "Error loading statistics data.",
    dashBtnRefresh: "Refresh stats",
    dashStatsTotalLabel: "TOTAL REQUESTS (24H)",
    dashStatsSyncRealtime: "Synced in real-time",
    dashStatsLossesPrevented: "PREVENTED LOSSES",
    dashStatsLossesAvgLabel: "In average {avg} meaning losses per request",
    dashStatsSuccessRate: "SUCCESS RATE",
    dashStatsUptimeLabel: "Gateway uptime is 99.9%",
    dashStatsActiveKeys: "ACTIVE API KEYS",
    dashStatsRevokedLabel: "Revoked:",
    dashKeysTableCreatedLabel: "Created:",
    dashKeysTableCopyTooltip: "Copy full token",
    dashKeysTableHeaderToken: "API TOKEN",
    dashKeysTableHeaderCallsCount: "CALLS",
    dashKeysTableHeaderActionManage: "MANAGEMENT"
  }
};

const HERO_SAMPLES = [
  {
    lang: "JP",
    flag: "🇯🇵",
    phrase: "行けたら行く",
    literal: "I will go if I can",
    literalFlaw: {
      ru: "LLM считает, что собеседник скорее всего придёт (False Positive)",
      en: "LLM assumes the user will likely attend (False Positive)"
    },
    litVerdict: "I probably won't be able to make it",
    nuance: {
      ru: "Культура 'Wa' (гармония): вежливое уклонение, означающее категорический отказ без создания неловкости",
      en: "Japanese 'Wa' culture: polite avoidance, meaning a definitive decline to preserve harmony"
    },
    score: 96,
  },
  {
    lang: "RU",
    flag: "🇷🇺",
    phrase: "Да, но нет",
    literal: "Yes, but no",
    literalFlaw: {
      ru: "LLM воспринимает как сомнение или колебание между 'да' и 'нет'",
      en: "LLM parses this as confusion or indecisiveness"
    },
    litVerdict: "Definitely not / I must decline",
    nuance: {
      ru: "Разговорный смягчающий маркер: поверхностная вежливость ('Да') перед твердым отказом ('нет')",
      en: "Polite Russian softening marker: superficial agreement followed by definitive refusal"
    },
    score: 98,
  },
  {
    lang: "DE",
    flag: "🇩🇪",
    phrase: "Jein",
    literal: "Yes-no",
    literalFlaw: {
      ru: "LLM считает фразу признаком нерешительности",
      en: "LLM treats it as vague uncertainty"
    },
    litVerdict: "Yes, but only under specific strict conditions",
    nuance: {
      ru: "Синтез Ja + Nein: согласие строго при выполнении принципиальных оговорок",
      en: "Structured skepticism: agreement strictly conditioned on major reservations"
    },
    score: 94,
  },
  {
    lang: "ES",
    flag: "🇪🇸",
    phrase: "Mañana te lo mando",
    literal: "Tomorrow I will send it to you",
    literalFlaw: {
      ru: "LLM фиксирует строгий дедлайн на завтрашний день",
      en: "LLM sets a literal deadline for tomorrow"
    },
    litVerdict: "In the near future, not necessarily tomorrow",
    nuance: {
      ru: "Социальное хеджирование: 'mañana' обозначает неопределённый срок, а не календарный день",
      en: "Cultural hedging: 'mañana' refers to indefinite future rather than tomorrow"
    },
    score: 92,
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'demo' | 'docs' | 'dashboard' | 'integrations' | 'privacy'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [heroSampleIdx, setHeroSampleIdx] = useState(0);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyTier, setNewKeyTier] = useState<'free' | 'paid'>('paid');
  const [keyGenerationLoading, setKeyGenerationLoading] = useState(false);
  const [generatedKeyResult, setGeneratedKeyResult] = useState<string | null>(null);
  const [revokingKey, setRevokingKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Authentication State Hooks
  const [sessionToken, setSessionToken] = useState<string | null>(localStorage.getItem('lit_session_token'));
  const [user, setUser] = useState<{ id: string | number; email: string } | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Eagerly prefetch lazy modules in background so tab switching is instantaneous
  useEffect(() => {
    const prefetch = () => {
      import('./components/ApiDocs');
      import('./components/Integrations');
      import('./components/SupportModal');
      import('./components/PrivacyPolicy');
    };
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetch);
    } else {
      setTimeout(prefetch, 100);
    }
  }, []);

  // Helper to switch tabs and sync URL hash
  const switchTab = (tab: 'home' | 'demo' | 'docs' | 'dashboard' | 'integrations' | 'privacy') => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (window.location.hash.replace(/^#/, '') !== tab) {
      window.history.pushState(null, '', `#${tab}`);
    }
  };

  // Synchronize URL query params and hash routes
  useEffect(() => {
    const handleRoute = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || params.get('guide') === 'true' || params.get('dev') === 'true') {
        setIsAdminMode(true);
      }
      
      const rawHash = window.location.hash.replace(/^#/, '').toLowerCase();
      const tabParam = params.get('tab');
      const target = (tabParam || rawHash).toLowerCase();
      const pathName = window.location.pathname.toLowerCase();

      if (target === 'privacy' || target === 'policy' || pathName === '/privacy') {
        setCurrentTab('privacy');
      } else if (target === 'integrations') {
        setCurrentTab('integrations');
      } else if (target === 'demo' || target === 'sandbox') {
        setCurrentTab('demo');
      } else if (target === 'docs' || target === 'api') {
        setCurrentTab('docs');
      } else if (target === 'dashboard' || target === 'keys') {
        setCurrentTab('dashboard');
      } else if (target === 'pricing') {
        setCurrentTab('home');
        setTimeout(() => {
          document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else if (target === 'support' || target === 'help') {
        setIsSupportModalOpen(true);
      } else if (target === 'home' || target === '') {
        setCurrentTab('home');
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  // Verify token on mount / when token changes
  const checkAuthMe = async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('lit_session_token');
        setSessionToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Error verifying session token:", err);
    }
  };

  useEffect(() => {
    if (sessionToken) {
      checkAuthMe(sessionToken);
    }
  }, [sessionToken]);

  // Fetch Dashboard Stats with Session Header
  const fetchStats = async () => {
    if (!sessionToken) return;
    setStatsLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else if (res.status === 401) {
        handleSignOut();
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'dashboard' && sessionToken) {
      fetchStats();
    }
  }, [currentTab, sessionToken]);

  // Handle Key Generation with Session Header
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;
    setKeyGenerationLoading(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ name: newKeyName, tier: newKeyTier })
      });
      if (res.ok) {
        const newKey = await res.json();
        setGeneratedKeyResult(newKey.key);
        setNewKeyName("");
        fetchStats(); // refresh keys list
      }
    } catch (err) {
      console.error(err);
    } finally {
      setKeyGenerationLoading(false);
    }
  };

  // Handle Revoke Key with Session Header
  const handleRevokeKey = async (keyString: string) => {
    if (!sessionToken) return;
    setRevokingKey(keyString);
    try {
      const res = await fetch('/api/keys/revoke', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ key: keyString })
      });
      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRevokingKey(null);
    }
  };

  // Auth Submit Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('lit_session_token', data.token);
        setSessionToken(data.token);
        setUser(data.user);
        setAuthEmail('');
        setAuthPassword('');
      } else {
        setAuthError(data.error || 'Failed to sign in');
      }
    } catch (err) {
      setAuthError('Network communication error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok) {
        // Log in automatically upon success
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem('lit_session_token', loginData.token);
          setSessionToken(loginData.token);
          setUser(loginData.user);
          setAuthEmail('');
          setAuthPassword('');
        } else {
          setAuthTab('login');
        }
      } else {
        setAuthError(data.error || 'Failed to sign up');
      }
    } catch (err) {
      setAuthError('Network communication error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'github' | 'google' | 'yandex' | 'telegram') => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('lit_session_token', data.token);
        setSessionToken(data.token);
        setUser(data.user);
      } else {
        setAuthError(data.error || 'Failed to authenticate via ' + provider);
      }
    } catch (err) {
      setAuthError('OAuth authentication error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('lit_session_token');
    setSessionToken(null);
    setUser(null);
    setStats(null);
  };

  // Copy Key Utility
  const handleCopyKey = (keyString: string, id: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#f1f5f9] flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-400/30">

      {/* PERSISTENT LIVING ORB & COSMIC STARDUST BACKGROUND (Seamless across all tabs) */}
      <MattkaOrbCanvas isHero={currentTab === 'home'} />

      {/* TOP MASTHEAD BANNER */}
      <div className="border-b border-white/[0.04] bg-black/15 backdrop-blur-2xl text-slate-400 py-1.5 px-3 sm:px-4 text-[11px] sm:text-xs font-sans tracking-wide flex items-center justify-between max-w-7xl mx-auto w-full overflow-hidden relative z-10">
        <div className="flex items-center gap-1.5 sm:gap-2.5 truncate">
          <span className="text-white font-semibold">LostInTranslation</span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">AI Cultural Linguistic Middleware</span>
          <span className="text-white/20 hidden md:inline">•</span>
          <span className="hidden md:inline text-sky-300 font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-sky-400/10 border border-sky-400/20 font-medium">v2.0 PROD</span>
        </div>
        <div className="text-slate-400 text-xs hidden lg:block">
          Semantic Precision Gateway & Token Saver for LLMs
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
          <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">SYSTEM ACTIVE</span>
        </div>
      </div>

      {/* MAIN ULTRA-TRANSPARENT FROSTED GLASS NAVBAR */}
      <header className="border-b border-white/[0.06] bg-black/15 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { switchTab('home'); setIsMobileMenuOpen(false); }}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 via-amber-300 to-emerald-300 p-[1px] flex items-center justify-center shadow-lg shadow-sky-500/20">
              <div className="w-full h-full rounded-full bg-[#05070c] flex items-center justify-center">
                <Sparkles size={15} className="text-white" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors font-sans">
              LostInTranslation
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono tracking-wider uppercase text-sky-300 border border-sky-400/30 bg-sky-400/10 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.15)]">
              INTELLIGENCE
            </span>
          </div>

          {/* Desktop Navigation Controls */}
          <nav className="hidden lg:flex items-center gap-2">
            <button
              id="nav-tab-home"
              className={`px-3.5 py-1.5 font-sans text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentTab === 'home' 
                  ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.12)] font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
              }`}
              onClick={() => switchTab('home')}
            >
              {currentTab === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] shrink-0" />}
              <span>{TRANSLATIONS[lang].navHome}</span>
            </button>
            <button
              id="nav-tab-demo"
              className={`px-3.5 py-1.5 font-sans text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentTab === 'demo' 
                  ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.12)] font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
              }`}
              onClick={() => switchTab('demo')}
            >
              {currentTab === 'demo' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] shrink-0" />}
              <span>{TRANSLATIONS[lang].navSandbox}</span>
            </button>
            <button
              id="nav-tab-docs"
              className={`px-3.5 py-1.5 font-sans text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentTab === 'docs' 
                  ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.12)] font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
              }`}
              onClick={() => switchTab('docs')}
            >
              {currentTab === 'docs' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] shrink-0" />}
              <span>{TRANSLATIONS[lang].navDocs}</span>
            </button>
            <button
              id="nav-tab-integrations"
              className={`px-3.5 py-1.5 font-sans text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentTab === 'integrations' 
                  ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.12)] font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
              }`}
              onClick={() => switchTab('integrations')}
            >
              {currentTab === 'integrations' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] shrink-0" />}
              <span>{TRANSLATIONS[lang].navIntegrations}</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center p-0.5 bg-white/[0.04] rounded-full border border-white/10 text-xs font-sans ml-2 mr-1 shrink-0">
              <button
                onClick={() => setLang('ru')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer text-[11px] ${
                  lang === 'ru' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                RU
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer text-[11px] ${
                  lang === 'en' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>

            {/* User Profile / Logout */}
            {user && (
              <div className="flex items-center gap-2 ml-1 mr-1 shrink-0">
                <span className="text-[11px] font-sans text-slate-300 bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <User size={11} className="text-sky-400" />
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 bg-white/[0.04] border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 rounded-full transition-all cursor-pointer"
                  title={lang === 'ru' ? "Выйти из аккаунта" : "Sign Out"}
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}

            <button
              id="nav-tab-dashboard"
              className="apple-btn-primary ml-2 px-4 py-1.5 text-xs sm:text-sm font-sans font-medium rounded-full bg-white text-black hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg tracking-wide whitespace-nowrap shrink-0 border border-white/30"
              onClick={() => switchTab('dashboard')}
            >
              <Sparkles size={13} className="text-sky-500 shrink-0" />
              <span>{TRANSLATIONS[lang].navDashboard}</span>
            </button>
          </nav>

          {/* Mobile Menu Actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-full border border-white/15 backdrop-blur-xl">
              <button
                onClick={() => setLang('ru')}
                className={`px-2.5 py-1 text-[11px] font-sans font-bold rounded-full transition-all ${
                  lang === 'ru' ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                RU
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-[11px] font-sans font-bold rounded-full transition-all ${
                  lang === 'en' ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-full bg-white/[0.08] text-white hover:bg-white/[0.15] transition-all cursor-pointer flex items-center justify-center border border-white/15 backdrop-blur-xl active:scale-95"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu with Slide Down Animation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-white/10 bg-black/50 backdrop-blur-3xl overflow-hidden shadow-2xl"
            >
              <div className="px-4 py-5 flex flex-col gap-2.5 pb-[env(safe-area-inset-bottom,20px)]">
                <button
                  id="nav-mob-home"
                  className={`w-full text-left px-4 py-3.5 text-sm font-sans rounded-2xl transition-all flex items-center gap-3 ${
                    currentTab === 'home' 
                      ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm' 
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                  onClick={() => {
                    switchTab('home');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Sparkles size={16} className="text-sky-400 shrink-0" />
                  <span>{TRANSLATIONS[lang].navHome}</span>
                </button>
                <button
                  id="nav-mob-demo"
                  className={`w-full text-left px-4 py-3.5 text-sm font-sans rounded-2xl transition-all flex items-center gap-3 ${
                    currentTab === 'demo' 
                      ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm' 
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                  onClick={() => {
                    switchTab('demo');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Play size={16} className="text-emerald-400 shrink-0" />
                  <span>{TRANSLATIONS[lang].navSandbox}</span>
                </button>
                <button
                  id="nav-mob-docs"
                  className={`w-full text-left px-4 py-3.5 text-sm font-sans rounded-2xl transition-all flex items-center gap-3 ${
                    currentTab === 'docs' 
                      ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm' 
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                  onClick={() => {
                    switchTab('docs');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <BookOpen size={16} className="text-amber-300 shrink-0" />
                  <span>{TRANSLATIONS[lang].navDocs}</span>
                </button>
                <button
                  id="nav-mob-integrations"
                  className={`w-full text-left px-4 py-3.5 text-sm font-sans rounded-2xl transition-all flex items-center gap-3 ${
                    currentTab === 'integrations' 
                      ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm' 
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                  onClick={() => {
                    switchTab('integrations');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Layers size={16} className="text-sky-400 shrink-0" />
                  <span>{TRANSLATIONS[lang].navIntegrations}</span>
                </button>

                <button
                  id="nav-mob-dashboard"
                  className="apple-btn-primary w-full text-center px-4 py-3.5 text-sm font-sans font-semibold rounded-2xl bg-white text-black hover:bg-slate-100 mt-2 shadow-lg flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  onClick={() => {
                    switchTab('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Sparkles size={15} className="text-sky-500 shrink-0" />
                  <span>{TRANSLATIONS[lang].navDashboard}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* CORE PAGES COMPONENT CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: LANDING PAGE */}
          {currentTab === 'home' && (
            <motion.div
              key="tab-home"
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center text-center relative py-4 px-4 my-auto w-full"
            >
              <RemixHud onOpenDemo={() => switchTab('demo')} />

              <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
                {/* Status Chip */}
                <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs text-white/95 bg-white/[0.06] border border-white/15 rounded-full px-3.5 py-1 mb-5 backdrop-blur-2xl shadow-xl max-w-[95%]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse shrink-0" />
                  <span className="tracking-widest font-mono text-[10px] sm:text-[11px] text-sky-300 font-semibold uppercase">
                    {lang === 'ru' ? 'СИСТЕМА АКТИВНА' : 'SYSTEM OPERATIONAL'}
                  </span>
                  <span className="text-white/20 hidden xs:inline">•</span>
                  <span className="text-slate-300 font-mono text-[10px] sm:text-[11px] hidden xs:inline">LATENCY &lt; 15MS</span>
                  <span className="text-white/20 hidden sm:inline">•</span>
                  <span className="text-emerald-400 font-mono text-[10px] sm:text-[11px] hidden sm:inline">100% CONTEXT</span>
                </div>

                {/* Spaced Elegant Typography in Mattka style */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extralight tracking-[0.16em] sm:tracking-[0.24em] md:tracking-[0.28em] uppercase text-cyan-100/90 leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] select-none whitespace-nowrap max-w-full">
                  LOST IN TRANSLATION
                </h1>

                <div className="mt-3 flex items-center justify-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs md:text-sm font-mono tracking-[0.16em] sm:tracking-[0.32em] uppercase text-cyan-300/70 max-w-full px-2">
                  <span className="text-cyan-400 font-bold shrink-0">[</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-amber-100 font-medium truncate">
                    {lang === 'ru' ? 'ИИ-ШЛЮЗ КУЛЬТУРНОГО СМЫСЛА И СЕМАНТИКИ' : 'AI CULTURAL LINGUISTIC MIDDLEWARE'}
                  </span>
                  <span className="text-cyan-400 font-bold shrink-0">]</span>
                </div>

                {/* Headline */}
                <p className="text-sm sm:text-lg text-white/90 font-light max-w-xl mx-auto mt-4 leading-relaxed drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                  {TRANSLATIONS[lang].heroTitle}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-rose-300 to-amber-100 font-normal">
                    {TRANSLATIONS[lang].heroTitleHighlight}
                  </span>
                </p>

                {/* Direct Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-6 w-full sm:w-auto">
                  <button
                    id="btn-hero-demo"
                    onClick={() => switchTab('demo')}
                    className="celestial-btn-primary w-full sm:w-auto px-7 py-3 bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 font-semibold rounded-full border border-sky-400/40 backdrop-blur-md shadow-[0_0_35px_rgba(56,189,248,0.35)] hover:shadow-[0_0_45px_rgba(56,189,248,0.5)] transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm hover:scale-[1.03]"
                  >
                    <span>{TRANSLATIONS[lang].heroBtnSandbox}</span>
                    <ArrowRight size={15} />
                  </button>
                  <button
                    id="btn-hero-docs"
                    onClick={() => switchTab('docs')}
                    className="w-full sm:w-auto px-7 py-3 bg-white/[0.08] hover:bg-white/[0.16] text-white font-medium rounded-full border border-white/20 backdrop-blur-2xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:border-sky-400/40"
                  >
                    <BookOpen size={15} className="text-sky-400" />
                    <span>{TRANSLATIONS[lang].heroBtnDocs}</span>
                  </button>
                </div>

                {/* Quick cURL one-liner */}
                <div className="mt-6 flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2 rounded-full bg-black/60 border border-white/15 text-[11px] sm:text-xs font-mono text-slate-200 shadow-xl backdrop-blur-2xl w-full max-w-xs sm:max-w-xl mx-auto overflow-hidden">
                  <span className="text-sky-400 font-semibold shrink-0">terminal</span>
                  <span className="text-slate-500 shrink-0">$</span>
                  <span className="text-slate-200 truncate font-mono">curl -X POST https://lostintranslation.dev/api/analyze</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText("curl -X POST https://lostintranslation.dev/api/analyze -H 'Content-Type: application/json' -d '{\"text\":\"行けたら行く\"}'");
                      setCopiedCurl(true);
                      setTimeout(() => setCopiedCurl(false), 2000);
                    }}
                    className="ml-auto text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Copy cURL command"
                  >
                    {copiedCurl ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl mt-8 py-3.5 border-y border-white/10 text-center backdrop-blur-md bg-white/[0.02] rounded-2xl">
                  <div>
                    <div className="text-xl font-sans font-bold text-white">15+</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">{lang === 'ru' ? 'Маркеров культуры' : 'Linguistic markers'}</div>
                  </div>
                  <div>
                    <div className="text-xl font-mono font-bold text-sky-300">&lt; 15ms</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">{lang === 'ru' ? 'Латентность шлюза' : 'Gateway latency'}</div>
                  </div>
                  <div>
                    <div className="text-xl font-sans font-bold text-emerald-400">100%</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">{lang === 'ru' ? 'Точность контекста' : 'Context precision'}</div>
                  </div>
                  <div>
                    <div className="text-xl font-mono font-bold text-cyan-400">-45%</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">{lang === 'ru' ? 'Расход токенов' : 'Token savings'}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: INTERACTIVE DEMO */}
          {currentTab === 'demo' && (
            <motion.div
              key="tab-demo"
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6 w-full"
            >
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-sky-300 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                  LIVE WORKSHOP & TOKEN SAVER
                </span>
                <h2 className="text-2xl sm:text-3xl font-sans font-bold text-white flex items-center gap-2 mt-2">
                  <Sparkles size={22} className="text-sky-400" />
                  {TRANSLATIONS[lang].demoTitle}
                </h2>
                <p className="text-sm text-slate-400 font-normal max-w-2xl mt-1">
                  {TRANSLATIONS[lang].demoSubtitle}
                </p>
              </div>

              <DemoWidget lang={lang} />
            </motion.div>
          )}

          {/* TAB 3: API REFERENCE / DOCS */}
          {currentTab === 'docs' && (
            <motion.div
              key="tab-docs"
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <React.Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-slate-400 font-mono text-sm"><RefreshCw className="animate-spin mr-2" size={16} /> Loading documentation...</div>}>
                <ApiDocs
                  lang={lang}
                  onNavigateToDashboard={() => switchTab('dashboard')}
                />
              </React.Suspense>
            </motion.div>
          )}

          {/* TAB 4: DEVELOPER DASHBOARD */}
          {currentTab === 'dashboard' && (
            <motion.div
              key="tab-dashboard"
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-8 w-full"
            >
              {!user ? (
                <div className="frosted-card max-w-[480px] mx-auto w-full my-8 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-3 bg-sky-400/10 text-sky-400 rounded-xl mb-3 border border-sky-400/20">
                      <Users size={22} className="animate-pulse" />
                    </div>
                    <h3 className="text-xl font-sans font-bold text-white">
                      {lang === 'ru' ? "Авторизация разработчика" : "Developer Authorization"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-sans">
                      {lang === 'ru' 
                        ? "Войдите или зарегистрируйтесь, чтобы управлять своими API-токенами и отслеживать семантические потери." 
                        : "Sign in or register to manage your API tokens and track semantic losses."}
                    </p>
                  </div>

                  {/* Tabs for Login / Register */}
                  <div className="flex border border-white/10 mb-5 p-1 bg-black/40 rounded-xl">
                    <button
                      onClick={() => { setAuthTab('login'); setAuthError(null); }}
                      className={`flex-1 py-2 text-xs font-sans rounded-lg transition-all cursor-pointer ${
                        authTab === 'login' 
                          ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-sm font-semibold' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'ru' ? "Вход" : "Sign In"}
                    </button>
                    <button
                      onClick={() => { setAuthTab('register'); setAuthError(null); }}
                      className={`flex-1 py-2 text-xs font-sans rounded-lg transition-all cursor-pointer ${
                        authTab === 'register' 
                          ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-sm font-semibold' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'ru' ? "Регистрация" : "Sign Up"}
                    </button>
                  </div>

                  {/* Quick OAuth Providers Grid (Official Branded Styles) */}
                  <div className="mb-5">
                    <div className="grid grid-cols-2 gap-3">
                      {/* 1. GitHub Button */}
                      <button
                        id="oauth-btn-github"
                        type="button"
                        disabled={authLoading}
                        onClick={() => handleOAuthLogin('github')}
                        className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 font-semibold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        title={lang === 'ru' ? "Войти через GitHub" : "Sign In with GitHub"}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        <span className="truncate">GitHub</span>
                      </button>

                      {/* 2. Яндекс ID */}
                      <button
                        id="oauth-btn-yandex"
                        type="button"
                        disabled={authLoading}
                        onClick={() => handleOAuthLogin('yandex')}
                        className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 font-semibold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        title={lang === 'ru' ? "Войти с Яндекс ID" : "Sign In with Yandex ID"}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
                          <circle cx="12" cy="12" r="10" fill="#FC3F1D" />
                          <path d="M14.6 17.5h-1.9v-6.3h-1.2c-1.3 0-2 .6-2 1.6 0 .9.5 1.5 1.4 2.2l.9.7-2.6 3.8H7l2.8-4C8.9 14.8 8.1 13.9 8.1 12.6c0-1.9 1.4-3.1 3.7-3.1h2.8v8z" fill="#FFFFFF" />
                        </svg>
                        <span className="truncate">Яндекс ID</span>
                      </button>

                      {/* 3. Telegram */}
                      <button
                        id="oauth-btn-telegram"
                        type="button"
                        disabled={authLoading}
                        onClick={() => handleOAuthLogin('telegram')}
                        className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 font-semibold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        title={lang === 'ru' ? "Войти через Telegram" : "Sign In with Telegram"}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0 text-[#24A1DE]">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                        </svg>
                        <span className="truncate">Telegram</span>
                      </button>

                      {/* 4. Google */}
                      <button
                        id="oauth-btn-google"
                        type="button"
                        disabled={authLoading}
                        onClick={() => handleOAuthLogin('google')}
                        className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 font-semibold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        title={lang === 'ru' ? "Войти через Google" : "Sign In with Google"}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span className="truncate">Google</span>
                      </button>
                    </div>
                  </div>

                  {/* Or Divider */}
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="border-t border-white/10 w-full" />
                    <span className="bg-black/40 px-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider relative shrink-0 rounded-full border border-white/5">
                      {lang === 'ru' ? "или через Email" : "or with Email"}
                    </span>
                    <div className="border-t border-white/10 w-full" />
                  </div>

                  {/* Auth Error Display */}
                  {authError && (
                    <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2 font-sans">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Auth Form */}
                  <form onSubmit={authTab === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                        Email:
                      </label>
                      <input
                        id="auth-email-input"
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="developer@example.com"
                        className="w-full bg-black/40 border border-white/15 focus:border-amber-400/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors duration-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                        {lang === 'ru' ? "Пароль:" : "Password:"}
                      </label>
                      <input
                        id="auth-password-input"
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/40 border border-white/15 focus:border-amber-400/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors duration-200 font-mono"
                      />
                    </div>

                    <button
                      id="auth-submit-btn"
                      type="submit"
                      disabled={authLoading}
                      className="celestial-btn-primary w-full mt-2 py-3 bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 border border-sky-400/40 font-sans font-bold text-xs rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {authLoading ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      {authTab === 'login' 
                        ? (lang === 'ru' ? "Войти в панель" : "Sign In to Console") 
                        : (lang === 'ru' ? "Создать аккаунт" : "Create Developer Account")}
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  {/* Page header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <h2 className="text-2xl font-sans font-bold text-white flex items-center gap-2">
                    <Database size={22} className="text-sky-400" />
                    {lang === 'ru' ? "Панель разработчика & Ключи" : "Developer Console & Keys"}
                  </h2>
                  <p className="text-sm text-slate-400 leading-none mt-1 font-sans">
                    {lang === 'ru' 
                      ? "Управление API-ключами, мониторинг нагрузки, аудит недавних сетевых транзакций." 
                      : "Manage API keys, monitor usage quotas, and audit real-time gateway logs."}
                  </p>
                </div>
                
                <button
                   id="btn-refresh-stats"
                  onClick={fetchStats}
                  disabled={statsLoading}
                  className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-sky-400/40 text-xs font-sans font-semibold text-slate-200 rounded-xl flex items-center gap-2 transition-all disabled:opacity-55 cursor-pointer backdrop-blur-xl"
                >
                  <RefreshCw size={13} className={statsLoading ? 'animate-spin' : ''} />
                  {lang === 'ru' ? "Обновить статистику" : "Refresh Analytics"}
                </button>
              </div>

              {/* CORE DASHBOARD STATS METRICS (4 COLUMNS) */}
              {stats ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Metric 1 */}
                  <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-5 rounded-2xl flex flex-col gap-1.5 shadow-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {TRANSLATIONS[lang].dashStatsTotalLabel}
                    </span>
                    <div className="text-3xl font-bold text-white font-sans">
                      {stats.totalRequests}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-sans">
                      <Activity size={12} className="text-emerald-400" />
                      {TRANSLATIONS[lang].dashStatsSyncRealtime}
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-5 rounded-2xl flex flex-col gap-1.5 shadow-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {TRANSLATIONS[lang].dashStatsLossesPrevented}
                    </span>
                    <div className="text-3xl font-bold text-amber-300 font-sans">
                      {Math.round(stats.totalRequests * stats.lossesAvg)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-sans">
                      {lang === 'ru' 
                        ? `В среднем ${stats.lossesAvg} потери смыслов на запрос`
                        : `In average ${stats.lossesAvg} meaning losses per request`}
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-5 rounded-2xl flex flex-col gap-1.5 shadow-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {TRANSLATIONS[lang].dashStatsSuccessRate}
                    </span>
                    <div className="text-3xl font-bold text-emerald-400 font-sans">
                      {stats.successRate}%
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-sans">
                      {TRANSLATIONS[lang].dashStatsUptimeLabel}
                    </div>
                  </div>

                  {/* Metric 4 */}
                  <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-5 rounded-2xl flex flex-col gap-1.5 shadow-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {TRANSLATIONS[lang].dashStatsActiveKeys}
                    </span>
                    <div className="text-3xl font-bold text-white font-sans">
                      {stats.apiKeys.filter(k => k.status === 'active').length}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-sans">
                      {TRANSLATIONS[lang].dashStatsRevokedLabel} <span className="font-semibold text-slate-300">{stats.apiKeys.filter(k => k.status === 'revoked').length}</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-24 bg-white/[0.03] border border-white/10 animate-pulse rounded-2xl" />
              )}

              {/* CORE DASHBOARD GRID: LEFT COLUMN (GENERATE KEY), RIGHT COLUMN (ACTIVE KEYS TABLE) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Generate API Key form */}
                <div className="frosted-card lg:col-span-1 bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 rounded-2xl h-fit flex flex-col gap-4 shadow-xl">
                  <h3 className="font-sans font-bold text-white text-base flex items-center gap-1.5">
                    <Plus size={18} className="text-sky-400" />
                    {lang === 'ru' ? "Выпустить новый API-ключ" : "Issue New API Key"}
                  </h3>

                  <form onSubmit={handleGenerateKey} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                        {lang === 'ru' ? "Название ключа / Описание:" : "Key Description / Name:"}
                      </label>
                      <input
                        id="input-key-name"
                        type="text"
                        required
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder={lang === 'ru' ? "Например: Production Telegram Bot" : "E.g. Production Telegram Bot"}
                        className="w-full bg-black/40 border border-white/15 focus:border-sky-400/50 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors duration-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                        {lang === 'ru' ? "Тип тарифа API:" : "API Subscription Tier:"}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          id="btn-tier-free"
                          type="button"
                          onClick={() => setNewKeyTier('free')}
                          className={`py-2 px-3 text-xs font-sans font-semibold rounded-xl border transition-all cursor-pointer ${
                            newKeyTier === 'free'
                              ? 'bg-sky-400/20 text-sky-300 border-sky-400/40 shadow-sm font-bold'
                              : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
                          }`}
                        >
                          Sandbox Free
                        </button>
                        <button
                          id="btn-tier-paid"
                          type="button"
                          onClick={() => setNewKeyTier('paid')}
                          className={`py-2 px-3 text-xs font-sans font-semibold rounded-xl border transition-all cursor-pointer ${
                            newKeyTier === 'paid'
                              ? 'bg-amber-300/20 text-amber-200 border-amber-300/40 shadow-sm font-bold'
                              : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
                          }`}
                        >
                          Production Pro ($5)
                        </button>
                      </div>
                    </div>

                    <button
                      id="btn-submit-key-generation"
                      type="submit"
                      disabled={keyGenerationLoading || !newKeyName.trim()}
                      className="celestial-btn-primary w-full py-2.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 border border-sky-400/40 font-sans font-bold text-xs rounded-xl transition-all disabled:opacity-45 shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {keyGenerationLoading ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Key size={12} />
                      )}
                      {lang === 'ru' ? "Сгенерировать токен" : "Generate Token"}
                    </button>
                  </form>

                  {/* Display generated key modal/alert right here immediately */}
                  <AnimatePresence>
                    {generatedKeyResult && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-black/40 border border-amber-400/40 p-4 rounded-xl flex flex-col gap-2 mt-2"
                      >
                        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-sans font-bold">
                          <Check size={14} className="text-emerald-400" /> {lang === 'ru' ? "Токен успешно сгенерирован!" : "Token successfully generated!"}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight font-sans">
                          {lang === 'ru' 
                            ? "Скопируйте его прямо сейчас. Из соображений безопасности вы не сможете просмотреть его снова после перезагрузки."
                            : "Copy it right now. For security reasons, you will not be able to view it again after reloading."}
                        </p>
                        <div className="flex items-center bg-black/60 rounded-lg p-2 border border-white/10 justify-between gap-2 mt-1">
                          <span className="font-mono text-xs text-amber-300 font-bold break-all select-all">
                            {generatedKeyResult}
                          </span>
                          <button
                            id="btn-copy-new-key"
                            onClick={() => handleCopyKey(generatedKeyResult, 'new_key')}
                            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white shrink-0 cursor-pointer"
                          >
                            {copiedKeyId === 'new_key' ? (
                              <Check size={14} className="text-emerald-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                        <button
                          id="btn-close-new-key-alert"
                          onClick={() => setGeneratedKeyResult(null)}
                          className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 uppercase tracking-wider text-right mt-1 cursor-pointer"
                        >
                          {lang === 'ru' ? "Закрыть уведомление" : "Dismiss alert"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. List of active/revoked keys */}
                <div className="frosted-card lg:col-span-2 bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 rounded-2xl flex flex-col gap-4 shadow-xl">
                  <h3 className="font-sans font-bold text-white text-base flex items-center gap-1.5">
                    <Settings size={18} className="text-sky-400" />
                    {lang === 'ru' ? "Список ваших API-ключей" : "Your API Access Tokens"}
                  </h3>

                  {stats && stats.apiKeys.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400 font-semibold font-mono text-[10px]">
                            <th className="pb-3">{lang === 'ru' ? "ОПИСАНИЕ / ИМЯ КЛЮЧА" : "DESCRIPTION / KEY NAME"}</th>
                            <th className="pb-3">{lang === 'ru' ? "API ТОКЕН" : "API TOKEN"}</th>
                            <th className="pb-3">{lang === 'ru' ? "ТАРИФ" : "TIER"}</th>
                            <th className="pb-3 text-center">{lang === 'ru' ? "ЗАПРОСЫ" : "QUOTA USAGE"}</th>
                            <th className="pb-3 text-right">{lang === 'ru' ? "УПРАВЛЕНИЕ" : "ACTIONS"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-sans">
                          {stats.apiKeys.map((k) => (
                            <tr key={k.id} className="group hover:bg-white/[0.02]">
                              <td className="py-3.5 pr-2 font-medium text-slate-200">
                                <div className="font-sans font-bold text-white">{k.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                  {lang === 'ru' ? "Создан: " : "Created: "}{new Date(k.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-3.5 font-mono text-[11px] text-slate-400">
                                <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/10 w-fit">
                                  <span className="text-amber-300">{k.key.substring(0, 10)}...{k.key.substring(k.key.length - 4)}</span>
                                  <button
                                    id={`btn-copy-key-${k.id}`}
                                    onClick={() => handleCopyKey(k.key, k.id)}
                                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                                    title={lang === 'ru' ? "Скопировать полный ключ" : "Copy full key"}
                                  >
                                    {copiedKeyId === k.id ? (
                                      <Check size={11} className="text-emerald-400" />
                                    ) : (
                                      <Copy size={11} />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="py-3.5 pr-2">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider font-mono ${
                                  k.tier === 'paid' 
                                    ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30' 
                                    : 'bg-white/[0.05] text-slate-300 border border-white/10'
                                  }`}>
                                  {k.tier}
                                </span>
                              </td>
                              <td className="py-3.5 font-mono font-semibold text-center text-slate-300">
                                {k.usageCount}
                              </td>
                              <td className="py-3.5 text-right">
                                {k.status === 'active' ? (
                                  <button
                                    id={`btn-revoke-key-${k.id}`}
                                    disabled={revokingKey !== null}
                                    onClick={() => handleRevokeKey(k.key)}
                                    className="text-[10px] font-bold text-rose-400 hover:text-rose-200 px-2 py-1 hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 rounded-lg transition-all focus:outline-none flex items-center gap-1 ml-auto cursor-pointer"
                                  >
                                    <Trash2 size={11} /> {lang === 'ru' ? "Отозвать" : "Revoke"}
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white/[0.05] px-2 py-1 rounded-lg border border-white/10">
                                    {lang === 'ru' ? "Отозван" : "Revoked"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs font-sans">
                      {lang === 'ru' ? "Ключи отсутствуют. Сгенерируйте токен слева." : "No keys generated yet. Use the form on the left."}
                    </div>
                  )}
                </div>

              </div>

              {/* LIVE NETWORK API LOGS AUDIT TRAIL */}
              {stats && stats.recentLogs.length > 0 && (
                <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 rounded-2xl flex flex-col gap-4 shadow-xl">
                  <h3 className="font-sans font-bold text-white text-base flex items-center gap-1.5">
                    <Activity size={18} className="text-emerald-400 animate-pulse" />
                    {lang === 'ru' ? "Логи транзакций API шлюза (Аудит в реальном времени)" : "Gateway Transaction Logs (Real-time Audit)"}
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 font-semibold font-mono text-[10px]">
                          <th className="pb-3">{lang === 'ru' ? "ЭНДПОИНТ" : "ENDPOINT"}</th>
                          <th className="pb-3">{lang === 'ru' ? "API-ТОКЕН" : "API KEY"}</th>
                          <th className="pb-3">{lang === 'ru' ? "СЕРВЕРНОЕ ЧИСЛО ПОТЕРЬ" : "LOSSES DETECTED"}</th>
                          <th className="pb-3">{lang === 'ru' ? "ДЛИНА ТЕКСТА" : "TEXT SIZE"}</th>
                          <th className="pb-3">{lang === 'ru' ? "IP АДРЕС" : "IP ADDRESS"}</th>
                          <th className="pb-3 text-right">{lang === 'ru' ? "ВРЕМЯ ТРАНЗАКЦИИ" : "TIMESTAMP"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {stats.recentLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold font-mono ${
                                log.endpoint === 'enhance'
                                  ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                                  : 'bg-white/[0.05] text-slate-300 border border-white/10'
                              }`}>
                                POST /api/{log.endpoint}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-[10px] text-slate-400">
                              {log.apiKey === 'free' ? (
                                <span className="text-slate-400 italic">anonymous (demo-site)</span>
                              ) : (
                                <span>{log.apiKey.substring(0, 10)}...</span>
                              )}
                            </td>
                            <td className="py-3">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                log.lossesDetected > 0
                                  ? 'bg-amber-400/15 text-amber-300 border border-amber-400/25'
                                  : 'bg-black/30 text-slate-400'
                              }`}>
                                {log.lossesDetected} fixed
                              </span>
                            </td>
                            <td className="py-3 text-slate-400 font-mono text-[10px]">
                              {lang === 'ru' ? `${log.textLength} символов` : `${log.textLength} chars`}
                            </td>
                            <td className="py-3 text-slate-400 font-mono text-[10px]">
                              {log.ipAddress || 'Unknown'}
                            </td>
                            <td className="py-3 text-right text-slate-400 text-[10px]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </motion.div>
      )}

          {/* TAB 5: INTEGRATIONS */}
          {currentTab === 'integrations' && (
            <motion.div
              key="tab-integrations"
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <React.Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-slate-400 font-mono text-sm"><RefreshCw className="animate-spin mr-2" size={16} /> Loading integrations...</div>}>
                <Integrations 
                  lang={lang} 
                  onNavigateToDemo={() => {
                    switchTab('demo');
                  }} 
                />
              </React.Suspense>
            </motion.div>
          )}

          {/* TAB 6: PRIVACY POLICY */}
          {currentTab === 'privacy' && (
            <motion.div
              key="tab-privacy"
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <React.Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-slate-400 font-mono text-sm"><RefreshCw className="animate-spin mr-2" size={16} /> Loading policy...</div>}>
                <PrivacyPolicy 
                  lang={lang} 
                  onNavigateHome={() => switchTab('home')} 
                  onOpenSupport={() => {
                    setIsSupportModalOpen(true);
                    window.location.hash = 'support';
                  }} 
                />
              </React.Suspense>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ULTRA-TRANSPARENT FROSTED GLASS FOOTER */}
      <footer className="border-t border-white/[0.08] bg-black/20 backdrop-blur-3xl py-8 text-center text-xs text-slate-400 font-sans mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-bold text-white text-sm sm:text-xs">LostInTranslation</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="text-slate-400 text-xs">
              {lang === 'ru' ? "Культурный семантический слой для больших языковых моделей." : "Cultural semantic precision gateway for LLMs."}
            </span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs">
            <a href="https://github.com/Mohito-s/LostinTranslation" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub (AGPL-3.0)</a>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <button
              id="footer-btn-privacy"
              onClick={() => {
                switchTab('privacy');
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {lang === 'ru' ? "Политика конфиденциальности" : "Privacy Policy"}
            </button>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <button
              id="footer-btn-support"
              onClick={() => {
                setIsSupportModalOpen(true);
                window.location.hash = 'support';
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {lang === 'ru' ? "Поддержка разработчиков" : "Developer Support"}
            </button>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-500 font-mono text-[11px]">© 2026 LostInTranslation</span>
          </div>
        </div>
      </footer>

      {/* SUPPORT & DIAGNOSTICS MODAL */}
      <React.Suspense fallback={null}>
        <SupportModal
          isOpen={isSupportModalOpen}
          onClose={() => {
            setIsSupportModalOpen(false);
            if (window.location.hash === '#support' || window.location.hash === '#help') {
              window.history.replaceState(null, '', ' ');
            }
          }}
          lang={lang}
          onNavigateToDocs={() => switchTab('docs')}
          onNavigateToDashboard={() => switchTab('dashboard')}
        />
      </React.Suspense>

    </div>
  );
}
