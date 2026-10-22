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
  Code,
  ShieldCheck,
  Scale,
  FileText,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Share2,
  Info,
  Zap,
  Coins,
  TrendingDown,
  Download
} from 'lucide-react';
import LossCard from './LossCard';
import { LossItem, CompareResponse, CompareIssue } from '../lib/analyze';
import { OptimizePromptResponse } from '../lib/enhance';

interface DemoExample {
  text: string;
  literal: string;
  meaning: string;
  lang: string;
  category?: string;
}

const DEMO_EXAMPLES: DemoExample[] = [
  { text: "行けたら行く", literal: "I will go if I can", meaning: "Тонкий вежливый способ сказать «Я не приду»", lang: "JP", category: "Face-Saving Refusal" },
  { text: "Да, но нет", literal: "Yes, but no", meaning: "Вежливый, мягкий, но окончательный отказ", lang: "RU", category: "Polite Refusal" },
  { text: "Jein", literal: "Yes-no", meaning: "Сложное противоречие, Ja + Nein одновременно", lang: "DE", category: "Ambivalence" },
  { text: "Mañana", literal: "Tomorrow", meaning: "Неопределенно отложено на далекое будущее", lang: "ES", category: "Hedging" },
  { text: "Ah, bon?", literal: "Oh, good?", meaning: "Выражение сильного удивления или скептицизма", lang: "FR", category: "Irony / Doubt" },
  { text: "I'm fine", literal: "Я в порядке", meaning: "Попытка вежливо скрыть обиду или недовольство", lang: "EN", category: "Understatement" }
];

const TOKEN_EXAMPLES = [
  { prompt: "Сделай мне вежливый, но твердый отказ подрядчику, чтобы не обидеть человека и не сжечь мосты", category: "Вежливый отказ" },
  { prompt: "Напиши душевную сцену, где герои молча посидят на дорожку перед дальним вылетом", category: "Культурный ритуал" },
  { prompt: "Да нет, наверное, мы не успеем согласовать релиз к жесткому дедлайну в пятницу", category: "Модальность сомнения" },
  { prompt: "В принципе результат неплохой, но для продакшена надо доработать напильником", category: "Сдержанная похвала" },
  { prompt: "Напиши надежный модуль авторизации с хешированием паролей по уму, сессионными токенами, валидацией всех полей и защитой от перебора. Без заглушек, чисто и на совесть.", category: "Развёрнутое ТЗ (-45%)" },
];

