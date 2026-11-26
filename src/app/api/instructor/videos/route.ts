import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkVideoProcessingStatus } from '@/lib/cloudflare-stream';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('q')?.trim() || '';

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const recordings = await prisma.recording.findMany({
      where,
      include: {
        _count: {
          select: { playbackLogs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ recordings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch recordings' }, { status: 500 });
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
      slug,
      description,
      category = 'Asana Practice',
      durationSeconds = 1800,
      streamVideoId,
      thumbnailUrl,
      isPublished = true,
      planId,
    } = body;

    if (!title || !streamVideoId) {
      return NextResponse.json({ error: 'Title and Stream Video UID are required.' }, { status: 400 });
    }

    const generatedSlug = slug?.trim() || `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;

    // Verify Cloudflare status
    const cfStatus = await checkVideoProcessingStatus(streamVideoId);

    const recording = await prisma.$transaction(async (tx) => {
      const rec = await tx.recording.create({
        data: {
          title: title.trim(),
          slug: generatedSlug,
          description: description?.trim() || '',
          category,
          instructor: session.name,
          durationSeconds: parseInt(String(durationSeconds || cfStatus.durationSeconds || 1800), 10),
          thumbnailUrl: thumbnailUrl?.trim() || cfStatus.thumbnailUrl || '/images/hero-bg.jpg',
          streamVideoId: streamVideoId.trim(),
          streamPlaybackUrl: cfStatus.playbackUrl || null,
          isPublished: Boolean(isPublished),
          planId: planId || null,
        },
      });

      await tx.videoUpload.create({
        data: {
          recordingId: rec.id,
          provider: 'CLOUDFLARE_STREAM',
          directUploadId: streamVideoId,
          status: cfStatus.state.toUpperCase(),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'RECORDING_PUBLISHED',
          targetType: 'RECORDING',
          targetId: rec.id,
          details: `Instructor ${session.name} published masterclass ${rec.title} (${category}, UID: ${streamVideoId})`,
        },
      });

      return rec;
    });

    return NextResponse.json({ success: true, recording });
  } catch (err: any) {
    console.error('Error saving recording:', err);
    return NextResponse.json({ error: err.message || 'Failed to save recording' }, { status: 500 });
  }
}
