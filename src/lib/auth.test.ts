import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateToken, verifyToken } from './auth';

describe('password hashing (PBKDF2)', () => {
  it('hashes and verifies a correct password', async () => {
    const hash = await hashPassword('sup3r-secret');
    expect(hash).toContain(':');
    expect(await verifyPassword('sup3r-secret', hash)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('right-password');
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('uses a unique salt per hash', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
  });

  it('returns false for a malformed stored hash', async () => {
    expect(await verifyPassword('x', 'not-a-valid-hash')).toBe(false);
  });
});

describe('session tokens (HMAC)', () => {
  it('issues a token that verifies', () => {
    const token = generateToken(42, 'dev@example.com');
    const user = verifyToken(token);
    expect(user).not.toBeNull();
    expect(user!.id).toBe(42);
    expect(user!.email).toBe('dev@example.com');
  });

  it('rejects a tampered token', () => {
    const token = generateToken(42, 'dev@example.com');
    const flipped = token.endsWith('=') ? token.slice(0, -2) + 'AA=' : token + 'AAAA';
    expect(verifyToken(flipped)).toBeNull();
  });

  it('rejects garbage input', () => {
    expect(verifyToken('not-a-token')).toBeNull();
    expect(verifyToken('')).toBeNull();
  });
});