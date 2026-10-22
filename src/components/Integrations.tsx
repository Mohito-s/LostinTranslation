import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Workflow, 
  Terminal, 
  Copy, 
  Check, 
  ArrowRight, 
  Layers, 
  Zap, 
  Sparkles, 
  GitBranch, 
  MessageSquare, 
  Headphones, 
  Cpu, 
  Code2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface IntegrationItem {
  id: string;
  category: 'ai' | 'cicd' | 'support' | 'bots';
  name: string;
  badge: string;
  descriptionRu: string;
  descriptionEn: string;
  language: 'typescript' | 'python' | 'yaml' | 'bash';
  code: string;
  demoPrompt?: string;
}

const INTEGRATIONS_DATA: IntegrationItem[] = [
  {
    id: 'openai-proxy',
    category: 'ai',
    name: 'OpenAI SDK (Drop-in Proxy)',
    badge: '1-Line URL Swap (-50% Tokens)',
    descriptionRu: 'Бесшовная замена base_url в стандартном клиенте OpenAI (Python, Node.js, Cursor, LibreChat). Промпты на русском автоматически сжимаются в плотный английский, экономя до 65% токенов, а ответ приходит на чистом русском.',
    descriptionEn: 'Drop-in base_url swap for standard OpenAI client. Automatically compresses Russian prompts into high-density English (-50% to -65% tokens) and returns responses in Russian.',
    language: 'python',
    demoPrompt: 'Сделай вежливый отказ подрядчику, чтобы не сжечь мосты',
    code: `from openai import OpenAI

# ⚡ Шаг 1: Просто укажите base_url нашего семантического шлюза
client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="ltk_your_api_key"  # или ваш ключ OpenAI
)

# ⚡ Шаг 2: Пишите промпты как обычно на русском языке.
# Шлюз сожмет русский текст в плотный английский и вернет ответ на русском!
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Сделай мне вежливый, но твердый отказ подрядчику, чтобы не сжечь мосты"}
    ]
)

print(response.choices[0].message.content)`
  },
  {
    id: 'langchain',
    category: 'ai',
    name: 'LangChain / LangGraph',
    badge: 'Python & TS Middleware',
    descriptionRu: 'Встраивание семантического шлюза LIT в виде кастомного Runnable или CallbackHandler. Автоматически валидирует культурные потери перед генерацией ответа.',
    descriptionEn: 'Embed LIT cultural middleware as a LangChain Runnable or CallbackHandler. Automatically prevents cultural meaning loss before final LLM answer generation.',
    language: 'python',
    demoPrompt: '行けたら行く (Iketara iku)',
    code: `from langchain_core.runnables import RunnableLambda
import requests

def lit_cultural_guard(text: str) -> dict:
    """Interprets raw text through LostInTranslation Semantic API"""
    response = requests.post(
        "https://lostintranslation.dev/api/analyze",
        headers={"x-api-key": "ltk_your_key_here"},
        json={"text": text, "target_language": "en"}
    )
    analysis = response.json()
    if analysis.get("found"):
        print(f"⚠️ Cultural nuance detected: {analysis['items'][0]['short']}")
    return analysis

# Chain integration: Raw Input -> LIT Cultural Guard -> LLM
chain = RunnableLambda(lit_cultural_guard) | target_llm`
  },
  {
    id: 'vercel-ai-sdk',
    category: 'ai',
    name: 'Vercel AI SDK',
    badge: 'Next.js & React Middleware',
    descriptionRu: 'Интеграция в Vercel AI SDK (generateText, streamText) через wrapLanguageModel для обогащения системного промта культурным контекстом.',
    descriptionEn: 'Integrate into Vercel AI SDK via wrapLanguageModel middleware to enrich system prompts with pragmatic cultural guidance in Next.js.',
    language: 'typescript',
    demoPrompt: 'Да нет, наверное, я не успею.',
    code: `import { wrapLanguageModel, extractReasoningMiddleware } from 'ai';
import { openai } from '@ai-sdk/openai';

export const culturallyAwareModel = wrapLanguageModel({
  model: openai('gpt-4o'),
  middleware: {
    transformParams: async ({ params }) => {
      // Call LostInTranslation /api/enhance
      const res = await fetch('https://lostintranslation.dev/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.LIT_API_KEY! },
        body: JSON.stringify({ prompt: params.prompt, text: params.prompt })
      });
      const data = await res.json();
      return { ...params, prompt: data.enhanced_prompt || params.prompt };
    }
  }
});`
  },
  {
    id: 'github-actions',
    category: 'cicd',
    name: 'GitHub Actions (i18n CI Linter)',
    badge: 'Automated CI/CD Quality Gate',
    descriptionRu: 'Автоматическая проверка файлов локализации (locales/*.json, *.po) на культурные мины и потерю вежливости при каждом Pull Request.',
    descriptionEn: 'Automated CI quality gate for i18n JSON / PO files on every Pull Request, stopping subtle meaning loss before code reaches production.',
    language: 'yaml',
    code: `name: Cultural i18n Linter
on: [pull_request]

jobs:
  cultural-qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: LIT Cultural QA Check
        uses: Mohito-s/LostinTranslation@v1
        with:
          api-key: \${{ secrets.LIT_API_KEY }}
          locales-dir: './locales'
          fail-on-severity: 'high'`
  },
  {
    id: 'deepl-proxy',
    category: 'cicd',
    name: 'DeepL / Google Translate Pipeline',
    badge: 'Enrichment Proxy',
    descriptionRu: 'Пайплайн «Перевод + Культурный аудит»: переводите через DeepL, а LostInTranslation проверяет соответствие исходному намерению автора.',
    descriptionEn: 'Two-stage translation pipeline: raw translate with DeepL, then verify pragmatic accuracy and tone preservation with LIT.',
    language: 'typescript',
    code: `async function translateWithCulturalQA(rawText: string, targetLang = 'en') {
  // 1. DeepL Translation
  const deeplRes = await deeplClient.translateText(rawText, null, targetLang);
  const translated = deeplRes.text;

  // 2. Cultural QA Verification via LIT
  const litRes = await fetch('https://lostintranslation.dev/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: rawText, target: translated })
  });
  const audit = await litRes.json();

  return {
    translated,
    culturalLossDetected: audit.loss_detected,
    severity: audit.severity,
    recommendations: audit.items
  };
}`
  },
  {
    id: 'intercom-support',
    category: 'support',
    name: 'Intercom & Zendesk Copilot',
    badge: 'Customer Support Guard',
    descriptionRu: 'Защита агентов службы поддержки от непреднамеренной грубости или непонимания местных традиций общения при переписке с клиентами.',
    descriptionEn: 'Real-time pre-send guard for support desks preventing accidental impoliteness or misreading regional cultural subtleties.',
    language: 'typescript',
    demoPrompt: 'C\'est pas terrible',
    code: `// Intercom Webhook: ticket.reply.pre_send
export async function handleSupportReply(req, res) {
  const { replyText, customerCountry } = req.body;

  const check = await fetch('https://lostintranslation.dev/api/analyze', {
    method: 'POST',
    headers: { 'x-api-key': process.env.LIT_API_KEY },
    body: JSON.stringify({ text: replyText, target_language: customerCountry })
  });
  const data = await check.json();

  if (data.severity === 'high') {
    // Notify support agent before sending
    return res.json({ allow: false, warning: data.items[0].explanation });
  }
  return res.json({ allow: true });
}`
  },
  {
    id: 'telegram-bot',
    category: 'bots',
    name: 'Telegram & Discord Bots',
    badge: 'Community & Chat Bot',
    descriptionRu: 'Готовый бот-переводчик для международных чатов, который вставляет сноску с реальным значением фраз собеседников.',
    descriptionEn: 'Drop-in Telegram & Discord translation bot explaining hidden intent and context footnotes directly in international team chats.',
    language: 'python',
    demoPrompt: 'Das ist ja ein Ding!',
    code: `from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, filters
import requests

async def explain_nuance(update: Update, context):
    text = update.message.text
    res = requests.post(
        "https://lostintranslation.dev/api/analyze",
        json={"text": text, "target_language": "en"}
    ).json()
    
    if res.get("found"):
        loss = res["items"][0]
        reply = (
            f"💡 **Культурный нюанс:** {loss['short']}\\n"
            f"📖 {loss['explanation']}\\n"
            f"✨ Рекомендуемый перевод: *{loss['alternative']}*"
        )
        await update.message.reply_markdown(reply)

app = ApplicationBuilder().token("TG_BOT_TOKEN").build()
app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), explain_nuance))
app.run_polling()`
  }
];

