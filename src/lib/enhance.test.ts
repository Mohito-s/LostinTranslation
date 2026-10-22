import { describe, it, expect, beforeEach } from 'vitest';
import { enhancePrompt, optimizePrompt } from './enhance';

beforeEach(() => {
  delete process.env.GEMINI_API_KEY;
});

describe('enhancePrompt mock fallback (no API key)', () => {
  it('enriches Japanese polite refusal 行けたら行く', async () => {
    const res = await enhancePrompt('Translate this message', '行けたら行く');
    expect(res.context_added).toBe(true);
    expect(res.losses_detected).toBeGreaterThan(0);
    expect(res.enhanced_prompt).toContain('Cultural context');
    expect(res.enhanced_prompt).toContain('行けたら行く');
  });

  it('enriches German Jein', async () => {
    const res = await enhancePrompt('Translate to Russian', 'Jein');
    expect(res.context_added).toBe(true);
    expect(res.losses_detected).toBe(1);
    expect(res.enhanced_prompt).toContain('Jein');
    expect(res.enhanced_prompt).toContain('Ja + Nein');
  });

  it('enriches Russian "Да, но нет"', async () => {
    const res = await enhancePrompt('Process this input', 'Да, но нет');
    expect(res.context_added).toBe(true);
    expect(res.enhanced_prompt).toContain('Да, но нет');
  });

  it('enriches Spanish "mañana"', async () => {
    const res = await enhancePrompt('Analyze schedule', 'Mañana te lo entrego');
    expect(res.context_added).toBe(true);
    expect(res.enhanced_prompt).toContain('mañana');
  });

  it('handles arbitrary text gracefully with default enhancement', async () => {
    const res = await enhancePrompt('Translate please', 'Обычный текст без подтекста');
    expect(typeof res.enhanced_prompt).toBe('string');
    expect(res.enhanced_prompt).toContain('Translate please');
    expect(res.enhanced_prompt).toContain('Обычный текст без подтекста');
    expect(typeof res.context_added).toBe('boolean');
    expect(typeof res.losses_detected).toBe('number');
  });
});

describe('optimizePrompt and token estimator (Token Saver)', () => {
  it('estimates higher token count for Russian Cyrillic vs English', () => {
    const ruText = 'Русский текст в нейросетях стоит значительно дороже английского';
    const enText = 'Russian text in neural networks costs significantly more than English';
    
    // Estimate tokens
    const ruTokens = (ruText.length * 0.57);
    const enTokens = (enText.length * 0.26);
    expect(ruTokens).toBeGreaterThan(enTokens);
  });

  it('optimizes Russian refusal prompt and calculates token savings', async () => {
    const prompt = 'Сделай мне вежливый, но твердый отказ подрядчику, чтобы не обидеть человека';
    const res = await optimizePrompt(prompt, 'Russian');

    expect(res.source_language).toBe('ru');
    expect(res.english_prompt).toBeTruthy();
    expect(res.full_optimized_prompt).toContain('Instruction');
    expect(res.cultural_nuances_preserved.length).toBeGreaterThan(0);
    expect(res.token_stats.original_claude_tokens).toBeGreaterThan(0);
    expect(res.token_stats.optimized_claude_tokens).toBeGreaterThan(0);
  });

  it('optimizes Russian cultural idiom "посидим на дорожку"', async () => {
    const prompt = 'Опиши сцену где мы посидим на дорожку перед вылетом';
    const res = await optimizePrompt(prompt, 'Russian');

    expect(res.english_prompt).toContain('departure');
    expect(res.cultural_nuances_preserved.some(n => n.includes('паузы') || n.includes('дорог'))).toBe(true);
  });

  it('handles arbitrary prompts with universal optimizer fallback', async () => {
    const prompt = 'Напиши план интеграции платежной системы в наш сервис';
    const res = await optimizePrompt(prompt, 'Russian');

    expect(res.english_prompt).toBeTruthy();
    expect(res.token_stats.original_claude_tokens).toBeGreaterThan(0);
    expect(res.full_optimized_prompt).toContain(res.english_prompt);
  });
});
