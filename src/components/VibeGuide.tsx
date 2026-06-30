import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Send, 
  Sparkles, 
  Check, 
  Copy, 
  Terminal, 
  Key, 
  Smartphone, 
  Layers, 
  ArrowRight,
  Code,
  Shield,
  Info
} from 'lucide-react';

interface VibeGuideProps {
  onGoToDemo: () => void;
  onGoToDashboard: () => void;
}

export default function VibeGuide({ onGoToDemo, onGoToDashboard }: VibeGuideProps) {
  const [dbTab, setDbTab] = useState<'firebase' | 'postgres'>('firebase');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [tmaTheme, setTmaTheme] = useState<'dark' | 'light'>('dark');
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Firebase integration snippet
  const firebaseCode = `// src/lib/firebaseDb.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Инициализация Firebase (Рекомендуется lazy-load или синглтон)
let db: FirebaseFirestore.Firestore;

export function getFirebaseDb() {
  if (!db) {
    // В продакшене используйте переменные окружения!
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
    
    initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore();
  }
  return db;
}

// Замена функции getDb() из db.ts на Firebase Firestore
export async function getApiKeysFromFirebase() {
  const firestore = getFirebaseDb();
  const snapshot = await firestore.collection('api_keys').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addUsageLogToFirebase(log: any) {
  const firestore = getFirebaseDb();
  const logRef = firestore.collection('usage_logs').doc();
  await logRef.set({
    ...log,
    timestamp: new Date().toISOString()
  });
  
  // Обновляем счетчик использования ключа атомарно!
  if (log.apiKey !== 'free') {
    const keyQuery = await firestore.collection('api_keys')
      .where('key', '==', log.apiKey)
      .limit(1)
      .get();
      
    if (!keyQuery.empty) {
      const keyDoc = keyQuery.docs[0];
      await keyDoc.ref.update({
        usageCount: admin.firestore.FieldValue.increment(1)
      });
    }
  }
}`;

  // Postgres / Supabase SQL schema and JS snippet
  const postgresCode = `-- 1. СОЗДАНИЕ ТАБЛИЦ В POSTGRESQL / SUPABASE
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(50) PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active' or 'revoked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tier VARCHAR(20) DEFAULT 'free', -- 'free' or 'paid'
    usage_count INTEGER DEFAULT 0
);

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

-- Индексы для быстрой фильтрации и статистики
CREATE INDEX idx_keys_key ON api_keys(key);
CREATE INDEX idx_logs_apikey ON usage_logs(api_key);`;

  const postgresJsCode = `// src/lib/postgresDb.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Вставляется из Supabase / Render / Neon
  ssl: { rejectUnauthorized: false }
});

export async function validateApiKeyInPostgres(keyString: string) {
  const result = await pool.query(
    'SELECT * FROM api_keys WHERE key = $1 AND status = \\'active\\'', 
    [keyString]
  );
  return result.rows[0] || null;
}

export async function addUsageLogToPostgres(log: any) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Вставляем лог
    await client.query(
      \`INSERT INTO usage_logs (api_key, endpoint, text_length, losses_detected, success, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)\`,
      [log.apiKey, log.endpoint, log.textLength, log.lossesDetected, log.success, log.ipAddress]
    );
    
    // Обновляем инкремент использования ключа
    if (log.apiKey !== 'free') {
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
}`;

  // TMA SDK Code Snippet
  const tmaSdkCode = `<!-- Вставьте в <head> вашего index.html -->
<script src="https://telegram.org/js/telegram-web-app.js"></script>

<script>
  // Инициализация Telegram WebApp
  window.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Сообщаем Telegram, что приложение готово к рендерингу
      tg.ready();
      
      // Расширяем приложение на весь экран телефона
      tg.expand();
      
      // Синхронизируем цвета темы с Telegram
      document.body.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
      document.body.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
      
      console.log('User Telegram Data:', tg.initDataUnsafe.user);
    }
  });
</script>`;

  // Hermes Prompt system instruction
  const hermesPrompt = `Ты — ИИ-агент Hermes, экспертный маркетолог и лингвистический ассистент для проекта LostInTranslation (LIT) API.
Твоя цель — общаться с подписчиками Telegram-канала, рассказывать про "культурные потери" LLM и предлагать попробовать API.

Паттерн диалога:
1. Заметь, когда пользователи пишут о странностях перевода ИИ или о том, что LLM не понимает иронию/контекст.
2. Приведи яркий пример! Например, японское "行けたら行く" (пойду если смогу), которое в 99% случаев означает вежливый отказ "я не приду", но обычные ИИ переводят буквально как согласие "я приду, если смогу".
3. Дай ссылку на Telegram Mini App LostInTranslation и предложи выпустить бесплатный API-ключ в Дашборде разработчика.
4. Будь профессиональным, пиши на легком, живом языке (вайб "дружелюбный эксперт").

Ссылка на Mini App: [Твоя TMA Ссылка]
Доступные эндпоинты:
- GET /api/dashboard/stats — статистика предотвращенных потерь смысла
- POST /api/analyze — глубокий анализ текста`;

  return (
    <div className="flex flex-col gap-12 py-4">
      {/* HEADER EXPLANATION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-850/60">
        <div className="flex-1 flex flex-col gap-3">
          <span className="inline-flex w-fit px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-xs font-semibold tracking-wide font-mono uppercase">
            🚀 Руководство Вайбкодера (Solo Developer Guide)
          </span>
          <h2 className="text-2xl font-display font-bold text-white">
            Масштабируем LostInTranslation до Telegram Mini App и Своей БД
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed font-sans max-w-2xl">
            Привет! Твой продукт <a href="https://shadowlinkapp.online" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">shadowlinkapp.online</a> показывает, что у тебя отличный вкус на лаконичный стек и красивую подачу. Лови выжимку сеньорских архитектурных решений, которые помогут тебе в одиночку подключить базу данных и выпустить TMA без боли.
          </p>
        </div>
        <div className="flex flex-row md:flex-col gap-3 shrink-0">
          <button
            onClick={onGoToDemo}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
          >
            В песочницу
            <ArrowRight size={13} />
          </button>
          <button
            onClick={onGoToDashboard}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            <Key size={13} />
            Выпустить Ключ
          </button>
        </div>
      </div>

      {/* ROADMAP / INTERACTIVE STEPS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: NAVIGATION & ADVICE */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="font-display font-bold text-slate-200 text-sm flex items-center gap-2 mb-2">
              <Layers size={16} className="text-emerald-400" />
              План быстрого запуска
            </h3>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveStep(1)}
                className={`text-left p-3 rounded-xl transition-all duration-200 border flex items-start gap-3 ${
                  activeStep === 1 
                    ? 'bg-slate-950 text-emerald-400 border-emerald-500/20' 
                    : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-850/40 hover:text-slate-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                  activeStep === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>1</span>
                <div>
                  <h4 className="font-semibold text-xs text-slate-200">Подключение базы данных</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Firebase Firestore vs PostgreSQL</p>
                </div>
              </button>

              <button
                onClick={() => setActiveStep(2)}
                className={`text-left p-3 rounded-xl transition-all duration-200 border flex items-start gap-3 ${
                  activeStep === 2 
                    ? 'bg-slate-950 text-emerald-400 border-emerald-500/20' 
                    : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-850/40 hover:text-slate-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                  activeStep === 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>2</span>
                <div>
                  <h4 className="font-semibold text-xs text-slate-200">Телеграм Mini App (TMA)</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Настройка SDK за 3 строчки кода</p>
                </div>
              </button>

              <button
                onClick={() => setActiveStep(3)}
                className={`text-left p-3 rounded-xl transition-all duration-200 border flex items-start gap-3 ${
                  activeStep === 3 
                    ? 'bg-slate-950 text-emerald-400 border-emerald-500/20' 
                    : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-850/40 hover:text-slate-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                  activeStep === 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>3</span>
                <div>
                  <h4 className="font-semibold text-xs text-slate-200">Прогрев агента Hermes AI</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Как заставить ИИ продавать ваш софт</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              <Info size={14} className="text-emerald-400" />
              Советы по Стэку для Соло
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Для <span className="text-emerald-400 font-semibold">shadowlinkapp.online</span> ты выбрал прекрасный путь. Твой главный ресурс — скорость. 
            </p>
            <ul className="text-[11px] text-slate-400 flex flex-col gap-2 list-disc pl-4 leading-relaxed">
              <li>
                <strong className="text-slate-300">Firebase Firestore</strong> — идеальный выбор без геморроя. Настраивается прямо из консоли, не требует миграций и серверов БД.
              </li>
              <li>
                <strong className="text-slate-300">Supabase (PostgreSQL)</strong> — лучший выбор, если любишь SQL. Сразу дает готовый REST API поверх твоих таблиц.
              </li>
              <li>
                <strong className="text-slate-300">Хранение ключей:</strong> Храни захешированные API-ключи, чтобы никто не мог украсть их из бэкапа базы данных.
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: CODE PANELS & EMULATION */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* STEP 1: DATABASE SETUP */}
          {activeStep === 1 && (
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                <div>
                  <h3 className="font-display font-bold text-slate-100 text-lg flex items-center gap-2">
                    <Database size={18} className="text-emerald-400" />
                    Подключаем Хранилище Базы Данных
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Замени локальный файл <code className="text-emerald-300 font-mono text-[10px] bg-slate-950 px-1 py-0.5 rounded">db.json</code> на надежную облачную базу
                  </p>
                </div>
                
                {/* Firebase vs PG Toggle */}
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
                  <button
                    onClick={() => setDbTab('firebase')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      dbTab === 'firebase' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Firebase Firestore
                  </button>
                  <button
                    onClick={() => setDbTab('postgres')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      dbTab === 'postgres' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    PostgreSQL (SQL)
                  </button>
                </div>
              </div>

              {dbTab === 'firebase' ? (
                <div className="flex flex-col gap-3">
                  <div className="text-xs text-slate-300 leading-relaxed">
                    Firestore — это документоориентированная NoSQL-база данных, которая масштабируется сама. Тебе не нужно знать SQL, а бесплатного лимита (50 000 чтений/день) с лихвой хватит на первый год работы!
                  </div>
                  <div className="relative">
                    <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto border border-slate-850 max-h-96">
                      {firebaseCode}
                    </pre>
                    <button
                      onClick={() => handleCopy(firebaseCode, 'firebase')}
                      className="absolute right-3 top-3 p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                      title="Копировать код"
                    >
                      {copiedSection === 'firebase' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="text-xs text-slate-300 leading-relaxed">
                    Если ты хочешь использовать реляционную PostgreSQL (например, через бесплатный Neon или Supabase), выполни этот SQL-скрипт в консоли Supabase, а затем используй Node.js драйвер:
                  </div>

                  {/* Schema SQL block */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">1. Структура таблиц (SQL Schema)</span>
                    <div className="relative">
                      <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-4 rounded-xl overflow-x-auto border border-slate-850 max-h-56">
                        {postgresCode}
                      </pre>
                      <button
                        onClick={() => handleCopy(postgresCode, 'pg-sql')}
                        className="absolute right-3 top-3 p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                      >
                        {copiedSection === 'pg-sql' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Node Connect block */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">2. Node-подключение и транзакции</span>
                    <div className="relative">
                      <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto border border-slate-850 max-h-56">
                        {postgresJsCode}
                      </pre>
                      <button
                        onClick={() => handleCopy(postgresJsCode, 'pg-js')}
                        className="absolute right-3 top-3 p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                      >
                        {copiedSection === 'pg-js' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: TELEGRAM MINI APP DETAILED SDK */}
          {activeStep === 2 && (
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-4 gap-3">
                <div>
                  <h3 className="font-display font-bold text-slate-100 text-lg flex items-center gap-2">
                    <Smartphone size={18} className="text-emerald-400" />
                    Запуск внутри Telegram как Mini App (TMA)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Сайт полностью адаптивен и готов к запуску прямо из мессенджера Telegram.
                  </p>
                </div>
                
                {/* Theme toggle for simulation */}
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 shrink-0">
                  <button
                    onClick={() => setTmaTheme('dark')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                      tmaTheme === 'dark' 
                        ? 'bg-slate-900 text-emerald-400' 
                        : 'text-slate-500'
                    }`}
                  >
                    ТГ ТЕМНАЯ
                  </button>
                  <button
                    onClick={() => setTmaTheme('light')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                      tmaTheme === 'light' 
                        ? 'bg-slate-900 text-emerald-400' 
                        : 'text-slate-500'
                    }`}
                  >
                    ТГ СВЕТЛАЯ
                  </button>
                </div>
              </div>

              {/* TWO COLUMN GRID: LEFT = TMA MOCKUP, RIGHT = DESCRIPTION & CODE */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* PHONE MOCKUP SENSORY COMPONENT */}
                <div className="md:col-span-5 flex justify-center">
                  <div className="w-[230px] h-[430px] rounded-[36px] border-[6px] border-slate-950 bg-slate-950 overflow-hidden relative shadow-2xl flex flex-col">
                    {/* Speaker ear slit */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-14 h-3 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                      <div className="w-6 h-0.5 bg-slate-800 rounded-full"></div>
                    </div>

                    {/* Simulating Telegram top bar */}
                    <div className={`pt-6 px-3 pb-2 flex items-center justify-between border-b text-xs font-sans select-none shrink-0 ${
                      tmaTheme === 'dark' 
                        ? 'bg-[#17212b] text-[#f5f5f5] border-[#101921]' 
                        : 'bg-[#517da2] text-white border-blue-600/10'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[10px]">LostInTranslation</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-85">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[9px] font-mono">v1.0</span>
                      </div>
                    </div>

                    {/* Webview Content container inside phone */}
                    <div className={`flex-1 p-3 flex flex-col gap-3 overflow-y-auto ${
                      tmaTheme === 'dark' ? 'bg-[#0e1621] text-[#e4ecf2]' : 'bg-[#f4f4f4] text-slate-800'
                    }`}>
                      <div className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                        tmaTheme === 'dark' 
                          ? 'bg-[#182533] border-[#101921]' 
                          : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-[8px] font-bold text-emerald-400 uppercase font-mono tracking-wider">ПРОМТ-ЦЕНТР</span>
                        <p className="text-[10px] font-sans leading-relaxed font-semibold">
                          Считываем скрытый культурный смысл:
                        </p>
                        <div className="bg-slate-950/20 p-1.5 rounded font-mono text-[9px] text-emerald-300">
                          "да, но нет"
                        </div>
                        <div className="text-[9px] text-slate-400 leading-snug">
                          Literal: "yes, but no" <br />
                          <span className="text-emerald-400 font-bold">Meaning:</span> A polite, passive refusal or polite doubt.
                        </div>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex flex-col gap-1 ${
                        tmaTheme === 'dark' 
                          ? 'bg-[#182533] border-[#101921]' 
                          : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-[8px] font-bold text-emerald-400 uppercase font-mono">API СТАТИСТИКА</span>
                        <div className="flex justify-between items-center text-[10px]">
                          <span>Предотвращено потерь:</span>
                          <span className="font-bold text-emerald-400">148</span>
                        </div>
                      </div>

                      {/* Launch key generation button in TMA mock */}
                      <div className="mt-auto">
                        <div className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-[10px] text-center rounded-lg shadow uppercase tracking-wider font-sans">
                          ВЫПУСТИТЬ API-КЛЮЧ
                        </div>
                      </div>
                    </div>

                    {/* Bottom home indicator bar */}
                    <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
                      <div className="w-16 h-1 bg-slate-800 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* HOW TO INITIALIZE */}
                <div className="md:col-span-7 flex flex-col gap-3">
                  <div className="text-xs text-slate-300 leading-relaxed">
                    Telegram Mini Apps — это стандартные SPA, открытые во встроенном веб-вью Telegram. 
                    Чтобы твой сайт идеально синхронизировался с Telegram (например, передавал данные пользователя в базу данных или подстраивал цветовую гамму), подключи специальный JS-скрипт в <code className="text-emerald-400 font-mono text-[10px]">index.html</code>:
                  </div>

                  <div className="relative">
                    <pre className="text-[10px] font-mono text-emerald-400 bg-slate-950 p-4 rounded-xl overflow-x-auto border border-slate-850 max-h-56">
                      {tmaSdkCode}
                    </pre>
                    <button
                      onClick={() => handleCopy(tmaSdkCode, 'tma-sdk')}
                      className="absolute right-3 top-3 p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      {copiedSection === 'tma-sdk' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[11px] text-slate-300 leading-relaxed">
                    <span className="font-bold text-emerald-400 block mb-0.5">💡 Как это монетизировать?</span>
                    Ты можешь настроить Telegram Stars (платёжный шлюз Telegram) прямо в Mini App или принимать оплату криптовалютой (через TON/CryptoPay API), выдавая Production-ключи автоматически.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: TELEGRAM CHANNEL WITH HERMES AI AGENT */}
          {activeStep === 3 && (
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-4">
                <Send size={18} className="text-emerald-400" />
                <div>
                  <h3 className="font-display font-bold text-slate-100 text-lg">
                    Прогрев Агента Hermes AI для твоего ТГ Канала
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Сделай так, чтобы твой ИИ-агент Hermes продвигал этот продукт на автопилоте
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed">
                Поскольку ты соло-вайбкодер, тебе некогда заниматься классическим маркетингом. Пусть ИИ-агент <span className="text-emerald-400 font-bold">Hermes</span> забирает эту рутину! Скопируй этот системный промт и задай его своему агенту Hermes, чтобы он эффективно рекомендовал твой новый сервис:
              </div>

              <div className="relative">
                <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto border border-slate-850 max-h-72 whitespace-pre-wrap">
                  {hermesPrompt}
                </pre>
                <button
                  onClick={() => handleCopy(hermesPrompt, 'hermes-prompt')}
                  className="absolute right-3 top-3 p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  {copiedSection === 'hermes-prompt' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                  <Sparkles size={16} />
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-bold text-slate-200 block mb-0.5">Вайб-хак: Интеграция Hermes по Webhook</span>
                  Ты можешь научить Hermes отправлять POST-запросы на <code className="text-emerald-300">/api/keys</code> твоего проекта. Если лояльный подписчик в канале просит ключ — Hermes может сам сгенерировать его через API и отправить пользователю в ЛС! Это создаст вау-эффект у аудитории.
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
