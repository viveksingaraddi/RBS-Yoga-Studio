import { NextRequest, NextResponse } from 'next/server';
import { processNotificationQueue, queueSubscriptionExpiryReminders } from '@/lib/notification-queue';

export async function GET(req: NextRequest) {
  try {
    // 1. Process queued notifications
    const queueResult = await processNotificationQueue(50);

    // 2. Scan & queue subscription expiry reminders
    const remindersQueued = await queueSubscriptionExpiryReminders();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      queue: queueResult,
      remindersQueued,
    });
  } catch (err: any) {
    console.error('Cron notification processing error:', err);
    return NextResponse.json({ error: err.message || 'Cron execution failed' }, { status: 500 });
  }
}
