import { GoogleGenAI, Type } from '@google/genai';
import logger from './logger';

// Model can be overridden via GEMINI_MODEL (defaults to gemini-3.5-flash).
function getModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.5-flash';
}

// Lazy client initialization
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'MOCK_KEY_FALLBACK',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

function safeJsonParse(raw: string | undefined | null, fallback: any = {}): any {
  if (!raw || typeof raw !== 'string') return fallback;
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}

export interface EnhanceResponse {
  enhanced_prompt: string;
  context_added: boolean;
  losses_detected: number;
}

export interface TokenStats {
  original_claude_tokens: number;
  optimized_claude_tokens: number;
  saved_claude_tokens: number;
  saved_claude_percent: number;
  original_gpt_tokens: number;
  optimized_gpt_tokens: number;
  saved_gpt_tokens: number;
  saved_gpt_percent: number;
}

export interface OptimizePromptResponse {
  original_prompt: string;
  source_language: string;
  target_output_language: string;
  english_prompt: string;
  system_directive: string;
  full_optimized_prompt: string;
  cultural_nuances_preserved: string[];
  token_stats: TokenStats;
}

export function estimateTokens(text: string, isCyrillic: boolean): { claude: number; gpt: number } {
  if (!text || text.trim().length === 0) return { claude: 0, gpt: 0 };
  const len = text.length;
  if (isCyrillic) {
    return {
      claude: Math.max(1, Math.round(len * 0.57)),
      gpt: Math.max(1, Math.round(len * 0.40)),
    };
  } else {
    return {
      claude: Math.max(1, Math.round(len * 0.26)),
      gpt: Math.max(1, Math.round(len * 0.24)),
    };
  }
}

export function computeTokenStats(originalText: string, englishText: string): TokenStats {
  const cyrillicCount = (originalText.match(/[\u0400-\u04FF]/g) || []).length;
  const isCyrillic = cyrillicCount / Math.max(1, originalText.length) > 0.2;

  const originalTokens = estimateTokens(originalText, isCyrillic);
  const optimizedTokens = estimateTokens(englishText, false);

  const savedClaude = Math.max(0, originalTokens.claude - optimizedTokens.claude);
  const savedClaudePercent = originalTokens.claude > 0
    ? Math.round((savedClaude / originalTokens.claude) * 100)
    : 0;

  const savedGpt = Math.max(0, originalTokens.gpt - optimizedTokens.gpt);
  const savedGptPercent = originalTokens.gpt > 0
    ? Math.round((savedGpt / originalTokens.gpt) * 100)
    : 0;

  return {
    original_claude_tokens: originalTokens.claude,
    optimized_claude_tokens: optimizedTokens.claude,
    saved_claude_tokens: savedClaude,
    saved_claude_percent: savedClaudePercent,
    original_gpt_tokens: originalTokens.gpt,
    optimized_gpt_tokens: optimizedTokens.gpt,
    saved_gpt_tokens: savedGpt,
    saved_gpt_percent: savedGptPercent,
  };
}

export async function enhancePrompt(prompt: string, text: string): Promise<EnhanceResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return getMockEnhancement(prompt, text);
  }

  try {
    const ai = getAiClient();

    const systemInstruction = `
You are a cultural-linguistic middleware layer. Your role is not to translate or answer questions — your role is to silently enrich a developer's prompt with cultural and linguistic context extracted from the source-language text, so that any downstream LLM processes that text with full understanding of its implicit meaning.

You receive:
1. A developer's original prompt (what they want the LLM to do with the text)
2. Source-language text (such as Russian, Japanese, German, Spanish, French, Arabic, etc.) that will be processed by that prompt

Your task:
First, automatically detect the source language of the text.
Then, scan the text for implicit meaning, high-context nuances, or subtext that survives literal translation poorly:
- Diminutives, honorifics, or suffixes revealing emotional attitude or power dynamics.
- Verb aspect, tense, or subjunctive mood affecting actions, completions, or habits.
- Modal particles, fillers, or clitics (e.g. Russian 'же', 'ну'; German modal particles like 'doch', 'ja', 'mal'; Japanese 'yo', 'ne') shifting certainty, tone, or relationship proximity.
- Polite vs casual address/pronouns indicating social distance or hierarchy.
- Word order used as emotional emphasis or prosody.
- Hedging and face-saving constructions (polite avoidance of direct 'no', indirect refusals, or qualified praise).
- Understatement as a cultural default (e.g. 'I'm fine' or 'not bad' indicating dissatisfaction).

Output Format instructions:
You MUST generate a JSON object with:
1. "enhanced_prompt": The fully rewritten prompt. It MUST start with the developer's original instructions, followed by a clearly delimited "[Cultural context for accurate interpretation: ...]" block, and then include the original source text.
2. "context_added": Boolean indicating if any meaningful cultural/linguistic nuances were added.
3. "losses_detected": Integer indicating the number of nuances identified.

CRITICAL RULES FOR "enhanced_prompt" CONTENT:
- State concisely what a native speaker of the source language understands that a literal translation would miss.
- Be specific to THIS text, not generic language facts.
- Use plain language — not academic linguistic terminology — so any downstream LLM can understand and utilize it.
- Do not exceed 5 key observations (quality over quantity).
- End with a plain, clear restatement of the original task and provide the text.
- Never invent context that isn't in the text. If the text is plain and unambiguous, return the original prompt with "context_added" as false and "losses_detected" as 0.
`;

    const userContent = `
DEVELOPER ORIGINAL PROMPT: "${prompt}"
SOURCE TEXT TO PROCESS: "${text}"
`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: userContent,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            enhanced_prompt: {
              type: Type.STRING,
              description: 'The final rewritten prompt containing the original task description, the added [Cultural context] block, and the text.'
            },
            context_added: {
              type: Type.BOOLEAN,
              description: 'Whether any specific cultural context or nuances were added.'
            },
            losses_detected: {
              type: Type.INTEGER,
              description: 'The count of distinct cultural/linguistic nuances identified.'
            }
          },
          required: ['enhanced_prompt', 'context_added', 'losses_detected']
        }
      }
    });

    const parsed = safeJsonParse(response.text, {});
    return {
      enhanced_prompt: parsed.enhanced_prompt || `${prompt}\n\nText: ${text}`,
      context_added: parsed.context_added ?? false,
      losses_detected: parsed.losses_detected ?? 0
    };
  } catch (error) {
    logger.error({ err: error }, 'Error calling Gemini API in enhancePrompt:');
    return getMockEnhancement(prompt, text);
  }
}

