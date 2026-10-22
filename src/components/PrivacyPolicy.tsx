import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Database, 
  Trash2, 
  EyeOff, 
  FileText, 
  Printer, 
  ArrowLeft, 
  ExternalLink,
  HelpCircle,
  Globe2,
  CheckCircle2
} from 'lucide-react';

interface PrivacyPolicyProps {
  lang: 'ru' | 'en';
  onNavigateHome: () => void;
  onOpenSupport: () => void;
}

export default function PrivacyPolicy({ lang, onNavigateHome, onOpenSupport }: PrivacyPolicyProps) {
  const isRu = lang === 'ru';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16 text-slate-100">
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-mono text-sky-300 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {isRu ? '← На главную' : '← Back to Home'}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            title={isRu ? 'Печать или экспорт в PDF' : 'Print or Export to PDF'}
          >
            <Printer className="w-3.5 h-3.5" />
            {isRu ? 'Печать / PDF' : 'Print / PDF'}
          </button>
        </div>
      </div>

      {/* DOCUMENT TITLE & FOLIO */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-sky-400/20 bg-sky-400/10 text-sky-300 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>LEGAL COMPLIANCE • GOOGLE PLAY & GDPR READY</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-sans font-bold text-white tracking-tight mb-4">
          {isRu ? 'Политика конфиденциальности' : 'Privacy Policy'}
        </h1>
        <p className="font-sans text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {isRu 
            ? 'LostInTranslation (LIT) — прозрачные правила обработки данных, защиты промптов и соблюдения приватности разработчиков.'
            : 'LostInTranslation (LIT) — transparent rules on data handling, prompt protection, and developer privacy.'}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3 text-xs font-mono text-slate-500">
          <span>{isRu ? 'Редакция: 16 октября 2026' : 'Effective: October 16, 2026'}</span>
          <span>•</span>
          <span>VER. 2.4-PROD</span>
        </div>
      </div>

      {/* TL;DR HIGHLIGHTS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
        <div className="frosted-card p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <EyeOff className="w-4 h-4" />
            <h4 className="font-sans font-bold text-sm text-white">
              {isRu ? 'Zero Training' : 'Zero Training'}
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {isRu 
              ? 'Ваши тексты и промпты не используются для дообучения ИИ. Они обрабатываются в оперативной памяти и не сохраняются в постоянных базах.'
              : 'Your prompts and texts are never used to train AI models. Processing is purely ephemeral in memory.'}
          </p>
        </div>

        <div className="frosted-card p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-400" />
          <div className="flex items-center gap-2 mb-2 text-sky-400">
            <Lock className="w-4 h-4" />
            <h4 className="font-sans font-bold text-sm text-white">
              {isRu ? 'AppSec Безопасность' : 'AppSec Security'}
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {isRu 
              ? 'Асинхронное PBKDF2-хеширование паролей с уникальной криптографической солью, HMAC-сессии и строгая изоляция API-ключей.'
              : 'Async PBKDF2 password hashing with unique salts, HMAC sessions, and strict API-key isolation.'}
          </p>
        </div>

        <div className="frosted-card p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-400" />
          <div className="flex items-center gap-2 mb-2 text-sky-300">
            <CheckCircle2 className="w-4 h-4" />
            <h4 className="font-sans font-bold text-sm text-white">
              {isRu ? 'Без рекламы и трекеров' : 'No Ads / Trackers'}
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {isRu 
              ? 'Ноль маркетинговых пикселей, ноль рекламных SDK, никакого профилирования. Мы собираем только техническую телеметрию использования квот.'
              : 'Zero ad pixels, zero tracking SDKs, no behavioral profiling. Only technical rate-limiting telemetry.'}
          </p>
        </div>
      </div>

      {/* LEGAL SECTIONS */}
      <div className="space-y-8 text-slate-300 font-sans leading-relaxed text-sm">
        
        {/* SECTION 1 */}
        <section className="frosted-card p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-400/10 text-sky-300 border border-sky-400/20">§ 01</span>
            <h2 className="text-xl font-sans font-bold text-white">
              {isRu ? '1. Общие положения и назначение сервиса' : '1. Overview & Service Scope'}
            </h2>
          </div>
          <p className="mb-3">
            {isRu ? (
              <>
                Настоящая Политика конфиденциальности распространяется на веб-приложение, API-шлюз и мобильные сборки (TWA / Android) <strong>LostInTranslation (LIT)</strong>, доступные по адресу официального домена и в каталоге приложений <strong>Google Play Store</strong>.
              </>
            ) : (
              <>
                This Privacy Policy applies to the web application, API gateway, and mobile builds (TWA / Android) of <strong>LostInTranslation (LIT)</strong> accessible via the official domain and published on the <strong>Google Play Store</strong>.
              </>
            )}
          </p>
          <p>
            {isRu ? (
              <>
                Сервис разработан под свободной лицензией <strong>GNU Affero General Public License v3.0 (AGPL-3.0)</strong>. Наша цель — предоставление разработчикам и пользователям семантического шлюза для выявления потерь культурного контекста при машинном переводе и оптимизации токенов при взаимодействии с большими языковыми моделями.
              </>
            ) : (
              <>
                The service is provided under the <strong>GNU Affero General Public License v3.0 (AGPL-3.0)</strong>. Our mission is to provide developers with a semantic middleware detecting cultural meaning loss in translations and optimizing token spend.
              </>
            )}
          </p>
        </section>

        {/* SECTION 2 */}
        <section className="frosted-card p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-400/10 text-sky-300 border border-sky-400/20">§ 02</span>
            <h2 className="text-xl font-sans font-bold text-white">
              {isRu ? '2. Какие данные мы обрабатываем' : '2. Information We Process'}
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-sans font-semibold text-sky-300 text-base mb-1">
                {isRu ? 'А. Обрабатываемые данные пользователя' : 'A. User-Provided Data'}
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>
                  <strong>{isRu ? 'Учётная запись (для разработчиков):' : 'Developer Account:'}</strong> {isRu ? 'Адрес электронной почты (email) и криптографический хеш пароля (PBKDF2 с уникальной солью на 100 000 итераций). Мы никогда не храним пароли в открытом виде.' : 'Email address and salted PBKDF2 password hash (100,000 iterations). Raw passwords are never stored.'}
                </li>
                <li>
                  <strong>{isRu ? 'Тексты и промпты:' : 'Prompts & Texts:'}</strong> {isRu ? 'Тексты, отправляемые через форму песочницы, эндпоинты `/api/analyze`, `/api/enhance`, `/api/optimize-prompt` и `/v1/chat/completions`. Обрабатываются исключительно в памяти в момент выполнения запроса.' : 'Texts submitted for analysis, enhancement, prompt optimization, or chat proxy completions. Processed strictly in memory.'}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-sans font-semibold text-sky-300 text-base mb-1">
                {isRu ? 'Б. Техническая телеметрия и журналы (Logs)' : 'B. Technical Logs & Telemetry'}
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>
                  <strong>{isRu ? 'Метрики запросов:' : 'Request Metrics:'}</strong> {isRu ? 'Длина текста в символах, количество распознанных культурных потерь, статус-код ответа, временная метка и идентификатор API-ключа.' : 'Character count, count of detected nuances, HTTP status, timestamp, and API key ID.'}
                </li>
                <li>
                  <strong>{isRu ? 'IP-адрес:' : 'IP Address:'}</strong> {isRu ? 'Используется исключительно для ограничения частоты запросов (Rate Limiting: 10 запросов/24ч для анонимных пользователей) и защиты от DDoS-атак. Логи автоматически перезаписываются и не передаются третьим лицам.' : 'Used strictly for rate limiting (10 reqs/24h for anonymous users) and DDoS defense.'}
                </li>
              </ul>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-xs text-slate-400">
              <strong className="text-sky-300 font-mono">ВАЖНО:</strong> {isRu ? 'Мы НЕ собираем персональные идентификаторы, платёжные реквизиты карт (все платежи, если будут внедрены, обрабатываются сертифицированными провайдерами Google Play / Stripe), данные геолокации GPS или телефонные книги.' : 'We DO NOT collect personal identity documents, credit card numbers, GPS location, or device contacts.'}
            </div>
          </div>
        </section>

        {/* SECTION 3 */}
        <section className="frosted-card p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-400/10 text-sky-300 border border-sky-400/20">§ 03</span>
            <h2 className="text-xl font-sans font-bold text-white">
              {isRu ? '3. Взаимодействие с внешними LLM-провайдерами' : '3. Downstream AI Processing (Gemini & OpenAI)'}
            </h2>
          </div>
          <p className="mb-3">
            {isRu ? (
              <>
                Для глубокого культурного анализа и сжатия промптов сервис использует официальные программные интерфейсы <strong>Google Gemini API</strong> и/или <strong>OpenAI API</strong>.
              </>
            ) : (
              <>
                To perform cultural analysis and semantic token compression, LIT communicates with official APIs of <strong>Google Gemini</strong> and/or <strong>OpenAI</strong>.
              </>
            )}
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              {isRu ? 'Запросы передаются по защищенным протоколам TLS 1.3.' : 'Requests are transmitted over encrypted TLS 1.3 channels.'}
            </li>
            <li>
              {isRu ? 'В соответствии с политиками конфиденциальности Google Cloud AI и OpenAI API корпоративного уровня, данные, передаваемые через платные API-эндпоинты, не используются поставщиками для тренировки общедоступных базовых моделей.' : 'Per Google Cloud AI and OpenAI API commercial terms, customer inputs sent via enterprise API endpoints are not used to train public foundation models.'}
            </li>
            <li>
              {isRu ? 'Если внешний API недоступен, сервер переключается на локальный детерминированный движок без отправки данных во внешние сети.' : 'In case of provider outage, LIT utilizes deterministic local heuristics without external transmission.'}
            </li>
          </ul>
        </section>

        {/* SECTION 4 */}
        <section className="frosted-card p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-400/10 text-sky-300 border border-sky-400/20">§ 04</span>
            <h2 className="text-xl font-sans font-bold text-white">
              {isRu ? '4. Защита данных, хранилище и Cookies' : '4. Data Security, Storage & Cookies'}
            </h2>
          </div>
          <p className="mb-3">
            {isRu ? (
              <>
                Мы применяем строгие инженерные стандарты информационной безопасности:
              </>
            ) : (
              <>
                We maintain industry-standard security and privacy practices:
              </>
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 font-mono text-xs">
            <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl">
              <span className="text-sky-300 font-bold block mb-1">Local Storage Tokens:</span>
              <span className="text-slate-400">
                {isRu 
                  ? '`lit_session_token` — сохраняет состояние входа разработчика. Удаляется при нажатии кнопки «Выход».'
                  : '`lit_session_token` — keeps developer login session. Cleared upon logout.'}
              </span>
            </div>
            <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl">
              <span className="text-sky-300 font-bold block mb-1">Security Headers:</span>
              <span className="text-slate-400">
                {isRu 
                  ? 'Сервер защищен заголовками Helmet (CSP, HSTS, X-Content-Type-Options, защита от Clickjacking).'
                  : 'Protected with Helmet (Content-Security-Policy, HSTS, X-Frame-Options, anti-clickjacking).'}
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 5 */}
        <section className="frosted-card p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-400/10 text-sky-300 border border-sky-400/20">§ 05</span>
            <h2 className="text-xl font-sans font-bold text-white">
              {isRu ? '5. Права пользователя (GDPR, CCPA) и удаление данных' : '5. User Rights (GDPR / CCPA) & Data Deletion'}
            </h2>
          </div>
          <p className="mb-3">
            {isRu ? (
              <>
                Каждый пользователь и разработчик обладает следующими неотъемлемыми правами:
              </>
            ) : (
              <>
                Every user and developer holds the following guaranteed rights:
              </>
            )}
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong>{isRu ? 'Право на отзыв ключей:' : 'Right to Revoke Keys:'}</strong> {isRu ? 'Вы можете в любой момент мгновенно деактивировать любой выпущенный API-ключ прямо в Панели разработчика.' : 'You can revoke any issued API key immediately inside the Developer Dashboard.'}
            </li>
            <li>
              <strong>{isRu ? 'Право на удаление (Right to Erasure):' : 'Right to Erasure:'}</strong> {isRu ? 'Вы можете запросить полное удаление вашей учетной записи разработчика и всех связанных записей журналов обращений через форму поддержки.' : 'You may request permanent deletion of your developer account and associated logs via developer support.'}
            </li>
            <li>
              <strong>{isRu ? 'Экспорт данных:' : 'Data Portability:'}</strong> {isRu ? 'Вы можете просматривать и выгружать историю использования ваших ключей в Dashboard.' : 'You can view and export your API usage logs from the Dashboard.'}
            </li>
          </ul>
        </section>

        {/* SECTION 6 */}
        <section className="frosted-card p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-400/10 text-sky-300 border border-sky-400/20">§ 06</span>
            <h2 className="text-xl font-sans font-bold text-white">
              {isRu ? '6. Требования Google Play Store и возрастные ограничения' : '6. Google Play Compliance & Age Requirements'}
            </h2>
          </div>
          <p className="mb-2">
            {isRu ? (
              <>
                Приложение LostInTranslation полностью соответствует <strong>Google Play Developer Program Policies</strong>, включая разделы о защите пользовательских данных (User Data Policy) и требованиях к приложениям с генеративным ИИ (Generative AI Apps Policy).
              </>
            ) : (
              <>
                LostInTranslation strictly adheres to the <strong>Google Play Developer Program Policies</strong>, including the User Data Policy and Generative AI content guidelines.
              </>
            )}
          </p>
          <p className="text-slate-400 text-xs">
            {isRu ? (
              <>
                Сервис предназначен для лиц старше 13 лет (или 16 лет в странах ЕС). Мы сознательно не собираем информацию от детей младше этого возраста.
              </>
            ) : (
              <>
                The service is intended for individuals aged 13 and older (or 16 in the EU). We do not knowingly collect personal data from minors.
              </>
            )}
          </p>
        </section>

        {/* SECTION 7 */}
        <section className="frosted-card p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-400/10 text-sky-300 border border-sky-400/20">§ 07</span>
            <h2 className="text-xl font-sans font-bold text-white">
              {isRu ? '7. Контакты и обратная связь' : '7. Contact & Support'}
            </h2>
          </div>
          <p className="mb-4">
            {isRu ? (
              <>
                Если у вас есть вопросы касательно настоящей Политики конфиденциальности или вы желаете подать запрос на удаление данных, свяжитесь с нашей командой поддержки:
              </>
            ) : (
              <>
                If you have questions regarding this Privacy Policy or wish to request data erasure, contact our team:
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSupport}
              className="apple-btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-black font-semibold text-xs transition-colors cursor-pointer shadow-lg"
            >
              <HelpCircle className="w-4 h-4" />
              {isRu ? 'Форма поддержки разработчиков' : 'Developer Support Window'}
            </button>
            <a
              href="https://github.com/Mohito-s/LostinTranslation/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              GitHub Issues
            </a>
          </div>
        </section>

      </div>

      {/* FOOTER ACTION */}
      <div className="mt-12 pt-6 border-t border-white/10 text-center">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/20 hover:border-sky-400/50 bg-white/[0.04] hover:bg-sky-400/10 text-slate-300 hover:text-white font-sans text-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {isRu ? 'Вернуться к обзору LostInTranslation' : 'Return to LostInTranslation'}
        </button>
      </div>
    </div>
  );
}
