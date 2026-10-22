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
  
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lit-http-smoke-'));
  process.chdir(tempDir);
  
  const server = await import('../server.ts');
  app = await server.createApp();
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe('Smoke Tests - LostInTranslation API', () => {
  describe('Health and Docs', () => {
    it('GET /api/health should return 200 OK', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 'ok' });
      expect(res.headers).toHaveProperty('x-xss-protection');
    });

    it('GET /docs should serve Swagger UI', async () => {
      const res = await request(app).get('/docs/');
      // Could be redirect or 200 html
      expect([200, 301, 302]).toContain(res.status);
      if (res.status === 200) {
        expect(res.text).toContain('swagger');
      }
    });

    it('POST /api/optimize-prompt should return optimized english prompt and token savings', async () => {
      const res = await request(app)
        .post('/api/optimize-prompt')
        .send({ prompt: 'Сделай мне вежливый, но твердый отказ подрядчику' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('english_prompt');
      expect(res.body).toHaveProperty('token_stats');
      expect(res.body.token_stats).toHaveProperty('saved_claude_percent');
      expect(res.body.token_stats.original_claude_tokens).toBeGreaterThan(0);
    });

    it('POST /v1/chat/completions serves OpenAI drop-in proxy with token savings metadata', async () => {
      const res = await request(app)
        .post('/v1/chat/completions')
        .send({
          model: 'gpt-4o',
          messages: [
            { role: 'user', content: 'Сделай мне вежливый, но твердый отказ подрядчику, чтобы не обидеть человека и не сжечь мосты' }
          ]
        });
      expect(res.status).toBe(200);
      expect(res.headers['x-lit-optimized']).toBe('true');
      expect(res.headers['x-lit-tokens-saved']).toBeDefined();
      expect(res.body.object).toBe('chat.completion');
      expect(res.body.choices[0].message.role).toBe('assistant');
      expect(res.body.choices[0].message.content).toBeTruthy();
      expect(res.body.lit_bridge).toBeDefined();
      expect(res.body.lit_bridge.tokens_saved).toBeGreaterThan(0);
    });

    it('POST /v1/chat/completions supports streaming mode (SSE)', async () => {
      const res = await request(app)
        .post('/v1/chat/completions')
        .send({
          model: 'gpt-4o',
          stream: true,
          messages: [
            { role: 'user', content: 'Сделай мне вежливый отказ' }
          ]
        });
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/event-stream');
      expect(res.text).toContain('data:');
      expect(res.text).toContain('[DONE]');
    });
  });

  describe('Full Auth & Key Flow', () => {
    it('handles register, login, get profile, create key, use key, dashboard, revoke key', async () => {
      // 1. Register
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ email: 'smoke@example.com', password: 'secure_password' });
      expect(reg.status).toBe(201);
      
      // 2. Login
      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: 'smoke@example.com', password: 'secure_password' });
      expect(login.status).toBe(200);
      expect(login.body).toHaveProperty('token');
      const token = login.body.token;

      // 3. Profile
      const me = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(me.status).toBe(200);
      expect(me.body.user.email).toBe('smoke@example.com');

      // 4. Create Key
      const keyRes = await request(app)
        .post('/api/keys')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Smoke Test Key', tier: 'pro' });
      expect(keyRes.status).toBe(201);
      expect(keyRes.body).toHaveProperty('key');
      const apiKey = keyRes.body.key;

      // List keys
      const keysList = await request(app)
        .get('/api/keys')
        .set('Authorization', `Bearer ${token}`);
      expect(keysList.status).toBe(200);
      expect(Array.isArray(keysList.body)).toBe(true);
      expect(keysList.body.length).toBeGreaterThan(0);

      // 5. Use Key on Enhance
      const enhanceRes = await request(app)
        .post('/api/enhance')
        .set('x-api-key', apiKey)
        .send({ prompt: 'Fix translation', text: '行けたら行く' });
      expect(enhanceRes.status).toBe(200);
      expect(enhanceRes.body).toHaveProperty('enhanced_prompt');
      expect(enhanceRes.headers).toHaveProperty('x-ratelimit-limit');

      // 6. Dashboard Stats
      const stats = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);
      expect(stats.status).toBe(200);
      expect(stats.body).toHaveProperty('totalRequests');
      expect(stats.body.apiKeys.length).toBe(1);

      // 7. Revoke Key
      const revoke = await request(app)
        .post('/api/keys/revoke')
        .set('Authorization', `Bearer ${token}`)
        .send({ key: apiKey });
      expect(revoke.status).toBe(200);
      
      const keysListAfter = await request(app)
        .get('/api/keys')
        .set('Authorization', `Bearer ${token}`);
      expect(keysListAfter.body.length).toBe(1);
      expect(keysListAfter.body[0].status).toBe('revoked');
    });
  });

  describe('Edge Cases and Errors', () => {
    it('POST /api/auth/register with empty body', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.status).toBe(400);
    });

    it('POST /api/analyze without body', async () => {
      const res = await request(app).post('/api/analyze').send({});
      expect(res.status).toBe(400);
    });

    it('POST /api/compare without body', async () => {
      const res = await request(app).post('/api/compare').send({});
      expect(res.status).toBe(400);
    });

    it('GET /api/auth/me with invalid/expired token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });

    it('POST /api/auth/register rejects invalid email or short password', async () => {
      const res1 = await request(app).post('/api/auth/register').send({ email: 'notanemail', password: '123' });
      expect(res1.status).toBe(400);

      const res2 = await request(app).post('/api/auth/register').send({ email: 'valid@example.com', password: '123' });
      expect(res2.status).toBe(400);
    });

    it('POST /api/keys/revoke rejects missing or invalid key parameter', async () => {
      const login = await request(app).post('/api/auth/oauth').send({ provider: 'github' });
      const token = login.body.token;

      const res = await request(app)
        .post('/api/keys/revoke')
        .set('Authorization', `Bearer ${token}`)
        .send({ key: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('OAuth', () => {
    it('POST /api/auth/oauth handles mock OAuth', async () => {
      const res = await request(app).post('/api/auth/oauth').send({ provider: 'google' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email');
    });
  });

  describe('Analyze and Compare (No key)', () => {
    it('POST /api/analyze returns 200 with mock data', async () => {
      const res = await request(app).post('/api/analyze').send({ text: 'test text' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('found');
      expect(res.body).toHaveProperty('items');
    });

    it('POST /api/compare returns 200 with mock data', async () => {
      const res = await request(app).post('/api/compare').send({ source_text: 'a', target_text: 'b' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('score');
      expect(res.body).toHaveProperty('issues');
    });
  });

  describe('Growth API', () => {
    it('GET /api/growth/benchmark', async () => {
      const res = await request(app).get('/api/growth/benchmark');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('cases');
      expect(res.body).toHaveProperty('rankings');
    });

    it('GET /api/growth/draft', async () => {
      const res = await request(app).get('/api/growth/draft').query({ platform: 'habr' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('content');
    });

    it('GET /api/growth/badge', async () => {
      const res = await request(app).get('/api/growth/badge').query({ status: 'Awesome', score: 100 });
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('image/svg+xml');
      expect(res.text || (res.body && res.body.toString())).toContain('Awesome');
    });
  });
});
