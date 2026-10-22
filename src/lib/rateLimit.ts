import { getRecentLogsStats, ApiKey } from './db';

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
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // If valid API Key is provided
  if (apiKeyObj) {
    const key = apiKeyObj.key;
    const limit = apiKeyObj.tier === 'paid' ? PAID_KEY_LIMIT : FREE_KEY_LIMIT;

    const stats = await getRecentLogsStats({ apiKey: key, since: oneDayAgo });
    const count = stats.count;
    const remaining = Math.max(0, limit - count);

    // Calculate time until oldest log in the 24h window expires (approximation)
    let resetHours = 24;
    if (stats.oldestTimestamp) {
      const oldestLogTime = new Date(stats.oldestTimestamp).getTime();
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
  const stats = await getRecentLogsStats({ ipAddress, since: oneDayAgo });
  const count = stats.count;
  const remaining = Math.max(0, FREE_IP_LIMIT - count);

  let resetHours = 24;
  if (stats.oldestTimestamp) {
    const oldestLogTime = new Date(stats.oldestTimestamp).getTime();
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
