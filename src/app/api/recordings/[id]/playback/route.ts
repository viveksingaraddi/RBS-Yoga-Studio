import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canUserAccessRecording } from '@/lib/access-control';
import { generateStreamPlaybackUrl } from '@/lib/video-stream';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { id: recordingId } = await params;

    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || !recording.isPublished) {
      return NextResponse.json({ success: false, message: 'Recording not found' }, { status: 404 });
    }

    // Server-side membership authorization check
    const hasAccess = await canUserAccessRecording(user.userId, recordingId);
    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          message: 'An active membership with recording library access is required to view this practice.',
        },
        { status: 403 }
      );
    }

    // Generate signed playback URL
    const stream = generateStreamPlaybackUrl({
      videoId: recording.streamVideoId,
      userId: user.userId,
      expiresInSeconds: 3600,
    });

    // Fetch previous playback position if any
    const playbackLog = await prisma.playbackLog.findUnique({
      where: {
        userId_recordingId: {
          userId: user.userId,
          recordingId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      playbackUrl: recording.streamPlaybackUrl || stream.playbackUrl,
      lastPositionSec: playbackLog?.lastPositionSec || 0,
      isCompleted: playbackLog?.isCompleted || false,
    });
  } catch (error: any) {
    console.error('Recording playback error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to authorize video playback' },
      { status: 500 }
    );
  }
}
