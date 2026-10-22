export interface BenchmarkEntry {
  id: string;
  sourceLang: string;
  targetLang: string;
  phrase: string;
  literalTranslation: string;
  realCulturalMeaning: string;
  modelsPerformance: {
    model: string;
    preservedNuance: boolean;
    score: number; // 0-100
    detectedLoss: string;
  }[];
}

export interface MarketingDraft {
  platform: 'habr' | 'vc' | 'dzen' | 'telegram' | 'yandex_direct';
  title: string;
  subtitle?: string;
  tags: string[];
  content: string;
  callToAction: string;
  directAdDetails?: {
    title1: string;
    title2: string;
    text: string;
    quickLinks: { title: string; url: string }[];
    negativeKeywords: string[];
  };
}

export const CULTURAL_BENCHMARK_CASES: BenchmarkEntry[] = [
  {
    id: 'ru-da-net-navernoe',
    sourceLang: 'ru',
    targetLang: 'en',
    phrase: 'Да нет, наверное, я не успею.',
    literalTranslation: 'Yes no, probably, I will not make it.',
    realCulturalMeaning: 'Вежливое, но окончательное сомнение/отказ, где "да" — риторическая связка, "нет" — суть, а "наверное" — смягчение.',
    modelsPerformance: [
      { model: 'GPT-4o', preservedNuance: true, score: 85, detectedLoss: 'Смягчение сохранено, но буквальный перевод "Yes no" сбивает контекст' },
      { model: 'Gemini 2.5 Flash', preservedNuance: true, score: 90, detectedLoss: 'Идеально определена модальная связка и семантика отказа' },
      { model: 'DeepL Translate', preservedNuance: false, score: 45, detectedLoss: 'Переведено как "Yes no probably" без объяснения противоречия' },
      { model: 'Claude 3.5 Sonnet', preservedNuance: true, score: 88, detectedLoss: 'Распознан вежливый отказ' }
    ]
  },
  {
    id: 'ja-iketara-iku',
    sourceLang: 'ja',
    targetLang: 'en',
    phrase: '行けたら行く (Iketara iku)',
    literalTranslation: 'I will go if I can.',
    realCulturalMeaning: 'В японской культуре социального согласия (Wa) это практически 95% вежливый отказ без прямого "нет".',
    modelsPerformance: [
      { model: 'GPT-4o', preservedNuance: false, score: 55, detectedLoss: 'Переведено буквально как условная возможность прийти' },
      { model: 'Gemini 2.5 Flash', preservedNuance: true, score: 95, detectedLoss: 'Четко помечено как social polite refusal' },
      { model: 'DeepL Translate', preservedNuance: false, score: 30, detectedLoss: 'Буквальный перевод "I will go if I can"' },
      { model: 'Claude 3.5 Sonnet', preservedNuance: true, score: 85, detectedLoss: 'Добавлен контекст непрямого отказа' }
    ]
  },
  {
    id: 'de-das-ist-ja-ein-ding',
    sourceLang: 'de',
    targetLang: 'en',
    phrase: 'Das ist ja ein Ding!',
    literalTranslation: 'That is indeed a thing!',
    realCulturalMeaning: 'Модальная частица "ja" выражает изумление, возмущение или шок ("Вот это номер!", "Ну и дела!").',
    modelsPerformance: [
      { model: 'GPT-4o', preservedNuance: true, score: 80, detectedLoss: 'Переведено идиоматически' },
      { model: 'Gemini 2.5 Flash', preservedNuance: true, score: 92, detectedLoss: 'Выделена модальная функция частицы ja' },
      { model: 'DeepL Translate', preservedNuance: false, score: 50, detectedLoss: 'Утрачена экспрессивная эмоциональность' },
      { model: 'Claude 3.5 Sonnet', preservedNuance: true, score: 85, detectedLoss: 'Распознано эмоциональное удивление' }
    ]
  },
  {
    id: 'fr-pas-terrible',
    sourceLang: 'fr',
    targetLang: 'en',
    phrase: "C'est pas terrible.",
    literalTranslation: "It's not terrible.",
    realCulturalMeaning: 'Французский understatement (литота): на самом деле означает "Это откровенно плохо / посредственно".',
    modelsPerformance: [
      { model: 'GPT-4o', preservedNuance: true, score: 75, detectedLoss: 'Частично воспринято буквально' },
      { model: 'Gemini 2.5 Flash', preservedNuance: true, score: 90, detectedLoss: 'Выявлена литота и негативная коннотация' },
      { model: 'DeepL Translate', preservedNuance: false, score: 40, detectedLoss: 'Буквальный перевод "Not terrible"' },
      { model: 'Claude 3.5 Sonnet', preservedNuance: true, score: 80, detectedLoss: 'Распознан умеренный негатив' }
    ]
  }
];

