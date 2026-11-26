import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateMeetingUrl, encryptMeetingUrl } from '@/lib/meetings';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.liveSession.findMany({
      include: {
        _count: {
          select: { attendances: true },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (err: any) {
    console.error('Error fetching live sessions:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      instructor = 'Master Sangu',
      meetingUrl,
      startDate,
      startTimeStr,
      durationMinutes = 60,
      requiresMembership = true,
      status = 'SCHEDULED', // SCHEDULED, LIVE
      classScheduleId,
    } = body;

    if (!title || !meetingUrl || !startDate || !startTimeStr) {
      return NextResponse.json({ error: 'Title, meeting URL, date, and start time are required.' }, { status: 400 });
    }

    // 1. Server-side meeting URL validation
    const validation = validateMeetingUrl(meetingUrl);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error || 'Invalid meeting URL.' }, { status: 400 });
    }

    // 2. Compute timestamps
    const [h, m] = startTimeStr.split(':').map(Number);
    const start = new Date(startDate);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + parseInt(String(durationMinutes), 10) * 60 * 1000);

    // 3. Encrypt URL for secure storage
    const encryptedUrl = encryptMeetingUrl(meetingUrl.trim());

    const liveSession = await prisma.liveSession.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        instructor,
        startTime: start,
        endTime: end,
        durationMinutes: parseInt(String(durationMinutes), 10),
        deliveryType: 'ONLINE',
        meetingProvider: validation.provider,
        meetingUrl: meetingUrl.trim(),
        meetingUrlEncrypted: encryptedUrl,
        requiresMembership: Boolean(requiresMembership),
        status,
        classScheduleId: classScheduleId || null,
      },
    });

    // 4. Schedule 60m & 30m reminders in NotificationJob queue if scheduled in future
    const now = new Date();
    const timeToStart = start.getTime() - now.getTime();
    const reminder60Time = new Date(start.getTime() - 60 * 60 * 1000);
    const reminder30Time = new Date(start.getTime() - 30 * 60 * 1000);

    // Find all active members eligible for live streams
    const activeMembers = await prisma.user.findMany({
      where: {
        role: 'LEARNER',
        isActive: true,
        memberships: {
          some: {
            status: 'ACTIVE',
            plan: { includesLiveClasses: true },
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
        },
      },
      select: { id: true, email: true, name: true },
    });

    const jobsToCreate = [];

    // Schedule 60 min reminder if in future
    if (timeToStart > 60 * 60 * 1000) {
      for (const member of activeMembers) {
        jobsToCreate.push({
          recipient: member.email,
          subject: `[Reminder] Live Yoga Session starts in 60 minutes: ${liveSession.title}`,
          content: `Namaste ${member.name}, your live session ${liveSession.title} starts at ${start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`,
          eventType: 'LIVE_REMINDER_60M',
          idempotencyKey: `REM60_${liveSession.id}_${member.id}`,
          scheduledFor: reminder60Time,
          status: 'PENDING',
        });
      }
    }

    // Schedule 30 min reminder if in future
    if (timeToStart > 30 * 60 * 1000) {
      for (const member of activeMembers) {
        jobsToCreate.push({
          recipient: member.email,
          subject: `[Reminder] Live Yoga Session starts in 30 minutes: ${liveSession.title}`,
          content: `Namaste ${member.name}, your live session ${liveSession.title} begins in 30 minutes.`,
          eventType: 'LIVE_REMINDER_30M',
          idempotencyKey: `REM30_${liveSession.id}_${member.id}`,
          scheduledFor: reminder30Time,
          status: 'PENDING',
        });
      }
    }

    if (jobsToCreate.length > 0) {
      await prisma.notificationJob.createMany({
        data: jobsToCreate,
        skipDuplicates: true,
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'LIVE_SESSION_CREATED',
        targetType: 'LIVE_SESSION',
        targetId: liveSession.id,
        details: `Instructor ${session.name} published live broadcast ${liveSession.title} for ${start.toISOString()} (${validation.provider})`,
      },
    });

    return NextResponse.json({ success: true, session: liveSession });
  } catch (err: any) {
    console.error('Error creating live session:', err);
    return NextResponse.json({ error: err.message || 'Failed to create live session' }, { status: 500 });
  }
}
