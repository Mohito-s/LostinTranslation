import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, AlertCircle, Check, ShieldCheck, ArrowRight, BookOpen, Layers, Zap, Info } from 'lucide-react';

interface SimulatorCase {
  id: string;
  titleRu: string;
  titleEn: string;
  sourceText: string;
  langCode: string;
  rawResponseRu: string;
  rawResponseEn: string;
  rawAccuracy: number;
  enrichedResponseRu: string;
  enrichedResponseEn: string;
  enrichedAccuracy: number;
  culturalInsightRu: string;
  culturalInsightEn: string;
  contextSnippet: string;
}

const SIMULATOR_CASES: SimulatorCase[] = [
  {
    id: "jp_refusal",
    titleRu: "Японская вежливость (行けたら行く)",
    titleEn: "Japanese Politeness (行けたら行く)",
    sourceText: "行けたら行く (I will go if I can)",
    langCode: "JP",
    rawAccuracy: 35,
    rawResponseRu: "«Я обязательно постараюсь прийти, если мои дела и расписание это позволят. Я настроен позитивно!»",
    rawResponseEn: "\"I will try my best to attend if my schedule and plans permit. I feel positive about coming!\"",
    enrichedAccuracy: 98,
    enrichedResponseRu: "«Собеседник вежливо отклоняет ваше приглашение. В японском культурном коде эта фраза почти в 98% случаев означает мягкий окончательный отказ, чтобы избежать прямой конфронтации. Не планируйте его присутствие.»",
    enrichedResponseEn: "\"The speaker is politely declining your invitation. In Japanese social codes, this phrase represents a soft, face-saving 'No' in 98% of cases to avoid direct confrontation. Do not expect attendance.\"",
    culturalInsightRu: "В японской культуре гармонии (Wa) прямой отказ считается грубостью. Сочетание сослагательного наклонения с глаголом движения — стандартная лингвистическая маскировка вежливого отказа.",
    culturalInsightEn: "In Japanese harmony (Wa) culture, direct refusal is considered rude. Combining the conditional form with a motion verb is a standard linguistic mask for a polite decline.",
    contextSnippet: "politeness_level: humble_refusal, intent_reality: negative (98% probability), social_context: avoid_harm"
  },
  {
    id: "ru_sarcasm",
    titleRu: "Русский скепсис (Да нет наверное)",
    titleEn: "Russian Skepticism (Да нет наверное)",
    sourceText: "Да нет наверное (Yes no probably)",
    langCode: "RU",
    rawAccuracy: 20,
    rawResponseRu: "«Пользователь испытывает крайнюю степень нерешительности, одновременно соглашаясь (Да), отрицая (Нет) и сомневаясь (Наверное).»",
    rawResponseEn: "\"The user is experiencing extreme indecisiveness, simultaneously agreeing (Yes), denying (No), and doubting (Probably).\"",
    enrichedAccuracy: 96,
    enrichedResponseRu: "«Уверенное отрицание с мягкой модальной окраской. На русский разговорный лад эта идиома означает уверенное 'Скорее всего нет' или 'Вряд ли', выраженное в некатегоричной форме.»",
    enrichedResponseEn: "\"A confident negation with a softened modal coloring. In colloquial Russian, this idiom carries the meaning of a firm 'Most likely not' or 'Highly unlikely', wrapped in a non-confrontational delivery.\"",
    culturalInsightRu: "Отрицательные модальные связки в русском языке часто строятся на сопоставлении противоположностей для создания плавности диалога и сглаживания категоричности суждения.",
    culturalInsightEn: "Negative modal clauses in Russian are often constructed by juxtaposing opposites to smooth out conversations and make judgments sound less blunt.",
    contextSnippet: "linguistic_paradox: resolved, sentiment_polarity: negative (96%), force: hesitant_negation"
  },
  {
    id: "de_jein",
    titleRu: "Немецкая дуальность (Jein)",
    titleEn: "German Dialectics (Jein)",
    sourceText: "Jein (Yes + No hybrid)",
    langCode: "DE",
    rawAccuracy: 40,
    rawResponseRu: "«Ошибка ввода или гибрид слов Ja (Да) и Nein (Нет). Требуется уточнение у пользователя.»",
    rawResponseEn: "\"Input error or a hybrid of the words Ja (Yes) and Nein (No). Requires clarification from the user.\"",
    enrichedAccuracy: 95,
    enrichedResponseRu: "«Философское согласие с важными оговорками. Означает, что ответ является утвердительным в одних условиях и отрицательным в других. Модель должна рассмотреть оба сценария.»",
    enrichedResponseEn: "\"A philosophical agreement accompanied by critical caveats. Indicates that the answer is affirmative under certain conditions and negative under others. Both paths must be parsed.\"",
    culturalInsightRu: "Портманто «Jein» выражает рациональную немецкую точность: нежелание давать упрощенный двоичный ответ там, где ситуация объективно многогранна.",
    culturalInsightEn: "The portmanteau 'Jein' reflects rational German precision: a refusal to give a simplistic binary response when a situation is objectively multi-layered.",
    contextSnippet: "modal_duality: dual_state, trigger_split_analysis: true, certainty_ratio: 50_50_conditional"
  }
];

