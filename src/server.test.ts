import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import os from 'os';
import path from 'path';
import fs from 'fs';
import request from 'supertest';

const originalCwd = process.cwd();

let tempDir: string;
let app: import('express').Express;

beforeEach(async () => {
  vi.resetModules();
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  delete process.env.SEED_DEMO_KEYS;
  delete process.env.GEMINI_API_KEY;
  process.env.NODE_ENV = 'test';
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lit-http-'));
  process.chdir(tempDir);
  const server = await import('../server.ts');
  app = await server.createApp();
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe('HTTP API', () => {
  it('registers, logs in and reads the profile', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dev@example.com', password: 'secret123' });
    expect(reg.status).toBe(201);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dev@example.com', password: 'secret123' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('dev@example.com');
  });

  it('rejects login with a wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dev@example.com', password: 'secret123' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dev@example.com', password: 'wrong-password' });
    expect(login.status).toBe(401);
  });

  it('validates request bodies', async () => {
    const res = await request(app).post('/api/analyze').send({});
    expect(res.status).toBe(400);
  });

  it('analyze returns mock results without a key', async () => {
    const res = await request(app).post('/api/analyze').send({ text: '行けたら行く' });
    expect(res.status).toBe(200);
    expect(res.body.found).toBe(true);
    expect(res.body.items[0].fragment).toContain('行けたら行く');
  });

  it('analyze rejects an invalid API key', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .set('x-api-key', 'ltk_invalidkey1234567890ab')
      .send({ text: 'hello' });
    expect(res.status).toBe(401);
  });

  it('compare flags meaning loss without a key', async () => {
    const res = await request(app)
      .post('/api/compare')
      .send({ source_text: '行けたら行く', target_text: 'I will go if I can' });
    expect(res.status).toBe(200);
    expect(res.body.score).toBeLessThan(70);
    expect(res.body.issues.length).toBeGreaterThan(0);
  });

  it('compare validates its body', async () => {
    const res = await request(app).post('/api/compare').send({ source_text: 'only source' });
    expect(res.status).toBe(400);
  });

  it('enhance requires an API key (403 without)', async () => {
    const res = await request(app)
      .post('/api/enhance')
      .send({ prompt: 'summarize', text: 'Да, но нет' });
    expect(res.status).toBe(403);
  });

  it('full flow: register -> create key -> enhance -> dashboard stats', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'k@example.com', password: 'secret123' });
    expect(reg.status).toBe(201);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'k@example.com', password: 'secret123' });
    const token = login.body.token;

    const created = await request(app)
      .post('/api/keys')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'test', tier: 'free' });
    expect(created.status).toBe(201);
    const apiKey = created.body.key;
    expect(apiKey).toMatch(/^ltk_[0-9a-f]{24}$/);

    const enhanced = await request(app)
      .post('/api/enhance')
      .set('x-api-key', apiKey)
      .send({ prompt: 'Translate and summarize', text: '行けたら行く' });
    expect(enhanced.status).toBe(200);
    expect(enhanced.body.enhanced_prompt).toContain('行けたら行く');

    const stats = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(stats.status).toBe(200);
    expect(stats.body.totalRequests).toBeGreaterThanOrEqual(1);
    expect(stats.body.apiKeys).toHaveLength(1);
  });
});