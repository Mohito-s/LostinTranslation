import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import os from 'os';
import path from 'path';
import fs from 'fs';

const originalCwd = process.cwd();

type DbModule = typeof import('./db');

let tempDir: string;
let db: DbModule;

beforeEach(async () => {
  vi.resetModules();
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  delete process.env.SEED_DEMO_KEYS;
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lit-db-'));
  process.chdir(tempDir);
  db = await import('./db');
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe('local file database', () => {
  it('creates users and finds them by email (case-insensitive)', async () => {
    const user = await db.createUser('dev@example.com', 'hash');
    expect(user.id).toBeTruthy();
    expect(user.email).toBe('dev@example.com');

    const found = await db.getUserByEmail('DEV@example.com');
    expect(found?.email).toBe('dev@example.com');
  });

  it('rejects duplicate emails', async () => {
    await db.createUser('dev@example.com', 'hash');
    await expect(db.createUser('dev@example.com', 'hash2')).rejects.toThrow();
  });

  it('does not seed demo keys by default', async () => {
    const all = await db.getDb();
    expect(all.apiKeys).toHaveLength(0);
  });

  it('seeds demo keys only when SEED_DEMO_KEYS=true', async () => {
    vi.resetModules();
    process.env.SEED_DEMO_KEYS = 'true';
    const seededDb = await import('./db');
    const all = await seededDb.getDb();
    expect(all.apiKeys.map(k => k.key)).toContain('ltk_demokey12345');
    expect(all.apiKeys.map(k => k.key)).toContain('ltk_freekey98765');
  });

  it('generates, validates and revokes API keys', async () => {
    const user = await db.createUser('dev@example.com', 'hash');
    const key = await db.generateApiKey('Test Key', 'free', user.id);
    expect(key.key).toMatch(/^ltk_[0-9a-f]{24}$/);

    const valid = await db.validateApiKey(key.key);
    expect(valid?.name).toBe('Test Key');

    const revoked = await db.revokeApiKey(key.key, user.id);
    expect(revoked).toBe(true);
    expect(await db.validateApiKey(key.key)).toBeNull();
  });

  it('cannot revoke a key owned by another user', async () => {
    const owner = await db.createUser('owner@example.com', 'hash');
    const attacker = await db.createUser('attacker@example.com', 'hash');
    const key = await db.generateApiKey('K', 'free', owner.id);

    const revoked = await db.revokeApiKey(key.key, attacker.id);
    expect(revoked).toBe(false);
    expect(await db.validateApiKey(key.key)).not.toBeNull();
  });

  it('usage log increments the key usage count', async () => {
    const user = await db.createUser('dev@example.com', 'hash');
    const key = await db.generateApiKey('K', 'free', user.id);

    await db.addUsageLog({
      userId: user.id, apiKey: key.key, endpoint: 'analyze',
      textLength: 10, lossesDetected: 2, success: true, ipAddress: '127.0.0.1'
    });
    await db.addUsageLog({
      userId: user.id, apiKey: key.key, endpoint: 'enhance',
      textLength: 5, lossesDetected: 0, success: true, ipAddress: '127.0.0.1'
    });

    const updated = await db.validateApiKey(key.key);
    expect(updated?.usageCount).toBe(2);
  });

  it('lists only the logs of the given user', async () => {
    const user = await db.createUser('dev@example.com', 'hash');
    const other = await db.createUser('other@example.com', 'hash');

    await db.addUsageLog({
      userId: user.id, apiKey: 'free', endpoint: 'analyze',
      textLength: 3, lossesDetected: 1, success: true, ipAddress: '127.0.0.1'
    });
    await db.addUsageLog({
      userId: other.id, apiKey: 'free', endpoint: 'enhance',
      textLength: 3, lossesDetected: 1, success: true, ipAddress: '127.0.0.1'
    });

    const logs = await db.getUserLogs(user.id);
    expect(logs).toHaveLength(1);
    expect(logs[0].endpoint).toBe('analyze');
  });

  it('safely handles non-string or malformed API keys in validateApiKey', async () => {
    expect(await db.validateApiKey('')).toBeNull();
    expect(await db.validateApiKey(null as unknown as string)).toBeNull();
    expect(await db.validateApiKey(12345 as unknown as string)).toBeNull();
    expect(await db.validateApiKey('a'.repeat(200))).toBeNull();
  });
});