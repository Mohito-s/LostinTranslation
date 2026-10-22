// Load environment variables FIRST, before any module that reads process.env
// at import time (auth.ts reads SESSION_SECRET, db.ts reads DATABASE_URL).
import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import crypto from 'crypto';
import { pathToFileURL, fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import logger from './src/lib/logger';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import helmet from 'helmet';

// Import local business logic
import { 
  getDb, 
  generateApiKey, 
  revokeApiKey, 
  validateApiKey, 
  addUsageLog,
  createUser,
  getUserByEmail,
  getUserById,
  getUserKeys,
  getUserLogs,
  closeDb
} from './src/lib/db';
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  requireAuth, 
  optionalAuth, 
  AuthenticatedRequest 
} from './src/lib/auth';
import { analyzeText, compareTranslation } from './src/lib/analyze';
import { enhancePrompt, optimizePrompt } from './src/lib/enhance';
import { processChatCompletion } from './src/lib/chatProxy';
import { checkRateLimit } from './src/lib/rateLimit';
import { getBenchmarkSummary, generateMarketingDraft, generateSvgBadge } from './src/lib/growth';

export async function createApp() {
  const app = express();

  // Security headers (CSP, XSS, clickjacking protection)
  app.use(helmet({
    contentSecurityPolicy: false,
  }));

  // Middleware to parse json bodies
  app.use(express.json({ limit: '1mb' }));

  // CORS: '*' by default (public API), or a comma-separated allowlist via CORS_ORIGIN
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.use(cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map(s => s.trim()),
  }));

  // Trust proxies when running behind Cloud Run / nginx (TRUST_PROXY=true or hop count).
  const trustProxy = process.env.TRUST_PROXY;
  if (trustProxy) {
    app.set('trust proxy', trustProxy === 'true' ? true : Number(trustProxy));
  }

  // Swagger UI for API docs
  let swaggerDocument: any = null;
  try {
    const candidatePaths = [
      path.join(process.cwd(), 'src/openapi.yaml'),
      path.join(process.cwd(), 'openapi.yaml'),
    ];
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      const dir = path.dirname(fileURLToPath(import.meta.url));
      candidatePaths.push(path.join(dir, 'src/openapi.yaml'));
      candidatePaths.push(path.join(dir, '../src/openapi.yaml'));
      candidatePaths.push(path.join(dir, 'openapi.yaml'));
    }
    const resolvedPath = candidatePaths.find(p => fs.existsSync(p));
    if (resolvedPath) {
      swaggerDocument = YAML.load(resolvedPath);
    }
  } catch (err) {
    logger.warn({ err }, '[docs] Failed to load OpenAPI schema.');
  }
  if (swaggerDocument) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }


  // Helper to extract client IP address accurately (with IP spoofing protection)
  const getClientIp = (req: express.Request): string => {
    const isTrustProxy = process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1';
    if (isTrustProxy) {
      const forwarded = req.headers['x-forwarded-for'];
      if (forwarded) {
        const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
        return ip.trim();
      }
    }
    return req.socket.remoteAddress || '127.0.0.1';
  };

  // Helper to extract API key from headers or request body
  const extractApiKey = (req: express.Request): string => {
    const apiKeyHeader = req.headers['x-api-key'] || req.headers['authorization'];
    if (apiKeyHeader && typeof apiKeyHeader === 'string') {
      return apiKeyHeader.replace(/^Bearer\s+/i, '').trim();
    }
    if (req.body && typeof req.body.api_key === 'string') {
      return req.body.api_key.trim();
    }
    return '';
  };

  // ==========================================
  // HEALTH CHECK
  // ==========================================

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  // Register a new developer user
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail.length > 255 || !trimmedEmail.includes('@')) {
        res.status(400).json({ error: 'Valid email under 255 characters is required' });
        return;
      }
      if (password.length < 6 || password.length > 128) {
        res.status(400).json({ error: 'Password must be between 6 and 128 characters' });
        return;
      }
      const existing = await getUserByEmail(trimmedEmail);
      if (existing) {
        res.status(409).json({ error: 'A user with this email already exists' });
        return;
      }
      const passwordHash = await hashPassword(password);
      const newUser = await createUser(trimmedEmail, passwordHash);
      res.status(201).json({
        success: true,
        user: { id: newUser.id, email: newUser.email }
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Error registering user');
      res.status(500).json({ error: 'Failed to register user' });
    }
  });

  // Login developer user
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail.length > 255 || password.length > 128) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }
      let user = await getUserByEmail(trimmedEmail);
      if (!user) {
        await hashPassword(password);
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }
      const isMatch = await verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }
      const token = generateToken(user.id, user.email);
      res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email }
      });
    } catch (error) {
      logger.error({ err: error }, 'Error logging in');
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  // OAuth fast login / simulation for GitHub, Google, Yandex, Telegram
  app.post('/api/auth/oauth', async (req, res) => {
    try {
      const { provider, email: customEmail } = req.body;
      const validProviders = ['github', 'google', 'yandex', 'telegram'];
      if (!provider || !validProviders.includes(provider)) {
        res.status(400).json({ error: `Invalid provider. Supported: ${validProviders.join(', ')}` });
        return;
      }

      // Security: Disallow arbitrary customEmail override in production
      if (process.env.NODE_ENV === 'production' && customEmail && process.env.ALLOW_DEMO_OAUTH !== 'true') {
        res.status(403).json({ error: 'Custom OAuth email override is disabled in production.' });
        return;
      }
      const defaultEmails: Record<string, string> = {
        github: 'developer@github.com',
        google: 'developer@gmail.com',
        yandex: 'developer@yandex.ru',
        telegram: 'telegram_user@t.me'
      };

      const email = customEmail || defaultEmails[provider];
      let user = await getUserByEmail(email);
      if (!user) {
        const dummyHash = await hashPassword(crypto.randomBytes(16).toString('hex'));
        user = await createUser(email, dummyHash);
      }

      const token = generateToken(user.id, user.email);
      res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email },
        provider
      });
    } catch (error) {
      logger.error({ err: error }, 'Error in OAuth login');
      res.status(500).json({ error: 'Failed to process OAuth login' });
    }
  });

  // Get current user profile
  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({ user: req.user });
  });

  // ==========================================
  // API ENDPOINTS
  // ==========================================

  // 1. POST /api/analyze - Analyze Russian text for cultural losses
  app.post('/api/analyze', optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { text, target_language } = req.body;
      const targetLang = target_language || 'en';

      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text field is required and must be a string' });
        return;
      }

      // Check for API key in header or body
      const apiKeyString = extractApiKey(req);

      let activeKeyObj = null;
      if (apiKeyString) {
        activeKeyObj = await validateApiKey(apiKeyString);
        if (!activeKeyObj) {
          res.status(401).json({ error: 'Invalid or revoked API key' });
          return;
        }
      }

      // Check Rate Limit
      const ip = getClientIp(req);
      const limitCheck = await checkRateLimit(ip, activeKeyObj);

      if (!limitCheck.allowed) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          limit: limitCheck.limit,
          remaining: limitCheck.remaining,
          resetHours: limitCheck.resetHours,
          message: activeKeyObj 
            ? `Your API key has hit its limit of ${limitCheck.limit} requests per 24 hours.`
            : `Your anonymous IP has hit its daily demo limit of ${limitCheck.limit} requests. Please register for a free API key on the Developer Dashboard to continue.`
        });
        return;
      }

      // Call Gemini model
      const result = await analyzeText(text, targetLang);

      // Save to usage log
      await addUsageLog({
        userId: activeKeyObj ? activeKeyObj.userId : (req.user ? req.user.id : null),
        apiKey: activeKeyObj ? activeKeyObj.key : 'free',
        endpoint: 'analyze',
        textLength: text.length,
        lossesDetected: result.items.length,
        success: true,
        ipAddress: ip
      });

      // Append rate limit headers
      res.setHeader('X-RateLimit-Limit', limitCheck.limit);
      res.setHeader('X-RateLimit-Remaining', limitCheck.remaining - 1);
      
      res.json(result);
    } catch (error) {
      logger.error({ err: error }, 'Error in /api/analyze');
      res.status(500).json({ error: 'Internal server error analyzing text' });
    }
  });

  // 2. POST /api/compare - Cultural QA: compare a translation against the source
  app.post('/api/compare', optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { source_text, target_text, target_language } = req.body;
      const targetLang = target_language || 'en';

      if (!source_text || typeof source_text !== 'string' || !target_text || typeof target_text !== 'string') {
        res.status(400).json({
          error: 'source_text and target_text are required and must be strings'
        });
        return;
      }

      // Check for API key in header or body
      const apiKeyString = extractApiKey(req);

      let activeKeyObj = null;
      if (apiKeyString) {
        activeKeyObj = await validateApiKey(apiKeyString);
        if (!activeKeyObj) {
          res.status(401).json({ error: 'Invalid or revoked API key' });
          return;
        }
      }

      // Check Rate Limit
      const ip = getClientIp(req);
      const limitCheck = await checkRateLimit(ip, activeKeyObj);

      if (!limitCheck.allowed) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          limit: limitCheck.limit,
          remaining: limitCheck.remaining,
          resetHours: limitCheck.resetHours,
          message: activeKeyObj
            ? `Your API key has hit its limit of ${limitCheck.limit} requests per 24 hours.`
            : `Your anonymous IP has hit its daily demo limit of ${limitCheck.limit} requests. Please register for a free API key on the Developer Dashboard to continue.`
        });
        return;
      }

      // Call Gemini model
      const result = await compareTranslation(source_text, target_text, targetLang);

      // Save to usage log
      await addUsageLog({
        userId: activeKeyObj ? activeKeyObj.userId : (req.user ? req.user.id : null),
        apiKey: activeKeyObj ? activeKeyObj.key : 'free',
        endpoint: 'compare',
        textLength: source_text.length + target_text.length,
        lossesDetected: result.issues.length,
        success: true,
        ipAddress: ip
      });

      // Append rate limit headers
      res.setHeader('X-RateLimit-Limit', limitCheck.limit);
      res.setHeader('X-RateLimit-Remaining', limitCheck.remaining - 1);

      res.json(result);
    } catch (error) {
      logger.error({ err: error }, 'Error in /api/compare');
      res.status(500).json({ error: 'Internal server error comparing translation' });
    }
  });

  // 3. POST /api/enhance - Main Product: Enrich developer prompt with cultural context block
  app.post('/api/enhance', optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { prompt, text } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt field is required and must be a string' });
        return;
      }

      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text field is required and must be a string' });
        return;
      }

      // API Key is strictly MANDATORY for /api/enhance
      const apiKeyString = extractApiKey(req);

      if (!apiKeyString) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'API key is required for prompt enhancement. Please obtain a key from the Developer Dashboard.'
        });
        return;
      }

      const activeKeyObj = await validateApiKey(apiKeyString);
      if (!activeKeyObj) {
        res.status(401).json({ error: 'Invalid or revoked API key' });
        return;
      }

      // Check Rate Limit
      const ip = getClientIp(req);
      const limitCheck = await checkRateLimit(ip, activeKeyObj);

      if (!limitCheck.allowed) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          limit: limitCheck.limit,
          remaining: limitCheck.remaining,
          resetHours: limitCheck.resetHours,
          message: `Your API key has hit its limit of ${limitCheck.limit} requests per 24 hours.`
        });
        return;
      }

      // Call Gemini prompt enhancement logic
      const result = await enhancePrompt(prompt, text);

      // Save to usage log
      await addUsageLog({
        userId: activeKeyObj.userId,
        apiKey: activeKeyObj.key,
        endpoint: 'enhance',
        textLength: text.length,
        lossesDetected: result.losses_detected,
        success: true,
        ipAddress: ip
      });

      // Append rate limit headers
      res.setHeader('X-RateLimit-Limit', limitCheck.limit);
      res.setHeader('X-RateLimit-Remaining', limitCheck.remaining - 1);

      res.json(result);
    } catch (error) {
      logger.error({ err: error }, 'Error in /api/enhance');
      res.status(500).json({ error: 'Internal server error enhancing prompt' });
    }
  });

  // 3b. POST /api/optimize-prompt - Translate Russian prompt to high-density English, preserve cultural nuance & save up to 65% tokens in Claude/GPT
  app.post('/api/optimize-prompt', optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { prompt, targetLanguage, target_language } = req.body;
      const targetLang = targetLanguage || target_language || 'Russian';

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt field is required and must be a string' });
        return;
      }

      // Check for API key in header or body
      const apiKeyString = extractApiKey(req);
      let activeKeyObj = null;
      if (apiKeyString) {
        activeKeyObj = await validateApiKey(apiKeyString);
        if (!activeKeyObj) {
          res.status(401).json({ error: 'Invalid or revoked API key' });
          return;
        }
      }

      // Check Rate Limit
      const ip = getClientIp(req);
      const limitCheck = await checkRateLimit(ip, activeKeyObj);

      if (!limitCheck.allowed) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          limit: limitCheck.limit,
          remaining: limitCheck.remaining,
          resetHours: limitCheck.resetHours,
          message: activeKeyObj 
            ? `Your API key has hit its limit of ${limitCheck.limit} requests per 24 hours.`
            : `Your anonymous IP has hit its daily demo limit of ${limitCheck.limit} requests.`
        });
        return;
      }

      const result = await optimizePrompt(prompt, targetLang);

      // Save to usage log if key is provided
      if (activeKeyObj) {
        await addUsageLog({
          userId: activeKeyObj.userId,
          apiKey: activeKeyObj.key,
          endpoint: 'optimize-prompt',
          textLength: prompt.length,
          lossesDetected: result.cultural_nuances_preserved.length,
          success: true,
          ipAddress: ip
        });
      }

      res.setHeader('X-RateLimit-Limit', limitCheck.limit);
      res.setHeader('X-RateLimit-Remaining', limitCheck.remaining - 1);
      res.json(result);
    } catch (error) {
      logger.error({ err: error }, 'Error in /api/optimize-prompt');
      res.status(500).json({ error: 'Internal server error optimizing prompt' });
    }
  });

  // 3c. POST /v1/chat/completions - OpenAI Drop-in Proxy with Semantic & Token Optimization
  app.post('/v1/chat/completions', optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { messages, stream } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({
          error: {
            message: 'Invalid request: "messages" array is required and must not be empty',
            type: 'invalid_request_error',
            param: 'messages',
            code: 'missing_required_parameter'
          }
        });
        return;
      }

      // Check for API key in header or body
      const apiKeyString = extractApiKey(req);
      let activeKeyObj = null;
      if (apiKeyString) {
        activeKeyObj = await validateApiKey(apiKeyString);
        if (!activeKeyObj) {
          res.status(401).json({
            error: {
              message: 'Invalid or revoked API key',
              type: 'invalid_request_error',
              code: 'invalid_api_key'
            }
          });
          return;
        }
      }

      // Check Rate Limit
      const ip = getClientIp(req);
      const limitCheck = await checkRateLimit(ip, activeKeyObj);

      if (!limitCheck.allowed) {
        res.status(429).json({
          error: {
            message: activeKeyObj 
              ? `Your API key has hit its limit of ${limitCheck.limit} requests per 24 hours.`
              : `Your anonymous IP has hit its daily limit of ${limitCheck.limit} requests.`,
            type: 'insufficient_quota',
            code: 'rate_limit_exceeded'
          }
        });
        return;
      }

      const { completion, optimized } = await processChatCompletion(req.body);

      // Save to usage log if key is provided
      if (activeKeyObj) {
        await addUsageLog({
          userId: activeKeyObj.userId,
          apiKey: activeKeyObj.key,
          endpoint: 'chat-completions',
          textLength: JSON.stringify(messages).length,
          lossesDetected: optimized?.cultural_nuances_preserved.length || 0,
          success: true,
          ipAddress: ip
        });
      }

      if (optimized) {
        res.setHeader('X-LIT-Tokens-Saved', String(optimized.token_stats.saved_gpt_tokens));
        res.setHeader('X-LIT-Tokens-Saved-Percent', `${optimized.token_stats.saved_gpt_percent}%`);
        res.setHeader('X-LIT-Optimized', 'true');
      }

      res.setHeader('X-RateLimit-Limit', limitCheck.limit);
      res.setHeader('X-RateLimit-Remaining', limitCheck.remaining - 1);

      // Handle streaming requests
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const content = completion.choices[0]?.message?.content || '';
        const id = completion.id;
        const created = completion.created;
        const model = completion.model;

        // Chunk 1: Role delta
        res.write(`data: ${JSON.stringify({
          id, object: 'chat.completion.chunk', created, model,
          choices: [{ index: 0, delta: { role: 'assistant', content: '' }, finish_reason: null }]
        })}\n\n`);

        // Chunk 2: Full content delta
        res.write(`data: ${JSON.stringify({
          id, object: 'chat.completion.chunk', created, model,
          choices: [{ index: 0, delta: { content }, finish_reason: null }]
        })}\n\n`);

        // Chunk 3: Finish delta
        res.write(`data: ${JSON.stringify({
          id, object: 'chat.completion.chunk', created, model,
          choices: [{ index: 0, delta: {}, finish_reason: 'stop' }]
        })}\n\n`);

        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      res.json(completion);
    } catch (error: any) {
      logger.error({ err: error }, 'Error in /v1/chat/completions');
      res.status(500).json({
        error: {
          message: error.message || 'Internal server error in chat completions proxy',
          type: 'api_error',
          code: 'internal_error'
        }
      });
    }
  });

  // 4. GET /api/keys - List keys owned by the authenticated developer
  app.get('/api/keys', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const keys = await getUserKeys(req.user!.id);
      res.json(keys);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve keys' });
    }
  });

  // 5. POST /api/keys - Generate a new key for the authenticated developer
  app.post('/api/keys', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, tier } = req.body;
      const safeName = typeof name === 'string' && name.trim().length > 0 
        ? name.trim().slice(0, 100) 
        : 'Default Key';
      const keyTier = tier === 'paid' ? 'paid' : 'free';
      const newKey = await generateApiKey(safeName, keyTier, req.user!.id);
      res.status(201).json(newKey);
    } catch (error) {
      logger.error({ err: error }, 'Error generating API key');
      res.status(500).json({ error: 'Failed to generate key' });
    }
  });

  // 6. POST /api/keys/revoke - Revoke a key owned by the authenticated developer
  app.post('/api/keys/revoke', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { key } = req.body;
      if (!key || typeof key !== 'string' || key.length > 100) {
        res.status(400).json({ error: 'Key parameter is required and must be a valid string' });
        return;
      }
      const success = await revokeApiKey(key.trim(), req.user!.id);
      if (success) {
        res.json({ success: true, message: 'API key successfully revoked' });
      } else {
        res.status(404).json({ error: 'API key not found or not owned by you' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to revoke key' });
    }
  });

  // 7. GET /api/dashboard/stats - Fetch stats for the authenticated developer's dashboard analytics
  app.get('/api/dashboard/stats', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const keys = await getUserKeys(userId);
      const logs = await getUserLogs(userId);

      const totalRequests = logs.length;
      const successLogs = logs.filter(l => l.success);
      const successRate = totalRequests > 0 ? Math.round((successLogs.length / totalRequests) * 100) : 100;
      
      const totalLosses = logs.reduce((sum, l) => sum + l.lossesDetected, 0);
      const lossesAvg = totalRequests > 0 ? parseFloat((totalLosses / totalRequests).toFixed(1)) : 0;

      const enhanceCount = logs.filter(l => l.endpoint === 'enhance').length;
      const analyzeCount = logs.filter(l => l.endpoint === 'analyze').length;
      const compareCount = logs.filter(l => l.endpoint === 'compare').length;

      // Sort logs by newest first, take last 15
      const recentLogs = [...logs]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 15);

      res.json({
        totalRequests,
        successRate,
        lossesAvg,
        endpointsUsage: {
          enhance: enhanceCount,
          analyze: analyzeCount,
          compare: compareCount
        },
        apiKeys: keys,
        recentLogs
      });
    } catch (error) {
      logger.error({ err: error }, 'Error fetching stats');
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  // ==========================================
  // GROWTH & AUTONOMOUS MARKETING ENDPOINTS
  // ==========================================

  // 1. GET /api/growth/benchmark - Public dataset and LLM ranking
  app.get('/api/growth/benchmark', (req, res) => {
    try {
      const summary = getBenchmarkSummary();
      res.json(summary);
    } catch (error) {
      logger.error({ err: error }, 'Error generating benchmark summary');
      res.status(500).json({ error: 'Failed to generate benchmark data' });
    }
  });

  // 2. GET /api/growth/draft - Autonomous marketing draft generator
  app.get('/api/growth/draft', (req, res) => {
    try {
      const platform = (req.query.platform || 'habr') as 'habr' | 'vc' | 'dzen' | 'telegram' | 'yandex_direct';
      const validPlatforms = ['habr', 'vc', 'dzen', 'telegram', 'yandex_direct'];
      if (!validPlatforms.includes(platform)) {
        res.status(400).json({ error: `Invalid platform. Supported: ${validPlatforms.join(', ')}` });
        return;
      }
      const draft = generateMarketingDraft(platform);
      res.json(draft);
    } catch (error) {
      logger.error({ err: error }, 'Error generating marketing draft');
      res.status(500).json({ error: 'Failed to generate marketing draft' });
    }
  });

  // 3. GET /api/growth/badge - Dynamic SVG badge for GitHub and docs
  app.get('/api/growth/badge', (req, res) => {
    const status = (req.query.status as string) || 'Passed';
    const score = (req.query.score as string) || '92/100';
    const svg = generateSvgBadge(status, score);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  });

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================

  const publicPath = path.join(process.cwd(), 'public');
  app.use(express.static(publicPath));

  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

async function startServer() {
  const app = await createApp();
  const PORT = Number(process.env.PORT) || 3000;
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`LostInTranslation API listening at http://0.0.0.0:${PORT}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      try {
        await closeDb();
        logger.info('Database connections closed. Exiting process.');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error during database shutdown');
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

const isMain =
  (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) ||
  (Boolean(process.argv[1]) && typeof import.meta !== 'undefined' && Boolean(import.meta.url) && import.meta.url === pathToFileURL(process.argv[1]).href);
if (isMain) {
  startServer();
}
