import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import os from 'os';
import path from 'path';
import fs from 'fs';

const originalCwd = process.cwd();

let tempDir: string;
let db: typeof import('./db');
let rateLimit: typeof import('./rateLimit');

beforeEach(async () => {
  vi.resetModules();
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lit-ratelimit-'));
  process.chdir(tempDir);
  db = await import('./db');
  rateLimit = await import('./rateLimit');
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe('rate limiting', () => {
  it('allows anonymous IP requests up to the free limit, then blocks', async () => {
    for (let i = 0; i < 10; i++) {
      const check = await rateLimit.checkRateLimit('1.2.3.4', null);
      expect(check.allowed).toBe(true);
      await db.addUsageLog({
        apiKey: 'free', endpoint: 'analyze',
        textLength: 1, lossesDetected: 0, success: true, ipAddress: '1.2.3.4'
      });
    }

    const blocked = await rateLimit.checkRateLimit('1.2.3.4', null);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('does not share limits between different IPs', async () => {
    await db.addUsageLog({
      apiKey: 'free', endpoint: 'analyze',
      textLength: 1, lossesDetected: 0, success: true, ipAddress: '1.2.3.4'
    });
    const other = await rateLimit.checkRateLimit('9.9.9.9', null);
    expect(other.allowed).toBe(true);
    expect(other.remaining).toBe(10);
  });

  it('blocks a free key after 50 requests within 24h', async () => {
    const user = await db.createUser('dev@example.com', 'hash');
    const key = await db.generateApiKey('free key', 'free', user.id);

    for (let i = 0; i < 50; i++) {
      const keyObj = await db.validateApiKey(key.key);
      const check = await rateLimit.checkRateLimit('10.0.0.1', keyObj);
      expect(check.allowed).toBe(true);
      await db.addUsageLog({
        userId: user.id, apiKey: key.key, endpoint: 'analyze',
        textLength: 1, lossesDetected: 0, success: true, ipAddress: '10.0.0.1'
      });
    }

    const keyObj = await db.validateApiKey(key.key);
    const blocked = await rateLimit.checkRateLimit('10.0.0.1', keyObj);
    expect(blocked.allowed).toBe(false);
  });
});