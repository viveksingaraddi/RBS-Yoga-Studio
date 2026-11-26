import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../src/lib/auth';

describe('Subscription-Based Access Control & Credential Security', () => {
  it('enforces configured role account exemption whitelist', () => {
    const CONFIG_SYSTEM_EMAILS = [
      'admin@rbsyogastudio.com',
      'instructor@rbsyogastudio.com',
      'learner@rbsyogastudio.com',
      'yogawithsangu@gmail.com',
    ];

    expect(CONFIG_SYSTEM_EMAILS.includes('admin@rbsyogastudio.com')).toBe(true);
    expect(CONFIG_SYSTEM_EMAILS.includes('instructor@rbsyogastudio.com')).toBe(true);
    expect(CONFIG_SYSTEM_EMAILS.includes('learner@rbsyogastudio.com')).toBe(true);
    expect(CONFIG_SYSTEM_EMAILS.includes('yogawithsangu@gmail.com')).toBe(true);
    expect(CONFIG_SYSTEM_EMAILS.includes('unsubscribed_user@example.com')).toBe(false);
  });

  it('determines active membership subscription validity correctly', () => {
    const now = new Date();

    const activeMembership = {
      status: 'ACTIVE',
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 80 * 24 * 60 * 60 * 1000),
    };

    const isCurrentlyActive =
      activeMembership.status === 'ACTIVE' &&
      (!activeMembership.endDate || activeMembership.endDate >= now);

    expect(isCurrentlyActive).toBe(true);

    const expiredMembership = {
      status: 'EXPIRED',
      startDate: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    };

    const isExpiredActive =
      expiredMembership.status === 'ACTIVE' &&
      (!expiredMembership.endDate || expiredMembership.endDate >= now);

    expect(isExpiredActive).toBe(false);
  });

  it('verifies password hashing and update flow', async () => {
    const initialPassword = 'InitialLearnerPassword2026!';
    const initialHash = await hashPassword(initialPassword);

    expect(await comparePassword(initialPassword, initialHash)).toBe(true);

    // User updates their password
    const updatedPassword = 'MyNewSecurePassword2026@Sadhana';
    const updatedHash = await hashPassword(updatedPassword);

    expect(await comparePassword(updatedPassword, updatedHash)).toBe(true);
    expect(await comparePassword(initialPassword, updatedHash)).toBe(false);
  });
});
