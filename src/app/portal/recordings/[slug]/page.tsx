import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { canUserAccessRecording } from '@/lib/access-control';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import VideoPlayerWithTracking from '@/components/portal/VideoPlayerWithTracking';

export default async function SingleRecordingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) redirect('/login');

  const { slug } = await params;

  const recording = await prisma.recording.findUnique({
    where: { slug },
  });

  if (!recording || !recording.isPublished) {
    notFound();
  }

  // Strictly check server-side access
  const hasAccess = await canUserAccessRecording(session.userId, recording.id);
  if (!hasAccess) {
    redirect('/portal/recordings');
  }

  // Get previous playback log
  const log = await prisma.playbackLog.findUnique({
    where: {
      userId_recordingId: {
        userId: session.userId,
        recordingId: recording.id,
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/portal/recordings"
          className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider text-olive hover:text-forest mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Video Library</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-earth font-semibold">
              {recording.category} · Guided by {recording.instructor}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-forest mt-1">
              {recording.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2 text-xs text-olive font-medium">
            <Clock className="w-3.5 h-3.5 text-earth" />
            <span>{Math.round(recording.durationSeconds / 60)} Minutes Practice</span>
          </div>
        </div>
      </div>

      {/* Video Player Component with Progress Sync */}
      <div className="bg-black shadow-elevated border border-earth/30">
        <VideoPlayerWithTracking
          recordingId={recording.id}
          initialPosition={log?.lastPositionSec || 0}
          durationSeconds={recording.durationSeconds}
        />
      </div>

      {/* Practice Notes & Details */}
      <div className="bg-ivory border border-sage-dark/40 p-8 shadow-card space-y-6">
        <div>
          <h3 className="font-serif text-2xl text-forest">Sadhana Description & Focus</h3>
          <p className="text-sm text-charcoal/80 mt-2 leading-relaxed">
            {recording.description}
          </p>
        </div>

        <div className="pt-4 border-t border-sage-dark/30 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal/70">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-earth shrink-0 mt-0.5" />
            <span>Focus on continuous steady breathing through the nose (Ujjayi or Natural Pranayama).</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-earth shrink-0 mt-0.5" />
            <span>Honor your personal range of motion without straining joints or ligaments.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
