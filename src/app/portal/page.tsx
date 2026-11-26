import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Video, Film, Award, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export default async function PortalDashboardPage() {
  const session = await getCurrentUser();
  if (!session) return null;

  const now = new Date();

  // Fetch all learner dashboard components concurrently in parallel with specific column selection
  const [membership, upcomingBookings, recordings, liveSessions] = await Promise.all([
    // 1. Fetch active membership
    prisma.membership.findFirst({
      where: {
        userId: session.userId,
        status: 'ACTIVE',
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        plan: {
          select: {
            name: true,
            durationDays: true,
            includesRecordings: true,
            includesLiveClasses: true,
          },
        },
      },
    }),

    // 2. Fetch upcoming confirmed bookings
    prisma.booking.findMany({
      where: {
        userId: session.userId,
        status: 'CONFIRMED',
        schedule: {
          startTime: { gte: now },
        },
      },
      select: {
        id: true,
        bookingNumber: true,
        schedule: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            deliveryType: true,
            location: true,
            meetingUrl: true,
            class: { select: { title: true } },
          },
        },
      },
      orderBy: { schedule: { startTime: 'asc' } },
      take: 3,
    }),

    // 3. Fetch recent recordings
    prisma.recording.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        durationSeconds: true,
        category: true,
        thumbnailUrl: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),

    // 4. Fetch upcoming live sessions
    prisma.liveSession.findMany({
      where: {
        status: 'SCHEDULED',
        startTime: { gte: now },
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        streamUrl: true,
      },
      orderBy: { startTime: 'asc' },
      take: 2,
    }),
  ]);

  const daysRemaining = membership?.endDate
    ? Math.max(0, Math.ceil((membership.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-ivory border border-sage-dark/40 p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
            Daily Practice Sanctuary
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest">
            Namaste, {session.name}
          </h1>
          <p className="text-xs text-charcoal/70 max-w-xl">
            Welcome to your personal sadhana space. Track your scheduled classes, join live transmissions with Master Sangu, and continue your on-demand video studies.
          </p>
        </div>

        <Link
          href="/schedule"
          className="self-start md:self-auto bg-forest text-ivory px-6 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all shadow-sm"
        >
          Book Next Class
        </Link>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Membership Status */}
        <div className="bg-ivory border border-sage-dark/40 p-6 shadow-card space-y-3">
          <div className="flex items-center justify-between text-xs text-olive font-semibold uppercase tracking-wider">
            <span>Membership Pass</span>
            <Award className="w-4 h-4 text-earth" />
          </div>
          {membership ? (
            <div>
              <h3 className="font-serif text-2xl text-forest font-semibold">
                {membership.plan.name}
              </h3>
              <p className="text-xs text-olive mt-1">
                {daysRemaining} Days Remaining
              </p>
              <div className="mt-3 inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-0.5 bg-sage text-forest font-semibold">
                Active & Verified
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-charcoal/80">No Active Pass</p>
              <Link
                href="/memberships"
                className="mt-3 inline-block text-xs uppercase tracking-wider text-forest font-semibold underline"
              >
                Explore Passes
              </Link>
            </div>
          )}
        </div>

        {/* Bookings Count */}
        <div className="bg-ivory border border-sage-dark/40 p-6 shadow-card space-y-3">
          <div className="flex items-center justify-between text-xs text-olive font-semibold uppercase tracking-wider">
            <span>Upcoming Classes</span>
            <Calendar className="w-4 h-4 text-earth" />
          </div>
          <h3 className="font-serif text-3xl text-forest font-semibold">
            {upcomingBookings.length}
          </h3>
          <p className="text-xs text-olive">Confirmed Mats Reserved</p>
        </div>

        {/* Live Transmissions */}
        <div className="bg-ivory border border-sage-dark/40 p-6 shadow-card space-y-3">
          <div className="flex items-center justify-between text-xs text-olive font-semibold uppercase tracking-wider">
            <span>Next Live Session</span>
            <Video className="w-4 h-4 text-earth" />
          </div>
          {liveSessions.length > 0 ? (
            <div>
              <h4 className="font-serif text-lg text-forest truncate font-medium">
                {liveSessions[0].title}
              </h4>
              <p className="text-xs text-olive mt-1">
                {new Date(liveSessions[0].startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                IST
              </p>
            </div>
          ) : (
            <p className="text-xs text-charcoal/60">No Live Broadcast Today</p>
          )}
        </div>
      </div>

      {/* Upcoming Bookings Section */}
      <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-sage-dark/30 pb-4">
          <h2 className="font-serif text-2xl text-forest">Upcoming Scheduled Classes</h2>
          <Link
            href="/portal/bookings"
            className="text-xs uppercase tracking-wider text-forest font-semibold hover:text-earth underline"
          >
            All Bookings
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-8 text-charcoal/60 text-xs">
            No upcoming bookings reserved yet.{' '}
            <Link href="/schedule" className="text-forest font-semibold underline">
              Browse the timetable
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-sage-dark/30">
            {upcomingBookings.map((b) => (
              <div key={b.id} className="py-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-earth font-semibold">
                    {b.bookingNumber}
                  </span>
                  <h4 className="font-serif text-xl text-forest">{b.schedule.class.title}</h4>
                  <p className="text-xs text-olive">
                    {new Date(b.schedule.startTime).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <span className="px-3 py-1 bg-sage text-forest text-xs uppercase tracking-wider font-semibold">
                  {b.schedule.deliveryType}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recorded Library Highlights */}
      <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-sage-dark/30 pb-4">
          <h2 className="font-serif text-2xl text-forest">Recommended Video Teachings</h2>
          <Link
            href="/portal/recordings"
            className="text-xs uppercase tracking-wider text-forest font-semibold hover:text-earth underline"
          >
            Open Full Library
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {recordings.map((rec) => (
            <Link
              key={rec.id}
              href={`/portal/recordings/${rec.slug}`}
              className="group border border-sage-dark/40 overflow-hidden hover:border-earth/50 transition-all flex flex-col"
            >
              <div className="relative aspect-[16/10] bg-forest/5 overflow-hidden">
                <img
                  src={rec.thumbnailUrl}
                  alt={rec.title}
                  className="w-full h-full object-cover filter saturate-[0.9] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 right-2 bg-forest/90 text-ivory text-[10px] px-2 py-0.5">
                  {Math.round(rec.durationSeconds / 60)} Mins
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-olive font-semibold">
                    {rec.category}
                  </span>
                  <h4 className="font-serif text-lg text-forest group-hover:text-forest-light line-clamp-2 mt-1">
                    {rec.title}
                  </h4>
                </div>
                <div className="pt-3 text-[11px] text-earth font-semibold flex items-center space-x-1">
                  <span>Stream Video</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Account Security & Password Card */}
      <div className="bg-sage-light border border-sage-dark/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-forest font-serif text-lg font-medium">
            <ShieldCheck className="w-5 h-5 text-earth" />
            <span>Account Security &amp; Login Password</span>
          </div>
          <p className="text-xs text-charcoal/70">
            Keep your account secure. You can update your initial login password at any time.
          </p>
        </div>
        <Link
          href="/portal/settings"
          className="bg-forest text-ivory px-5 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light transition-all flex items-center space-x-1.5 shrink-0"
        >
          <span>Update Password</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
