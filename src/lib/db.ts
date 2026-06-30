import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Define DB Interfaces
export interface ApiKey {
  id: string;
  userId?: number | string | null;
  key: string;
  name: string;
  status: 'active' | 'revoked';
  createdAt: string;
  tier: 'free' | 'paid';
  usageCount: number;
}

export interface UsageLog {
  id: string;
  userId?: number | string | null;
  apiKey: string; // 'free' or actual key
  endpoint: 'analyze' | 'enhance';
  timestamp: string;
  textLength: number;
  lossesDetected: number;
  success: boolean;
  ipAddress?: string;
}

export interface User {
  id: number | string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface DbSchema {
  users: User[];
  apiKeys: ApiKey[];
  usageLogs: UsageLog[];
}

const LOCAL_DB_PATH = path.join(process.cwd(), 'local_db.json');

// Initialize Connection Pool for Postgres if DATABASE_URL is set
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
let pool: pg.Pool | null = null;
let isPostgres = false;

if (dbUrl) {
  try {
    pool = new pg.Pool({
      connectionString: dbUrl,
      ssl: dbUrl.includes('supabase') || dbUrl.includes('neon') || dbUrl.includes('render')
        ? { rejectUnauthorized: false }
        : false,
    });
    isPostgres = true;
    console.log('PostgreSQL/Supabase pool configured. Running on Postgres mode.');
  } catch (err) {
    console.error('Failed to configure PostgreSQL pool, falling back to local file:', err);
    isPostgres = false;
  }
} else {
  console.log('No DATABASE_URL found. Running on Local File Database mode.');
}

// Database bootstrapping on startup/first use
let dbBootstrapped = false;

async function bootstrapDb() {
  if (dbBootstrapped) return;
  dbBootstrapped = true;

  if (isPostgres && pool) {
    try {
      const client = await pool.connect();
      try {
        console.log('Bootstrapping PostgreSQL tables...');
        // Create users table
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Create api_keys table
        await client.query(`
          CREATE TABLE IF NOT EXISTS api_keys (
            id TEXT PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            key TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tier TEXT DEFAULT 'free',
            usage_count INTEGER DEFAULT 0
          );
        `);

        // Create usage_logs table
        await client.query(`
          CREATE TABLE IF NOT EXISTS usage_logs (
            id TEXT PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            api_key TEXT NOT NULL,
            endpoint TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            text_length INTEGER NOT NULL,
            losses_detected INTEGER NOT NULL,
            success BOOLEAN NOT NULL,
            ip_address TEXT
          );
        `);

        console.log('PostgreSQL database bootstrapping completed successfully.');
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Failed to bootstrap PostgreSQL tables, falling back to local file mode.', err);
      isPostgres = false;
    }
  }

  // Handle local file initialization if in local mode
  if (!isPostgres) {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      const initialDb: DbSchema = {
        users: [],
        apiKeys: [
          {
            id: 'key_default_1',
            key: 'ltk_demokey12345',
            name: 'Default Production Key',
            status: 'active',
            createdAt: new Date().toISOString(),
            tier: 'paid',
            usageCount: 0,
            userId: null
          },
          {
            id: 'key_default_2',
            key: 'ltk_freekey98765',
            name: 'Sandbox Free Key',
            status: 'active',
            createdAt: new Date().toISOString(),
            tier: 'free',
            usageCount: 0,
            userId: null
          }
        ],
        usageLogs: []
      };
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
      console.log('Initialized clean local database at', LOCAL_DB_PATH);
    }
  }
}

// -------------------------------------------------------------
// Core Database APIs
// -------------------------------------------------------------

// Read entire DB (mainly for rate-limit and dashboard compatibility)
export async function getDb(): Promise<DbSchema> {
  await bootstrapDb();

  if (isPostgres && pool) {
    try {
      const usersRes = await pool.query('SELECT * FROM users ORDER BY id ASC');
      const keysRes = await pool.query('SELECT * FROM api_keys ORDER BY created_at DESC');
      const logsRes = await pool.query('SELECT * FROM usage_logs ORDER BY timestamp DESC');

      const users: User[] = usersRes.rows.map(r => ({
        id: r.id,
        email: r.email,
        passwordHash: r.password_hash,
        createdAt: new Date(r.created_at).toISOString()
      }));

      const apiKeys: ApiKey[] = keysRes.rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        key: r.key,
        name: r.name,
        status: r.status as 'active' | 'revoked',
        createdAt: new Date(r.created_at).toISOString(),
        tier: r.tier as 'free' | 'paid',
        usageCount: r.usage_count || 0
      }));

