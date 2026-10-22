import { describe, it, expect, beforeEach } from 'vitest';
import { processChatCompletion } from './chatProxy';

beforeEach(() => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;
});

describe('chatProxy (OpenAI Drop-in Proxy)', () => {
  it('throws error if messages array is missing or empty', async () => {
    // @ts-expect-error testing invalid payload
    await expect(processChatCompletion({})).rejects.toThrow('Messages array is required');
    await expect(processChatCompletion({ messages: [] })).rejects.toThrow('Messages array is required');
  });

  it('processes user message, optimizes tokens and returns OpenAI compatible response', async () => {
    const res = await processChatCompletion({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: 'Сделай мне вежливый, но твердый отказ подрядчику, чтобы не обидеть человека и не сжечь мосты' }
      ]
    });

    expect(res.completion.object).toBe('chat.completion');
    expect(res.completion.id).toMatch(/^chatcmpl-/);
    expect(res.completion.model).toBe('gpt-4o');
    expect(res.completion.choices).toHaveLength(1);
    expect(res.completion.choices[0].message.role).toBe('assistant');
    expect(res.completion.choices[0].message.content).toBeTruthy();
    expect(res.completion.usage.prompt_tokens).toBeGreaterThan(0);
    expect(res.completion.usage.completion_tokens).toBeGreaterThan(0);

    // Check LIT Bridge enrichment metadata
    expect(res.optimized).toBeTruthy();
    expect(res.completion.lit_bridge).toBeDefined();
    expect(res.completion.lit_bridge?.tokens_saved).toBeGreaterThan(0);
    expect(res.completion.lit_bridge?.saved_percent).toBeGreaterThan(0);
    expect(res.completion.lit_bridge?.cultural_nuances.length).toBeGreaterThan(0);
  });

  it('handles multi-turn conversation and targets the last user message', async () => {
    const res = await processChatCompletion({
      messages: [
        { role: 'system', content: 'You are an executive assistant.' },
        { role: 'user', content: 'Привет' },
        { role: 'assistant', content: 'Здравствуйте! Чем могу помочь?' },
        { role: 'user', content: 'Напиши надежный модуль авторизации с хешированием паролей по уму, сессионными токенами, валидацией всех полей и защитой от перебора. Без заглушек, чисто и на совесть.' }
      ]
    });

    expect(res.completion.choices[0].message.content).toBeTruthy();
    expect(res.completion.lit_bridge?.tokens_saved).toBeGreaterThan(20);
    expect(res.completion.lit_bridge?.saved_percent).toBeGreaterThan(30);
  });
});
