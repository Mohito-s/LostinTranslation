import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

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
  getUserLogs
} from './src/lib/db';
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  requireAuth, 
  optionalAuth, 
  AuthenticatedRequest 
} from './src/lib/auth';
import { analyzeText } from './src/lib/analyze';
import { enhancePrompt } from './src/lib/enhance';
import { checkRateLimit } from './src/lib/rateLimit';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse json bodies
  app.use(express.json());

  // Helper to extract client IP address accurately
  const getClientIp = (req: express.Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
      return ip.trim();
    }
    return req.socket.remoteAddress || '127.0.0.1';
  };

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
      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
      }
      const existing = await getUserByEmail(email);
      if (existing) {
        res.status(409).json({ error: 'A user with this email already exists' });
        return;
      }
      const passwordHash = hashPassword(password);
      const newUser = await createUser(email, passwordHash);
      res.status(201).json({
        success: true,
        user: { id: newUser.id, email: newUser.email }
      });
    } catch (error: any) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Failed to register user: ' + error.message });
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
      const user = await getUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }
      const isMatch = verifyPassword(password, user.passwordHash);
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
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Failed to login' });
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
      const apiKeyHeader = req.headers['x-api-key'] || req.headers['authorization'];
      let apiKeyString = (req.body.api_key || '') as string;
      
      if (apiKeyHeader && typeof apiKeyHeader === 'string') {
        apiKeyString = apiKeyHeader.replace('Bearer ', '').trim();
      }

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
      console.error('Error in /api/analyze:', error);
      res.status(500).json({ error: 'Internal server error analyzing text' });
    }
  });

  // 2. POST /api/enhance - Main Product: Enrich developer prompt with cultural context block
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
      const apiKeyHeader = req.headers['x-api-key'] || req.headers['authorization'];
      let apiKeyString = (req.body.api_key || '') as string;
      
      if (apiKeyHeader && typeof apiKeyHeader === 'string') {
        apiKeyString = apiKeyHeader.replace('Bearer ', '').trim();
      }

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
      console.error('Error in /api/enhance:', error);
      res.status(500).json({ error: 'Internal server error enhancing prompt' });
    }
  });

  // 3. GET /api/keys - List keys owned by the authenticated developer
  app.get('/api/keys', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const keys = await getUserKeys(req.user!.id);
      res.json(keys);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve keys' });
    }
  });

  // 4. POST /api/keys - Generate a new key for the authenticated developer
  app.post('/api/keys', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, tier } = req.body;
      const keyTier = tier === 'paid' ? 'paid' : 'free';
      const newKey = await generateApiKey(name, keyTier, req.user!.id);
      res.status(201).json(newKey);
    } catch (error) {
      console.error('Error generating API key:', error);
      res.status(500).json({ error: 'Failed to generate key' });
    }
  });

  // 5. POST /api/keys/revoke - Revoke a key owned by the authenticated developer
  app.post('/api/keys/revoke', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { key } = req.body;
      if (!key) {
        res.status(400).json({ error: 'Key parameter is required' });
        return;
      }
      const success = await revokeApiKey(key, req.user!.id);
      if (success) {
        res.json({ success: true, message: 'API key successfully revoked' });
      } else {
        res.status(404).json({ error: 'API key not found or not owned by you' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to revoke key' });
    }
  });

  // 6. GET /api/dashboard/stats - Fetch stats for the authenticated developer's dashboard analytics
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
          analyze: analyzeCount
        },
        apiKeys: keys,
        recentLogs
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LostInTranslation API full-stack server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