      const usageLogs: UsageLog[] = logsRes.rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        apiKey: r.api_key,
        endpoint: r.endpoint as 'analyze' | 'enhance',
        timestamp: new Date(r.timestamp).toISOString(),
        textLength: r.text_length,
        lossesDetected: r.losses_detected,
        success: r.success,
        ipAddress: r.ip_address
      }));

      return { users, apiKeys, usageLogs };
    } catch (err) {
      console.error('Error fetching data from PostgreSQL, falling back to local file:', err);
    }
  }

  // Fallback to local file read
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(raw) as DbSchema;
  } catch (err) {
    console.error('Failed to read local DB, returning empty schema:', err);
    return { users: [], apiKeys: [], usageLogs: [] };
  }
}

// Write helper for local file database
function saveLocalDb(data: DbSchema): void {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save local database:', err);
  }
}

// -------------------------------------------------------------
// Authentication / User Queries
// -------------------------------------------------------------

export async function createUser(email: string, passwordHash: string): Promise<User> {
  await bootstrapDb();
  const emailLower = email.trim().toLowerCase();

  if (isPostgres && pool) {
    try {
      const res = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
        [emailLower, passwordHash]
      );
      const row = res.rows[0];
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: new Date(row.created_at).toISOString()
      };
    } catch (err) {
      console.error('Error in Postgres createUser:', err);
      throw err;
    }
  }

  // Local Mode
  const db = await getDb();
  const existing = db.users.find(u => u.email === emailLower);
  if (existing) {
    throw new Error('User already exists');
  }

  const id = db.users.length + 1;
  const newUser: User = {
    id,
    email: emailLower,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveLocalDb(db);
  return newUser;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await bootstrapDb();
  const emailLower = email.trim().toLowerCase();

  if (isPostgres && pool) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [emailLower]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: new Date(row.created_at).toISOString()
      };
    } catch (err) {
      console.error('Error in Postgres getUserByEmail:', err);
      return null;
    }
  }

  // Local Mode
  const db = await getDb();
  const user = db.users.find(u => u.email === emailLower);
  return user || null;
}

export async function getUserById(id: number | string): Promise<User | null> {
  await bootstrapDb();

  if (isPostgres && pool) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: new Date(row.created_at).toISOString()
      };
    } catch (err) {
      console.error('Error in Postgres getUserById:', err);
      return null;
    }
  }

  // Local Mode
  const db = await getDb();
  const user = db.users.find(u => String(u.id) === String(id));
  return user || null;
}

// -------------------------------------------------------------
// API Key Queries
// -------------------------------------------------------------

