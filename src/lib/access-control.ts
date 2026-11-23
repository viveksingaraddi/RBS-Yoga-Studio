import { prisma } from './prisma';

export async function checkUserMembershipAccess(userId: string) {
  const now = new Date();
  const activeMembership = await prisma.membership.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      OR: [
        { endDate: null },
        { endDate: { gte: now } }
      ]
    },
    include: {
      plan: true,
    },
  });

  return activeMembership;
}

export async function canUserAccessRecording(userId: string, recordingId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') return true;

  const membership = await checkUserMembershipAccess(userId);
  if (!membership || !membership.plan.includesRecordings) {
    return false;
  }

  return true;
}

export async function canUserAccessLiveSession(userId: string, sessionId: string): Promise<{
  allowed: boolean;
  meetingUrl?: string;
  reason?: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return { allowed: false, reason: 'Session not found' };
  }

  if (session.status === 'CANCELLED') {
    return { allowed: false, reason: 'This session has been cancelled' };
  }

  if (user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') {
    return { allowed: true, meetingUrl: session.meetingUrlEncrypted };
  }

  if (session.requiresMembership) {
    const membership = await checkUserMembershipAccess(userId);
    if (!membership || !membership.plan.includesLiveClasses) {
      return { allowed: false, reason: 'Active membership with live class access is required' };
    }
  }

  return { allowed: true, meetingUrl: session.meetingUrlEncrypted };
}