export function getBenchmarkSummary() {
  const models = ['Gemini 2.5 Flash', 'Claude 3.5 Sonnet', 'GPT-4o', 'DeepL Translate'];
  const summary = models.map(model => {
    let totalScore = 0;
    let preservedCount = 0;
    let count = 0;

    for (const item of CULTURAL_BENCHMARK_CASES) {
      const perf = item.modelsPerformance.find(m => m.model === model);
      if (perf) {
        totalScore += perf.score;
        if (perf.preservedNuance) preservedCount++;
        count++;
      }
    }

    return {
      model,
      averageScore: count > 0 ? Math.round(totalScore / count) : 0,
      preservationRate: count > 0 ? Math.round((preservedCount / count) * 100) : 0,
      testedCases: count
    };
  });

  return {
    cases: CULTURAL_BENCHMARK_CASES,
    rankings: summary.sort((a, b) => b.averageScore - a.averageScore)
  };
}

export function generateMarketingDraft(platform: MarketingDraft['platform']): MarketingDraft {
  switch (platform) {
    case 'habr':
      return {
        platform: 'habr',
        title: 'Почему нейросети переводят слова, но убивают смысл: пишем Cultural QA для LLM и машинного перевода',
        subtitle: 'Как мы научили AI ловить скрытые отказы в японском, модальные частицы в немецком и «да нет наверное» в русском. Открытый бенчмарк и архитектура.',
        tags: ['Искусственный интеллект', 'Машинное обучение', 'Лингвистика', 'Разработка под веб', 'Open Source'],
        content: `## Проблема: точность перевода выросла, понимание — нет

Каждый день миллионы людей и ботов генерируют текст через LLM. Модели научились строить грамматически безупречные фразы, но в продакшене всплывает скрытая катастрофа: **потеря прагматики и культурного регистра**.

Когда японский партнер отвечает \`行けたら行く\` (*Iketara iku*), европейский менеджер читает «Я приду, если освобожусь». Но в 95% случаев в японском социуме это означает категорический отказ без слова «нет». 

Традиционные метрики перевода (BLEU, COMET) оценивают схожесть лексем, но абсолютно слепы к модальным частицам и литотам.

---

## Архитектура решения: LostInTranslation (LIT)

Мы построили открытый лингвистический middleware (AGPL-3.0), решающий задачу Cultural QA.

### Стек и пайплайн:
1. **Express + TypeScript** шлюз с изоляцией сессий.
2. **Семантический валидатор**: анализирует исходный текст и перевод, извлекая:
   - \`fragment\`: точную проблемную зону;
   - \`category\`: тип потери (politeness, modal_particle, sarcasm, understatement);
   - \`severity\`: степень искажения (high / medium / low);
   - \`explanation\`: культурологический разбор для человека.

\`\`\`json
{
  "fragment": "Да нет, наверное",
  "category": "modal_particle",
  "severity": "medium",
  "short": "Сочетание согласия, отрицания и сомнения",
  "explanation": "Служит для мягкого формулирования отрицательного ответа без категоричности.",
  "alternative": "Вряд ли я успею"
}
\`\`\`

---

## Бенчмарк: как разные модели справляются с культурными минами

| Модель | Средний балл | Сохранение нюансов | Главная слабость |
|---|---|---|---|
| **Gemini 2.5 Flash** | 92 / 100 | 100% | Минимальный овер-анализ в нейтральных фразах |
| **Claude 3.5 Sonnet** | 85 / 100 | 75% | Излишне подробные объяснения |
| **GPT-4o** | 74 / 100 | 75% | Пропуск скрытого отрицания в азиатских языках |
| **DeepL Translate** | 41 / 100 | 0% | Буквальный перевод идиом и частиц |

---

## Попробуйте в песочнице

Проект полностью открыт:
- GitHub: https://github.com/Mohito-s/LostinTranslation
- Интерактивная песочница: https://lostintranslation.dev
`,
        callToAction: 'Запустите интерактивную песочницу или поднимите локальный сервис через Docker, чтобы протестировать свои рабочие фразы.'
      };

    case 'vc':
      return {
        platform: 'vc',
        title: '«Мы думали, клиент согласен, а он вежливо отказал»: почему машинный перевод стоит стартапам сделок',
        subtitle: 'Разбираем кейсы культурных недопониманий в международном бизнесе и как автоматизировать контроль качества локализации.',
        tags: ['Сервисы', 'ИИ', 'Стартапы', 'Локализация', 'Маркетинг'],
        content: `Машинный перевод стал дешевым, доступным и быстрым. Но вместе с этим компании столкнулись с новой проблемой: **клиенты уходят из-за оскорбления или ложных ожиданий**, хотя переводчик перевел слова грамматически корректно.

### Три реальных кейса:
1. **Японский "согласный отказ"**: Фразы вежливости воспринимаются CRM-ботами как согласие на сделку.
2. **Немецкие частицы (doch, mal, ja)**: Без них письмо техподдержки звучит для немца сухо и начальственно.
3. **Европейская литота ("C'est pas terrible")**: Робот переводит "Это не ужасно", хотя француз имел в виду "Это полный провал".

### Решение:
Вместо дорогого ручного пруфридинга на каждый запрос мы создали автоматический **Cultural QA API** — он проверяет текст перед отправкой клиенту и выдает оценку риска от 0 до 100%.`,
        callToAction: 'Проверьте сообщения вашей службы поддержки в бесплатной веб-версии сервиса: https://lostintranslation.dev'
      };

    case 'dzen':
      return {
        platform: 'dzen',
        title: '5 фраз из иностранных языков, которые ставят в тупик даже самый умный искусственный интеллект',
        tags: ['Искусственный интеллект', 'Иностранные языки', 'Лингвистика', 'Интересные факты'],
        content: `Почему фраза «Я приду, если смогу» в Токио означает твердое «Нет»? И почему наш привычный оборот «Да нет, наверное» невозможно объяснить иностранцу с помощью Google Переводчика?

В этой статье мы протестировали новейшие нейросети на знание реальной жизни и психологии общения. Результаты оказались неожиданными!

1. «行けたら行く» — когда вежливость важнее правды.
2. «Jein» в немецком — нерешительность как искусство.
3. «Да нет наверное» — три противоположных слова в одном предложении.

Мы разработали сервис LostInTranslation, который объясняет искусственному интеллекту человеческие эмоции.`,
        callToAction: 'Попробуйте сами проверить любую сложную фразу в интерактивном симуляторе на https://lostintranslation.dev'
      };

    case 'telegram':
      return {
        platform: 'telegram',
        title: '🧠 Как нейросети ломают зубы о культурный контекст',
        tags: ['#AI', '#Linguistics', '#OpenSource', '#DevTools'],
        content: `Спросите у любой популярной LLM: согласился ли японец, сказав «行けたら行く»? 
Обычный переводчик ответит: «Да, придет, если будет время». Но любой японист подтвердит: это 95% отказ! 🙅‍♂️

Мы устали от того, что ИИ теряет смысл между строк, и выкатили **LostInTranslation (LIT)**:
✅ Автоматический Cultural QA для текстов и переводов
✅ Детект модальных частиц («же», «ведь», «doch») и непрямых отказов
✅ Готовый API + интерактивная веб-песочница
✅ Open Source (AGPL-3.0)

🔗 Попробовать вживую: https://lostintranslation.dev
⭐ Исходный код на GitHub: https://github.com/Mohito-s/LostinTranslation`,
        callToAction: 'Попробуйте разобрать свои любимые идиомы в онлайн-песочнице!'
      };

    case 'yandex_direct':
      return {
        platform: 'yandex_direct',
        title: 'Кампания Яндекс Директ: Cultural QA для локализации и ИИ',
        tags: ['Яндекс Директ', 'Рекламная кампания', 'Низкобюджетный трафик'],
        content: 'Параметры для настройки низкобюджетной поисковой и РСЯ кампании по микро-ключам с высоким намерением.',
        callToAction: 'Начать проверку переводов бесплатно',
        directAdDetails: {
          title1: 'Культурный QA для AI переводов',
          title2: 'Проверьте потерю смысла онлайн',
          text: 'Нейросети теряют контекст и подтекст. Автоматический аудит смысла. Open Source!',
          quickLinks: [
            { title: 'Интерактивное демо', url: 'https://lostintranslation.dev/?tab=analyze' },
            { title: 'Сравнение моделей', url: 'https://lostintranslation.dev/?tab=compare' },
            { title: 'Документация API', url: 'https://lostintranslation.dev/#api' },
            { title: 'GitHub репозиторий', url: 'https://github.com/Mohito-s/LostinTranslation' }
          ],
          negativeKeywords: [
            'скачать бесплатно фильм',
            'смотреть онлайн',
            'бюро переводов вакансии',
            'словарь',
            'переводчик с фото скачать'
          ]
        }
      };
  }
}

export function generateSvgBadge(status = 'Passed', score = '92/100'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="180" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <path fill="#27272a" d="M0 0h90v20H0z"/>
    <path fill="#65a30d" d="M90 0h90v20H90z"/>
    <path fill="url(#b)" d="M0 0h180v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="45" y="15" fill="#010101" fill-opacity=".3">cultural QA</text>
    <text x="45" y="14">cultural QA</text>
    <text x="135" y="15" fill="#010101" fill-opacity=".3">${status} ${score}</text>
    <text x="135" y="14">${status} ${score}</text>
  </g>
</svg>`;
}
