import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid') || `mock_stream_${Date.now()}`;
  return NextResponse.json({
    success: true,
    result: {
      uid,
      state: 'ready',
      playback: {
        hls: `https://videodelivery.net/${uid}/manifest/video.m3u8`,
      },
      thumbnail: '/images/hero-bg.jpg',
    },
  });
}