const t = {
  ru: {
    compareTab: "Культурный QA (/api/compare)",
    analyzeTab: "Анализ потерь (/api/analyze)",
    enhanceTab: "Обогащение промтов (/api/enhance)",
    presetsLabel: "Быстрые примеры разных культурных контекстов:",
    
    // Compare Tab
    compareHeading: "Проверка качества перевода на сохранение культурного смысла",
    sourceTextLabel: "Оригинальный текст (исходный язык):",
    sourceTextPlaceholder: "Например: 行けたら行く или Да, но нет...",
    targetTextLabel: "Машинный перевод (переводчик / LLM):",
    targetTextPlaceholder: "Например: I will go if I can или Yes, but no...",
    btnCompare: "Запустить лингвистический QA",
    loadingCompare: "Сравниваем прагматические слои... Оцениваем сохранение вежливости и модальностей...",
    faithfulnessScore: "Индекс сохранности смысла",
    verdictLabel: "Вердикт QA",
    linterDiffTitle: "Diff: Дословный перевод vs Культурный эквивалент",
    copyBugReport: "Скопировать Markdown-отчет",
    bugReportCopied: "Отчет скопирован в буфер!",
    noCompareIssues: "Отличный результат! Перевод полностью передает культурный контекст и эмоциональный подтекст оригинала.",
    
    // Analyze Tab
    inputTextLabel: "Текст для анализа (любой язык):",
    inputTextPlaceholder: "Введите фразу с глубоким культурным контекстом (например: 行けたら行く, да, но нет, Jein, Mañana)...",
    btnAnalyze: "Анализировать",
    requestError: "Ошибка запроса API:",
    loadingScanner: "Считываем культурный слой... Сканируем модальные конструкции...",
    literalLabel: "Буквальный перевод",
    lossesCount: "Потерь смысла",
    noLosses: "Никаких значительных культурных потерь не обнаружено. Текст переводится буквально без искажения глубинного смысла.",
    detectedLosses: "Выявленные потери культурного контекста:",
    
    // Enhance Tab
    inputPromptLabel: "Оригинальная инструкция (Промт для LLM):",
    inputPromptPlaceholder: "Например: Summarize user feedback / Analyze sentiment",
    inputKeyLabel: "API-Ключ разработчика:",
    inputKeySandbox: "Sandbox Key",
    inputEnhanceTextLabel: "Текст для обработки целевой моделью:",
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

    // Token Saver Tab
    tokensTab: "Экономия токенов (-65%)",
    tokensHeading: "Token Saver: Перевод в сжатый английский промт с сохранением 100% культурного смысла",
    tokensSubheading: "В Claude русский текст стоит почти в 3 раза дороже (+196% токенов). Наш семантический слой конвертирует промт в точный английский и велит модели ответить на русском.",
    tokensInputLabel: "Промт на русском языке (для Claude / GPT / Gemini):",
    tokensInputPlaceholder: "Например: Сделай вежливый, но твердый отказ подрядчику...",
    tokensTargetLangLabel: "Язык ответа целевой модели:",
    btnOptimizeTokens: "Оптимизировать промт и рассчитать токены",
    loadingOptimizer: "Извлекаем культурную прагматику... Переводим в сжатый английский... Считаем экономию токенов...",
    tokenSavingsTitle: "Расчёт экономии токенов и стоимости",
    claudeTokensLabel: "Anthropic Claude (Opus / Sonnet)",
    gptTokensLabel: "OpenAI GPT (GPT-4o / GPT-5)",
    tokensSavedBadge: "Экономия",
    preservedNuancesTitle: "Сохранённые культурные нюансы и подтекст:",
    optimizedPromptTitle: "Оптимизированный английский промт (для отправки в LLM):",
    btnCopyOptimized: "Скопировать готовый промт",
  },
  en: {
    compareTab: "Cultural QA (/api/compare)",
    analyzeTab: "Loss Analysis (/api/analyze)",
    enhanceTab: "Prompt Enrichment (/api/enhance)",
    presetsLabel: "Quick presets of distinct cultural contexts:",
    
    // Compare Tab
    compareHeading: "Evaluate translation fidelity for cultural & pragmatic nuance",
    sourceTextLabel: "Source text (original language):",
    sourceTextPlaceholder: "E.g.: 行けたら行く or Да, но нет...",
    targetTextLabel: "Machine translation (Google / DeepL / LLM):",
    targetTextPlaceholder: "E.g.: I will go if I can or Yes, but no...",
    btnCompare: "Run Cultural QA Linter",
    loadingCompare: "Comparing pragmatic layers... Evaluating politeness & register...",
    faithfulnessScore: "Faithfulness Score",
    verdictLabel: "QA Verdict",
    linterDiffTitle: "Diff: Literal Translation vs Cultural Equivalent",
    copyBugReport: "Copy Markdown Bug Report",
    bugReportCopied: "Report copied to clipboard!",
    noCompareIssues: "Excellent! The translation fully preserves the cultural intent and emotional context of the source.",
    
    // Analyze Tab
    inputTextLabel: "Text to analyze (any language):",
    inputTextPlaceholder: "Enter a phrase with deep cultural context (e.g. 行けたら行く, да, но нет, Jein, Mañana)...",
    btnAnalyze: "Analyze",
    requestError: "API Request Error:",
    loadingScanner: "Reading cultural context... Scanning modal structures...",
    literalLabel: "Literal Translation",
    lossesCount: "Losses Detected",
    noLosses: "No major cultural losses detected. The text translates literally without changing its underlying meaning.",
    detectedLosses: "Identified cultural context losses:",
    
    // Enhance Tab
    inputPromptLabel: "Original instruction (Prompt for LLM):",
    inputPromptPlaceholder: "E.g.: Summarize user feedback / Analyze sentiment",
    inputKeyLabel: "Developer API Key:",
    inputKeySandbox: "Sandbox Key",
    inputEnhanceTextLabel: "Source text for processing:",
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

    // Token Saver Tab
    tokensTab: "Token Saver (-65%)",
    tokensHeading: "Token Saver: Translate into dense English prompt preserving 100% cultural intent",
    tokensSubheading: "In Claude, Russian text consumes nearly 3x more tokens (+196%). Our semantic middleware compresses the prompt into idiomatic English and directs the model to reply in Russian.",
    tokensInputLabel: "Russian prompt (to send to Claude / GPT / Gemini):",
    tokensInputPlaceholder: "E.g.: Draft a polite yet firm refusal to a contractor...",
    tokensTargetLangLabel: "Target answer language:",
    btnOptimizeTokens: "Optimize Prompt & Compute Savings",
    loadingOptimizer: "Extracting cultural pragmatics... Compressing into English bridge... Calculating token economics...",
    tokenSavingsTitle: "Token Savings & Economic Estimation",
    claudeTokensLabel: "Anthropic Claude (Opus / Sonnet)",
    gptTokensLabel: "OpenAI GPT (GPT-4o / GPT-5)",
    tokensSavedBadge: "Savings",
    preservedNuancesTitle: "Preserved Cultural Nuances & Pragmatics:",
    optimizedPromptTitle: "Optimized English Prompt (Send directly to LLM):",
    btnCopyOptimized: "Copy Optimized Prompt",
  }
};