export default function PromptSimulator({ lang = 'ru' }: { lang?: 'ru' | 'en' }) {
  const [activeCaseId, setActiveCaseId] = useState<string>("jp_refusal");
  const currentCase = SIMULATOR_CASES.find(c => c.id === activeCaseId) || SIMULATOR_CASES[0];

  const t = {
    ru: {
      sectionTitle: "Интерактивный симулятор точности LLM",
      sectionSubtitle: "Сравните, как обычная нейросеть ломается на культурных барьерах и как LostInTranslation решает это за секунды.",
      rawTitle: "До обогащения (Обычный запрос)",
      enrichedTitle: "С LostInTranslation API",
      accuracyLabel: "Точность понимания смысла:",
      resultTitle: "Интерпретация ИИ:",
      culturalInsight: "Культурный лингвистический инсайт:",
      apiSnippetTitle: "Сгенерированная мета-разметка контекста:",
      testPreset: "Выбрать языковой прецедент:",
      benefitCheck1: "Предотвращает ложные срабатывания",
      benefitCheck2: "Распознает иронию, вежливость и реальный отказ",
      benefitCheck3: "Повышает CSAT приложений до 40% на глобальном рынке"
    },
    en: {
      sectionTitle: "Interactive LLM Comprehension Simulator",
      sectionSubtitle: "Compare how standard LLMs lose core intent on cultural barriers and how LostInTranslation fixes it instantly.",
      rawTitle: "Before Enrichment (Raw Query)",
      enrichedTitle: "With LostInTranslation API",
      accuracyLabel: "Comprehension Accuracy:",
      resultTitle: "AI Interpretation Output:",
      culturalInsight: "Cultural Linguistic Insight:",
      apiSnippetTitle: "Generated Context Meta-Tagging:",
      testPreset: "Select Cultural Precedent:",
      benefitCheck1: "Prevents toxic misinterpretation false-positives",
      benefitCheck2: "Accurately parses irony, modesty, and real intent",
      benefitCheck3: "Boosts global app CSAT ratings by up to 40%"
    }
  };

  return (
    <div id="prompt-simulator-widget" className="bg-slate-900/40 rounded-3xl border border-slate-900 p-6 md:p-8 relative overflow-hidden">
      {/* Visual decorative accents - corner crosshairs */}
      <div className="absolute top-3 left-3 text-slate-800 font-mono text-[10px] select-none">+</div>
      <div className="absolute top-3 right-3 text-slate-800 font-mono text-[10px] select-none">+</div>
      <div className="absolute bottom-3 left-3 text-slate-800 font-mono text-[10px] select-none">+</div>
      <div className="absolute bottom-3 right-3 text-slate-800 font-mono text-[10px] select-none">+</div>

      <div className="flex flex-col gap-6">
        <div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10 uppercase tracking-wider font-semibold">
            Interactive Simulator
          </span>
          <h3 className="text-xl md:text-2xl font-display font-bold text-white mt-3">
            {t[lang].sectionTitle}
          </h3>
          <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-2xl">
            {t[lang].sectionSubtitle}
          </p>
        </div>

        {/* Case Selector Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-900">
          <span className="text-slate-500 text-xs font-mono font-bold flex items-center px-3 uppercase shrink-0 py-1 sm:py-0">
            {t[lang].testPreset}
          </span>
          <div className="flex flex-wrap gap-2 w-full">
            {SIMULATOR_CASES.map((c) => (
              <button
                key={c.id}
                id={`btn-sim-case-${c.id}`}
                onClick={() => setActiveCaseId(c.id)}
                className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  activeCaseId === c.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-mono bg-slate-950/60 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5 border border-emerald-500/10">
                  {c.langCode}
                </span>
                {lang === 'ru' ? c.titleRu : c.titleEn}
              </button>
            ))}
          </div>
        </div>

        {/* Core Side-by-Side Comparison Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          
          {/* Panel 1: RAW / Lacks Context */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-900 p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
                <AlertCircle size={15} className="text-slate-500" />
                {t[lang].rawTitle}
              </span>
              <span className="px-2 py-0.5 bg-slate-900 text-slate-500 rounded-full font-mono text-[10px] border border-slate-850">
                RAW TRANSLATION
              </span>
            </div>

            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900/60 text-xs font-mono text-slate-300">
              <span className="text-slate-500 block mb-1">User input phrase:</span>
              <span className="text-sm text-slate-200 font-semibold italic">"{currentCase.sourceText}"</span>
            </div>

            {/* Accuracy Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-500">{t[lang].accuracyLabel}</span>
                <span className="text-rose-400 font-bold">{currentCase.rawAccuracy}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 transition-all duration-500" 
                  style={{ width: `${currentCase.rawAccuracy}%` }}
                />
              </div>
            </div>

            {/* Simulated Response */}
            <div className="flex-grow bg-slate-900/20 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t[lang].resultTitle}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans italic">
                {lang === 'ru' ? currentCase.rawResponseRu : currentCase.rawResponseEn}
              </p>
            </div>
          </div>

          {/* Panel 2: ENRICHED / With LIT API */}
          <div className="bg-slate-950/80 rounded-2xl border border-emerald-500/10 p-5 flex flex-col gap-4 relative shadow-lg shadow-emerald-950/5">
            <div className="absolute top-0 right-8 -translate-y-1/2 px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded uppercase tracking-wider font-mono">
              Enriched Layer
            </div>
            
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles size={15} className="text-emerald-400 animate-pulse" />
                {t[lang].enrichedTitle}
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-mono text-[10px] font-bold border border-emerald-500/15">
                ✓ LIT API ACTIVE
              </span>
            </div>

            {/* Generated Meta tag snippet */}
            <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-xs font-mono text-emerald-300">
              <span className="text-emerald-500/70 block mb-1 font-sans font-bold text-[10px] uppercase tracking-wider">
                {t[lang].apiSnippetTitle}
              </span>
              <code className="text-[10px] font-bold break-all">
                {"{"} {currentCase.contextSnippet} {"}"}
              </code>
            </div>

            {/* Accuracy Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-400">{t[lang].accuracyLabel}</span>
                <span className="text-emerald-400 font-bold">{currentCase.enrichedAccuracy}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${currentCase.enrichedAccuracy}%` }}
                />
              </div>
            </div>

            {/* Simulated Response */}
            <div className="flex-grow bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 flex flex-col gap-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {t[lang].resultTitle}
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                {lang === 'ru' ? currentCase.enrichedResponseRu : currentCase.enrichedResponseEn}
              </p>
            </div>
          </div>

        </div>

        {/* Detailed Insights Footer */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col md:flex-row gap-4 text-xs">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 h-fit">
            <BookOpen size={16} />
          </div>
          <div>
            <h4 className="font-bold text-slate-300 mb-1">{t[lang].culturalInsight}</h4>
            <p className="text-slate-400 leading-relaxed font-sans">
              {lang === 'ru' ? currentCase.culturalInsightRu : currentCase.culturalInsightEn}
            </p>
          </div>
        </div>

        {/* Benefits Checks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-900/60 pt-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span>{t[lang].benefitCheck1}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span>{t[lang].benefitCheck2}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span>{t[lang].benefitCheck3}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
