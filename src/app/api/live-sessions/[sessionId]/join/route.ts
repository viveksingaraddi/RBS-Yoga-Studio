import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canUserAccessLiveSession } from '@/lib/access-control';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { sessionId } = await params;

    // Check authorization strictly server-side
    const access = await canUserAccessLiveSession(user.userId, sessionId);
    if (!access.allowed || !access.meetingUrl) {
      return NextResponse.json(
        {
          success: false,
          message: access.reason || 'You do not have active access privileges for this live session.',
        },
        { status: 403 }
      );
    }

    // Track attendance event: Link Opened
    await prisma.attendance.upsert({
      where: {
        id: `att_${user.userId}_${sessionId}`,
      },
      update: {
        status: 'LINK_OPENED',
        linkOpenedAt: new Date(),
      },
      create: {
        id: `att_${user.userId}_${sessionId}`,
        userId: user.userId,
        liveSessionId: sessionId,
        status: 'LINK_OPENED',
        linkOpenedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: user.userId,
      action: 'LIVE_SESSION_LINK_ACCESSED',
      targetType: 'LiveSession',
      targetId: sessionId,
    });

    // Return meeting URL ONLY to verified authorized user
    return NextResponse.json({
      success: true,
      meetingUrl: access.meetingUrl,
    });
  } catch (error: any) {
    console.error('Join live session error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error authorizing live session' },
      { status: 500 }
    );
  }
}
