import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, signToken, verifyToken } from '../src/lib/auth';

describe('Authentication & Security', () => {
  it('correctly hashes passwords and verifies with bcrypt', async () => {
    const rawPassword = 'SecurePracticePassword2026!';
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.length).toBeGreaterThan(20);

    const isMatch = await comparePassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('WrongPassword', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('signs and verifies JWT tokens with proper claims', () => {
    const payload = {
      userId: 'test-user-id-123',
      email: 'learner@rbsyogastudio.com',
      name: 'Aditi Sharma',
      role: 'LEARNER' as const,
    };

    const token = signToken(payload, '1h');
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe('LEARNER');
  });

  it('rejects tampered or malformed JWT tokens', () => {
    const validToken = signToken({
      userId: 'user-1',
      email: 'test@example.com',
      name: 'Test',
      role: 'LEARNER' as const,
    });

    const tampered = validToken + 'tampered';
    const decoded = verifyToken(tampered);
    expect(decoded).toBeNull();
  });
});
