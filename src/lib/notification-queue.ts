import { prisma } from './prisma';
import { sendEmailNotification } from './email';

interface EnqueueOptions {
  recipient: string;
  subject: string;
  content: string;
  eventType: string;
  scheduledFor?: Date;
  idempotencyKey?: string;
  payload?: any;
}

/**
 * Enqueues a notification job into the persistent database queue with idempotency protection.
 */
export async function enqueueNotificationJob({
  recipient,
  subject,
  content,
  eventType,
  scheduledFor = new Date(),
  idempotencyKey,
  payload,
}: EnqueueOptions) {
  if (idempotencyKey) {
    const existing = await prisma.notificationJob.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      return { success: true, duplicate: true, job: existing };
    }
  }

  const job = await prisma.notificationJob.create({
    data: {
      recipient,
      subject,
      content,
      eventType,
      scheduledFor,
      idempotencyKey: idempotencyKey || null,
      payload: payload ? JSON.stringify(payload) : null,
      status: 'PENDING',
    },
  });

  return { success: true, duplicate: false, job };
}

/**
 * Executes due background notification jobs using atomic processing and exponential backoff retry.
 */
export async function processNotificationQueue(limit = 25): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const now = new Date();

  // Find due jobs
  const dueJobs = await prisma.notificationJob.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: now },
    },
    take: limit,
    orderBy: { scheduledFor: 'asc' },
  });

  let succeeded = 0;
  let failed = 0;

  for (const job of dueJobs) {
    try {
      // Mark as PROCESSING
      await prisma.notificationJob.update({
        where: { id: job.id },
        data: { status: 'PROCESSING' },
      });

      // Dispatch email
      const result = await sendEmailNotification({
        to: job.recipient,
        subject: job.subject,
        html: job.content,
        eventType: job.eventType,
      });

      if (result.success) {
        await prisma.notificationJob.update({
          where: { id: job.id },
          data: {
            status: 'COMPLETED',
            processedAt: new Date(),
            attempts: { increment: 1 },
          },
        });
        succeeded++;
      } else {
        throw new Error(result.error ? JSON.stringify(result.error) : 'Email delivery rejected');
      }
    } catch (err: any) {
      failed++;
      const nextAttempt = job.attempts + 1;
      const isMaxReached = nextAttempt >= job.maxAttempts;

      // Exponential backoff: 2^attempt * 2 minutes
      const backoffMinutes = Math.pow(2, nextAttempt) * 2;
      const nextSchedule = new Date(Date.now() + backoffMinutes * 60 * 1000);

      await prisma.notificationJob.update({
        where: { id: job.id },
        data: {
          status: isMaxReached ? 'FAILED' : 'PENDING',
          attempts: nextAttempt,
          lastError: err.message || 'Unknown processing error',
          scheduledFor: isMaxReached ? job.scheduledFor : nextSchedule,
        },
      });
    }
  }

  return { processed: dueJobs.length, succeeded, failed };
}

/**
 * Scans active memberships and queues expiry reminders for 7d, 3d, and 1d
 */
export async function queueSubscriptionExpiryReminders(): Promise<number> {
  const now = new Date();
  let queuedCount = 0;

  const targetIntervals = [7, 3, 1]; // days before expiry

  for (const days of targetIntervals) {
    const targetStart = new Date(now.getTime() + (days - 0.5) * 24 * 60 * 60 * 1000);
    const targetEnd = new Date(now.getTime() + (days + 0.5) * 24 * 60 * 60 * 1000);

    const expiringMemberships = await prisma.membership.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { gte: targetStart, lte: targetEnd },
      },
      include: {
        user: true,
        plan: true,
      },
    });

    for (const m of expiringMemberships) {
      const idempotencyKey = `EXPIRY_REM_${m.id}_${days}D`;
      const expiryDateStr = m.endDate ? new Date(m.endDate).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) : '';

      const content = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #F8F6F0; padding: 32px; border: 1px solid #E9EDE5; color: #1E3029;">
          <h2 style="font-family: Georgia, serif; color: #173F34;">Renew Your Studio Sadhana Pass</h2>
          <p style="font-size: 14px; line-height: 1.6;">Namaste <strong>${m.user.name}</strong>, your active subscription for <strong>${m.plan.name}</strong> expires in <strong>${days} day${days > 1 ? 's' : ''}</strong> (on ${expiryDateStr}).</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/memberships" style="background: #173F34; color: #F8F6F0; padding: 12px 28px; text-decoration: none; text-transform: uppercase; font-size: 12px; font-weight: 600;">
              Renew Pass Online &rarr;
            </a>
          </div>
        </div>
      `;

      const result = await enqueueNotificationJob({
        recipient: m.user.email,
        subject: `[Reminder] Your ${m.plan.name} expires in ${days} days`,
        content,
        eventType: `SUBSCRIPTION_EXPIRY_${days}D`,
        idempotencyKey,
      });

      if (!result.duplicate) queuedCount++;
    }
  }

  return queuedCount;
}
