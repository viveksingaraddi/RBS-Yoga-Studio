import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { canUserAccessRecording, canUserAccessLiveSession } from '../src/lib/access-control';

describe('Authorization & Access Guard Rules', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('denies recorded class access to non-existent or inactive learners', async () => {
    const fakeUserId = 'non-existent-user-id';
    const recording = await prisma.recording.findFirst();

    if (recording) {
      const hasAccess = await canUserAccessRecording(fakeUserId, recording.id);
      expect(hasAccess).toBe(false);
    }
  });

  it('grants recording access to admin unconditionally', async () => {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@rbsyogastudio.com' },
    });
    const recording = await prisma.recording.findFirst();

    if (admin && recording) {
      const hasAccess = await canUserAccessRecording(admin.id, recording.id);
      expect(hasAccess).toBe(true);
    }
  });

  it('safeguards live session URLs against unauthorized learners', async () => {
    const fakeUserId = 'unauthorized-user-999';
    const liveSession = await prisma.liveSession.findFirst();

    if (liveSession) {
      const access = await canUserAccessLiveSession(fakeUserId, liveSession.id);
      expect(access.allowed).toBe(false);
      expect(access.meetingUrl).toBeUndefined();
    }
  });
});
