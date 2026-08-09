import { describe, it, expect, beforeEach } from 'vitest';
import { analyzeText } from './analyze';

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