function getMockEnhancement(prompt: string, text: string): EnhanceResponse {
  const normalized = text.toLowerCase();

  if (normalized.includes('iketara iku') || normalized.includes('行けたら行く')) {
    return {
      enhanced_prompt: `${prompt}

[Cultural context for accurate interpretation: The Japanese phrase '行けたら行く' (literally 'I will go if I can') is a well-established socio-cultural mechanism to avoid direct refusal. In Japanese society, saying 'no' directly is avoided to maintain 'Wa' (social harmony). Downstream processors must understand that the speaker has no intention of attending, and the response is a polite but definitive decline.]

Text: ${text}`,
      context_added: true,
      losses_detected: 1
    };
  }

  if (normalized.includes('jein')) {
    return {
      enhanced_prompt: `${prompt}

[Cultural context for accurate interpretation: The German word 'Jein' (Ja + Nein) is not simple confusion. It signals a complex, dualistic opinion where yes and no apply simultaneously. It highlights structured skepticism, meaning the answer is affirmative only under strict conditions or has major unspoken reservations.]

Text: ${text}`,
      context_added: true,
      losses_detected: 1
    };
  }

  if (normalized.includes('manana') || normalized.includes('mañana')) {
    return {
      enhanced_prompt: `${prompt}

[Cultural context for accurate interpretation: The Spanish concept of 'mañana' (literally 'tomorrow') is culturally high-context. It does not refer to the next calendar day, but rather represents a relaxed view of time meaning 'not today' or 'some indefinite point in the future.' It communicates non-urgency and low priority.]

Text: ${text}`,
      context_added: true,
      losses_detected: 1
    };
  }

  if (normalized.includes('ah bon') || normalized.includes('ah, bon')) {
    return {
      enhanced_prompt: `${prompt}

[Cultural context for accurate interpretation: The French expression 'Ah, bon?' literally translates to 'Oh, good?', but culturally it functions as a highly expressive marker of surprise, skepticism, or even polite disbelief. In a conversational setting, it rarely signifies actual approval, but rather asks the speaker to defend or expand on their statement.]

Text: ${text}`,
      context_added: true,
      losses_detected: 1
    };
  }

  if (normalized.includes('im fine') || normalized.includes('i\'m fine')) {
    return {
      enhanced_prompt: `${prompt}

[Cultural context for accurate interpretation: In Anglo-American culture, 'I'm fine' during a disagreement or tense situation is a classic conversational hedge. It signals defensive retreat or covert dissatisfaction rather than actual positive state. The speaker is politely refusing further emotional disclosure while remaining upset.]

Text: ${text}`,
      context_added: true,
      losses_detected: 1
    };
  }

  if (normalized.includes('ну в принципе неплохо')) {
    return {
      enhanced_prompt: `${prompt}

[Cultural context for accurate interpretation: The phrase uses 'ну в принципе' (a hedging particle combination indicating reluctant, qualified acceptance rather than genuine approval), 'неплохо' (literally 'not bad' but culturally equivalent to mild disappointment, not a compliment), and an impersonal construction that distances the speaker from direct criticism — a common Russian politeness strategy. The actual sentiment is closer to 'disappointing but acceptable' than the literal 'not bad'.]

Text: ${text}`,
      context_added: true,
      losses_detected: 3
    };
  }

  if (normalized.includes('да но нет') || normalized.includes('да, но нет')) {
    return {
      enhanced_prompt: `${prompt}

[Cultural context for accurate interpretation: The phrase 'Да, но нет' (literally 'Yes, but no') is not an undecided hesitation. Culturally, 'Да' (Yes) represents a soft conversational agreement that the speaker hears and understands the proposal, while 'но нет' (but no) is the actual definitive, final negative answer. It is a highly polite, indirect, yet absolute refusal.]

Text: ${text}`,
      context_added: true,
      losses_detected: 1
    };
  }

  if (normalized.includes('домой пойду') || normalized.includes('да ну и ладно')) {
    return {
      enhanced_prompt: `${prompt}

[Cultural context for accurate interpretation: The phrase 'Да ну и ладно' signals heavy, bitter resignation and mild resentment rather than simple neutral agreement. The speaker is yielding to circumstances while expressing covert dissatisfaction. The transition 'домой пойду' ('I'm going home') following this highlights a withdrawal from the active situation due to this disappointment.]

Text: ${text}`,
      context_added: true,
      losses_detected: 2
    };
  }

  // Generic fallback enhancement
  return {
    enhanced_prompt: `${prompt}

[Cultural context for accurate interpretation: The Russian speaker uses an indirect phrasing typical of Eastern European conversational politeness, where direct confrontation is avoided. Diminutives or particles in the text soften the statement's weight, indicating a desire to keep relationship distance comfortable while delivering potentially critical feedback.]

Text: ${text}`,
    context_added: true,
    losses_detected: 1
  };
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const promptOptimizationCache = new Map<string, CacheEntry<OptimizePromptResponse>>();
const PROMPT_CACHE_MAX_ENTRIES = 500;
const PROMPT_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

function getFromCache(key: string): OptimizePromptResponse | null {
  const entry = promptOptimizationCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    promptOptimizationCache.delete(key);
    return null;
  }
  return entry.data;
}