export default function DemoWidget({ lang = 'ru' }: { lang?: 'ru' | 'en' }) {
  const [activeTab, setActiveTab] = useState<'compare' | 'analyze' | 'enhance' | 'tokens'>('tokens');
  
  // Tab 1 (Compare / Cultural QA) State
  const [compareSourceVal, setCompareSourceVal] = useState("行けたら行く");
  const [compareTargetVal, setCompareTargetVal] = useState("I will go if I can");
  const [compareLanguage, setCompareLanguage] = useState("en");
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);
  const [compareError, setCompareError] = useState("");
  const [copiedBugReport, setCopiedBugReport] = useState(false);

  // Tab 2 (Analyze) State
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

  // Tab 3 (Enhance) State
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

  // Tab 4 (Token Saver) State
  const [tokensPromptVal, setTokensPromptVal] = useState("Сделай мне вежливый, но твердый отказ подрядчику, чтобы не обидеть человека и не сжечь мосты");
  const [tokensTargetLang, setTokensTargetLang] = useState("Russian");
  const [tokensLoading, setTokensLoading] = useState(false);
  const [tokensResult, setTokensResult] = useState<OptimizePromptResponse | null>(null);
  const [tokensError, setTokensError] = useState("");
  const [copiedTokensPrompt, setCopiedTokensPrompt] = useState(false);

  // Trigger Token Optimizer Request
  const handleOptimizeTokens = async (customPrompt?: string) => {
    const promptToOpt = customPrompt !== undefined ? customPrompt : tokensPromptVal;
    if (!promptToOpt.trim()) return;

    setTokensLoading(true);
    setTokensError("");
    setTokensResult(null);

    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToOpt,
          targetLanguage: tokensTargetLang
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to optimize prompt');
      }

      setTokensResult(data);
    } catch (err: any) {
      setTokensError(err.message || 'Error communicating with server');
    } finally {
      setTokensLoading(false);
    }
  };

  const handleCopyTokensPrompt = () => {
    if (!tokensResult) return;
    navigator.clipboard.writeText(tokensResult.full_optimized_prompt);
    setCopiedTokensPrompt(true);
    setTimeout(() => setCopiedTokensPrompt(false), 2000);
  };

  // Trigger Compare Request
  const handleCompare = async (customSource?: string, customTarget?: string) => {
    const src = customSource !== undefined ? customSource : compareSourceVal;
    const tgt = customTarget !== undefined ? customTarget : compareTargetVal;
    if (!src.trim() || !tgt.trim()) return;

    setCompareLoading(true);
    setCompareError("");
    setCompareResult(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_text: src,
          target_text: tgt,
          target_language: compareLanguage
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to compare translation');
      }

      setCompareResult(data);
    } catch (err: any) {
      setCompareError(err.message || 'Error communicating with server');
    } finally {
      setCompareLoading(false);
    }
  };

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

  const handleCopyBugReport = () => {
    if (!compareResult) return;
    const issuesMd = compareResult.issues.map(iss => (
      `- **[${iss.severity.toUpperCase()}]** \`${iss.fragment}\`: ${iss.short}\n  *Причина:* ${iss.explanation}\n  *Рекомендованная альтернатива:* \`${iss.alternative}\``
    )).join('\n\n');

    const report = `# [Cultural QA Bug Report] Translation Meaning Loss
**Score:** ${compareResult.score ?? 0}/100 — **${compareResult.verdict}**
**Source text:** "${compareResult.source}"
**Given translation:** "${compareResult.target}"

## Detected Issues:
${issuesMd || '_No cultural meaning losses detected._'}

---
*Generated by LostInTranslation API (LIT) — https://lostintranslation.dev*`;

    navigator.clipboard.writeText(report);
    setCopiedBugReport(true);
    setTimeout(() => setCopiedBugReport(false), 2000);
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCompare = (format: 'json' | 'md') => {
    if (!compareResult) return;
    if (format === 'json') {
      downloadFile(
        `lit-cultural-qa-${Date.now()}.json`,
        JSON.stringify(compareResult, null, 2),
        'application/json'
      );
    } else {
      const issuesMd = compareResult.issues.map(iss => (
        `- **[${iss.severity.toUpperCase()}]** \`${iss.fragment}\`: ${iss.short}\n  *Причина:* ${iss.explanation}\n  *Рекомендованная альтернатива:* \`${iss.alternative}\``
      )).join('\n\n');

      const md = `# [Cultural QA Report] Translation Meaning Loss
**Score:** ${compareResult.score ?? 0}/100 — **${compareResult.verdict}**
**Source text:** "${compareResult.source}"
**Given translation:** "${compareResult.target}"

## Detected Issues:
${issuesMd || '_No cultural meaning losses detected._'}

---
*Generated by LostInTranslation API (LIT) — https://lostintranslation.dev*`;
      downloadFile(`lit-cultural-qa-${Date.now()}.md`, md, 'text/markdown');
    }
  };

  const handleExportAnalyze = (format: 'json' | 'md') => {
    if (!analyzeResult) return;
    if (format === 'json') {
      downloadFile(
        `lit-analysis-${Date.now()}.json`,
        JSON.stringify(analyzeResult, null, 2),
        'application/json'
      );
    } else {
      const lossesMd = (analyzeResult.losses || []).map((loss: any, i: number) => (
        `### ${i + 1}. \`${loss.element}\` (${loss.type || 'Cultural Loss'})
- **Explanation:** ${loss.explanation}
- **Intent Impact:** ${loss.intentImpact}
- **Recommendation:** ${loss.recommendation}`
      )).join('\n\n');

      const md = `# [Cultural Loss Analysis] LostInTranslation
**Input text:** "${analyzeTextVal}"
**Detected Losses:** ${analyzeResult.losses?.length || 0}
**Literal Translation:** "${analyzeResult.literal_translation || ''}"

## Losses Breakdown:
${lossesMd || '_No cultural loss detected._'}

---
*Generated by LostInTranslation API (LIT) — https://lostintranslation.dev*`;
      downloadFile(`lit-analysis-${Date.now()}.md`, md, 'text/markdown');
    }
  };

  const selectExample = (ex: DemoExample) => {
    if (activeTab === 'compare') {
      setCompareSourceVal(ex.text);
      setCompareTargetVal(ex.literal);
      handleCompare(ex.text, ex.literal);
    } else if (activeTab === 'analyze') {
      setAnalyzeTextVal(ex.text);
      handleAnalyze(ex.text);
    } else {
      setEnhanceTextVal(ex.text);
    }
  };

  // Helper for score badge colors
  const getScoreColor = (score: number | null) => {
    if (score === null) return { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
    if (score >= 90) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    if (score >= 70) return { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' };
    if (score >= 50) return { bg: 'bg-amber-400/10', text: 'text-amber-300', border: 'border-amber-400/30' };
    return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' };
  };

  const getSeverityBadge = (sev: 'high' | 'medium' | 'low') => {
    if (sev === 'high') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
          <AlertTriangle size={10} /> HIGH RISK
        </span>
      );
    }
    if (sev === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <AlertCircle size={10} /> MEDIUM LOSS
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
        <Info size={10} /> LOW SHIFT
      </span>
    );
  };

  return (
    <div id="demo-playground-widget" className="w-full frosted-card rounded-2xl sm:rounded-3xl border border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.85)] overflow-hidden bg-white/[0.03] backdrop-blur-2xl">
      {/* Tabs Selector */}
      <div className="flex items-center gap-1.5 p-1.5 sm:p-2 bg-black/40 border-b border-white/10 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          id="btn-tab-compare"
          className={`flex-1 min-w-fit shrink-0 flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'compare' 
              ? 'bg-white/10 text-white border border-white/25 shadow-[0_0_15px_rgba(56,189,248,0.18)] font-semibold' 
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
          }`}
          onClick={() => setActiveTab('compare')}
        >
          <GitCompare size={15} className={activeTab === 'compare' ? 'text-sky-400 shrink-0' : 'text-slate-500 shrink-0'} />
          <span>{lang === 'ru' ? 'Культурный QA' : 'Cultural QA'}</span>
          <span className="hidden xl:inline text-[11px] font-mono opacity-60">(/api/compare)</span>
        </button>

        <button
          id="btn-tab-analyze"
          className={`flex-1 min-w-fit shrink-0 flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'analyze' 
              ? 'bg-white/10 text-white border border-white/25 shadow-[0_0_15px_rgba(56,189,248,0.18)] font-semibold' 
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
          }`}
          onClick={() => setActiveTab('analyze')}
        >
          <HelpCircle size={15} className={activeTab === 'analyze' ? 'text-sky-400 shrink-0' : 'text-slate-500 shrink-0'} />
          <span>{lang === 'ru' ? 'Анализ потерь' : 'Loss Analysis'}</span>
          <span className="hidden xl:inline text-[11px] font-mono opacity-60">(/api/analyze)</span>
        </button>

        <button
          id="btn-tab-enhance"
          className={`flex-1 min-w-fit shrink-0 flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'enhance' 
              ? 'bg-white/10 text-white border border-white/25 shadow-[0_0_15px_rgba(56,189,248,0.18)] font-semibold' 
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
          }`}
          onClick={() => setActiveTab('enhance')}
        >
          <Sparkles size={15} className={activeTab === 'enhance' ? 'text-sky-400 shrink-0' : 'text-slate-500 shrink-0'} />
          <span>{lang === 'ru' ? 'Обогащение' : 'Enrichment'}</span>
          <span className="hidden xl:inline text-[11px] font-mono opacity-60">(/api/enhance)</span>
        </button>

        <button
          id="btn-tab-tokens"
          className={`flex-1 min-w-fit shrink-0 flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'tokens' 
              ? 'bg-white/10 text-white border border-white/25 shadow-[0_0_15px_rgba(56,189,248,0.18)] font-semibold' 
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
          }`}
          onClick={() => {
            setActiveTab('tokens');
            if (!tokensResult && !tokensLoading) {
              handleOptimizeTokens();
            }
          }}
        >
          <Zap size={15} className={activeTab === 'tokens' ? 'text-emerald-400 shrink-0' : 'text-slate-500 shrink-0'} />
          <span>Token Saver</span>
          <span className="hidden sm:inline text-[11px] font-mono text-emerald-400 font-semibold">(-65%)</span>
        </button>
      </div>

      <div className="p-3.5 sm:p-5 md:p-6">
        {/* Quick Presets Carousel */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-sans font-medium text-slate-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-sky-400" />
              {t[lang].presetsLabel}
            </h3>
            <span className="text-[11px] text-sky-400/80 font-mono">1-click preset</span>
          </div>

          {activeTab === 'tokens' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {TOKEN_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  id={`btn-token-example-${i}`}
                  className="text-left p-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-sky-400/40 rounded-xl transition-all duration-200 group text-xs cursor-pointer shadow-sm flex flex-col justify-between"
                  onClick={() => {
                    setTokensPromptVal(ex.prompt);
                    handleOptimizeTokens(ex.prompt);
                  }}
                >
                  <div>
                    <span className="font-mono text-[9px] font-bold text-sky-300 bg-sky-400/15 px-1.5 py-0.5 rounded border border-sky-400/30 uppercase mb-1 inline-block">
                      {ex.category}
                    </span>
                    <div className="font-sans text-slate-200 text-xs line-clamp-2">
                      «{ex.prompt}»
                    </div>
                  </div>
                  <div className="text-[10px] text-sky-300 font-mono flex items-center gap-1 mt-2 group-hover:text-white">
                    <span>⚡ Тест экономии</span>
                    <ArrowRight size={10} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {DEMO_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  id={`btn-example-${i}`}
                  className="text-left p-2.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-sky-400/40 rounded-xl transition-all duration-200 group text-xs cursor-pointer shadow-sm flex flex-col justify-between overflow-hidden"
                  onClick={() => selectExample(ex)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-[9px] font-bold text-sky-300 bg-sky-400/15 px-1.5 py-0.5 rounded border border-sky-400/30 uppercase">
                        {ex.lang}
                      </span>
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 text-sky-400 transform translate-x-0 group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>
                    <div className="font-sans font-bold text-white truncate">
                      «{ex.text}»
                    </div>
                    <div className="text-slate-400 truncate text-[11px] font-mono">→ {ex.literal}</div>
                  </div>
                  <div className="text-slate-400 font-mono text-[10px] mt-1.5 truncate">
                    {ex.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1: COMPARE (Cultural QA Linter) */}
        <AnimatePresence mode="wait">
          {activeTab === 'compare' && (
            <motion.div
              key="tab-compare"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    § {t[lang].sourceTextLabel}
                  </label>
                  <textarea
                    id="input-compare-source"
                    value={compareSourceVal}
                    onChange={(e) => setCompareSourceVal(e.target.value)}
                    rows={3}
                    placeholder={t[lang].sourceTextPlaceholder}
                    className="w-full bg-black/40 border border-white/15 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-all duration-200 text-sm resize-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    § {t[lang].targetTextLabel}
                  </label>
                  <textarea
                    id="input-compare-target"
                    value={compareTargetVal}
                    onChange={(e) => setCompareTargetVal(e.target.value)}
                    rows={3}
                    placeholder={t[lang].targetTextPlaceholder}
                    className="w-full bg-black/40 border border-white/15 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-all duration-200 text-sm resize-none font-sans"
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="font-sans">Target language:</span>
                  <select
                    value={compareLanguage}
                    onChange={(e) => setCompareLanguage(e.target.value)}
                    className="bg-black/60 border border-white/15 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
                  >
                    <option value="en">English (EN)</option>
                    <option value="es">Spanish (ES)</option>
                    <option value="de">German (DE)</option>
                    <option value="zh">Chinese (ZH)</option>
                    <option value="ru">Russian (RU)</option>
                  </select>
                </div>

                <button
                  id="btn-trigger-compare"
                  disabled={compareLoading || !compareSourceVal.trim() || !compareTargetVal.trim()}
                  onClick={() => handleCompare()}
                  className="celestial-btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-sans font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 border border-sky-400/40 tracking-wide cursor-pointer disabled:opacity-40 shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] active:scale-98 transition-all"
                >
                  {compareLoading ? (
                    <RefreshCw size={14} className="animate-spin text-sky-200" />
                  ) : (
                    <Scale size={14} className="text-sky-200" />
                  )}
                  {t[lang].btnCompare}
                </button>
              </div>

              {/* Error block */}
              {compareError && (
                <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl flex gap-3 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <span className="font-bold">{t[lang].requestError}</span> {compareError}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {compareLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <RefreshCw className="animate-spin text-sky-400" size={32} />
                  <p className="text-sm font-medium animate-pulse font-sans text-sky-300">
                    {t[lang].loadingCompare}
                  </p>
                </div>
              )}

              {/* Result State: Linter Dashboard */}
              {compareResult && (
                <div className="flex flex-col gap-4 mt-2">
                  {/* Top Score Banner */}
                  <div className={`p-4 md:p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/[0.03] backdrop-blur-xl ${getScoreColor(compareResult.score).border}`}>
                    <div className="flex items-center gap-4">
                      {/* Circular Gauge Representation */}
                      <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center font-mono border ${getScoreColor(compareResult.score).bg} ${getScoreColor(compareResult.score).border}`}>
                        <span className={`text-2xl font-bold leading-none ${getScoreColor(compareResult.score).text}`}>
                          {compareResult.score ?? 0}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">/ 100</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                          § {t[lang].verdictLabel}
                        </span>
                        <h3 className={`text-lg font-bold font-sans ${getScoreColor(compareResult.score).text}`}>
                          {compareResult.verdict}
                        </h3>
                        <p className="text-xs text-slate-400 font-sans">
                          {compareResult.issues.length === 0 
                            ? "Zero pragmatic distortion detected" 
                            : `${compareResult.issues.length} linguistic issue(s) flattening the cultural intent`}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons: Copy & Export */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={handleCopyBugReport}
                        className="flex items-center gap-2 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white rounded-xl border border-white/10 text-xs font-sans font-medium transition-all duration-200 cursor-pointer"
                        title={lang === 'ru' ? "Скопировать баг-репорт" : "Copy bug report"}
                      >
                        {copiedBugReport ? (
                          <>
                            <Check size={14} className="text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">{t[lang].bugReportCopied}</span>
                          </>
                        ) : (
                          <>
                            <FileText size={14} className="text-amber-400" />
                            <span>{t[lang].copyBugReport}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleExportCompare('md')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 hover:text-white rounded-xl border border-sky-400/25 text-xs font-sans font-medium transition-all cursor-pointer"
                        title={lang === 'ru' ? "Скачать отчёт в Markdown" : "Download Markdown report"}
                      >
                        <Download size={13} className="text-sky-300" />
                        <span>.MD</span>
                      </button>

                      <button
                        onClick={() => handleExportCompare('json')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 hover:text-white rounded-xl border border-sky-400/25 text-xs font-sans font-medium transition-all cursor-pointer"
                        title={lang === 'ru' ? "Скачать данные в JSON" : "Download JSON data"}
                      >
                        <Download size={13} className="text-sky-300" />
                        <span>.JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Issues List with Git-Style Diff */}
                  {compareResult.issues.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-sans font-bold text-amber-300 uppercase tracking-wider">
                        § Обнаруженные культурные расхождения:
                      </h4>

                      {compareResult.issues.map((issue, idx) => (
                        <div 
                          key={idx}
                          className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/10 p-4 flex flex-col gap-3 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-sm px-2.5 py-0.5 bg-black/40 text-amber-300 rounded-lg border border-amber-400/30 font-bold">
                                "{issue.fragment}"
                              </span>
                              <span className="text-xs font-sans font-medium text-white">
                                {issue.short}
                              </span>
                            </div>
                            <div>
                              {getSeverityBadge(issue.severity)}
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {issue.explanation}
                          </p>

                          {/* Git-Style Diff Block */}
                          <div className="bg-black/50 rounded-xl p-3 border border-white/10 font-mono text-xs flex flex-col gap-1.5">
                            <div className="flex items-start gap-2 text-rose-300/90">
                              <span className="select-none font-bold text-rose-500">- Given:</span>
                              <span className="line-through opacity-85">"{compareResult.target}"</span>
                            </div>
                            <div className="flex items-start gap-2 text-emerald-300 font-medium">
                              <span className="select-none font-bold text-emerald-400">+ Faithful:</span>
                              <span>"{issue.alternative}"</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 bg-white/[0.03] border border-emerald-500/30 rounded-xl text-center text-slate-300 text-sm flex flex-col items-center gap-2">
                      <CheckCircle2 size={28} className="text-emerald-400" />
                      <p className="font-medium font-sans">{t[lang].noCompareIssues}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 2: ANALYZE */}
          {activeTab === 'analyze' && (
            <motion.div
              key="tab-analyze"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <div>
                <label className="block text-xs font-sans font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                  § {t[lang].inputTextLabel}
                </label>
                <div className="relative">
                  <textarea
                    id="input-analyze-text"
                    value={analyzeTextVal}
                    onChange={(e) => setAnalyzeTextVal(e.target.value)}
                    rows={3}
                    placeholder={t[lang].inputTextPlaceholder}
                    className="w-full bg-black/40 border border-white/15 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-all duration-200 text-sm resize-none font-sans"
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <select
                      value={analyzeLanguage}
                      onChange={(e) => setAnalyzeLanguage(e.target.value)}
                      className="bg-black/60 border border-white/15 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
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
                      className="celestial-btn-primary flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-sans font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 border border-sky-400/40 tracking-wide cursor-pointer disabled:opacity-40 shadow-[0_0_15px_rgba(56,189,248,0.25)] hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-98 transition-all"
                    >
                      {analyzeLoading ? (
                        <RefreshCw size={13} className="animate-spin text-sky-200" />
                      ) : (
                        <Play size={13} className="text-sky-200" />
                      )}
                      {t[lang].btnAnalyze}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error block */}
              {analyzeError && (
                <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl flex gap-3 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <span className="font-bold">{t[lang].requestError}</span> {analyzeError}
                  </div>
                </div>
              )}

              {/* Loading */}
              {analyzeLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <RefreshCw className="animate-spin text-sky-400" size={32} />
                  <p className="text-sm font-medium animate-pulse font-sans text-sky-300">
                    {t[lang].loadingScanner}
                  </p>
                </div>
              )}

              {/* Result */}
              {analyzeResult && (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="bg-white/[0.03] backdrop-blur-xl p-4 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 relative group/card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                          § {t[lang].literalLabel} ({analyzeLanguage.toUpperCase()})
                        </h4>
                        <button
                          onClick={handleCopyLiteral}
                          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors duration-200 cursor-pointer"
                          title="Copy literal translation"
                        >
                          {copiedLiteral ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <p className="text-lg text-white font-sans font-medium">
                        "{analyzeResult.literal_translation}"
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="px-3.5 py-2 bg-black/40 border border-amber-400/30 rounded-xl text-center">
                        <span className="block text-2xl font-bold font-sans text-amber-300 leading-none">
                          {analyzeResult.items.length}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                          {t[lang].lossesCount}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleExportAnalyze('md')}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 hover:text-white rounded-lg border border-sky-400/25 text-[11px] font-sans font-medium transition-all cursor-pointer"
                          title={lang === 'ru' ? "Скачать отчёт в Markdown" : "Download Markdown report"}
                        >
                          <Download size={11} className="text-sky-300" />
                          <span>.MD</span>
                        </button>
                        <button
                          onClick={() => handleExportAnalyze('json')}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 hover:text-white rounded-lg border border-sky-400/25 text-[11px] font-sans font-medium transition-all cursor-pointer"
                          title={lang === 'ru' ? "Скачать данные в JSON" : "Download JSON data"}
                        >
                          <Download size={11} className="text-sky-300" />
                          <span>.JSON</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {analyzeResult.items.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-sans font-bold text-amber-300 uppercase tracking-wider">
                        § {t[lang].detectedLosses}
                      </h4>
                      <div className="flex flex-col gap-3">
                        {analyzeResult.items.map((item, index) => (
                          <LossCard key={index} item={item} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-xl text-center text-slate-400 font-sans text-sm">
                      {t[lang].noLosses}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 3: ENHANCE */}
          {activeTab === 'enhance' && (
            <motion.div
              key="tab-enhance"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    § {t[lang].inputPromptLabel}
                  </label>
                  <input
                    id="input-enhance-prompt"
                    type="text"
                    value={enhancePromptVal}
                    onChange={(e) => setEnhancePromptVal(e.target.value)}
                    placeholder={t[lang].inputPromptPlaceholder}
                    className="w-full bg-black/40 border border-white/15 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none transition-colors duration-200 text-sm font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    § {t[lang].inputKeyLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="input-enhance-key"
                      type="text"
                      value={enhanceApiKey}
                      onChange={(e) => setEnhanceApiKey(e.target.value)}
                      placeholder="ltk_..."
                      className="w-full bg-black/40 border border-white/15 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 rounded-xl pl-4 pr-24 py-2.5 text-slate-200 font-mono text-xs focus:outline-none transition-colors duration-200"
                    />
                    <div className="absolute right-1.5 top-1.5 px-2 py-1 bg-white/[0.06] border border-white/10 rounded-lg text-[9px] font-bold text-amber-300 uppercase tracking-wider">
                      {t[lang].inputKeySandbox}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                  § {t[lang].inputEnhanceTextLabel}
                </label>
                <textarea
                  id="input-enhance-text"
                  value={enhanceTextVal}
                  onChange={(e) => setEnhanceTextVal(e.target.value)}
                  rows={3}
                  placeholder={t[lang].inputEnhanceTextPlaceholder}
                  className="w-full bg-black/40 border border-white/15 focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors duration-200 text-sm resize-none font-sans"
                />
              </div>

              <div className="flex justify-end">
                <button
                  id="btn-trigger-enhance"
                  disabled={enhanceLoading || !enhancePromptVal.trim() || !enhanceTextVal.trim()}
                  onClick={handleEnhance}
                  className="celestial-btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-sans font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 border border-sky-400/40 tracking-wide cursor-pointer disabled:opacity-40 shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] active:scale-98 transition-all"
                >
                  {enhanceLoading ? (
                    <RefreshCw size={14} className="animate-spin text-sky-200" />
                  ) : (
                    <Sparkles size={14} className="text-sky-200" />
                  )}
                  {t[lang].btnEnhance}
                </button>
              </div>

              {/* Error block */}
              {enhanceError && (
                <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl flex gap-3 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <span className="font-bold">{t[lang].errorAuth}</span> {enhanceError}
                  </div>
                </div>
              )}

              {/* Loading */}
              {enhanceLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <RefreshCw className="animate-spin text-sky-400" size={32} />
                  <p className="text-sm font-medium animate-pulse font-sans text-sky-300">
                    {t[lang].loadingEnricher}
                  </p>
                </div>
              )}

              {/* Results */}
              {enhanceResult && (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="bg-white/[0.03] backdrop-blur-xl p-4 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-400/10 text-emerald-400 rounded-xl border border-emerald-400/20">
                        <Check size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-sans font-bold text-white">
                          § {t[lang].successTitle}
                        </h4>
                        <p className="text-xs text-slate-400 font-sans">
                          {t[lang].successSubtitle} <span className="text-amber-300 font-bold font-mono">{enhanceResult.losses_detected}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.03] backdrop-blur-xl p-4 rounded-xl border border-white/10 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-sans font-bold text-amber-300 uppercase tracking-wider">
                        § {t[lang].afterEnrichment}
                      </span>
                      <button
                        onClick={handleCopyEnhanced}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
                      >
                        {copiedEnhanced ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedEnhanced ? t[lang].btnCopied : t[lang].btnCopy}
                      </button>
                    </div>
                    <pre className="text-xs text-white font-mono whitespace-pre-wrap leading-relaxed bg-black/50 p-3 rounded-xl border border-white/10 max-h-60 overflow-y-auto">
                      {enhanceResult.enhanced_prompt}
                    </pre>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: TOKEN SAVER & BRIDGE */}
          {activeTab === 'tokens' && (
            <motion.div
              key="tab-tokens"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              {/* Educational Editorial Banner */}
              <div className="p-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl flex items-start gap-3">
                <div className="p-2.5 bg-amber-400/10 text-amber-300 rounded-xl border border-amber-400/30 shrink-0 mt-0.5">
                  <Zap size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                    <span>§ {t[lang].tokensHeading}</span>
                    <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      -65% COST
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                    {t[lang].tokensSubheading}
                  </p>
                </div>
              </div>

              {/* Input Form */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-sans font-medium text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>§ {t[lang].tokensInputLabel}</span>
                    <span className="text-[11px] text-amber-400 font-mono normal-case">
                      {tokensPromptVal.length} симв. • ~{Math.round(tokensPromptVal.length * 0.57)} токенов в Claude
                    </span>
                  </label>
                  <textarea
                    id="input-tokens-prompt"
                    value={tokensPromptVal}
                    onChange={(e) => setTokensPromptVal(e.target.value)}
                    rows={3}
                    placeholder={t[lang].tokensInputPlaceholder}
                    className="w-full bg-black/40 border border-white/15 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors duration-200 text-sm resize-none font-sans"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-300 font-sans">{t[lang].tokensTargetLangLabel}</span>
                    <select
                      value={tokensTargetLang}
                      onChange={(e) => setTokensTargetLang(e.target.value)}
                      className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-400"
                    >
                      <option value="Russian">Русский (Russian)</option>
                      <option value="English">English</option>
                      <option value="German">Deutsch</option>
                      <option value="Japanese">日本語 (Japanese)</option>
                    </select>
                  </div>

                  <button
                    id="btn-trigger-optimize-tokens"
                    disabled={tokensLoading || !tokensPromptVal.trim()}
                    onClick={() => handleOptimizeTokens()}
                    className="celestial-btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-sans font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 border border-sky-400/40 tracking-wide cursor-pointer disabled:opacity-40 shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] active:scale-98 transition-all"
                  >
                    {tokensLoading ? (
                      <RefreshCw size={14} className="animate-spin text-sky-200" />
                    ) : (
                      <Zap size={14} className="text-sky-200" />
                    )}
                    <span>{t[lang].btnOptimizeTokens}</span>
                  </button>
                </div>
              </div>

              {/* Error Block */}
              {tokensError && (
                <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl flex gap-3 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <span className="font-bold">Ошибка:</span> {tokensError}
                  </div>
                </div>
              )}

              {/* Loading */}
              {tokensLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <RefreshCw className="animate-spin text-sky-400" size={32} />
                  <p className="text-sm font-medium animate-pulse font-sans text-sky-300">
                    {t[lang].loadingOptimizer}
                  </p>
                </div>
              )}

              {/* Results */}
              {tokensResult && (
                <div className="flex flex-col gap-4 mt-2">
                  {/* Economics & Token Savings Cards */}
                  <div>
                    <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-amber-300 mb-2">
                      § {t[lang].tokenSavingsTitle}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Claude Card */}
                      <div className="p-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-sans font-bold text-sm text-white">
                            {t[lang].claudeTokensLabel}
                          </span>
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full border ${
                            tokensResult.token_stats.saved_claude_percent > 0
                              ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                              : 'text-slate-400 bg-slate-800/40 border-slate-700/50'
                          }`}>
                            {tokensResult.token_stats.saved_claude_percent > 0 
                              ? `-${tokensResult.token_stats.saved_claude_percent}% токенов` 
                              : `0% токенов`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/10">
                          <div>
                            <span className="text-slate-400 text-[10px] block">КИРИЛЛИЦА (Claude)</span>
                            <span className="text-rose-400 font-bold">{tokensResult.token_stats.original_claude_tokens} токенов</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">LIT BRIDGE (English)</span>
                            <span className={`font-bold ${
                              tokensResult.token_stats.optimized_claude_tokens < tokensResult.token_stats.original_claude_tokens
                                ? 'text-emerald-400'
                                : 'text-slate-300'
                            }`}>
                              {tokensResult.token_stats.optimized_claude_tokens} токенов
                            </span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-2 font-sans">
                          {tokensResult.token_stats.saved_claude_tokens > 0 ? (
                            <>
                              Экономия: <span className="text-emerald-400 font-mono font-bold">~{tokensResult.token_stats.saved_claude_tokens} токенов</span> на запросе (расход снижен в <span className="text-amber-300 font-mono font-bold">{(tokensResult.token_stats.original_claude_tokens / Math.max(1, tokensResult.token_stats.optimized_claude_tokens)).toFixed(1)}x</span>)
                            </>
                          ) : (
                            <span className="text-slate-400 italic">Экономия раскрывается на промптах от 15–20 слов</span>
                          )}
                        </div>
                      </div>

                      {/* GPT Card */}
                      <div className="p-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-sans font-bold text-sm text-white">
                            {t[lang].gptTokensLabel}
                          </span>
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full border ${
                            tokensResult.token_stats.saved_gpt_percent > 0
                              ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                              : 'text-slate-400 bg-slate-800/40 border-slate-700/50'
                          }`}>
                            {tokensResult.token_stats.saved_gpt_percent > 0 
                              ? `-${tokensResult.token_stats.saved_gpt_percent}% токенов` 
                              : `0% токенов`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/10">
                          <div>
                            <span className="text-slate-400 text-[10px] block">КИРИЛЛИЦА (GPT)</span>
                            <span className="text-rose-400 font-bold">{tokensResult.token_stats.original_gpt_tokens} токенов</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">LIT BRIDGE (English)</span>
                            <span className={`font-bold ${
                              tokensResult.token_stats.optimized_gpt_tokens < tokensResult.token_stats.original_gpt_tokens
                                ? 'text-emerald-400'
                                : 'text-slate-300'
                            }`}>
                              {tokensResult.token_stats.optimized_gpt_tokens} токенов
                            </span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-2 font-sans">
                          {tokensResult.token_stats.saved_gpt_tokens > 0 ? (
                            <>
                              Экономия: <span className="text-emerald-400 font-mono font-bold">~{tokensResult.token_stats.saved_gpt_tokens} токенов</span> на запросе (расход снижен в <span className="text-amber-300 font-mono font-bold">{(tokensResult.token_stats.original_gpt_tokens / Math.max(1, tokensResult.token_stats.optimized_gpt_tokens)).toFixed(1)}x</span>)
                            </>
                          ) : (
                            <span className="text-slate-400 italic">Экономия раскрывается на промптах от 15–20 слов</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preserved Cultural Nuances */}
                  {tokensResult.cultural_nuances_preserved.length > 0 && (
                    <div className="p-3.5 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl">
                      <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-amber-300 block mb-2">
                        § {t[lang].preservedNuancesTitle}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tokensResult.cultural_nuances_preserved.map((nuance, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-sans bg-amber-400/10 border border-amber-400/30 text-amber-300"
                          >
                            <Sparkles size={11} className="text-amber-400" />
                            {nuance}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optimized English Prompt Ready to Copy */}
                  <div className="bg-white/[0.03] backdrop-blur-xl p-4 rounded-xl border border-white/10 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-sans font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap size={13} className="text-amber-400" />
                        § {t[lang].optimizedPromptTitle}
                      </span>
                      <button
                        onClick={handleCopyTokensPrompt}
                        className="celestial-btn-primary flex items-center gap-1.5 text-xs text-sky-100 bg-sky-500/20 hover:bg-sky-500/30 px-3 py-1.5 rounded-lg border border-sky-400/30 cursor-pointer transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)] font-sans"
                      >
                        {copiedTokensPrompt ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-sky-300" />}
                        {copiedTokensPrompt ? t[lang].btnCopied : t[lang].btnCopyOptimized}
                      </button>
                    </div>
                    <pre className="text-xs text-white font-mono whitespace-pre-wrap leading-relaxed bg-black/50 p-3 rounded-xl border border-white/10 max-h-60 overflow-y-auto">
                      {tokensResult.full_optimized_prompt}
                    </pre>
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
