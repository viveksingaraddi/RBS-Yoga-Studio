import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';

describe('Database Models & Relations Integrity', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('verifies presence of singleton business settings with verified Master Sangu credentials', async () => {
    const settings = await prisma.businessSettings.findUnique({
      where: { id: 'singleton' },
    });

    expect(settings).not.toBeNull();
    expect(settings?.businessName).toBe('RBS Yoga Studio');
    expect(settings?.tagline).toBe('The Art of Strength, Balance & Wellness');
    expect(settings?.leadInstructor).toBe('Master Sangu');
    expect(settings?.instructorBio).toContain('M.Sc. in Yoga');
    expect(settings?.instructorBio).toContain('Vietnam');
    expect(settings?.timezone).toBe('Asia/Kolkata');
    expect(settings?.currency).toBe('INR');
  });

  it('verifies seeded membership plans have required attributes', async () => {
    const plans = await prisma.membershipPlan.findMany({
      where: { isActive: true },
    });

    expect(plans.length).toBeGreaterThanOrEqual(3);
    const monthly = plans.find((p) => p.slug === 'monthly-shala-pass');
    expect(monthly).toBeDefined();
    expect(monthly?.includesRecordings).toBe(true);
    expect(monthly?.includesLiveClasses).toBe(true);
    expect(monthly?.durationDays).toBe(30);
  });

  it('verifies class schedules have positive capacities', async () => {
    const schedules = await prisma.classSchedule.findMany({
      where: { isCancelled: false },
    });

    expect(schedules.length).toBeGreaterThan(0);
    for (const schedule of schedules) {
      expect(schedule.capacity).toBeGreaterThan(0);
      expect(schedule.bookedCount).toBeLessThanOrEqual(schedule.capacity);
    }
  });
});
