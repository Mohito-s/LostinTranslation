import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, Github, Send, Terminal, CheckCircle2, AlertCircle, RefreshCw, BookOpen, Key } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'ru' | 'en';
  onNavigateToDocs?: () => void;
  onNavigateToDashboard?: () => void;
}

export default function SupportModal({
  isOpen,
  onClose,
  lang = 'ru',
  onNavigateToDocs,
  onNavigateToDashboard
}: SupportModalProps) {
  const [healthStatus, setHealthStatus] = useState<{ status: string; uptime: number; latencyMs: number } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  const checkServerHealth = async () => {
    setCheckingHealth(true);
    setHealthError(null);
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const end = performance.now();
      if (res.ok) {
        const data = await res.json();
        setHealthStatus({
          status: data.status,
          uptime: Math.round(data.uptime || 0),
          latencyMs: Math.round(end - start)
        });
      } else {
        setHealthError(`Server returned status ${res.status}`);
      }
    } catch (err: any) {
      setHealthError(err.message || 'Failed to connect to /api/health');
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkServerHealth();
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const t = {
    ru: {
      title: "Поддержка разработчиков & Диагностика",
      subtitle: "Прямой мониторинг инстанса LostInTranslation и каналы связи с командой",
      serverStatus: "Статус локального сервера",
      checking: "Проверка...",
      recheck: "Проверить снова",
      online: "Шлюз активен",
      offline: "Нет связи с сервером",
      uptime: "Время работы:",
      latency: "Задержка:",
      contactsTitle: "Каналы связи и исходный код",
      githubBtn: "Репозиторий GitHub",
      githubDesc: "Открытый исходный код (AGPL-3.0), баг-трекер и обсуждения",
      telegramBtn: "Telegram сообщество",
      telegramDesc: "Оперативная связь с автором и разработчиками middleware",
      faqTitle: "Быстрые ответы разработчикам",
      q1: "Как протестировать API прямо сейчас с сервера?",
      a1: "Выполните в терминале curl.exe http://localhost:3000/api/health или перейдите в раздел Документация API для интерактивного тестирования.",
      q2: "Где взять токен для боевых вызовов /api/enhance?",
      a2: "Откройте вкладку «Кабинет API» и сгенерируйте бесплатный Sandbox-ключ на 50 запросов в день за 2 секунды.",
      closeBtn: "Закрыть окно",
      docsBtn: "Открыть документацию API",
      dashBtn: "Кабинет API токенов"
    },
    en: {
      title: "Developer Support & Diagnostics",
      subtitle: "Live status check for your LostInTranslation instance and developer contacts",
      serverStatus: "Local Server Status",
      checking: "Checking...",
      recheck: "Re-check status",
      online: "Gateway Operational",
      offline: "Connection Failed",
      uptime: "Uptime:",
      latency: "Latency:",
      contactsTitle: "Direct Channels & Source Code",
      githubBtn: "GitHub Repository",
      githubDesc: "Open-source codebase (AGPL-3.0), issue tracker & releases",
      telegramBtn: "Telegram Community",
      telegramDesc: "Direct chat with maintainers and integration discussions",
      faqTitle: "Quick Developer FAQ",
      q1: "How to test the API locally right now?",
      a1: "Run curl http://localhost:3000/api/health in your shell or use the interactive runner in the API Documentation tab.",
      q2: "How to get an API key for /api/enhance?",
      a2: "Navigate to the «API Keys» tab and generate a free Sandbox key (50 req/day) instantly.",
      closeBtn: "Close Window",
      docsBtn: "Open API Docs",
      dashBtn: "API Dashboard"
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#05070a]/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative frosted-card bg-black/85 backdrop-blur-3xl border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl text-white z-10"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  § SUPPORT & TELEMETRY
                </span>
                <h3 className="text-xl md:text-2xl font-sans font-bold text-white mt-2">
                  {t[lang].title}
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  {t[lang].subtitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="py-6 flex flex-col gap-6">
              
              {/* Server Diagnostics Box */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-emerald-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                      {t[lang].serverStatus}
                    </span>
                  </div>
                  <button
                    onClick={checkServerHealth}
                    disabled={checkingHealth}
                    className="text-[11px] font-mono flex items-center gap-1.5 text-sky-300 hover:text-white bg-sky-400/10 hover:bg-sky-400/20 px-2.5 py-1 rounded-lg border border-sky-400/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={checkingHealth ? "animate-spin" : ""} />
                    {checkingHealth ? t[lang].checking : t[lang].recheck}
                  </button>
                </div>

                {healthError ? (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{t[lang].offline}: {healthError}</span>
                  </div>
                ) : healthStatus ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-black/40 p-3 rounded-lg border border-white/10 flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">STATUS</span>
                        <span className="text-xs font-sans font-bold text-emerald-400">{t[lang].online}</span>
                      </div>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                      <span className="text-[10px] text-slate-400 block font-mono">{t[lang].latency}</span>
                      <span className="text-xs font-mono font-bold text-amber-300">{healthStatus.latencyMs} ms</span>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                      <span className="text-[10px] text-slate-400 block font-mono">{t[lang].uptime}</span>
                      <span className="text-xs font-mono text-slate-300">{healthStatus.uptime} sec</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 animate-pulse font-sans">
                    {t[lang].checking}
                  </div>
                )}
              </div>

              {/* Developer Channels */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-sans font-bold text-amber-300 tracking-wide uppercase">
                  § {t[lang].contactsTitle}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="https://github.com/Mohito-s/LostinTranslation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-sky-400/40 rounded-xl transition-all group flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-slate-200 group-hover:text-sky-300 font-sans font-bold text-sm">
                        <Github size={16} />
                        <span>{t[lang].githubBtn}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">
                        {t[lang].githubDesc}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-sky-400/80 mt-3 block">github.com/Mohito-s/LostinTranslation ↗</span>
                  </a>

                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-sky-400/40 rounded-xl transition-all group flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-slate-200 group-hover:text-sky-300 font-sans font-bold text-sm">
                        <Send size={16} />
                        <span>{t[lang].telegramBtn}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">
                        {t[lang].telegramDesc}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-sky-400/80 mt-3 block">@MohitoDev • Developer Community ↗</span>
                  </a>
                </div>
              </div>

              {/* Developer FAQ */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-sans font-bold text-sky-300 tracking-wide uppercase">
                  § {t[lang].faqTitle}
                </h4>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex flex-col gap-3 text-xs shadow-sm">
                  <div>
                    <h5 className="font-sans font-bold text-white mb-1">
                      1. {t[lang].q1}
                    </h5>
                    <p className="text-slate-400 font-sans leading-relaxed">
                      {t[lang].a1}
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <h5 className="font-sans font-bold text-white mb-1">
                      2. {t[lang].q2}
                    </h5>
                    <p className="text-slate-400 font-sans leading-relaxed">
                      {t[lang].a2}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {onNavigateToDocs && (
                  <button
                    onClick={() => { onClose(); onNavigateToDocs(); }}
                    className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs font-sans rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen size={13} className="text-sky-400" />
                    {t[lang].docsBtn}
                  </button>
                )}
                {onNavigateToDashboard && (
                  <button
                    onClick={() => { onClose(); onNavigateToDashboard(); }}
                    className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs font-sans rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Key size={13} className="text-sky-400" />
                    {t[lang].dashBtn}
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="celestial-btn-primary px-4 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 border border-sky-400/40 font-sans font-bold text-xs rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.25)] hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-98"
              >
                {t[lang].closeBtn}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
