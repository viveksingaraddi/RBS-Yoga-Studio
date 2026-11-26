import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createDirectUploadUrl } from '@/lib/cloudflare-stream';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { maxDurationSeconds = 7200, title } = body;

    const result = await createDirectUploadUrl({
      maxDurationSeconds: parseInt(String(maxDurationSeconds), 10),
      creatorId: session.userId,
      meta: {
        instructorName: session.name,
        title: title || 'RBS Yoga Recorded Masterclass',
      },
    });

    return NextResponse.json({
      success: true,
      uploadUrl: result.uploadUrl,
      uid: result.uid,
      isMock: result.isMock,
    });
  } catch (err: any) {
    console.error('Error generating direct upload URL:', err);
    return NextResponse.json({ error: err.message || 'Failed to initialize upload' }, { status: 500 });
  }
}
