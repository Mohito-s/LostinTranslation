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
import CodeExample from './components/CodeExample';
import PromptSimulator from './components/PromptSimulator';

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
    navDashboard: "Панель разработчика",
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
    pricingProPrice: "$9",
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
    dashKeyTierPaid: "Production Pro ($9/мес - 1000 запр/день)",
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
    navSandbox: "Interactive Sandbox",
    navDocs: "API Reference",
    navDashboard: "Developer Dashboard",
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
    pricingProPrice: "$9",
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
    dashKeyTierPaid: "Production Pro ($9/mo - 1000 requests/day)",
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'demo' | 'docs' | 'dashboard'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Parse URL to check if developer mode is loaded initially
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('guide') === 'true' || params.get('dev') === 'true') {
      setIsAdminMode(true);
    }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* 3D Ambient Vector Backdrops (No gradients, pure line depth) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        
        {/* Deep Multi-Layered Orbital Astrolabe */}
        <svg className="absolute top-[5%] left-[50%] -translate-x-1/2 w-[1200px] h-[800px] opacity-[0.25] text-slate-800" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Constellation star coordinates */}
          <circle cx="200" cy="150" r="1.5" fill="#10b981" className="animate-pulse" />
          <circle cx="350" cy="280" r="1" fill="#fff" />
          <circle cx="450" cy="120" r="1" fill="#fff" />
          <circle cx="680" cy="180" r="2" fill="#0d9488" className="animate-pulse" />
          <circle cx="820" cy="290" r="1" fill="#fff" />
          <circle cx="950" cy="140" r="1.5" fill="#14b8a6" />
          <circle cx="1050" cy="350" r="1" fill="#fff" />
          
          {/* Interconnecting constellation vectors */}
          <path d="M200 150 L350 280 L450 120" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
          <path d="M680 180 L820 290 L950 140 L1050 350" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
          <path d="M350 280 L680 180" stroke="currentColor" strokeWidth="0.5" strokeDasharray="6 6" />

          {/* Depth Orbit rings (No gradients, just pure thin mathematical curves) */}
          <ellipse cx="600" cy="350" rx="350" ry="120" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
          <ellipse cx="600" cy="350" rx="250" ry="86" stroke="currentColor" strokeWidth="0.75" />
          <ellipse cx="600" cy="350" rx="150" ry="51" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1 10" />
          <ellipse cx="600" cy="350" rx="550" ry="190" stroke="currentColor" strokeWidth="0.5" className="opacity-50" />
          
          {/* Crossed Keplerian Orbits for additional spatial depth */}
          <g style={{ transform: 'rotate(-25deg)', transformOrigin: '600px 350px' }}>
            <ellipse cx="600" cy="350" rx="420" ry="140" stroke="currentColor" strokeWidth="0.75" strokeDasharray="5 5" />
            <circle cx="180" cy="350" r="3" fill="#10b981" />
            <circle cx="1020" cy="350" r="2" fill="#0d9488" />
          </g>
          
          <g style={{ transform: 'rotate(15deg)', transformOrigin: '600px 350px' }}>
            <ellipse cx="600" cy="350" rx="480" ry="160" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="120" cy="350" r="2" fill="#fff" className="animate-pulse" />
          </g>
        </svg>
      </div>
      
      {/* HEADER / NAVBAR */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setCurrentTab('home'); setIsMobileMenuOpen(false); }}>
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/15 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" className="opacity-40" />
                <path d="M16 8C16 8 14.5 10 12 10C9.5 10 8 8 8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300" />
                <path d="M8 16C8 16 9.5 14 12 14C14.5 14 16 16 16 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal-300" />
                <path d="M12 2V22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-30" />
                <circle cx="12" cy="12" r="3" fill="currentColor" className="animate-pulse text-emerald-400" />
              </svg>
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                LostInTranslation
              </span>
              <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider font-mono border border-emerald-500/10">
                API v1.0
              </span>
            </div>
          </div>

          {/* Desktop Navigation Controls */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              id="nav-tab-home"
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                currentTab === 'home' 
                  ? 'bg-slate-900 text-white font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setCurrentTab('home')}
            >
              {TRANSLATIONS[lang].navHome}
            </button>
            <button
              id="nav-tab-demo"
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                currentTab === 'demo' 
                  ? 'bg-slate-900 text-white font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setCurrentTab('demo')}
            >
              {TRANSLATIONS[lang].navSandbox}
            </button>
            <button
              id="nav-tab-docs"
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                currentTab === 'docs' 
                  ? 'bg-slate-900 text-white font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setCurrentTab('docs')}
            >
              {TRANSLATIONS[lang].navDocs}
            </button>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 ml-3 mr-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setLang('ru')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  lang === 'ru' 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                RU
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  lang === 'en' 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                EN
              </button>
            </div>

            {/* User Profile / Logout */}
            {user && (
              <div className="flex items-center gap-2 ml-1 mr-1">
                <span className="text-[11px] font-mono text-slate-300 bg-slate-900/80 border border-slate-800 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                  <User size={10} className="text-emerald-400" />
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 bg-slate-900/60 border border-slate-800 hover:bg-red-950/40 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                  title={lang === 'ru' ? "Выйти из аккаунта" : "Sign Out"}
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}

            <button
              id="nav-tab-dashboard"
              className={`ml-1 px-3.5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer`}
              onClick={() => setCurrentTab('dashboard')}
            >
              <Key size={14} />
              {TRANSLATIONS[lang].navDashboard}
            </button>
          </nav>

          {/* Mobile Menu Actions (Includes Flag Buttons + Hamburger toggle) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setLang('ru')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                  lang === 'ru' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                }`}
              >
                RU
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                  lang === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center border border-slate-800"
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
              className="lg:hidden border-t border-slate-900 bg-slate-950/95 backdrop-blur overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-2">
                <button
                  id="nav-mob-home"
                  className={`w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    currentTab === 'home' 
                      ? 'bg-slate-900 text-emerald-400' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  onClick={() => {
                    setCurrentTab('home');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {TRANSLATIONS[lang].navHome}
                </button>
                <button
                  id="nav-mob-demo"
                  className={`w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    currentTab === 'demo' 
                      ? 'bg-slate-900 text-emerald-400' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  onClick={() => {
                    setCurrentTab('demo');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {TRANSLATIONS[lang].navSandbox}
                </button>
                <button
                  id="nav-mob-docs"
                  className={`w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    currentTab === 'docs' 
                      ? 'bg-slate-900 text-emerald-400' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  onClick={() => {
                    setCurrentTab('docs');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {TRANSLATIONS[lang].navDocs}
                </button>

                <button
                  id="nav-mob-dashboard"
                  className={`w-full text-center px-4 py-3.5 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md flex items-center justify-center gap-2 mt-2`}
                  onClick={() => {
                    setCurrentTab('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Key size={14} />
                  <span>{TRANSLATIONS[lang].navDashboard}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* CORE PAGES COMPONENT CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: LANDING PAGE */}
          {currentTab === 'home' && (
            <motion.div
              key="tab-home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-16 py-4 animate-fade-in"
            >
              {/* HERO SECTION WITH GEOMETRIC GRID */}
              <div className="text-center max-w-3xl mx-auto flex flex-col gap-6 mt-6 relative p-8 rounded-3xl overflow-hidden border border-slate-900/60 bg-slate-950/40 backdrop-blur-sm">
                {/* Clean vector geometry instead of dot grid */}
                <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
                  <svg width="100%" height="100%" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-700">
                    <circle cx="400" cy="200" r="180" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" />
                    <circle cx="400" cy="200" r="120" stroke="currentColor" strokeWidth="1" />
                    <circle cx="400" cy="200" r="60" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
                    <line x1="400" y1="0" x2="400" y2="400" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="100" y1="200" x2="700" y2="200" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                    <ellipse cx="400" cy="200" rx="180" ry="60" stroke="currentColor" strokeWidth="0.75" />
                    <ellipse cx="400" cy="200" rx="60" ry="180" stroke="currentColor" strokeWidth="0.75" />
                  </svg>
                </div>

                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white leading-[1.15]">
                  {TRANSLATIONS[lang].heroTitle}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                    {TRANSLATIONS[lang].heroTitleHighlight}
                  </span>
                </h1>

                <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto font-sans">
                  {TRANSLATIONS[lang].heroSubtitle}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
                  <button
                    id="btn-hero-demo"
                    onClick={() => setCurrentTab('demo')}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {TRANSLATIONS[lang].heroBtnSandbox}
                    <ArrowRight size={16} />
                  </button>
                  <button
                    id="btn-hero-docs"
                    onClick={() => setCurrentTab('docs')}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl border border-slate-800 transition-all cursor-pointer"
                  >
                    {TRANSLATIONS[lang].heroBtnDocs}
                  </button>
                </div>
              </div>

              {/* HOW IT WORKS DIAGRAM */}
              <div className="bg-slate-900/40 rounded-3xl border border-slate-900 p-8 shadow-inner bg-[radial-gradient(#111827_1px,transparent_1px)] [background-size:20px_20px]">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-center font-display text-xl font-bold mb-8">
                    {TRANSLATIONS[lang].howTitle}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    
                    {/* Step 1 */}
                    <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-850 flex flex-col gap-3 relative">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center font-mono border border-emerald-500/15">
                        1
                      </div>
                      <h4 className="font-bold text-white font-sans text-sm">{TRANSLATIONS[lang].howStep1Title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        {TRANSLATIONS[lang].howStep1Desc}
                      </p>
                      <div className="mt-2 bg-slate-900/60 p-2.5 rounded font-mono text-[10px] text-slate-500 border border-slate-800/40">
                        <span className="text-slate-400">"行けたら行く" (If I can, I will go)</span>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-slate-950/80 p-5 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5 flex flex-col gap-3 relative">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center font-mono">
                        2
                      </div>
                      <h4 className="font-bold text-emerald-400 font-sans text-sm flex items-center gap-1">
                        {TRANSLATIONS[lang].howStep2Title}
                        <Sparkles size={12} />
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {TRANSLATIONS[lang].howStep2Desc}
                      </p>
                      <div className="mt-2 bg-emerald-500/5 p-2.5 rounded font-mono text-[10px] text-emerald-300/90 border border-emerald-500/10">
                        <span>[Context: Politeness nuance - usually means they won't attend...]</span>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-850 flex flex-col gap-3 relative">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center font-mono border border-emerald-500/15">
                        3
                      </div>
                      <h4 className="font-bold text-white font-sans text-sm">{TRANSLATIONS[lang].howStep3Title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        {TRANSLATIONS[lang].howStep3Desc}
                      </p>
                      <div className="mt-2 bg-emerald-500/5 p-2.5 rounded font-mono text-[10px] text-emerald-400 border border-emerald-500/10">
                        <span className="font-bold">Real Meaning: Declining politely (98% accuracy)</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* INTERACTIVE PROMPT ACCURACY SIMULATOR */}
              <PromptSimulator lang={lang} />

              {/* INTERACTIVE ARCHITECTURE GUIDE (DEVELOPER VS USER FLOW) */}
              <div className="bg-slate-900/40 border border-slate-850 p-6 md:p-8 rounded-3xl mt-4">
                <div className="max-w-2xl mx-auto text-center mb-8">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10 uppercase tracking-wider font-semibold">
                    {lang === 'ru' ? 'Архитектура Интеграции' : 'Integration Architecture'}
                  </span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white mt-3">
                    {TRANSLATIONS[lang].archTitle}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400 mt-2">
                    {lang === 'ru' 
                      ? 'Вам не нужно просить каждого пользователя чата настраивать ключи. Вы делаете интеграцию один раз на стороне сервера, а пользователи общаются абсолютно бесшовно.'
                      : 'You do not need to ask each client user to supply credentials. Integrate LIT once on your server, and users communicate completely seamlessly.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  {/* Left Column: Developer */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-4 relative">
                    <div className="absolute top-4 right-4 text-xs font-mono text-emerald-400/70 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                      {lang === 'ru' ? 'Слой Разработки' : 'Developer Interface'}
                    </div>
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
                      <Terminal size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{TRANSLATIONS[lang].archBoxUser}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {lang === 'ru' 
                          ? 'Вы заходите в раздел Дашборд ключей, регистрируете токен ltk_..., и встраиваете один POST-запрос в бэкенд своего чат-бота.'
                          : 'Navigate to the Developer Dashboard, register a ltk_... token, and plug a single POST query into your backend pipelines.'}
                      </p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400/80">
                      <span className="text-emerald-400">headers:</span> <span className="text-slate-300">{"{"} "Authorization": "Bearer ltk_..." {"}"}</span>
                    </div>
                  </div>

                  {/* Right Column: End User */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-4 relative">
                    <div className="absolute top-4 right-4 text-xs font-mono text-teal-400/70 bg-teal-500/5 px-2 py-0.5 rounded border border-teal-500/10">
                      {lang === 'ru' ? 'Конечный Клиент' : 'End Client Stream'}
                    </div>
                    <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl w-fit">
                      <Users size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{lang === 'ru' ? 'Ваши Пользователи (Собеседники в чате)' : 'Your End Users'}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {lang === 'ru'
                          ? 'Собеседник пишет сообщение в вашем чате на своём родном языке. Ваша система незаметно обогащает культурный контекст через LIT API перед отправкой запроса к GPT/Claude.'
                          : 'Your user types a message in their native language. Your server transparently hydrates the payload with context via LIT before passing it to GPT-4/Claude.'}
                      </p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/60 text-[11px] font-mono text-slate-400/80 flex items-center justify-between">
                      <span className="text-slate-400">{lang === 'ru' ? 'Пользователь ➔ Ваш Чат ➔ LIT API ➔ LLM' : 'Client ➔ Your Server ➔ LIT API ➔ LLM'}</span>
                      <span className="text-emerald-400 font-semibold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">✓ {lang === 'ru' ? 'Скрыто от клиента' : 'Transparent to Client'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6 text-[11px] text-slate-500 italic">
                  {lang === 'ru' 
                    ? '*Таким образом, конечным пользователям чат-бота не требуются ключи или сложная настройка — всё работает в фоне под вашим полным контролем.'
                    : '*End users require zero setups or keys — the entire translation enhancement runs entirely on the background under your full control.'}
                </div>
              </div>

              {/* CORE LINGUISTIC TARGETS (BENTO-LIKE MATRIX) */}
              <div className="flex flex-col gap-8">
                <div className="text-center max-w-xl mx-auto">
                  <h2 className="text-2xl font-display font-bold text-white mb-2">
                    {TRANSLATIONS[lang].matrixTitle}
                  </h2>
                  <p className="text-sm text-slate-400 font-sans">
                    {TRANSLATIONS[lang].matrixSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* 1. Modal Particles */}
                  <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col gap-3 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
                      <Layers size={18} />
                    </div>
                    <h3 className="font-bold text-slate-200">{TRANSLATIONS[lang].matrix1Title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {TRANSLATIONS[lang].matrix1Desc}
                    </p>
                  </div>

                  {/* 2. Diminutives */}
                  <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col gap-3 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
                      <Sparkles size={18} />
                    </div>
                    <h3 className="font-bold text-slate-200">{TRANSLATIONS[lang].matrix2Title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {TRANSLATIONS[lang].matrix2Desc}
                    </p>
                  </div>

                  {/* 3. Understatement as Default */}
                  <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col gap-3 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
                      <Activity size={18} />
                    </div>
                    <h3 className="font-bold text-slate-200">{TRANSLATIONS[lang].matrix3Title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {TRANSLATIONS[lang].matrix3Desc}
                    </p>
                  </div>

                  {/* 4. Hedging */}
                  <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col gap-3 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
                      <Shield size={18} />
                    </div>
                    <h3 className="font-bold text-slate-200">{TRANSLATIONS[lang].matrix4Title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {TRANSLATIONS[lang].matrix4Desc}
                    </p>
                  </div>

                  {/* 5. Verb Aspect */}
                  <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col gap-3 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
                      <Database size={18} />
                    </div>
                    <h3 className="font-bold text-slate-200">{TRANSLATIONS[lang].matrix5Title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {TRANSLATIONS[lang].matrix5Desc}
                    </p>
                  </div>

                  {/* 6. Prosody & Word Order */}
                  <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col gap-3 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
                      <Terminal size={18} />
                    </div>
                    <h3 className="font-bold text-slate-200">{TRANSLATIONS[lang].matrix6Title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {TRANSLATIONS[lang].matrix6Desc}
                    </p>
                  </div>

                </div>
              </div>

              {/* PRICING PLANS */}
              <div className="flex flex-col gap-8 border-t border-slate-900 pt-16">
                <div className="text-center max-w-xl mx-auto">
                  <h2 className="text-2xl font-display font-bold text-white mb-2">
                    {TRANSLATIONS[lang].pricingTitle}
                  </h2>
                  <p className="text-sm text-slate-400 font-sans">
                    {TRANSLATIONS[lang].pricingSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto w-full">
                  
                  {/* Plan 1: Free */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-850 font-mono">
                        {TRANSLATIONS[lang].pricingFreeTitle}
                      </span>
                      <div className="flex items-baseline gap-1 mt-4">
                        <span className="text-3xl font-bold font-display text-white">{TRANSLATIONS[lang].pricingFreePrice}</span>
                        <span className="text-xs text-slate-400 font-medium">{TRANSLATIONS[lang].pricingFreePeriod}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mt-2 font-sans">
                        {TRANSLATIONS[lang].pricingFreeDesc}
                      </p>
                      
                      <ul className="mt-6 flex flex-col gap-3 text-xs text-slate-300">
                        <li className="flex items-center gap-2">
                          <Check size={14} className="text-emerald-400 shrink-0" />
                          <span>{TRANSLATIONS[lang].pricingFreeBullet1}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={14} className="text-emerald-400 shrink-0" />
                          <span>{TRANSLATIONS[lang].pricingFreeBullet2}</span>
                        </li>
                        <li className="flex items-center gap-2 text-slate-500 line-through">
                          <Check size={14} className="shrink-0" />
                          <span>{TRANSLATIONS[lang].pricingFreeBullet3}</span>
                        </li>
                        <li className="flex items-center gap-2 text-slate-500 line-through">
                          <Check size={14} className="shrink-0" />
                          <span>{TRANSLATIONS[lang].pricingFreeBullet4}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <button
                      id="btn-pricing-free"
                      onClick={() => {
                        setCurrentTab('dashboard');
                        setNewKeyTier('free');
                      }}
                      className="mt-8 w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 font-semibold rounded-xl text-xs transition-colors duration-200 cursor-pointer"
                    >
                      {TRANSLATIONS[lang].pricingFreeBtn}
                    </button>
                  </div>

                  {/* Plan 2: Pro */}
                  <div className="bg-slate-900 border-2 border-emerald-500/20 rounded-3xl p-6 flex flex-col justify-between relative shadow-lg shadow-emerald-500/5">
                    <div className="absolute -top-3.5 right-6 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full font-mono uppercase tracking-wider">
                      Most Popular
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/10 font-mono">
                        {TRANSLATIONS[lang].pricingProTitle}
                      </span>
                      <div className="flex items-baseline gap-1 mt-4">
                        <span className="text-3xl font-bold font-display text-white">{TRANSLATIONS[lang].pricingProPrice}</span>
                        <span className="text-xs text-slate-400 font-medium">{TRANSLATIONS[lang].pricingProPeriod}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                        {TRANSLATIONS[lang].pricingProDesc}
                      </p>
                      
                      <ul className="mt-6 flex flex-col gap-3 text-xs text-slate-300">
                        <li className="flex items-center gap-2">
                          <Check size={14} className="text-emerald-400 shrink-0" />
                          <span className="font-bold text-white">{TRANSLATIONS[lang].pricingProBullet1}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={14} className="text-emerald-400 shrink-0" />
                          <span>{TRANSLATIONS[lang].pricingProBullet2}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={14} className="text-emerald-400 shrink-0" />
                          <span>{TRANSLATIONS[lang].pricingProBullet3}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={14} className="text-emerald-400 shrink-0" />
                          <span>{TRANSLATIONS[lang].pricingProBullet4}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <button
                      id="btn-pricing-pro"
                      onClick={() => {
                        setCurrentTab('dashboard');
                        setNewKeyTier('paid');
                      }}
                      className="mt-8 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all duration-200 shadow-md shadow-emerald-500/10 cursor-pointer"
                    >
                      {TRANSLATIONS[lang].pricingProBtn}
                    </button>
                  </div>

                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: INTERACTIVE DEMO */}
          {currentTab === 'demo' && (
            <motion.div
              key="tab-demo"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  <Play size={18} className="text-emerald-400" />
                  {TRANSLATIONS[lang].demoTitle}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed font-sans max-w-2xl">
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Sidebar Index */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl sticky top-24">
                  <h3 className="font-display font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <BookOpen size={16} className="text-emerald-400" />
                    {lang === 'ru' ? "Содержание" : "Table of Contents"}
                  </h3>
                  
                  <ul className="flex flex-col gap-2 text-xs">
                    <li>
                      <a href="#doc-overview" className="block py-2 px-3 bg-slate-950 rounded-lg text-emerald-400 font-medium">
                        {lang === 'ru' ? "1. Обзор архитектуры" : "1. Architecture Overview"}
                      </a>
                    </li>
                    <li>
                      <a href="#doc-endpoint-analyze" className="block py-2 px-3 hover:bg-slate-950 rounded-lg text-slate-300 transition-colors">
                        2. POST /api/analyze
                      </a>
                    </li>
                    <li>
                      <a href="#doc-endpoint-enhance" className="block py-2 px-3 hover:bg-slate-950 rounded-lg text-slate-300 transition-colors">
                        3. POST /api/enhance
                      </a>
                    </li>
                    <li>
                      <a href="#doc-limits" className="block py-2 px-3 hover:bg-slate-950 rounded-lg text-slate-300 transition-colors">
                        {lang === 'ru' ? "4. Лимиты и Коды ошибок" : "4. Limits & Error Codes"}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Documentation Body */}
              <div className="lg:col-span-2 flex flex-col gap-10 font-sans leading-relaxed text-sm text-slate-300">
                
                {/* 1. Overview */}
                <section id="doc-overview" className="flex flex-col gap-3">
                  <h2 className="text-xl font-display font-bold text-white border-b border-slate-900 pb-2">
                    {lang === 'ru' ? "1. Обзор архитектуры" : "1. Architecture Overview"}
                  </h2>
                  <p>
                    {lang === 'ru' 
                      ? "LostInTranslation — это тонкий middleware-слой, который встраивается перед вызовами крупных LLM (Claude, GPT-4, Gemini) в вашем коде. Он предназначен для того, чтобы улавливать скрытые намерения говорящих на разных языках, которые стираются при обычном дословном машинном переводе."
                      : "LostInTranslation is a lightweight middleware layer that is injected before calls to large LLMs (Claude, GPT-4, Gemini) in your codebase. It is designed to capture the hidden intent of speakers across multiple languages, which is often completely erased by typical literal machine translations."}
                  </p>
                  <p>
                    {lang === 'ru'
                      ? "Вы передаете оригинальный текст в наш API, получаете структурированный лингвистический контекст или полностью готовый переписанный промт, который затем отправляется в вашу целевую нейросеть."
                      : "You pass the original text to our API, obtain a structured linguistic context or a fully ready-to-use enriched prompt, which is then dispatched directly to your target neural network."}
                  </p>
                </section>

                {/* 2. Endpoint: analyze */}
                <section id="doc-endpoint-analyze" className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold rounded">
                      POST
                    </span>
                    <h2 className="text-xl font-display font-bold text-white">
                      /api/analyze
                    </h2>
                  </div>
                  <p>
                    {lang === 'ru'
                      ? "Используется для парсинга текста и выделения списка потерь культурного смысла. Идеально подходит для систем речевой аналитики, анализа отзывов, локализации и фильтрации токсичности."
                      : "Used to parse text and extract a structured list of cultural meaning losses. Perfectly suited for speech analytics systems, customer feedback monitoring, translation localization, and advanced content safety layers."}
                  </p>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {lang === 'ru' ? "Заголовки (Headers)" : "Request Headers"}
                    </span>
                    <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-2 rounded">
                      Content-Type: application/json{"\n"}
                      X-LIT-API-KEY: your_api_key_here
                    </pre>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {lang === 'ru' ? "Тело запроса (Request JSON)" : "Request Body (JSON)"}
                    </span>
                    <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-2 rounded">
{`{
  "text": "行けたら行く",
  "target_language": "en"
}`}
                    </pre>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {lang === 'ru' ? "Ответ (Response JSON)" : "Response Payload (JSON)"}
                    </span>
                    <pre className="text-xs font-mono text-slate-400 bg-slate-950 p-2 rounded overflow-x-auto max-h-56">
{JSON.stringify({
  original: lang === 'ru' ? "Да ну и ладно, домой пойду" : "行けたら行く",
  literal_translation: lang === 'ru' ? "Well okay then, I'll go home" : "I'll go if I can go",
  found: true,
  items: [
    {
      fragment: lang === 'ru' ? "Да ну и ладно" : "行けたら行く",
      short: lang === 'ru' ? "Горькое смирение, замаскированное под безразличие" : "Polite refusal disguised as conditional plan",
      explanation: lang === 'ru' 
        ? "Комбинация частиц 'ну и' сдвигает фокус в сторону вынужденного компромисса, скрытой обиды или разочарования, когда говорящий делает вид, что ему всё равно..."
        : "In colloquial Japanese, this phrase is widely used as a polite social hedge meaning 'I will probably not attend', while literal translations falsely convey actual intent of visiting.",
      alternative: lang === 'ru' ? "Fine, whatever / I guess I have no choice anyway" : "I won't be able to make it"
    }
  ]
}, null, 2)}
                    </pre>
                  </div>
                </section>

                {/* 3. Endpoint: enhance */}
                <section id="doc-endpoint-enhance" className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold rounded">
                      POST
                    </span>
                    <h2 className="text-xl font-display font-bold text-white">
                      /api/enhance
                    </h2>
                  </div>
                  <p className="text-slate-300">
                    {lang === 'ru'
                      ? "Основной эндпоинт платформы. Принимает вашу исходную ИИ-инструкцию (промт) и русский текст. Возвращает готовый обогащенный промт со специальным размеченным блоком [Cultural context], готовый для немедленной отправки в GPT-4 или Claude."
                      : "The primary endpoint of the platform. It accepts your raw system instruction (prompt) and the localized text. It returns a fully context-enriched prompt featuring a dedicated [Cultural context] section, optimized for immediate routing to GPT-4, Claude, or other LLMs."}
                  </p>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {lang === 'ru' ? "Тело запроса (Request JSON)" : "Request Body (JSON)"}
                    </span>
                    <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-2 rounded">
{`{
  "prompt": "Summarize the following user feedback",
  "text": "Ну в принципе неплохо, но могло бы быть и лучше"
}`}
                    </pre>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {lang === 'ru' ? "Ответ (Response JSON)" : "Response Payload (JSON)"}
                    </span>
                    <pre className="text-xs font-mono text-slate-400 bg-slate-950 p-2 rounded overflow-x-auto max-h-56">
{`{
  "enhanced_prompt": "Summarize the following user feedback.\\n\\n[Cultural context for accurate interpretation: The phrase uses 'ну в принципе' (reluctant, qualified acceptance rather than approval)...]\\n\\nText: Ну в принципе неплохо, но могло бы быть и лучше",
  "context_added": true,
  "losses_detected": 3
}`}
                    </pre>
                  </div>

                  {/* Code Examples Component */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {lang === 'ru' ? "Примеры интеграции в код:" : "Code Integration Examples:"}
                    </span>
                    <CodeExample />
                  </div>
                </section>

                {/* 4. Limits */}
                <section id="doc-limits" className="flex flex-col gap-3">
                  <h2 className="text-xl font-display font-bold text-white border-b border-slate-900 pb-2">
                    {lang === 'ru' ? "4. Лимиты и Коды ошибок" : "4. Limits & Error Codes"}
                  </h2>
                  <p>
                    {lang === 'ru'
                      ? "LostInTranslation использует классические HTTP-коды ответов для обработки ошибок:"
                      : "LostInTranslation utilizes standard HTTP response status codes to communicate API transaction states:"}
                  </p>
                  <ul className="list-disc list-inside flex flex-col gap-1.5 text-xs">
                    <li>
                      <strong className="text-slate-200">200 OK</strong> — {lang === 'ru' ? "запрос успешно обработан." : "transaction successfully completed."}
                    </li>
                    <li>
                      <strong className="text-slate-200">400 Bad Request</strong> — {lang === 'ru' ? "отсутствует обязательный параметр или передан неверный тип данных." : "missing required parameters or invalid data payload type."}
                    </li>
                    <li>
                      <strong className="text-slate-200">401 Unauthorized</strong> — {lang === 'ru' ? "передан недействительный, просроченный или отозванный API-ключ." : "provided API key is invalid, expired, or manually revoked."}
                    </li>
                    <li>
                      <strong className="text-slate-200">403 Forbidden</strong> — {lang === 'ru' ? "эндпоинт защищен (например, вызов /api/enhance без передачи API-ключа)." : "endpoint is protected (e.g. attempting to call /api/enhance without passing a valid API key header)."}
                    </li>
                    <li>
                      <strong className="text-slate-200">429 Too Many Requests</strong> — {lang === 'ru' ? "превышен лимит тарифа в суточном скользящем окне 24 часов." : "subscription quota limit exceeded within the 24-hour sliding window."}
                    </li>
                  </ul>
                </section>

              </div>
            </motion.div>
          )}

          {/* TAB 4: DEVELOPER DASHBOARD */}
          {currentTab === 'dashboard' && (
            <motion.div
              key="tab-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-8"
            >
              {!user ? (
                <div className="max-w-md mx-auto w-full my-8 bg-slate-900 border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                  {/* Decorative background glow */}
                  <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full filter blur-[1px]"></div>
                  
                  <div className="text-center mb-6">
                    <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-xl mb-3 border border-emerald-500/20">
                      <Users size={22} className="animate-pulse" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white">
                      {lang === 'ru' ? "Авторизация разработчика" : "Developer Authorization"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-sans">
                      {lang === 'ru' 
                        ? "Войдите или зарегистрируйтесь, чтобы управлять своими API-токенами и отслеживать семантические потери." 
                        : "Sign in or register to manage your API tokens and track semantic losses."}
                    </p>
                  </div>

                  {/* Tabs for Login / Register */}
                  <div className="flex border-b border-slate-800 mb-6 p-1 bg-slate-950 rounded-xl">
                    <button
                      onClick={() => { setAuthTab('login'); setAuthError(null); }}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        authTab === 'login' 
                          ? 'bg-slate-900 text-white border border-slate-800/60 shadow-sm font-bold' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {lang === 'ru' ? "Вход" : "Sign In"}
                    </button>
                    <button
                      onClick={() => { setAuthTab('register'); setAuthError(null); }}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        authTab === 'register' 
                          ? 'bg-slate-900 text-white border border-slate-800/60 shadow-sm font-bold' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {lang === 'ru' ? "Регистрация" : "Sign Up"}
                    </button>
                  </div>

                  {/* Auth Error Display */}
                  {authError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2 font-sans">
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
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none transition-colors duration-200 font-mono"
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
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none transition-colors duration-200 font-mono"
                      />
                    </div>

                    <button
                      id="auth-submit-btn"
                      type="submit"
                      disabled={authLoading}
                      className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                    <Database size={22} className="text-emerald-400" />
                    Панель разработчика & Ключи
                  </h2>
                  <p className="text-sm text-slate-400 leading-none mt-1">
                    Управление API-ключами, мониторинг нагрузки, аудит недавних сетевых транзакций.
                  </p>
                </div>
                
                <button
                   id="btn-refresh-stats"
                  onClick={fetchStats}
                  disabled={statsLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl flex items-center gap-2 transition-all disabled:opacity-55 cursor-pointer"
                >
                  <RefreshCw size={13} className={statsLoading ? 'animate-spin' : ''} />
                  Обновить статистику
                </button>
              </div>

              {/* CORE DASHBOARD STATS METRICS (4 COLUMNS) */}
              {stats ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Metric 1 */}
                  <div className="bg-slate-900 border border-slate-880 p-5 rounded-2xl flex flex-col gap-1.5 shadow-md">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {TRANSLATIONS[lang].dashStatsTotalLabel}
                    </span>
                    <div className="text-3xl font-bold text-white font-display">
                      {stats.totalRequests}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <Activity size={12} className="text-emerald-400" />
                      {TRANSLATIONS[lang].dashStatsSyncRealtime}
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-slate-900 border border-slate-880 p-5 rounded-2xl flex flex-col gap-1.5 shadow-md">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {TRANSLATIONS[lang].dashStatsLossesPrevented}
                    </span>
                    <div className="text-3xl font-bold text-emerald-400 font-display">
                      {Math.round(stats.totalRequests * stats.lossesAvg)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {lang === 'ru' 
                        ? `В среднем ${stats.lossesAvg} потери смыслов на запрос`
                        : `In average ${stats.lossesAvg} meaning losses per request`}
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-1.5 shadow-md">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {TRANSLATIONS[lang].dashStatsSuccessRate}
                    </span>
                    <div className="text-3xl font-bold text-emerald-400 font-display">
                      {stats.successRate}%
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {TRANSLATIONS[lang].dashStatsUptimeLabel}
                    </div>
                  </div>

                  {/* Metric 4 */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-1.5 shadow-md">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {TRANSLATIONS[lang].dashStatsActiveKeys}
                    </span>
                    <div className="text-3xl font-bold text-white font-display">
                      {stats.apiKeys.filter(k => k.status === 'active').length}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {TRANSLATIONS[lang].dashStatsRevokedLabel} <span className="font-semibold">{stats.apiKeys.filter(k => k.status === 'revoked').length}</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-24 bg-slate-900 border border-slate-800 animate-pulse rounded-2xl" />
              )}

              {/* CORE DASHBOARD GRID: LEFT COLUMN (GENERATE KEY), RIGHT COLUMN (ACTIVE KEYS TABLE) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Generate API Key form */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-880 p-6 rounded-2xl h-fit flex flex-col gap-4">
                  <h3 className="font-display font-bold text-slate-200 text-base flex items-center gap-1.5">
                    <Plus size={18} className="text-emerald-400" />
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
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors duration-200"
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
                          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                            newKeyTier === 'free'
                              ? 'bg-slate-800 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-950 text-slate-500 border-slate-850 hover:text-slate-300'
                          }`}
                        >
                          Sandbox Free
                        </button>
                        <button
                          id="btn-tier-paid"
                          type="button"
                          onClick={() => setNewKeyTier('paid')}
                          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                            newKeyTier === 'paid'
                              ? 'bg-slate-800 text-emerald-400 border-emerald-500/20 shadow-md shadow-emerald-500/20'
                              : 'bg-slate-950 text-slate-500 border-slate-850 hover:text-slate-300'
                          }`}
                        >
                          Production Pro ($9)
                        </button>
                      </div>
                    </div>

                    <button
                      id="btn-submit-key-generation"
                      type="submit"
                      disabled={keyGenerationLoading || !newKeyName.trim()}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-45 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
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
                        className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl flex flex-col gap-2 mt-2"
                      >
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                          <Check size={14} /> {lang === 'ru' ? "Токен успешно сгенерирован!" : "Token successfully generated!"}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight font-sans">
                          {lang === 'ru' 
                            ? "Скопируйте его прямо сейчас. Из соображений безопасности вы не сможете просмотреть его снова после перезагрузки."
                            : "Copy it right now. For security reasons, you will not be able to view it again after reloading."}
                        </p>
                        <div className="flex items-center bg-slate-950 rounded-lg p-2 border border-slate-800 justify-between gap-2 mt-1">
                          <span className="font-mono text-xs text-emerald-300 font-bold break-all select-all">
                            {generatedKeyResult}
                          </span>
                          <button
                            id="btn-copy-new-key"
                            onClick={() => handleCopyKey(generatedKeyResult, 'new_key')}
                            className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white shrink-0"
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
                          className="text-[10px] font-semibold text-slate-500 hover:text-slate-300 uppercase tracking-wider text-right mt-1"
                        >
                          {lang === 'ru' ? "Закрыть уведомление" : "Dismiss alert"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. List of active/revoked keys */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-880 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="font-display font-bold text-slate-200 text-base flex items-center gap-1.5">
                    <Settings size={18} className="text-emerald-400" />
                    {lang === 'ru' ? "Список ваших API-ключей" : "Your API Access Tokens"}
                  </h3>

                  {stats && stats.apiKeys.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 font-semibold font-mono text-[10px]">
                            <th className="pb-3">{lang === 'ru' ? "ОПИСАНИЕ / ИМЯ КЛЮЧА" : "DESCRIPTION / KEY NAME"}</th>
                            <th className="pb-3">{lang === 'ru' ? "API ТОКЕН" : "API TOKEN"}</th>
                            <th className="pb-3">{lang === 'ru' ? "ТАРИФ" : "TIER"}</th>
                            <th className="pb-3 text-center">{lang === 'ru' ? "ЗАПРОСЫ" : "QUOTA USAGE"}</th>
                            <th className="pb-3 text-right">{lang === 'ru' ? "УПРАВЛЕНИЕ" : "ACTIONS"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {stats.apiKeys.map((k) => (
                            <tr key={k.id} className="group">
                              <td className="py-3.5 pr-2 font-medium text-slate-200">
                                <div className="font-bold">{k.name}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  {lang === 'ru' ? "Создан: " : "Created: "}{new Date(k.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-3.5 font-mono text-[11px] text-slate-400">
                                <div className="flex items-center gap-1.5 bg-slate-950/40 px-2 py-1 rounded border border-slate-850 w-fit">
                                  <span>{k.key.substring(0, 10)}...{k.key.substring(k.key.length - 4)}</span>
                                  <button
                                    id={`btn-copy-key-${k.id}`}
                                    onClick={() => handleCopyKey(k.key, k.id)}
                                    className="text-slate-500 hover:text-slate-300 transition-colors"
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
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono ${
                                  k.tier === 'paid' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-slate-950 text-slate-400 border border-slate-850'
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
                                    className="text-[10px] font-bold text-rose-400/80 hover:text-rose-400 px-2 py-1 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10 rounded-lg transition-all focus:outline-none flex items-center gap-1 ml-auto"
                                  >
                                    <Trash2 size={11} /> {lang === 'ru' ? "Отозвать" : "Revoke"}
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950 px-2 py-1 rounded border border-slate-850">
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
                    <div className="py-8 text-center text-slate-500 text-xs">
                      {lang === 'ru' ? "Ключи отсутствуют. Сгенерируйте токен слева." : "No keys generated yet. Use the form on the left."}
                    </div>
                  )}
                </div>

              </div>

              {/* LIVE NETWORK API LOGS AUDIT TRAIL */}
              {stats && stats.recentLogs.length > 0 && (
                <div className="bg-slate-900 border border-slate-880 p-6 rounded-2xl flex flex-col gap-4 shadow-lg">
                  <h3 className="font-display font-bold text-slate-200 text-base flex items-center gap-1.5">
                    <Activity size={18} className="text-emerald-400 animate-pulse" />
                    {lang === 'ru' ? "Логи транзакций API шлюза (Аудит в реальном времени)" : "Gateway Transaction Logs (Real-time Audit)"}
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-semibold font-mono text-[10px]">
                          <th className="pb-3">{lang === 'ru' ? "ЭНДПОИНТ" : "ENDPOINT"}</th>
                          <th className="pb-3">{lang === 'ru' ? "API-ТОКЕН" : "API KEY"}</th>
                          <th className="pb-3">{lang === 'ru' ? "СЕРВЕРНОЕ ЧИСЛО ПОТЕРЬ" : "LOSSES DETECTED"}</th>
                          <th className="pb-3">{lang === 'ru' ? "ДЛИНА ТЕКСТА" : "TEXT SIZE"}</th>
                          <th className="pb-3">{lang === 'ru' ? "IP АДРЕС" : "IP ADDRESS"}</th>
                          <th className="pb-3 text-right">{lang === 'ru' ? "ВРЕМЯ ТРАНЗАКЦИИ" : "TIMESTAMP"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/30">
                        {stats.recentLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-950/20 transition-colors">
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                                log.endpoint === 'enhance'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10'
                              }`}>
                                POST /api/{log.endpoint}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-[10px] text-slate-400">
                              {log.apiKey === 'free' ? (
                                <span className="text-slate-500 italic">anonymous (demo-site)</span>
                              ) : (
                                <span>{log.apiKey.substring(0, 10)}...</span>
                              )}
                            </td>
                            <td className="py-3">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                log.lossesDetected > 0
                                  ? 'bg-emerald-500/10 text-emerald-300'
                                  : 'bg-slate-950 text-slate-500'
                              }`}>
                                {log.lossesDetected} fixed
                              </span>
                            </td>
                            <td className="py-3 text-slate-400 font-mono text-[10px]">
                              {lang === 'ru' ? `${log.textLength} символов` : `${log.textLength} chars`}
                            </td>
                            <td className="py-3 text-slate-500 font-mono text-[10px]">
                              {log.ipAddress || 'Unknown'}
                            </td>
                            <td className="py-3 text-right text-slate-500 text-[10px]">
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

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 font-sans mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-center sm:text-left">
            <span className="font-display font-bold text-slate-400 text-sm sm:text-xs">LostInTranslation API</span>
            <span className="hidden sm:inline text-slate-750">|</span>
            <span className="text-slate-500 max-w-xs sm:max-w-none text-[11px] sm:text-xs">
              {lang === 'ru' ? "Ваш ИИ видит слова. Мы даем ему культурные контексты." : "Your LLM reads local words. We give it cultural meaning."}
            </span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-[11px] sm:text-xs">
            <a href="#github" className="hover:text-slate-300 transition-colors">GitHub (AGPL-3.0)</a>
            <span className="text-slate-800 hidden sm:inline">•</span>
            <a href="#support" className="hover:text-slate-300 transition-colors">{lang === 'ru' ? "Поддержка разработчиков" : "Developer Support"}</a>
            <span className="text-slate-800 hidden sm:inline">•</span>
            <span className="text-slate-600">© 2026 LostInTranslation</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
