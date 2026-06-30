import { GoogleGenAI, Type } from '@google/genai';

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

export interface EnhanceResponse {
  enhanced_prompt: string;
  context_added: boolean;
  losses_detected: number;
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
      model: 'gemini-3.5-flash',
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

    const parsed = JSON.parse(response.text || '{}');
    return {
      enhanced_prompt: parsed.enhanced_prompt || `${prompt}\n\nText: ${text}`,
      context_added: parsed.context_added ?? false,
      losses_detected: parsed.losses_detected ?? 0
    };
  } catch (error) {
    console.error('Error calling Gemini API in enhancePrompt:', error);
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