interface IntegrationsProps {
  lang: 'ru' | 'en';
  onNavigateToDemo: (prompt?: string) => void;
}

export default function Integrations({ lang, onNavigateToDemo }: IntegrationsProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'cicd' | 'support' | 'bots'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = selectedCategory === 'all' 
    ? INTEGRATIONS_DATA 
    : INTEGRATIONS_DATA.filter(item => item.category === selectedCategory);

  const isRu = lang === 'ru';

  return (
    <div className="flex flex-col gap-12 py-4 animate-fade-in">
      {/* Header Banner */}
      <div className="relative text-center max-w-4xl mx-auto p-8 sm:p-10 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-2xl frosted-card shadow-2xl">
        <span className="relative inline-flex items-center gap-2 text-xs font-mono text-sky-300 bg-sky-400/10 border border-sky-400/20 rounded-full px-3.5 py-1.5 w-fit mx-auto mb-4">
          <Sparkles size={14} className="text-sky-400" />
          § {isRu ? 'Готовые интеграции в 3 строчки кода' : 'Drop-in Integrations in 3 Lines of Code'}
        </span>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-white mb-4">
          {isRu ? 'Интеграция с вашей экосистемой' : 'Integrate with Your Tech Stack'}
        </h1>
        <p className="text-slate-300 font-sans text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {isRu 
            ? 'Подключите семантический шлюз LostInTranslation к LangChain, Vercel AI SDK, GitHub Actions, CRM поддержке или Telegram-ботам за пару минут.' 
            : 'Plug LostInTranslation semantic middleware into LangChain, Vercel AI SDK, CI/CD pipelines, Zendesk, or Telegram bots in minutes.'}
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {[
            { id: 'all', labelRu: '§ Все экосистемы', labelEn: '§ All Ecosystems', icon: Layers },
            { id: 'ai', labelRu: '§ AI & LLMs', labelEn: '§ AI & LLMs', icon: Cpu },
            { id: 'cicd', labelRu: '§ CI/CD & i18n', labelEn: '§ CI/CD & i18n', icon: GitBranch },
            { id: 'support', labelRu: '§ CRM & Поддержка', labelEn: '§ Support & CRM', icon: Headphones },
            { id: 'bots', labelRu: '§ Боты & Чат', labelEn: '§ Bots & Chat', icon: MessageSquare }
          ].map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-sans transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-sky-400/20 text-sky-300 border-sky-400/40 shadow-sm font-bold'
                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-sky-400' : 'text-slate-400'} />
                {isRu ? cat.labelRu : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto w-full">
        {filteredItems.map(item => (
          <div 
            key={item.id}
            className="frosted-card flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl overflow-hidden hover:border-sky-400/40 transition-all shadow-xl"
          >
            {/* Card Header */}
            <div className="p-6 border-b border-white/10 bg-black/30">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-sky-400 font-bold">
                    <Code2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-sans font-bold text-white">{item.name}</h3>
                    <span className="text-[11px] font-mono text-sky-300 bg-sky-400/10 border border-sky-400/25 px-2 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(item.code, item.id)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-sans flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400 font-sans font-bold">{isRu ? 'Скопировано!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>{isRu ? 'Код' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                {isRu ? item.descriptionRu : item.descriptionEn}
              </p>
            </div>

            {/* Code Box */}
            <div className="p-4 bg-black/50 font-mono text-xs text-sky-200 overflow-x-auto relative selection:bg-sky-400/30">
              <div className="absolute top-2 right-3 text-[10px] text-slate-400 font-mono uppercase">
                {item.language}
              </div>
              <pre className="pt-2 leading-relaxed">
                <code>{item.code}</code>
              </pre>
            </div>

            {/* Card Footer */}
            <div className="p-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-sans">
                <ShieldCheck size={14} className="text-emerald-400" />
                {isRu ? 'Проверено с LIT API v1.0' : 'Verified with LIT API v1.0'}
              </span>

              {item.demoPrompt && (
                <button
                  onClick={() => onNavigateToDemo(item.demoPrompt)}
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-sky-300 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{isRu ? 'Тест в песочнице' : 'Test in Sandbox'}</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Integration Callout */}
      <div className="frosted-card max-w-4xl mx-auto w-full p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-2xl">
        <div>
          <h3 className="text-lg font-sans font-bold text-white mb-1">
            {isRu ? 'Нужен кастомный плагин или интеграция?' : 'Need a custom SDK or integration?'}
          </h3>
          <p className="text-sm text-slate-400 font-sans">
            {isRu 
              ? 'LIT предоставляет stateless JSON REST API, совместимый с любым стеком (Go, Rust, Ruby, PHP).' 
              : 'LIT exposes a low-latency stateless REST API compatible with any backend language.'}
          </p>
        </div>
        <a
          href="https://github.com/Mohito-s/LostinTranslation"
          target="_blank"
          rel="noreferrer"
          className="celestial-btn-primary px-5 py-2.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 border border-sky-400/40 text-xs sm:text-sm font-sans font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] flex items-center gap-2 whitespace-nowrap cursor-pointer active:scale-98"
        >
          <span>{isRu ? 'GitHub Репозиторий' : 'View GitHub Repo'}</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
