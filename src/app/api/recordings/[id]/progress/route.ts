import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { id: recordingId } = await params;
    const { positionSeconds, durationSeconds } = await req.json();

    const isCompleted = durationSeconds > 0 && positionSeconds >= durationSeconds * 0.9;

    await prisma.playbackLog.upsert({
      where: {
        userId_recordingId: {
          userId: user.userId,
          recordingId,
        },
      },
      update: {
        lastPositionSec: Math.floor(positionSeconds || 0),
        watchedSeconds: { increment: 10 },
        isCompleted: isCompleted,
      },
      create: {
        userId: user.userId,
        recordingId,
        lastPositionSec: Math.floor(positionSeconds || 0),
        watchedSeconds: Math.floor(positionSeconds || 0),
        isCompleted: isCompleted,
      },
    });

    return NextResponse.json({ success: true, isCompleted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to record progress' },
      { status: 500 }
    );
  }
}