function setToCache(key: string, data: OptimizePromptResponse): void {
  if (promptOptimizationCache.size >= PROMPT_CACHE_MAX_ENTRIES) {
    const firstKey = promptOptimizationCache.keys().next().value;
    if (firstKey) promptOptimizationCache.delete(firstKey);
  }
  promptOptimizationCache.set(key, {
    data,
    expiresAt: Date.now() + PROMPT_CACHE_TTL_MS
  });
}

export async function optimizePrompt(
  prompt: string,
  targetOutputLanguage: string = 'Russian'
): Promise<OptimizePromptResponse> {
  const cacheKey = `${(targetOutputLanguage || 'Russian').toLowerCase()}:::${prompt.trim()}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const mockRes = getMockPromptOptimization(prompt, targetOutputLanguage);
    setToCache(cacheKey, mockRes);
    return mockRes;
  }

  try {
    const ai = getAiClient();
    const systemInstruction = `
You are an expert AI Linguistic Middleware and Prompt Token Optimizer for LostInTranslation.
The user enters a prompt written in Russian (or another non-English high-context language).
Russian Cyrillic consumes up to 2.5x–3x more tokens in Western LLMs (especially Anthropic Claude and OpenAI models) than concise English.

CRITICAL PRIME OBJECTIVE: MAXIMUM TOKEN COMPRESSION & SAVINGS.
The generated English prompt MUST consume FEWER tokens than the input Russian text.
1. Translate and condense the prompt into ULTRA-COMPACT, punchy, high-density English.
2. Cut all conversational filler, preambles, and meta-commentary. Keep the exact intent, constraints, and cultural tone in concise phrasing.
3. Keep english_prompt significantly shorter in word count than the source.
4. system_directive MUST be concise: "Reply in ${targetOutputLanguage || 'Russian'}".
5. Identify 1 to 3 distinct cultural nuances preserved in this translation.

Return a JSON object conforming to the schema.
`;

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: `ORIGINAL PROMPT TO OPTIMIZE: "${prompt}"\nTARGET OUTPUT LANGUAGE: "${targetOutputLanguage}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            source_language: { type: Type.STRING },
            english_prompt: { type: Type.STRING },
            system_directive: { type: Type.STRING },
            cultural_nuances_preserved: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['source_language', 'english_prompt', 'system_directive', 'cultural_nuances_preserved']
        }
      }
    });

    const parsed = safeJsonParse(response.text, {});
    const englishPrompt = parsed.english_prompt || prompt;
    const systemDirective = parsed.system_directive || `Reply in ${targetOutputLanguage || 'Russian'}`;
    const fullOptimized = `${englishPrompt}\n\n[Instruction: ${systemDirective}]`;
    const tokenStats = computeTokenStats(prompt, fullOptimized);

    const result: OptimizePromptResponse = {
      original_prompt: prompt,
      source_language: parsed.source_language || 'ru',
      target_output_language: targetOutputLanguage,
      english_prompt: englishPrompt,
      system_directive: systemDirective,
      full_optimized_prompt: fullOptimized,
      cultural_nuances_preserved: Array.isArray(parsed.cultural_nuances_preserved) && parsed.cultural_nuances_preserved.length > 0
        ? parsed.cultural_nuances_preserved
        : ['Семантическое намерение сохранено'],
      token_stats: tokenStats
    };

    setToCache(cacheKey, result);
    return result;
  } catch (error) {
    logger.error({ err: error }, 'Error calling Gemini in optimizePrompt:');
    return getMockPromptOptimization(prompt, targetOutputLanguage);
  }
}

