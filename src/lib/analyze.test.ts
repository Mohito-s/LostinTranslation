import { describe, it, expect, beforeEach } from 'vitest';
import { analyzeText, compareTranslation } from './analyze';

beforeEach(() => {
  delete process.env.GEMINI_API_KEY;
});

describe('analyzeText mock fallback (no API key)', () => {
  it('detects Japanese polite refusal 行けたら行く', async () => {
    const res = await analyzeText('行けたら行く', 'en');
    expect(res.found).toBe(true);
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items[0].fragment).toContain('行けたら行く');
  });

  it('detects German Jein', async () => {
    const res = await analyzeText('Jein', 'en');
    expect(res.found).toBe(true);
    expect(res.items[0].fragment).toContain('Jein');
  });

  it('detects Russian "Да, но нет"', async () => {
    const res = await analyzeText('Да, но нет', 'en');
    expect(res.found).toBe(true);
    expect(res.items.length).toBeGreaterThan(0);
  });

  it('detects Spanish "mañana"', async () => {
    const res = await analyzeText('Mañana te lo mando', 'en');
    expect(res.found).toBe(true);
  });

  it('returns a well-formed response for arbitrary text', async () => {
    const res = await analyzeText('Привет как дела', 'en');
    expect(res.original).toBe('Привет как дела');
    expect(Array.isArray(res.items)).toBe(true);
    expect(typeof res.literal_translation).toBe('string');
  });
});

describe('compareTranslation mock fallback (no API key)', () => {
  it('flags a literal translation of Japanese polite refusal', async () => {
    const res = await compareTranslation('行けたら行く', 'I will go if I can');
    expect(res.score).not.toBeNull();
    expect(res.score!).toBeLessThan(70);
    expect(res.issues.length).toBeGreaterThan(0);
    expect(res.issues[0].severity).toBe('high');
  });

  it('approves a translation that preserves the meaning', async () => {
    const res = await compareTranslation('行けたら行く', "I probably won't be able to make it");
    expect(res.issues.length).toBe(0);
    expect(res.score).toBe(100);
    expect(res.verdict).toBe('Meaning preserved');
  });

  it('flags Russian "Да, но нет" rendered as "yes, but no"', async () => {
    const res = await compareTranslation('Да, но нет', 'Yes, but no');
    expect(res.issues.length).toBeGreaterThan(0);
  });

  it('returns an unverifiable result for unknown source text', async () => {
    const res = await compareTranslation('Hello world', 'Привет мир');
    expect(res.score).toBeNull();
    expect(res.issues.length).toBe(0);
  });
});