import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Play, 
  HelpCircle, 
  AlertCircle, 
  Check, 
  Copy,
  ChevronRight,
  Code
} from 'lucide-react';
import LossCard from './LossCard';
import { LossItem } from '../lib/analyze';

interface DemoExample {
  text: string;
  literal: string;
  meaning: string;
  lang: string;
}

const DEMO_EXAMPLES: DemoExample[] = [
  { text: "Да, но нет", literal: "Yes, but no", meaning: "Вежливый, мягкий, но окончательный отказ", lang: "RU" },
  { text: "行けたら行く", literal: "I will go if I can", meaning: "Тонкий способ сказать «Я не приду»", lang: "JP" },
  { text: "Jein", literal: "Yes-no", meaning: "Сложное противоречие, Ja + Nein", lang: "DE" },
  { text: "Mañana", literal: "Tomorrow", meaning: "Неопределенно отложено на будущее", lang: "ES" },
  { text: "Ah, bon?", literal: "Oh, good?", meaning: "Выражение сильного удивления или скептицизма", lang: "FR" },
  { text: "I'm fine", literal: "Я в порядке", meaning: "Попытка вежливо скрыть обиду или гнев", lang: "EN" }
];

const t = {
  ru: {
    analyzeTab: "Анализ потерь (/api/analyze)",
    enhanceTab: "Обогащение промтов (/api/enhance)",
    presetsLabel: "Быстрые примеры разных культурных контекстов:",
    inputTextLabel: "Текст для анализа (любой язык):",
    inputTextPlaceholder: "Введите фразу с глубоким культурным контекстом (например: 行けたら行く, да, но нет, Jein, Mañana)...",
    btnAnalyze: "Анализировать",
    requestError: "Ошибка запроса API:",
    loadingScanner: "Считываем культурный слой... Сканируем модальные конструкции...",
    literalLabel: "Буквальный перевод",
    lossesCount: "Потерь смысла",
    noLosses: "Никаких значительных культурных потерь не обнаружено. Текст переводится буквально без искажения глубинного смысла.",
    detectedLosses: "Выявленные потери культурного контекста:",
    inputPromptLabel: "Оригинальная инструкция (Промт для LLM):",
    inputPromptPlaceholder: "Например: Summarize user feedback / Analyze sentiment",
    inputKeyLabel: "API-Ключ разработчика:",
    inputKeySandbox: "Sandbox Key",
    inputEnhanceTextLabel: "Русскоязычный текст для обработки:",
    inputEnhanceTextPlaceholder: "Текст, который будет анализироваться промтом выше...",
    btnEnhance: "Обогатить промт",
    errorAuth: "Ошибка авторизации / запроса:",
    loadingEnricher: "Синтезируем лингвистический паттерн... Конструируем контекстный слой...",
    successTitle: "Промт успешно обогащён!",
    successSubtitle: "Потерь культурного перевода предотвращено:",
    btnCopy: "Скопировать",
    btnCopied: "Скопировано!",
    beforeEnrichment: "До обогащения (Как видит обычная LLM)",
    afterEnrichment: "Обогащённый API-промт (Для любой LLM)",
  },
  en: {
    analyzeTab: "Loss Analysis (/api/analyze)",
    enhanceTab: "Prompt Enrichment (/api/enhance)",
    presetsLabel: "Quick presets of distinct cultural contexts:",
    inputTextLabel: "Text to analyze (any language):",
    inputTextPlaceholder: "Enter a phrase with deep cultural context (e.g. 行けたら行く, да, но нет, Jein, Mañana)...",
    btnAnalyze: "Analyze",
    requestError: "API Request Error:",
    loadingScanner: "Reading cultural context... Scanning modal structures...",
    literalLabel: "Literal Translation",
    lossesCount: "Losses Detected",
    noLosses: "No major cultural losses detected. The text translates literally without changing its underlying meaning.",
    detectedLosses: "Identified cultural context losses:",
    inputPromptLabel: "Original instruction (Prompt for LLM):",
    inputPromptPlaceholder: "E.g.: Summarize user feedback / Analyze sentiment",
    inputKeyLabel: "Developer API Key:",
    inputKeySandbox: "Sandbox Key",
    inputEnhanceTextLabel: "Russian source text for processing:",
    inputEnhanceTextPlaceholder: "Text that will be analyzed by the prompt above...",
    btnEnhance: "Enrich Prompt",
    errorAuth: "Authentication / request error:",
    loadingEnricher: "Synthesizing linguistic pattern... Engineering contextual layer...",
    successTitle: "Prompt enriched successfully!",
    successSubtitle: "Cultural transfer losses prevented:",
    btnCopy: "Copy",
    btnCopied: "Copied!",
    beforeEnrichment: "Before Enrichment (Raw LLM perception)",
    afterEnrichment: "Enriched API Prompt (For any LLM)",
  }
};

