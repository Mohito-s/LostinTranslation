import { getDb, ApiKey } from './db';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetHours: number;
  error?: string;
}

const FREE_IP_LIMIT = 10;
const PAID_KEY_LIMIT = 1000;
const FREE_KEY_LIMIT = 50; // Sandbox key limit

/**
 * Checks rate limit for a request.
 * If apiKey is provided and valid, it uses key limits.
 * Otherwise, it falls back to IP-based rate limiting.
 */
export async function checkRateLimit(ipAddress: string, apiKeyObj: ApiKey | null): Promise<RateLimitResult> {
  const db = await getDb();
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // If valid API Key is provided
  if (apiKeyObj) {
    const key = apiKeyObj.key;
    const limit = apiKeyObj.tier === 'paid' ? PAID_KEY_LIMIT : FREE_KEY_LIMIT;

    // Filter logs for this API key in the last 24 hours
    const keyLogs = db.usageLogs.filter(log => 
      log.apiKey === key && 
      new Date(log.timestamp) > oneDayAgo
    );

    const count = keyLogs.length;
    const remaining = Math.max(0, limit - count);

    // Calculate time until oldest log in the 24h window expires (approximation)
    let resetHours = 24;
    if (keyLogs.length > 0) {
      const oldestLogTime = new Date(keyLogs[0].timestamp).getTime();
      const msToReset = oldestLogTime + 24 * 60 * 60 * 1000 - now.getTime();
      resetHours = Math.max(0.1, parseFloat((msToReset / (1000 * 60 * 60)).toFixed(1)));
    }

    return {
      allowed: count < limit,
      limit,
      remaining,
      resetHours
    };
  }

  // Otherwise, use IP-based rate limiting for anonymous requests (demo-site)
  const anonymousLogs = db.usageLogs.filter(log => 
    (!log.apiKey || log.apiKey === 'free') && 
    log.ipAddress === ipAddress && 
    new Date(log.timestamp) > oneDayAgo
  );

  const count = anonymousLogs.length;
  const remaining = Math.max(0, FREE_IP_LIMIT - count);

  let resetHours = 24;
  if (anonymousLogs.length > 0) {
    const oldestLogTime = new Date(anonymousLogs[0].timestamp).getTime();
    const msToReset = oldestLogTime + 24 * 60 * 60 * 1000 - now.getTime();
    resetHours = Math.max(0.1, parseFloat((msToReset / (1000 * 60 * 60)).toFixed(1)));
  }

  return {
    allowed: count < FREE_IP_LIMIT,
    limit: FREE_IP_LIMIT,
    remaining,
    resetHours
  };
}
