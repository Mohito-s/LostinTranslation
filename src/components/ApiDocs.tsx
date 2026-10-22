import React, { useState } from 'react';
import { BookOpen, Terminal, Check, Copy, Play, RefreshCw, Zap, Shield, Key, AlertCircle, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import CodeExample from './CodeExample';

interface ApiDocsProps {
  lang?: 'ru' | 'en';
  onNavigateToDashboard?: () => void;
}

export default function ApiDocs({ lang = 'ru', onNavigateToDashboard }: ApiDocsProps) {
  // Live API Runner state
  const [runnerEndpoint, setRunnerEndpoint] = useState<'health' | 'analyze' | 'compare' | 'optimize-prompt'>('optimize-prompt');
  const [runnerLoading, setRunnerLoading] = useState(false);
  const [runnerResponse, setRunnerResponse] = useState<any>(null);
  const [runnerStatus, setRunnerStatus] = useState<number | null>(null);
  const [runnerTimeMs, setRunnerTimeMs] = useState<number | null>(null);
  const [runnerCopied, setRunnerCopied] = useState(false);

  // Active section for sidebar navigation
  const [activeSection, setActiveSection] = useState('overview');

  const executeLiveTest = async () => {
    setRunnerLoading(true);
    setRunnerResponse(null);
    setRunnerStatus(null);
    setRunnerTimeMs(null);

    const start = performance.now();
    try {
      let res: Response;
      if (runnerEndpoint === 'health') {
        res = await fetch('/api/health');
      } else if (runnerEndpoint === 'analyze') {
        res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: "Да нет наверное, я лучше дома посижу",
            target_language: "en"
          })
        });
      } else if (runnerEndpoint === 'compare') {
        res = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_text: "Да ладно тебе, всё нормально",
            target_text: "Come on, everything is totally fine",
            target_language: "en"
          })
        });
      } else {
        res = await fetch('/api/optimize-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: "Сделай мне вежливый, но твердый отказ подрядчику",
            targetLanguage: "Russian"
          })
        });
      }

      const end = performance.now();
      setRunnerTimeMs(Math.round(end - start));
      setRunnerStatus(res.status);

      const data = await res.json();
      setRunnerResponse(data);
    } catch (err: any) {
      setRunnerStatus(500);
      setRunnerResponse({ error: err.message || 'Network request failed' });
    } finally {
      setRunnerLoading(false);
    }
  };

  const copyResponseJson = () => {
    if (!runnerResponse) return;
    navigator.clipboard.writeText(JSON.stringify(runnerResponse, null, 2));
    setRunnerCopied(true);
    setTimeout(() => setRunnerCopied(false), 2000);
  };

  const t = {
    ru: {
      heading: "Документация разработчика (API v1)",
      subheading: "Спецификация REST-эндпоинтов, лимиты запросов и интерактивный тестировщик",
      tocTitle: "Содержание",
      liveTesterTitle: "Интерактивный тест API в реальном времени",
      liveTesterDesc: "Отправьте реальный HTTP-запрос к работающему локальному серверу прямо из браузера:",
      runBtn: "Отправить запрос к /api/",
      running: "Выполняется...",
      statusLabel: "HTTP Статус:",
      timeLabel: "Время:",
      copyJson: "Скопировать JSON",
      copied: "Скопировано!",
      sections: {
        overview: "1. Архитектура и Аутентификация",
        health: "2. GET /api/health (Мониторинг)",
        analyze: "3. POST /api/analyze (Потери смысла)",
        compare: "4. POST /api/compare (Cultural QA)",
        enhance: "5. POST /api/enhance (Обогащение промтов)",
        limits: "6. Квоты, Лимиты и Ошибки"
      }
    },
    en: {
      heading: "Developer Documentation (API v1)",
      subheading: "REST API reference, rate limits, and interactive live query runner",
      tocTitle: "Table of Contents",
      liveTesterTitle: "Live Interactive API Runner",
      liveTesterDesc: "Dispatch real HTTP requests to your local running instance directly from the browser:",
      runBtn: "Dispatch request to /api/",
      running: "Executing...",
      statusLabel: "HTTP Status:",
      timeLabel: "Latency:",
      copyJson: "Copy JSON",
      copied: "Copied!",
      sections: {
        overview: "1. Architecture & Authentication",
        health: "2. GET /api/health (Healthcheck)",
        analyze: "3. POST /api/analyze (Cultural Losses)",
        compare: "4. POST /api/compare (Cultural QA Linter)",
        enhance: "5. POST /api/enhance (Prompt Enrichment)",
        limits: "6. Quotas, Rate Limits & Errors"
      }
    }
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* Header Banner */}
      <div className="border-b border-white/10 pb-6">
        <span className="text-xs font-mono uppercase tracking-widest text-sky-300 bg-sky-400/10 px-3 py-1 rounded-full border border-sky-400/20">
          § API SPECIFICATION & REFERENCE
        </span>
        <h1 className="text-3xl sm:text-4xl font-sans font-bold text-white mt-3 mb-2">
          {t[lang].heading}
        </h1>
        <p className="text-sm text-slate-400 font-sans max-w-2xl">
          {t[lang].subheading}
        </p>
      </div>

      {/* LIVE INTERACTIVE RUNNER (TEST YOUR LOCAL SERVER NOW) */}
      <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-sans font-bold text-white text-lg">
                § {t[lang].liveTesterTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {t[lang].liveTesterDesc}
            </p>
          </div>

          {/* Endpoint Selector Tabs */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setRunnerEndpoint('analyze')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                runnerEndpoint === 'analyze'
                  ? 'bg-sky-400/20 text-sky-300 font-bold border border-sky-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              POST /analyze
            </button>
            <button
              onClick={() => setRunnerEndpoint('compare')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                runnerEndpoint === 'compare'
                  ? 'bg-sky-400/20 text-sky-300 font-bold border border-sky-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              POST /compare
            </button>
            <button
              onClick={() => setRunnerEndpoint('optimize-prompt')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                runnerEndpoint === 'optimize-prompt'
                  ? 'bg-sky-400/20 text-sky-300 font-bold border border-sky-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              POST /optimize-prompt
            </button>
            <button
              onClick={() => setRunnerEndpoint('health')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                runnerEndpoint === 'health'
                  ? 'bg-sky-400/20 text-sky-300 font-bold border border-sky-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              GET /health
            </button>
          </div>
        </div>

        {/* Runner Controls & Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-200 bg-black/40 px-3.5 py-2 rounded-xl border border-white/10 flex-grow overflow-x-auto">
            <span className="text-sky-300 font-bold">{runnerEndpoint === 'health' ? 'GET' : 'POST'}</span>
            <span className="text-slate-400">http://localhost:3000/api/{runnerEndpoint}</span>
          </div>

          <button
            onClick={executeLiveTest}
            disabled={runnerLoading}
            className="celestial-btn-primary px-5 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 border border-sky-400/40 font-sans font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] active:scale-98 disabled:opacity-50"
          >
            {runnerLoading ? (
              <RefreshCw size={14} className="animate-spin text-sky-200" />
            ) : (
              <Play size={14} className="text-sky-200" />
            )}
            {runnerLoading ? t[lang].running : `${t[lang].runBtn}${runnerEndpoint}`}
          </button>
        </div>

        {/* Runner Response Console */}
        {runnerResponse && (
          <div className="mt-4 bg-black/50 border border-white/10 rounded-xl overflow-hidden font-mono text-xs">
            <div className="bg-white/[0.04] px-4 py-2 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                  runnerStatus === 200 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {runnerStatus} {runnerStatus === 200 ? 'OK' : 'RESPONSE'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {t[lang].timeLabel} <span className="text-amber-300">{runnerTimeMs} ms</span>
                </span>
              </div>
              <button
                onClick={copyResponseJson}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer transition-colors"
              >
                {runnerCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {runnerCopied ? t[lang].copied : t[lang].copyJson}
              </button>
            </div>
            <pre className="p-4 text-amber-300 overflow-x-auto max-h-72 leading-relaxed">
              {JSON.stringify(runnerResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Main Documentation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sticky Table of Contents */}
        <div className="lg:col-span-1">
          <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-5 rounded-2xl sticky top-24 shadow-xl">
            <h3 className="font-sans font-bold text-white mb-4 flex items-center gap-2 text-sm">
              <BookOpen size={16} className="text-sky-400" />
              {t[lang].tocTitle}
            </h3>
            
            <ul className="flex flex-col gap-1.5 text-xs font-sans">
              <li>
                <a
                  href="#doc-overview"
                  onClick={() => setActiveSection('overview')}
                  className={`block py-1.5 px-2.5 rounded-lg transition-colors ${
                    activeSection === 'overview'
                      ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t[lang].sections.overview}
                </a>
              </li>
              <li>
                <a
                  href="#doc-health"
                  onClick={() => setActiveSection('health')}
                  className={`block py-1.5 px-2.5 rounded-lg transition-colors ${
                    activeSection === 'health'
                      ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t[lang].sections.health}
                </a>
              </li>
              <li>
                <a
                  href="#doc-analyze"
                  onClick={() => setActiveSection('analyze')}
                  className={`block py-1.5 px-2.5 rounded-lg transition-colors ${
                    activeSection === 'analyze'
                      ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t[lang].sections.analyze}
                </a>
              </li>
              <li>
                <a
                  href="#doc-compare"
                  onClick={() => setActiveSection('compare')}
                  className={`block py-1.5 px-2.5 rounded-lg transition-colors ${
                    activeSection === 'compare'
                      ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t[lang].sections.compare}
                </a>
              </li>
              <li>
                <a
                  href="#doc-enhance"
                  onClick={() => setActiveSection('enhance')}
                  className={`block py-1.5 px-2.5 rounded-lg transition-colors ${
                    activeSection === 'enhance'
                      ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t[lang].sections.enhance}
                </a>
              </li>
              <li>
                <a
                  href="#doc-limits"
                  onClick={() => setActiveSection('limits')}
                  className={`block py-1.5 px-2.5 rounded-lg transition-colors ${
                    activeSection === 'limits'
                      ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t[lang].sections.limits}
                </a>
              </li>
            </ul>

            {onNavigateToDashboard && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={onNavigateToDashboard}
                  className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] text-sky-300 border border-white/10 hover:border-sky-400/50 text-xs font-sans font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key size={13} className="text-sky-400" />
                  {lang === 'ru' ? "Получить API-ключ" : "Get API Key"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Documentation Content Body */}
        <div className="lg:col-span-3 flex flex-col gap-12 font-sans leading-relaxed text-sm text-slate-300">
          
          {/* 1. Architecture Overview */}
          <section id="doc-overview" className="flex flex-col gap-4 border-b border-white/10 pb-10">
            <h2 className="text-2xl font-sans font-bold text-white flex items-center gap-2">
              § 1. {lang === 'ru' ? "Архитектура и Аутентификация" : "Architecture & Authentication"}
            </h2>
            <p className="font-sans text-slate-400 text-base">
              {lang === 'ru' 
                ? "LostInTranslation (LIT) — это контекстный семантический шлюз, который встраивается в цепочку перед целевой LLM (Claude, GPT-4, Gemini) или CAT-системой перевода."
                : "LostInTranslation (LIT) is a context middleware layer inserted upstream of large LLMs (Claude, GPT-4, Gemini) or CAT localization pipelines."}
            </p>

            <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300">
                {lang === 'ru' ? "Заголовки авторизации (Headers)" : "Authentication Headers"}
              </span>
              <p className="text-xs text-slate-400 font-sans">
                {lang === 'ru'
                  ? "Для доступа к защищенным эндпоинтам (например, /api/enhance) передайте ваш ключ в заголовке x-api-key или Authorization:"
                  : "To authenticate protected endpoints (such as /api/enhance), provide your API key via the x-api-key or Authorization header:"}
              </p>
              <pre className="text-xs font-mono text-sky-300 bg-black/50 p-3 rounded-xl border border-white/10 overflow-x-auto">
                x-api-key: lit_live_xxxxxxxxxxxxxxxx{"\n"}
                Authorization: Bearer lit_live_xxxxxxxxxxxxxxxx
              </pre>
            </div>
          </section>

          {/* 2. GET /api/health */}
          <section id="doc-health" className="flex flex-col gap-4 border-b border-white/10 pb-10">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-lg border border-emerald-500/40">
                GET
              </span>
              <h2 className="text-xl sm:text-2xl font-sans font-bold text-white">
                /api/health
              </h2>
            </div>
            <p className="font-sans text-slate-400">
              {lang === 'ru'
                ? "Проверка жизнеспособности сервера, времени аптайма и готовности шлюза к приему запросов."
                : "Healthcheck and ping endpoint returning server status, uptime seconds, and timestamp."}
            </p>

            <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                {lang === 'ru' ? "Пример ответа (JSON)" : "Sample Response (JSON)"}
              </span>
              <pre className="text-xs font-mono text-amber-300 bg-black/50 p-3 rounded-xl border border-white/10">
{`{
  "status": "ok",
  "uptime": 1420.5,
  "timestamp": "2026-09-28T22:30:00.000Z"
}`}
              </pre>
            </div>
          </section>

          {/* 3. POST /api/analyze */}
          <section id="doc-analyze" className="flex flex-col gap-4 border-b border-white/10 pb-10">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-amber-400/15 text-amber-300 text-xs font-mono font-bold rounded-lg border border-amber-400/30">
                POST
              </span>
              <h2 className="text-xl sm:text-2xl font-sans font-bold text-white">
                /api/analyze
              </h2>
            </div>
            <p className="font-sans text-slate-400">
              {lang === 'ru'
                ? "Анализ исходного текста на наличие скрытых модальностей, частиц, вежливых отказов и культурных искажений."
                : "Analyzes raw input text to detect hidden cultural nuances, modal particles, passive refusals, and sarcastic markers."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-xl">
                <span className="text-xs font-mono text-sky-300 uppercase tracking-wider">
                  Request Payload
                </span>
                <pre className="text-xs font-mono text-slate-300 bg-black/50 p-3 rounded-xl border border-white/10">
{`{
  "text": "Да ну и ладно, домой пойду",
  "target_language": "en"
}`}
                </pre>
              </div>

              <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-xl">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  Response Payload
                </span>
                <pre className="text-xs font-mono text-sky-200 bg-black/50 p-3 rounded-xl border border-white/10 overflow-x-auto max-h-48">
{`{
  "literal_translation": "Well whatever, I'll go home",
  "items": [
    {
      "fragment": "Да ну и ладно",
      "short": "Горькое смирение под видом безразличия",
      "explanation": "Скрытая обида или разочарование...",
      "alternative": "Fine, I have no choice anyway"
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* 4. POST /api/compare */}
          <section id="doc-compare" className="flex flex-col gap-4 border-b border-white/10 pb-10">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-sky-400/15 text-sky-300 text-xs font-mono font-bold rounded-lg border border-sky-400/30">
                POST
              </span>
              <h2 className="text-xl sm:text-2xl font-sans font-bold text-white">
                /api/compare
              </h2>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/40">
                Cultural QA Linter
              </span>
            </div>
            <p className="font-sans text-slate-400">
              {lang === 'ru'
                ? "Сравнение исходного текста и готового машинного перевода (DeepL, Google, LLM). Возвращает числовой скоринг семантического сохранения (0–100), текстовый вердикт и реестр выявленных ошибок."
                : "Comparative Cultural Linter evaluating a translation against the source text. Calculates a 0-100 retention score, verdict, and detected distortions."}
            </p>

            <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
              <span className="text-xs font-mono text-sky-300 uppercase tracking-wider">
                {lang === 'ru' ? "Пример тела запроса (Request JSON)" : "Request Body (JSON)"}
              </span>
              <pre className="text-xs font-mono text-slate-300 bg-black/50 p-3 rounded-xl border border-white/10">
{`{
  "source_text": "Да ладно тебе, всё нормально",
  "target_text": "Come on, everything is totally fine",
  "target_language": "en"
}`}
              </pre>
            </div>
          </section>

          {/* 5. POST /api/enhance */}
          <section id="doc-enhance" className="flex flex-col gap-4 border-b border-white/10 pb-10">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-sky-400/15 text-sky-300 text-xs font-mono font-bold rounded-lg border border-sky-400/30">
                POST
              </span>
              <h2 className="text-xl sm:text-2xl font-sans font-bold text-white">
                /api/enhance
              </h2>
              <span className="text-[10px] font-mono uppercase bg-sky-400/15 text-sky-300 px-2 py-0.5 rounded-md border border-sky-400/30">
                Core Feature
              </span>
            </div>
            <p className="font-sans text-slate-400">
              {lang === 'ru'
                ? "Принимает ваш оригинальный промт для LLM и локализованный текст. Возвращает готовый обогащенный промт с инъецированным блоком [Cultural context], готовый к прямой отправке в GPT-4 или Claude."
                : "Accepts your original system prompt and the localized input text. Injects a calibrated [Cultural context] block so downstream LLMs interpret true intent without hallucination."}
            </p>

            <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                {lang === 'ru' ? "Примеры интеграции в код (cURL, Node.js, Python):" : "Integration Code Snippets:"}
              </span>
              <CodeExample />
            </div>
          </section>

          {/* 6. Quotas & Limits */}
          <section id="doc-limits" className="flex flex-col gap-4">
            <h2 className="text-xl sm:text-2xl font-sans font-bold text-white">
              § 6. {lang === 'ru' ? "Квоты, Лимиты и Коды ошибок" : "Quotas, Limits & Error Codes"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-xl">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">ANONYMOUS (IP)</span>
                <span className="text-xl font-sans font-bold text-white">10 req</span>
                <span className="text-xs text-slate-400 block mt-1 font-sans">/ 24 hours</span>
              </div>
              <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-xl">
                <span className="text-[10px] font-mono uppercase text-sky-300 block">FREE SANDBOX KEY</span>
                <span className="text-xl font-sans font-bold text-sky-200">50 req</span>
                <span className="text-xs text-slate-400 block mt-1 font-sans">/ 24 hours</span>
              </div>
              <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-xl">
                <span className="text-[10px] font-mono uppercase text-emerald-400 block">PRODUCTION PRO</span>
                <span className="text-xl font-sans font-bold text-emerald-400">1,000 req</span>
                <span className="text-xs text-slate-400 block mt-1 font-sans">/ 24 hours</span>
              </div>
            </div>

            <div className="frosted-card bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col gap-3 mt-2 shadow-xl">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                HTTP Status Codes
              </span>
              <ul className="flex flex-col gap-2 text-xs font-sans">
                <li><strong className="text-emerald-400 font-mono">200 OK</strong> — Успешное выполнение запроса</li>
                <li><strong className="text-amber-300 font-mono">400 Bad Request</strong> — Отсутствуют обязательные параметры запроса</li>
                <li><strong className="text-rose-400 font-mono">401 Unauthorized</strong> — Недействительный или отозванный API-ключ</li>
                <li><strong className="text-rose-400 font-mono">403 Forbidden</strong> — Требуется API-ключ для доступа к эндпоинту</li>
                <li><strong className="text-rose-400 font-mono">429 Too Many Requests</strong> — Превышена суточная квота запросов (заголовки X-RateLimit-Limit и X-RateLimit-Remaining)</li>
              </ul>
            </div>
          </section>

        </div>
      </div>

    </div>
  );
}
