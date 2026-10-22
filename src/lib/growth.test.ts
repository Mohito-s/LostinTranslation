import { describe, it, expect } from 'vitest';
import { 
  getBenchmarkSummary, 
  generateMarketingDraft, 
  generateSvgBadge,
  CULTURAL_BENCHMARK_CASES 
} from './growth';

describe('Growth & Autonomous Marketing API', () => {
  it('returns valid benchmark data with rankings', () => {
    const summary = getBenchmarkSummary();
    expect(summary.cases.length).toBeGreaterThan(0);
    expect(summary.rankings.length).toBeGreaterThan(0);
    expect(summary.rankings[0].averageScore).toBeGreaterThanOrEqual(summary.rankings[1].averageScore);
  });

  it('contains expected cultural trap test cases', () => {
    const ids = CULTURAL_BENCHMARK_CASES.map(c => c.id);
    expect(ids).toContain('ru-da-net-navernoe');
    expect(ids).toContain('ja-iketara-iku');
  });

  it('generates marketing drafts for all platforms', () => {
    const platforms: ('habr' | 'vc' | 'dzen' | 'telegram' | 'yandex_direct')[] = [
      'habr', 
      'vc', 
      'dzen', 
      'telegram', 
      'yandex_direct'
    ];

    for (const p of platforms) {
      const draft = generateMarketingDraft(p);
      expect(draft.platform).toBe(p);
      expect(draft.title.length).toBeGreaterThan(5);
      expect(draft.content.length).toBeGreaterThan(10);
      expect(draft.callToAction.length).toBeGreaterThan(5);
      if (p === 'yandex_direct') {
        expect(draft.directAdDetails).toBeDefined();
        expect(draft.directAdDetails?.quickLinks.length).toBeGreaterThan(0);
        expect(draft.directAdDetails?.negativeKeywords.length).toBeGreaterThan(0);
      }
    }
  });

  it('generates an SVG badge', () => {
    const badge = generateSvgBadge('Passed', '95/100');
    expect(badge).toContain('<svg');
    expect(badge).toContain('cultural QA');
    expect(badge).toContain('Passed 95/100');
  });
});