export default function DemoWidget({ lang = 'ru' }: { lang?: 'ru' | 'en' }) {
  const [activeTab, setActiveTab] = useState<'analyze' | 'enhance'>('analyze');
  
  // Tab 1 (Analyze) State
  const [analyzeTextVal, setAnalyzeTextVal] = useState("行けたら行く");
  const [analyzeLanguage, setAnalyzeLanguage] = useState("en");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<{
    original: string;
    literal_translation: string;
    found: boolean;
    items: LossItem[];
  } | null>(null);
  const [analyzeError, setAnalyzeError] = useState("");

  // Tab 2 (Enhance) State
  const [enhancePromptVal, setEnhancePromptVal] = useState("Translate this user feedback and determine sentiment");
  const [enhanceTextVal, setEnhanceTextVal] = useState("行けたら行く");
  const [enhanceApiKey, setEnhanceApiKey] = useState("ltk_demokey12345");
  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [enhanceResult, setEnhanceResult] = useState<{
    enhanced_prompt: string;
    context_added: boolean;
    losses_detected: number;
  } | null>(null);
  const [enhanceError, setEnhanceError] = useState("");
  const [copiedEnhanced, setCopiedEnhanced] = useState(false);
  const [copiedLiteral, setCopiedLiteral] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Trigger Analyze Request
  const handleAnalyze = async (customText?: string) => {
    const textToAnalyze = customText || analyzeTextVal;
    if (!textToAnalyze.trim()) return;

    setAnalyzeLoading(true);
    setAnalyzeError("");
    setAnalyzeResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          target_language: analyzeLanguage
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to analyze');
      }

      setAnalyzeResult(data);
    } catch (err: any) {
      setAnalyzeError(err.message || 'Error communicating with server');
    } finally {
      setAnalyzeLoading(false);
    }
  };

  // Trigger Enhance Request
  const handleEnhance = async () => {
    if (!enhancePromptVal.trim() || !enhanceTextVal.trim()) return;

    setEnhanceLoading(true);
    setEnhanceError("");
    setEnhanceResult(null);

    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': enhanceApiKey 
        },
        body: JSON.stringify({
          prompt: enhancePromptVal,
          text: enhanceTextVal
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to enhance prompt');
      }

      setEnhanceResult(data);
    } catch (err: any) {
      setEnhanceError(err.message || 'Error communicating with server');
    } finally {
      setEnhanceLoading(false);
    }
  };

  const handleCopyEnhanced = () => {
    if (!enhanceResult) return;
    navigator.clipboard.writeText(enhanceResult.enhanced_prompt);
    setCopiedEnhanced(true);
    setTimeout(() => setCopiedEnhanced(false), 2000);
  };

  const handleCopyLiteral = () => {
    if (!analyzeResult) return;
    navigator.clipboard.writeText(analyzeResult.literal_translation);
    setCopiedLiteral(true);
    setTimeout(() => setCopiedLiteral(false), 2000);
  };

  const handleCopyRaw = () => {
    const rawText = `${enhancePromptVal}\n\nText: ${enhanceTextVal}`;
    navigator.clipboard.writeText(rawText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const selectExample = (ex: DemoExample) => {
    if (activeTab === 'analyze') {
      setAnalyzeTextVal(ex.text);
      handleAnalyze(ex.text);
    } else {
      setEnhanceTextVal(ex.text);
    }
  };

  return (
    <div id="demo-playground-widget" className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Tabs Selector */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
        <button
          id="btn-tab-analyze"
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-sans text-sm font-medium rounded-xl transition-all duration-300 ${
            activeTab === 'analyze' 
              ? 'bg-slate-800 text-emerald-400 shadow' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('analyze')}
        >
          <HelpCircle size={16} />
          {t[lang].analyzeTab}
        </button>
        <button
          id="btn-tab-enhance"
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-sans text-sm font-medium rounded-xl transition-all duration-300 ${
            activeTab === 'enhance' 
              ? 'bg-slate-800 text-emerald-400 shadow' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('enhance')}
        >
          <Sparkles size={16} />
          {t[lang].enhanceTab}
        </button>
      </div>

      <div className="p-6">
        {/* Quick Presets Carousel */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {t[lang].presetsLabel}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {DEMO_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                id={`btn-example-${i}`}
                className="text-left p-2.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700/60 rounded-xl transition-all duration-200 group text-xs cursor-pointer"
                onClick={() => selectExample(ex)}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-500/10 uppercase">
                    {ex.lang}
                  </span>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 text-slate-400 transform translate-x-0 group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
                <div className="font-bold text-slate-200 mb-0.5 truncate">
                  "{ex.text}"
                </div>
                <div className="text-slate-400 truncate mb-1">Literal: {ex.literal}</div>
                <div className="text-emerald-300 font-medium truncate text-[11px]">{ex.meaning}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab CONTENT: ANALYZE */}
        <AnimatePresence mode="wait">
          {activeTab === 'analyze' ? (
            <motion.div
              key="tab-analyze"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 font-sans">
                  {t[lang].inputTextLabel}
                </label>
                <div className="relative">
                  <textarea
                    id="input-analyze-text"
                    value={analyzeTextVal}
                    onChange={(e) => setAnalyzeTextVal(e.target.value)}
                    rows={3}
                    placeholder={t[lang].inputTextPlaceholder}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none transition-colors duration-200 text-sm resize-none font-sans"
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <select
                      value={analyzeLanguage}
                      onChange={(e) => setAnalyzeLanguage(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      <option value="en">English (EN)</option>
                      <option value="es">Spanish (ES)</option>
                      <option value="de">German (DE)</option>
                      <option value="zh">Chinese (ZH)</option>
                      <option value="ru">Russian (RU)</option>
                    </select>

                    <button
                      id="btn-trigger-analyze"
                      disabled={analyzeLoading || !analyzeTextVal.trim()}
                      onClick={() => handleAnalyze()}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {analyzeLoading ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <Play size={13} />
                      )}
                      {t[lang].btnAnalyze}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error block */}
              {analyzeError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl flex gap-3 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{t[lang].requestError}</span> {analyzeError}
                  </div>
                </div>
              )}

              {/* Analyze Result Rendering */}
              {analyzeLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <RefreshCw className="animate-spin text-emerald-400" size={32} />
                  <p className="text-sm font-medium animate-pulse font-sans">
                    {t[lang].loadingScanner}
                  </p>
                </div>
              )}

              {analyzeResult && (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 relative group/card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {t[lang].literalLabel} ({analyzeLanguage.toUpperCase()})
                        </h4>
                        <button
                          onClick={handleCopyLiteral}
                          className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors duration-200 cursor-pointer"
                          title="Copy literal translation"
                        >
                          {copiedLiteral ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <p className="text-lg text-slate-300 font-medium italic">
                        "{analyzeResult.literal_translation}"
                      </p>
                    </div>
                    <div className="shrink-0 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                      <span className="block text-2xl font-bold font-mono text-emerald-400 leading-none">
                        {analyzeResult.items.length}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {t[lang].lossesCount}
                      </span>
                    </div>
                  </div>

                  {analyzeResult.items.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {t[lang].detectedLosses}
                      </h4>
                      <div className="flex flex-col gap-3">
                        {analyzeResult.items.map((item, index) => (
                          <LossCard key={index} item={item} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-400 text-sm">
                      {t[lang].noLosses}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            // Tab CONTENT: ENHANCE
            <motion.div
              key="tab-enhance"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 font-sans">
                    {t[lang].inputPromptLabel}
                  </label>
                  <input
                    id="input-enhance-prompt"
                    type="text"
                    value={enhancePromptVal}
                    onChange={(e) => setEnhancePromptVal(e.target.value)}
                    placeholder={t[lang].inputPromptPlaceholder}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none transition-colors duration-200 text-sm font-sans"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 font-sans">
                    {t[lang].inputKeyLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="input-enhance-key"
                      type="text"
                      value={enhanceApiKey}
                      onChange={(e) => setEnhanceApiKey(e.target.value)}
                      placeholder="ltk_..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl pl-4 pr-24 py-2.5 text-slate-300 font-mono text-xs focus:outline-none transition-colors duration-200"
                    />
                    <div className="absolute right-1.5 top-1.5 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {t[lang].inputKeySandbox}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 font-sans">
                  {t[lang].inputEnhanceTextLabel}
                </label>
                <div className="relative">
                  <textarea
                    id="input-enhance-text"
                    value={enhanceTextVal}
                    onChange={(e) => setEnhanceTextVal(e.target.value)}
                    rows={3}
                    placeholder={t[lang].inputEnhanceTextPlaceholder}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none transition-colors duration-200 text-sm resize-none font-sans"
                  />
                  <div className="absolute right-3 bottom-3">
                    <button
                      id="btn-trigger-enhance"
                      disabled={enhanceLoading || !enhancePromptVal.trim() || !enhanceTextVal.trim()}
                      onClick={handleEnhance}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {enhanceLoading ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <Sparkles size={13} />
                      )}
                      {t[lang].btnEnhance}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error block */}
              {enhanceError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl flex gap-3 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{t[lang].errorAuth}</span> {enhanceError}
                  </div>
                </div>
              )}

              {/* Enhance Result Loading */}
              {enhanceLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <RefreshCw className="animate-spin text-emerald-400" size={32} />
                  <p className="text-sm font-medium animate-pulse font-sans">
                    {t[lang].loadingEnricher}
                  </p>
                </div>
              )}

              {/* Enhance Result Output */}
              {enhanceResult && (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-400/20 rounded-lg text-emerald-400">
                        <Check size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-300 font-sans">{t[lang].successTitle}</h4>
                        <p className="text-xs text-slate-400 leading-none mt-0.5">
                          {t[lang].successSubtitle} <span className="font-bold text-emerald-400">{enhanceResult.losses_detected}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      id="btn-copy-enhanced"
                      onClick={handleCopyEnhanced}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                      {copiedEnhanced ? (
                        <>
                          <Check size={13} /> {t[lang].btnCopied}
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> {t[lang].btnCopy}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Before Block */}
                    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
                      <div className="bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex justify-between items-center">
                        <span>{t[lang].beforeEnrichment}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCopyRaw}
                            className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors duration-200 cursor-pointer"
                            title="Copy raw prompt"
                          >
                            {copiedRaw ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full font-mono scale-90">RAW</span>
                        </div>
                      </div>
                      <div className="p-4 flex-1 text-xs font-mono text-slate-400 leading-relaxed overflow-auto max-h-56">
                        <span className="text-slate-500">{enhancePromptVal}</span>
                        <br /><br />
                        <span className="text-slate-300">Text: {enhanceTextVal}</span>
                      </div>
                    </div>

                    {/* After Block */}
                    <div className="bg-slate-950 rounded-xl border border-emerald-500/20 overflow-hidden flex flex-col shadow-lg shadow-emerald-950/10">
                      <div className="bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider border-b border-emerald-500/10 flex justify-between items-center">
                        <span className="flex items-center gap-1.5 font-sans"><Sparkles size={12} /> {t[lang].afterEnrichment}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCopyEnhanced}
                            className="text-emerald-400 hover:text-emerald-200 p-1 rounded transition-colors duration-200 cursor-pointer"
                            title="Copy enriched prompt"
                          >
                            {copiedEnhanced ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-mono scale-90">ENRICHED</span>
                        </div>
                      </div>
                      <div className="p-4 flex-1 text-xs font-mono text-slate-300 leading-relaxed overflow-auto max-h-56">
                        {/* We split and highlight the cultural context block */}
                        {(() => {
                          const parts = enhanceResult.enhanced_prompt.split(/(\[Cultural context.*?\])/gs);
                          return parts.map((part, index) => {
                            if (part.startsWith('[Cultural context')) {
                              return (
                                <span key={index} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded inline-block my-1.5 font-sans leading-relaxed">
                                  {part}
                                </span>
                              );
                            }
                            return <span key={index}>{part}</span>;
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