function getMockPromptOptimization(prompt: string, targetOutputLanguage: string = 'Russian'): OptimizePromptResponse {
  const norm = prompt.toLowerCase();
  let englishPrompt = '';
  let nuances: string[] = [];

  if (norm.includes('отказ') || norm.includes('отказать') || norm.includes('сжечь мосты')) {
    englishPrompt = 'Decline the contractor politely yet firmly; avoid burning bridges.';
    nuances = [
      'Вежливый непрямой отказ (Face-saving refusal)',
      'Смягчение категоричности без потери твёрдости позиции'
    ];
  } else if (norm.includes('дорожку') || norm.includes('посидим') || norm.includes('вылет')) {
    englishPrompt = 'Write an evocative scene where characters observe the traditional quiet pause before departure ("posidim na dorozhku").';
    nuances = [
      'Традиционный ритуал паузы перед дорогой (Mindful pause)',
      'Культурный маркер сосредоточения и защиты от тревоги'
    ];
  } else if (norm.includes('да, но нет') || norm.includes('да но нет') || norm.includes('дедлайн')) {
    englishPrompt = "Politely convey hesitation: we likely won't approve the release by Friday's tight deadline.";
    nuances = [
      'Конверсационное согласие-подтверждение + скрытый отказ',
      'Этикетная формула бесконфликтного сомнения'
    ];
  } else if (norm.includes('неплохо') || norm.includes('в принципе') || norm.includes('напильник')) {
    englishPrompt = 'Give reserved feedback: functional draft, but needs hands-on polish for production.';
    nuances = [
      'Сдержанная похвала как сигнал умеренного разочарования',
      'Дистанцирование от открытой конфронтации'
    ];
  } else if (norm.includes('по уму') || norm.includes('на совесть') || norm.includes('авториз')) {
    englishPrompt = 'Build a production-ready user auth module with robust hashing, HMAC sessions, and strict input validation. No placeholders.';
    nuances = [
      'Идиома "по уму" (Industry best practices & robust architecture)',
      'Идиома "на совесть" (Production-ready, no shortcuts or placeholders)'
    ];
  } else {
    englishPrompt = compactTranslate(prompt);
    nuances = [
      'Семантическая компрессия (High-density English)',
      'Устранение избыточных кириллических байт-токенов'
    ];
  }

  const systemDirective = `Reply in ${targetOutputLanguage || 'Russian'}`;
  const fullOptimized = `${englishPrompt}\n\n[Instruction: ${systemDirective}]`;
  const tokenStats = computeTokenStats(prompt, fullOptimized);

  return {
    original_prompt: prompt,
    source_language: 'ru',
    target_output_language: targetOutputLanguage,
    english_prompt: englishPrompt,
    system_directive: systemDirective,
    full_optimized_prompt: fullOptimized,
    cultural_nuances_preserved: nuances,
    token_stats: tokenStats
  };
}

function compactTranslate(prompt: string): string {
  const norm = prompt.toLowerCase();
  if (norm.includes('код') || norm.includes('скрипт') || norm.includes('функци') || norm.includes('разработ')) {
    return 'Write production-ready, clean code for the requested task. Handle edge cases and optimize performance.';
  }
  if (norm.includes('ошибк') || norm.includes('баг') || norm.includes('исправ')) {
    return 'Debug and fix the issue. Provide root cause analysis and corrected code.';
  }
  if (norm.includes('объясн') || norm.includes('расскажи') || norm.includes('что такое')) {
    return 'Explain the core concept clearly and concisely with practical examples.';
  }
  if (norm.includes('план') || norm.includes('архитектур') || norm.includes('структур')) {
    return 'Design a concise, step-by-step architecture and implementation plan.';
  }
  if (norm.includes('ревью') || norm.includes('провер')) {
    return 'Conduct a thorough code review. Highlight security, performance, and best-practice improvements.';
  }
  return 'Execute the task with high precision and concise phrasing.';
}
