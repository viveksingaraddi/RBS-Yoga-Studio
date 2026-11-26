import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processNotificationQueue, queueSubscriptionExpiryReminders } from '@/lib/notification-queue';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [pendingJobs, recentNotifications, deliveryStats] = await Promise.all([
      prisma.notificationJob.findMany({
        where: { status: { in: ['PENDING', 'PROCESSING', 'FAILED'] } },
        orderBy: { scheduledFor: 'asc' },
        take: 30,
      }),
      prisma.notification.findMany({
        include: {
          logs: { orderBy: { attemptedAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.notification.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      pendingJobs,
      recentNotifications,
      deliveryStats,
    });
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const queueResult = await processNotificationQueue(50);
    const remindersQueued = await queueSubscriptionExpiryReminders();

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'NOTIFICATION_QUEUE_TRIGGERED',
        targetType: 'NOTIFICATION_JOB',
        details: `Instructor ${session.name} triggered manual queue processing: ${queueResult.processed} processed, ${remindersQueued} expiry reminders queued.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Processed ${queueResult.processed} queued emails (${queueResult.succeeded} sent, ${queueResult.failed} retrying). Queued ${remindersQueued} expiry reminders.`,
      result: queueResult,
    });
  } catch (err: any) {
    console.error('Error executing notification worker:', err);
    return NextResponse.json({ error: err.message || 'Worker execution failed' }, { status: 500 });
  }
}
