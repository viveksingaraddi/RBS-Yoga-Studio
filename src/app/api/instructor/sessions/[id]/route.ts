import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateMeetingUrl, encryptMeetingUrl } from '@/lib/meetings';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, status, meetingUrl, title, description, newStartTime } = body;

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
    });

    if (!liveSession) {
      return NextResponse.json({ error: 'Live session not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status; // SCHEDULED, LIVE, COMPLETED, CANCELLED
    }

    if (meetingUrl) {
      const validation = validateMeetingUrl(meetingUrl);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error || 'Invalid meeting URL' }, { status: 400 });
      }
      updateData.meetingUrl = meetingUrl.trim();
      updateData.meetingUrlEncrypted = encryptMeetingUrl(meetingUrl.trim());
      updateData.meetingProvider = validation.provider;
    }

    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;

    if (newStartTime) {
      const newStart = new Date(newStartTime);
      const newEnd = new Date(newStart.getTime() + liveSession.durationMinutes * 60 * 1000);
      updateData.startTime = newStart;
      updateData.endTime = newEnd;
    }

    const updated = await prisma.liveSession.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'LIVE_SESSION_UPDATED',
        targetType: 'LIVE_SESSION',
        targetId: id,
        details: `Instructor ${session.name} updated live session ${updated.title} (Status: ${updated.status})`,
      },
    });

    return NextResponse.json({ success: true, session: updated });
  } catch (err: any) {
    console.error('Error modifying live session:', err);
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}