export async function generateApiKey(name: string, tier: 'free' | 'paid', userId: number | string): Promise<ApiKey> {
  await bootstrapDb();
  const id = 'key_' + Math.random().toString(36).substring(2, 11);
  
  // Generate random 24 hex characters for key
  const randomBytes = Array.from({ length: 24 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  const key = `ltk_${randomBytes}`;

  const newKey: ApiKey = {
    id,
    userId,
    key,
    name: name || `Key`,
    status: 'active',
    createdAt: new Date().toISOString(),
    tier,
    usageCount: 0
  };

  if (isPostgres && pool) {
    try {
      await pool.query(
        'INSERT INTO api_keys (id, user_id, key, name, status, tier, usage_count) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, userId, key, newKey.name, 'active', tier, 0]
      );
      return newKey;
    } catch (err) {
      console.error('Error in Postgres generateApiKey:', err);
      throw err;
    }
  }

  // Local Mode
  const db = await getDb();
  db.apiKeys.push(newKey);
  saveLocalDb(db);
  return newKey;
}

export async function revokeApiKey(keyString: string, userId: number | string): Promise<boolean> {
  await bootstrapDb();

  if (isPostgres && pool) {
    try {
      const res = await pool.query(
        "UPDATE api_keys SET status = 'revoked' WHERE key = $1 AND user_id = $2 RETURNING id",
        [keyString, userId]
      );
      return res.rows.length > 0;
    } catch (err) {
      console.error('Error in Postgres revokeApiKey:', err);
      return false;
    }
  }

  // Local Mode
  const db = await getDb();
  const index = db.apiKeys.findIndex(k => k.key === keyString && String(k.userId) === String(userId));
  if (index !== -1) {
    db.apiKeys[index].status = 'revoked';
    saveLocalDb(db);
    return true;
  }
  return false;
}

export async function validateApiKey(keyString: string): Promise<ApiKey | null> {
  await bootstrapDb();

  if (isPostgres && pool) {
    try {
      const res = await pool.query(
        "SELECT * FROM api_keys WHERE key = $1 AND status = 'active' LIMIT 1",
        [keyString]
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        key: row.key,
        name: row.name,
        status: row.status as 'active' | 'revoked',
        createdAt: new Date(row.created_at).toISOString(),
        tier: row.tier as 'free' | 'paid',
        usageCount: row.usage_count || 0
      };
    } catch (err) {
      console.error('Error in Postgres validateApiKey:', err);
      return null;
    }
  }

  // Local Mode
  const db = await getDb();
  const keyObj = db.apiKeys.find(k => k.key === keyString && k.status === 'active');
  return keyObj || null;
}

export async function getUserKeys(userId: number | string): Promise<ApiKey[]> {
  await bootstrapDb();

  if (isPostgres && pool) {
    try {
      const res = await pool.query(
        'SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return res.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        key: row.key,
        name: row.name,
        status: row.status as 'active' | 'revoked',
        createdAt: new Date(row.created_at).toISOString(),
        tier: row.tier as 'free' | 'paid',
        usageCount: row.usage_count || 0
      }));
    } catch (err) {
      console.error('Error in Postgres getUserKeys:', err);
      return [];
    }
  }

  // Local Mode
  const db = await getDb();
  return db.apiKeys.filter(k => String(k.userId) === String(userId));
}

// -------------------------------------------------------------
// Usage Log Queries
// -------------------------------------------------------------

export async function addUsageLog(log: Omit<UsageLog, 'id' | 'timestamp'>): Promise<void> {
  await bootstrapDb();
  const id = 'log_' + Math.random().toString(36).substring(2, 11);
  const timestamp = new Date().toISOString();

  // Resolve matching key to find associated user_id if present
  let resolvedUserId = log.userId || null;
  if (!resolvedUserId && log.apiKey && log.apiKey !== 'free') {
    const keyDetails = await validateApiKey(log.apiKey);
    if (keyDetails) {
      resolvedUserId = keyDetails.userId || null;
    }
  }

  if (isPostgres && pool) {
    try {
      // 1. Write the transaction log
      await pool.query(
        'INSERT INTO usage_logs (id, user_id, api_key, endpoint, text_length, losses_detected, success) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, resolvedUserId, log.apiKey, log.endpoint, log.textLength, log.lossesDetected, log.success]
      );

      // 2. Increment key usage_count if applicable
      if (log.apiKey && log.apiKey !== 'free') {
        await pool.query(
          'UPDATE api_keys SET usage_count = usage_count + 1 WHERE key = $1',
          [log.apiKey]
        );
      }
      return;
    } catch (err) {
      console.error('Error in Postgres addUsageLog:', err);
    }
  }

  // Local Mode
  const db = await getDb();
  const newLog: UsageLog = {
    ...log,
    id,
    userId: resolvedUserId,
    timestamp
  };
  db.usageLogs.push(newLog);

  // Increment usage count locally
  if (log.apiKey && log.apiKey !== 'free') {
    const kIdx = db.apiKeys.findIndex(k => k.key === log.apiKey);
    if (kIdx !== -1) {
      db.apiKeys[kIdx].usageCount = (db.apiKeys[kIdx].usageCount || 0) + 1;
    }
  }

  saveLocalDb(db);
}

export async function getUserLogs(userId: number | string): Promise<UsageLog[]> {
  await bootstrapDb();

  if (isPostgres && pool) {
    try {
      const res = await pool.query(
        'SELECT * FROM usage_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 50',
        [userId]
      );
      return res.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        apiKey: row.api_key,
        endpoint: row.endpoint as 'analyze' | 'enhance',
        timestamp: new Date(row.timestamp).toISOString(),
        textLength: row.text_length,
        lossesDetected: row.losses_detected,
        success: row.success,
        ipAddress: row.ip_address
      }));
    } catch (err) {
      console.error('Error in Postgres getUserLogs:', err);
      return [];
    }
  }

  // Local Mode
  const db = await getDb();
  return db.usageLogs.filter(log => String(log.userId) === String(userId));
}
