import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Film, Play, Clock, CheckCircle2, Lock, Search } from 'lucide-react';
import InstructorRecordingsClient from '@/components/portal/InstructorRecordingsClient';

export default async function RecordingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) return null;

  const resolvedParams = await searchParams;
  const categoryFilter = resolvedParams?.category;
  const searchQuery = resolvedParams?.q;

  // If INSTRUCTOR or ADMIN, render management console
  if (session.role === 'INSTRUCTOR' || session.role === 'ADMIN') {
    const [allRecordings, plans] = await Promise.all([
      prisma.recording.findMany({
        include: {
          _count: { select: { playbackLogs: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.membershipPlan.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      }),
    ]);

    const formatted = allRecordings.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      category: r.category,
      instructor: r.instructor,
      durationSeconds: r.durationSeconds,
      thumbnailUrl: r.thumbnailUrl,
      streamVideoId: r.streamVideoId,
      isPublished: r.isPublished,
      planId: r.planId,
      createdAt: r.createdAt.toISOString(),
      watchCount: r._count.playbackLogs,
    }));

    return <InstructorRecordingsClient initialRecordings={formatted} plans={plans} />;
  }

  // Check if user has active membership
  const now = new Date();
  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.userId,
      status: 'ACTIVE',
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    include: { plan: true },
  });

  const hasAccess = Boolean(membership?.plan.includesRecordings);

  // Fetch recordings with playback status
  const recordings = await prisma.recording.findMany({
    where: {
      isPublished: true,
      ...(categoryFilter && categoryFilter !== 'ALL' ? { category: categoryFilter } : {}),
      ...(searchQuery
        ? {
            OR: [
              { title: { contains: searchQuery, mode: 'insensitive' } },
              { description: { contains: searchQuery, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      playbackLogs: {
        where: { userId: session.userId },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const categories = ['ALL', 'Hatha Yoga', 'Pranayama', 'Meditation'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-dark/40 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
            On-Demand Sadhana Archives
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest">
            Recorded Practice Library
          </h1>
          <p className="text-xs text-charcoal/70">
            Guided video instruction with Master Sangu. Stream high-definition practices at your own pace.
          </p>
        </div>

        {!hasAccess && (
          <div className="flex items-center space-x-2 bg-yellow-50 text-yellow-800 text-xs px-3 py-2 border border-yellow-200">
            <Lock className="w-4 h-4 shrink-0 text-yellow-600" />
            <span>Active membership required to stream recordings.</span>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/portal/recordings${cat === 'ALL' ? '' : `?category=${encodeURIComponent(cat)}`}`}
            className={`px-4 py-1.5 text-xs uppercase tracking-wider font-semibold border transition-all ${
              (cat === 'ALL' && !categoryFilter) || categoryFilter === cat
                ? 'bg-forest text-ivory border-forest shadow-sm'
                : 'bg-ivory text-charcoal/70 border-sage-dark/50 hover:border-forest'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Recordings Grid */}
      {recordings.length === 0 ? (
        <div className="text-center py-16 bg-ivory border border-sage-dark/40 shadow-card">
          <Film className="w-10 h-10 text-earth mx-auto mb-3" />
          <h3 className="font-serif text-2xl text-forest">No Practices Found</h3>
          <p className="text-xs text-charcoal/70 mt-1">
            Try selecting another category or check back as Master Sangu uploads new teachings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((rec) => {
            const userLog = rec.playbackLogs[0];
            const isCompleted = userLog?.isCompleted;
            const progressPercent = userLog?.lastPositionSec && rec.durationSeconds
              ? Math.min(100, Math.round((userLog.lastPositionSec / rec.durationSeconds) * 100))
              : 0;

            return (
              <div
                key={rec.id}
                className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden flex flex-col justify-between group hover:border-earth/60 transition-all"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] bg-forest/5 overflow-hidden">
                    <img
                      src={rec.thumbnailUrl}
                      alt={rec.title}
                      className="w-full h-full object-cover filter saturate-[0.9] group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Duration badge */}
                    <div className="absolute bottom-2.5 right-2.5 bg-forest/90 text-ivory text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium backdrop-blur-sm">
                      {Math.round(rec.durationSeconds / 60)} Mins
                    </div>

                    {/* Completion badge */}
                    {isCompleted && (
                      <div className="absolute top-2.5 right-2.5 bg-earth text-forest text-[10px] font-bold px-2 py-0.5 flex items-center space-x-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </div>
                    )}

                    {!hasAccess && (
                      <div className="absolute inset-0 bg-forest/70 backdrop-blur-xs flex items-center justify-center text-ivory">
                        <div className="text-center space-y-1">
                          <Lock className="w-6 h-6 mx-auto text-earth" />
                          <span className="text-[10px] uppercase tracking-widest font-semibold block">
                            Member Only
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-olive font-semibold">
                      {rec.category}
                    </span>
                    <h3 className="font-serif text-xl text-forest font-medium line-clamp-2">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-charcoal/70 line-clamp-2 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="p-5 pt-0 border-t border-sage-dark/30 mt-4">
                  {progressPercent > 0 && !isCompleted && (
                    <div className="mb-3 space-y-1">
                      <div className="flex justify-between text-[10px] text-olive font-medium">
                        <span>Progress</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1 bg-sage overflow-hidden">
                        <div
                          className="h-full bg-earth"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {hasAccess ? (
                    <Link
                      href={`/portal/recordings/${rec.slug}`}
                      className="w-full py-2.5 bg-forest text-ivory text-xs uppercase tracking-wider font-semibold flex items-center justify-center space-x-1.5 hover:bg-forest-light transition-all shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{progressPercent > 0 ? 'Resume Practice' : 'Start Practice'}</span>
                    </Link>
                  ) : (
                    <Link
                      href="/memberships"
                      className="w-full py-2.5 border border-forest text-forest text-xs uppercase tracking-wider font-semibold flex items-center justify-center space-x-1.5 hover:bg-forest hover:text-ivory transition-all"
                    >
                      <span>Unlock with Pass</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
