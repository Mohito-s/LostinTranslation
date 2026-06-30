import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const SALT_LENGTH = 16;
const ITERATIONS = 10000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

// Standard session token secret - loaded from env or fallback to a persistent default
const JWT_SECRET = process.env.SESSION_SECRET || 'lost_in_translation_secure_secret_key_12345';

/**
 * Hashes a plaintext password using PBKDF2 with a random salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored hash string.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
    return hash === originalHash;
  } catch (err) {
    return false;
  }
}

/**
 * Generates a signed stateless token containing the user's details.
 */
export function generateToken(userId: string | number, email: string): string {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = `${userId}:${email}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}.${signature}`).toString('base64');
}

export interface AuthenticatedUser {
  id: string | number;
  email: string;
}

/**
 * Decodes and verifies a signed token. Returns the user details if valid.
 */
export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split('.');
    if (parts.length !== 2) return null;
    
    const [payload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
    if (signature !== expectedSignature) return null;
    
    const [userId, email, expiresAtStr] = payload.split(':');
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) return null;
    
    return {
      id: isNaN(Number(userId)) ? userId : Number(userId),
      email
    };
  } catch (err) {
    return null;
  }
}

// Express request extension type
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Express middleware to authenticate users via Bearer token in Authorization header.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing session token' });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
  }

  req.user = user;
  next();
}

/**
 * Express middleware to optionally authenticate a user. Does not fail if missing or invalid.
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}
