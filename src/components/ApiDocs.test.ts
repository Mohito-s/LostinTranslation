import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import request from 'supertest';
import { ENDPOINTS, formatPythonPayload, generateSnippetCode, copyToClipboard, parseSseResponse } from './ApiDocs';

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

  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lit-apidocs-test-'));
  process.chdir(tempDir);

  const server = await import('../../server.ts');
  app = await server.createApp();
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe('ApiDocs Component & Interactive Console Integrity', () => {
  const componentPath = path.resolve(originalCwd, 'src/components/ApiDocs.tsx');
  const fileContent = fs.readFileSync(componentPath, 'utf-8');

  it('R1. Implements Stripe/Mintlify 3-column responsive layout', () => {
    // Left column: col-span-3, Center: col-span-5, Right: col-span-4 (sum = 12)
    expect(fileContent).toContain('min-[1200px]:grid-cols-12');
    expect(fileContent).toContain('min-[1200px]:col-span-3');
    expect(fileContent).toContain('min-[1200px]:col-span-5');
    expect(fileContent).toContain('min-[1200px]:col-span-4');
    // Sticky positioning on desktop
    expect(fileContent).toContain('min-[1200px]:sticky');
    expect(fileContent).toContain('min-[1200px]:top-24');
  });

  it('R1 & R2. Method badges and Celestial styling in navigation', () => {
    // GET method badge in emerald
    expect(fileContent).toContain('bg-emerald-500/20 text-emerald-400');
    // POST method badge in sky
    expect(fileContent).toContain('bg-sky-500/20 text-sky-300');
    // Primary action button styling
    expect(fileContent).toContain('celestial-btn-primary');
    // Frosted card styling
    expect(fileContent).toContain('frosted-card');
    expect(fileContent).toContain('backdrop-blur-2xl');
  });

  it('R1. Specifies all 6 core endpoints with schemas and tables', () => {
    const expectedEndpoints = [
      '/api/analyze',
      '/api/compare',
      '/api/optimize-prompt',
      '/api/enhance',
      '/v1/chat/completions',
      '/api/health'
    ];

    for (const ep of expectedEndpoints) {
      expect(fileContent).toContain(ep);
    }

    // Headers, Body Schema, and HTTP Status tables
    expect(fileContent).toContain('headersTableTitle');
    expect(fileContent).toContain('schemaTableTitle');
    expect(fileContent).toContain('statusCodesTitle');
    expect(fileContent).toContain('requiredBadge');
    expect(fileContent).toContain('optionalBadge');
  });

  it('R1 & R3. Interactive console contains required snippet languages and neutral AI Gateway name', () => {
    expect(fileContent).toContain('cURL');
    expect(fileContent).toContain('JavaScript');
    expect(fileContent).toContain('Python');
    // Exact universal neutral title (R3 requirement)
    expect(fileContent).toContain('OpenAI SDK / Drop-in AI Gateway (Cursor, OpenCode, LibreChat)');
  });

  it('R1. Live Request Runner includes latency measurement and JSON output', () => {
    expect(fileContent).toContain('performance.now()');
    expect(fileContent).toContain('runnerTimeMs');
    expect(fileContent).toContain('executeLiveTest');
    expect(fileContent).toContain('copyResponseJson');
    expect(fileContent).toContain('JSON.stringify(runnerResponse, null, 2)');
  });

  it('Acceptance Criteria: Server endpoints tested by the runner respond correctly', async () => {
    // 1. GET /api/health
    const healthRes = await request(app).get('/api/health');
    expect(healthRes.status).toBe(200);
    expect(healthRes.body).toHaveProperty('status', 'ok');

    // 2. POST /api/analyze
    const analyzeRes = await request(app)
      .post('/api/analyze')
      .send({ text: 'Да нет наверное, я лучше дома посижу', target_language: 'en' });
    expect(analyzeRes.status).toBe(200);
    expect(analyzeRes.body).toHaveProperty('items');

    // 3. POST /api/compare
    const compareRes = await request(app)
      .post('/api/compare')
      .send({
        source_text: 'Да ладно тебе, всё нормально',
        target_text: 'Come on, everything is totally fine',
        target_language: 'en'
      });
    expect(compareRes.status).toBe(200);
    expect(compareRes.body).toHaveProperty('score');

    // 4. POST /api/optimize-prompt
    const optRes = await request(app)
      .post('/api/optimize-prompt')
      .send({
        prompt: 'Сделай мне вежливый, но твердый отказ подрядчику',
        targetLanguage: 'Russian'
      });
    expect(optRes.status).toBe(200);
    expect(optRes.body).toHaveProperty('english_prompt');
    expect(optRes.body).toHaveProperty('token_stats');

    // 5. POST /v1/chat/completions
    const chatRes = await request(app)
      .post('/v1/chat/completions')
      .send({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Привет' }]
      });
    expect(chatRes.status).toBe(200);
    expect(chatRes.body).toHaveProperty('choices');
    expect(chatRes.body).toHaveProperty('lit_bridge');

    // 6. POST /api/enhance (forbidden without key)
    const enhanceRes = await request(app)
      .post('/api/enhance')
      .send({ prompt: 'test', text: 'test' });
    expect(enhanceRes.status).toBe(403);
    expect(enhanceRes.body).toHaveProperty('error', 'Forbidden');
  });

  it('Unit: formatPythonPayload correctly serializes boolean and null values for Python including arrays and preserves string literals', () => {
    const raw = JSON.stringify({
      stream: false,
      flag: true,
      extra: null,
      message: 'keep true and false in strings: status: false, is: true',
      nestedList: [true, false, null],
      emptyArr: [],
      emptyObj: {}
    });
    const py = formatPythonPayload(raw);
    expect(py).toContain(': False');
    expect(py).toContain(': True');
    expect(py).toContain(': None');
    // Strings must not be corrupted
    expect(py).toContain('keep true and false in strings: status: false, is: true');
    // Array elements must be converted to Python syntax
    expect(py).toContain('True,');
    expect(py).toContain('False,');
    expect(py).toContain('None');
    expect(py).toContain('[]');
    expect(py).toContain('{}');
  });

  it('Unit: copyToClipboard handles both modern Clipboard API and fallback securely', async () => {
    // 1. When navigator.clipboard.writeText is available and resolves
    const originalNavigator = globalThis.navigator;
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: writeTextMock } },
      configurable: true,
      writable: true
    });

    const success = await copyToClipboard('test copy');
    expect(success).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('test copy');

    // 2. Empty text returns false
    const emptySuccess = await copyToClipboard('');
    expect(emptySuccess).toBe(false);

    // 3. When writeText rejects, function handles error gracefully without throwing
    writeTextMock.mockRejectedValueOnce(new Error('Clipboard permission denied'));
    const failedSuccess = await copyToClipboard('test fail');
    expect(typeof failedSuccess).toBe('boolean');

    // Restore navigator
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true
    });
  });

  it('Unit: generateSnippetCode generates valid snippets for cURL, JS, Python, and OpenAI', () => {
    const chatEp = ENDPOINTS.find((e) => e.id === 'chat-completions')!;
    const analyzeEp = ENDPOINTS.find((e) => e.id === 'analyze')!;
    const healthEp = ENDPOINTS.find((e) => e.id === 'health')!;

    // 1. OpenAI snippet default fallback
    const openaiCode = generateSnippetCode(chatEp, 'openai', 'http://localhost:3000', 'lit_live_testkey', '{}');
    expect(openaiCode).toContain("baseURL: 'http://localhost:3000/v1'");
    expect(openaiCode).toContain("apiKey: 'lit_live_testkey'");
    expect(openaiCode).toContain('client.chat.completions.create');

    // 1b. OpenAI snippet with dynamic customized payload
    const customPayload = JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Кастомный запрос для шлюза' }],
      stream: true
    });
    const customOpenAiCode = generateSnippetCode(
      chatEp,
      'openai',
      'http://localhost:3000',
      'lit_live_testkey',
      customPayload
    );
    expect(customOpenAiCode).toContain('Кастомный запрос для шлюза');
    expect(customOpenAiCode).toContain('"stream": true');

    // 2. Python snippet for chat-completions
    const pyChatCode = generateSnippetCode(
      chatEp,
      'python',
      'http://localhost:3000',
      'lit_live_testkey',
      JSON.stringify({ stream: false })
    );
    expect(pyChatCode).toContain('import requests');
    expect(pyChatCode).toContain('"Authorization": "Bearer lit_live_testkey"');
    expect(pyChatCode).toContain(': False');

    // 3. JavaScript snippet for analyze
    const jsAnalyzeCode = generateSnippetCode(
      analyzeEp,
      'javascript',
      'http://localhost:3000',
      'lit_live_testkey',
      JSON.stringify({ text: 'Тест' })
    );
    expect(jsAnalyzeCode).toContain("fetch('http://localhost:3000/api/analyze'");
    expect(jsAnalyzeCode).toContain("'x-api-key': 'lit_live_testkey'");
    expect(jsAnalyzeCode).toContain('JSON.stringify(');

    // 4. cURL GET snippet for health
    const curlHealthCode = generateSnippetCode(healthEp, 'curl', 'http://localhost:3000', '', '');
    expect(curlHealthCode).toContain('curl -X GET "http://localhost:3000/api/health"');
    expect(curlHealthCode).toContain('-H "Accept: application/json"');

    // 5. cURL POST snippet with escaped single quotes
    const curlEscapeCode = generateSnippetCode(
      analyzeEp,
      'curl',
      'http://localhost:3000',
      'key',
      JSON.stringify({ text: "It's a test" })
    );
    expect(curlEscapeCode).toContain('curl -X POST');
    expect(curlEscapeCode).not.toContain("-d '{\"text\":\"It's a test\"}'");
  });

  it('Unit: ENDPOINTS contract guarantees all required fields, schemas, and status codes', () => {
    expect(ENDPOINTS.length).toBe(6);

    for (const ep of ENDPOINTS) {
      expect(ep.path).toMatch(/^\/(api|v1)\//);
      expect(['GET', 'POST']).toContain(ep.method);
      expect(ep.titleRu).toBeTruthy();
      expect(ep.titleEn).toBeTruthy();
      expect(ep.summaryRu).toBeTruthy();
      expect(ep.summaryEn).toBeTruthy();
      expect(ep.statusCodes.length).toBeGreaterThanOrEqual(2);

      // Verify headers contract: all endpoints specify auth headers
      const headerNames = ep.headers.map((h) => h.name);
      expect(headerNames).toContain('x-api-key');
      expect(headerNames).toContain('Authorization');

      const okStatus = ep.statusCodes.find((s) => s.code === 200);
      expect(okStatus).toBeDefined();

      if (ep.method === 'POST') {
        const codes = ep.statusCodes.map((s) => s.code);
        expect(codes).toContain(400);
        expect(codes).toContain(401);
        expect(codes).toContain(429);
        expect(ep.bodyParams.length).toBeGreaterThan(0);
        for (const p of ep.bodyParams) {
          expect(['string', 'number', 'boolean', 'array', 'object']).toContain(p.type);
          expect(typeof p.required).toBe('boolean');
        }
      }
    }
  });

  it('Unit: parseSseResponse handles spaces, missing spaces, CRLF line endings, and [DONE] marker', () => {
    // 1. CRLF line endings with mixed data: formatting and [DONE]
    const sseInput = 'data: {"id":"chatcmpl-1","chunk":1}\r\ndata:{"id":"chatcmpl-2","chunk":2}\r\ndata: [DONE]\r\n';
    const parsed = parseSseResponse(sseInput);
    expect(parsed.stream).toBe(true);
    expect(parsed.events_count).toBe(3);
    expect(parsed.events[0]).toEqual({ id: 'chatcmpl-1', chunk: 1 });
    expect(parsed.events[1]).toEqual({ id: 'chatcmpl-2', chunk: 2 });
    expect(parsed.events[2]).toEqual({ event: '[DONE]' });

    // 2. Non-JSON raw text fallback
    const rawInput = 'data: non-json chunk content\ndata: [DONE]';
    const rawParsed = parseSseResponse(rawInput);
    expect(rawParsed.events[0]).toEqual({ rawData: 'non-json chunk content' });
    expect(rawParsed.events[1]).toEqual({ event: '[DONE]' });
  });

  it('Unit: copyToClipboard falls back to DOM textarea with selectionRange and cleans up on error', async () => {
    // Disable navigator.clipboard
    const originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
      writable: true
    });

    const mockSelect = vi.fn();
    const mockSetSelectionRange = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();
    const mockExecCommand = vi.fn().mockReturnValue(true);

    const dummyTextarea = {
      value: '',
      style: {},
      setAttribute: vi.fn(),
      select: mockSelect,
      setSelectionRange: mockSetSelectionRange,
      parentNode: {
        removeChild: mockRemoveChild
      }
    };

    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, 'document', {
      value: {
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild
        },
        createElement: vi.fn().mockReturnValue(dummyTextarea),
        execCommand: mockExecCommand
      },
      configurable: true,
      writable: true
    });

    const success = await copyToClipboard('safari text');
    expect(success).toBe(true);
    expect(mockSelect).toHaveBeenCalled();
    expect(mockSetSelectionRange).toHaveBeenCalledWith(0, 11);
    expect(mockExecCommand).toHaveBeenCalledWith('copy');
    expect(mockRemoveChild).toHaveBeenCalledWith(dummyTextarea);

    // Restore globals
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true
    });
    Object.defineProperty(globalThis, 'document', {
      value: originalDocument,
      configurable: true,
      writable: true
    });
  });

  it('Unit: generateSnippetCode produces clean 2-space indented OpenAI payloads', () => {
    const chatEp = ENDPOINTS.find((e) => e.id === 'chat-completions')!;
    const customPayload = JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Привет шлюз' }]
    });

    const code = generateSnippetCode(chatEp, 'openai', 'http://localhost:3000', 'test_key', customPayload);
    // Closing brace of create({ ... }) must have standard 2-space indentation aligning with function body
    expect(code).toContain('  const completion = await client.chat.completions.create({\n    "model": "gpt-4o",\n    "messages": [\n      {\n        "role": "user",\n        "content": "Привет шлюз"\n      }\n    ]\n  });');
  });

  it('R1 & Robustness: Component includes AbortController, cleanup on unmount, and accessible label ids', () => {
    expect(fileContent).toContain('abortControllerRef');
    expect(fileContent).toContain('AbortController');
    expect(fileContent).toContain('runner-api-key-input');
    expect(fileContent).toContain('runner-request-body');
    expect(fileContent).toContain('htmlFor="runner-api-key-input"');
    expect(fileContent).toContain('htmlFor="runner-request-body"');
  });
});
