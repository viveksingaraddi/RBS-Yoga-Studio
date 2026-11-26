import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import NotificationsClient from './NotificationsClient';

export default async function NotificationsPage() {
  const session = await getCurrentUser();
  if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
    redirect('/login');
  }

  const [pendingJobs, recentNotifications, statsRaw] = await Promise.all([
    prisma.notificationJob.findMany({
      where: { status: { in: ['PENDING', 'PROCESSING', 'FAILED'] } },
      orderBy: { scheduledFor: 'asc' },
      take: 40,
    }),
    prisma.notification.findMany({
      include: {
        logs: { orderBy: { attemptedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    prisma.notification.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ]);

  const formattedJobs = pendingJobs.map((j) => ({
    id: j.id,
    recipient: j.recipient,
    subject: j.subject,
    eventType: j.eventType,
    scheduledFor: j.scheduledFor.toISOString(),
    status: j.status,
    attempts: j.attempts,
    maxAttempts: j.maxAttempts,
    lastError: j.lastError,
  }));

  const formattedNotifications = recentNotifications.map((n) => ({
    id: n.id,
    recipient: n.recipient,
    subject: n.subject,
    eventType: n.eventType,
    status: n.status,
    error: n.error,
    createdAt: n.createdAt.toISOString(),
    sentAt: n.sentAt?.toISOString() || null,
    provider: n.logs[0]?.provider || 'GMAIL_SMTP',
  }));

  const statMap: Record<string, number> = { SENT: 0, QUEUED: 0, FAILED: 0 };
  statsRaw.forEach((s) => {
    statMap[s.status] = s._count.id;
  });

  return (
    <NotificationsClient
      jobs={formattedJobs}
      notifications={formattedNotifications}
      stats={{
        totalSent: statMap.SENT || 0,
        queuedCount: formattedJobs.length,
        failedCount: statMap.FAILED || 0,
        senderIdentity: process.env.GMAIL_USER || 'yogawithsangu@gmail.com',
      }}
    />
  );
}
