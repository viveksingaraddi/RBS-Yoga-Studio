import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteCloudflareVideo } from '@/lib/cloudflare-stream';

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
    const { title, description, category, isPublished, planId, thumbnailUrl, durationSeconds } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);
    if (planId !== undefined) updateData.planId = planId || null;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (durationSeconds !== undefined) updateData.durationSeconds = parseInt(String(durationSeconds), 10);

    const updated = await prisma.recording.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'RECORDING_UPDATED',
        targetType: 'RECORDING',
        targetId: id,
        details: `Instructor ${session.name} updated masterclass ${updated.title}: ${JSON.stringify(updateData)}`,
      },
    });

    return NextResponse.json({ success: true, recording: updated });
  } catch (err: any) {
    console.error('Error updating recording:', err);
    return NextResponse.json({ error: err.message || 'Failed to update recording' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const recording = await prisma.recording.findUnique({
      where: { id },
    });

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    // Delete from Cloudflare Stream
    if (recording.streamVideoId) {
      await deleteCloudflareVideo(recording.streamVideoId);
    }

    // Delete from database (cascades to VideoUpload, PlaybackLogs)
    await prisma.recording.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'RECORDING_DELETED',
        targetType: 'RECORDING',
        targetId: id,
        details: `Instructor ${session.name} deleted masterclass ${recording.title} (UID: ${recording.streamVideoId})`,
      },
    });

    return NextResponse.json({ success: true, message: 'Recording deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting recording:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete recording' }, { status: 500 });
  }
}
