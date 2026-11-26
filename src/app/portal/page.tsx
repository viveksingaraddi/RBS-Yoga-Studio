import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Video, Film, Award, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import InstructorDashboardView from '@/components/portal/InstructorDashboardView';
import LiveSessionJoinButton from '@/components/portal/LiveSessionJoinButton';

export default async function PortalDashboardPage() {
  const session = await getCurrentUser();
  if (!session) return null;

  const now = new Date();

  // If the logged in user is the INSTRUCTOR (or ADMIN), render the comprehensive Lead Instructor Console
  if (session.role === 'INSTRUCTOR' || session.role === 'ADMIN') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const endOfTomorrow = new Date(endOfToday.getTime() + 24 * 60 * 60 * 1000);
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalRegisteredStudents,
      activeStudents,
      activeSubscriptions,
      todayRegistrations,
      tomorrowRegistrations,
      upcomingRegistrations7Days,
      todayScheduledClasses,
      upcomingLiveSessions,
      monthlyEarningsAgg,
      yearlyEarningsAgg,
      pendingPaymentsAgg,
      pendingPaymentsCount,
      expiringMemberships,
      sixMonthsPayments,
      sixMonthsUsers,
      subDistributionRaw,
      planDistributionRaw,
      teachingSchedules,
      recentLearnersRaw,
      recentBookingsRaw,
      recentPaymentsRaw,
    ] = await Promise.all([
      // 1. Total registered students
      prisma.user.count({ where: { role: 'LEARNER' } }),

      // 2. Active students (with active pass)
      prisma.user.count({
        where: {
          role: 'LEARNER',
          isActive: true,
          memberships: {
            some: {
              status: 'ACTIVE',
              OR: [{ endDate: null }, { endDate: { gte: now } }],
            },
          },
        },
      }),

      // 3. Active memberships
      prisma.membership.count({
        where: {
          status: 'ACTIVE',
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      }),

      // 4. Today's bookings
      prisma.booking.count({
        where: {
          status: 'CONFIRMED',
          schedule: { startTime: { gte: startOfToday, lte: endOfToday } },
        },
      }),

      // 5. Tomorrow's bookings
      prisma.booking.count({
        where: {
          status: 'CONFIRMED',
          schedule: { startTime: { gte: startOfTomorrow, lte: endOfTomorrow } },
        },
      }),

      // 6. Upcoming bookings 7 days
      prisma.booking.count({
        where: {
          status: 'CONFIRMED',
          schedule: { startTime: { gte: now, lte: next7Days } },
        },
      }),

      // 7. Today's scheduled classes
      prisma.classSchedule.count({
        where: {
          isCancelled: false,
          startTime: { gte: startOfToday, lte: endOfToday },
        },
      }),

      // 8. Upcoming live sessions
      prisma.liveSession.count({
        where: {
          status: { in: ['SCHEDULED', 'LIVE'] },
          startTime: { gte: now },
        },
      }),

      // 9. Monthly earnings
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'CAPTURED', createdAt: { gte: startOfMonth } },
      }),

      // 10. Yearly earnings
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'CAPTURED', createdAt: { gte: startOfYear } },
      }),

      // 11. Pending payments sum
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['CREATED', 'AUTHORIZED'] } },
      }),

      // 12. Pending payments count
      prisma.payment.count({
        where: { status: { in: ['CREATED', 'AUTHORIZED'] } },
      }),

      // 13. Expiring memberships (next 14 days)
      prisma.membership.count({
        where: {
          status: 'ACTIVE',
          endDate: { gte: now, lte: in14Days },
        },
      }),

      // 14. 6-month payments for chart
      prisma.payment.findMany({
        where: { status: 'CAPTURED', createdAt: { gte: sixMonthsAgo } },
        select: { amount: true, createdAt: true },
      }),

      // 15. 6-month users for chart
      prisma.user.findMany({
        where: { role: 'LEARNER', createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),

      // 16. Subscription status distribution
      prisma.membership.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // 17. Plan-wise distribution
      prisma.membershipPlan.findMany({
        select: {
          name: true,
          _count: {
            select: {
              memberships: { where: { status: 'ACTIVE' } },
            },
          },
        },
      }),

      // 18. Teaching schedules
      prisma.classSchedule.findMany({
        where: {
          isCancelled: false,
          startTime: { gte: startOfToday },
        },
        include: {
          class: {
            select: {
              title: true,
              instructor: true,
            },
          },
          bookings: {
            where: { status: 'CONFIRMED' },
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { startTime: 'asc' },
        take: 6,
      }),

      // 19. Recent learners
      prisma.user.findMany({
        where: { role: 'LEARNER' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          memberships: {
            where: { status: 'ACTIVE' },
            select: { plan: { select: { name: true } } },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),

      // 20. Recent bookings
      prisma.booking.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          schedule: { include: { class: { select: { title: true } } } },
        },
      }),

      // 21. Recent payments
      prisma.payment.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          membership: {
            include: {
              user: { select: { name: true } },
              plan: { select: { name: true } },
            },
          },
          booking: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    // Format 6-month charts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenueChart: { label: string; value: number }[] = [];
    const studentRegistrationsChart: { label: string; value: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const label = monthNames[mIdx];

      const rev = sixMonthsPayments
        .filter((p) => {
          const pDate = new Date(p.createdAt);
          return pDate.getMonth() === mIdx && pDate.getFullYear() === yr;
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const reg = sixMonthsUsers.filter((u) => {
        const uDate = new Date(u.createdAt);
        return uDate.getMonth() === mIdx && uDate.getFullYear() === yr;
      }).length;

      monthlyRevenueChart.push({ label, value: Math.round(rev) });
      studentRegistrationsChart.push({ label, value: reg });
    }

    // Format Subscription distribution
    const subDistMap: Record<string, number> = {
      ACTIVE: 0,
      PENDING_PAYMENT: 0,
      EXPIRED: 0,
      CANCELLED: 0,
    };
    subDistributionRaw.forEach((s) => {
      subDistMap[s.status] = s._count.id;
    });
    const subscriptionDistribution = Object.entries(subDistMap).map(([label, value]) => ({
      label,
      value,
    }));

    // Format Plan-wise distribution
    const planDistribution = planDistributionRaw.map((p) => ({
      label: p.name,
      value: p._count.memberships,
    }));

    // Format Recent Activity feed
    const recentActivity: {
      id: string;
      type: 'BOOKING' | 'PAYMENT' | 'STUDENT' | 'MEMBERSHIP' | 'SESSION';
      title: string;
      subtitle: string;
      timestamp: Date;
      statusBadge?: string;
    }[] = [];

    recentPaymentsRaw.forEach((p) => {
      const payerName = p.membership?.user.name || p.booking?.user.name || 'Student';
      recentActivity.push({
        id: `pay-${p.id}`,
        type: 'PAYMENT',
        title: `Payment: ₹${Number(p.amount).toLocaleString('en-IN')}`,
        subtitle: `Received from ${payerName} (${p.status})`,
        timestamp: p.createdAt,
        statusBadge: p.status,
      });
    });

    recentBookingsRaw.forEach((b) => {
      recentActivity.push({
        id: `book-${b.id}`,
        type: 'BOOKING',
        title: `Booking: ${b.schedule.class.title}`,
        subtitle: `Reserved by ${b.user.name} (#${b.bookingNumber})`,
        timestamp: b.createdAt,
        statusBadge: b.status,
      });
    });

    recentLearnersRaw.slice(0, 3).forEach((u) => {
      recentActivity.push({
        id: `user-${u.id}`,
        type: 'STUDENT',
        title: `New Student Registration`,
        subtitle: `${u.name} joined the studio sanctuary`,
        timestamp: u.createdAt,
        statusBadge: 'NEW',
      });
    });

    // Sort by timestamp descending
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const formattedLearners = recentLearnersRaw.map((learner) => ({
      id: learner.id,
      name: learner.name,
      email: learner.email,
      phone: learner.phone,
      isActive: learner.isActive,
      createdAt: learner.createdAt,
      membershipName: learner.memberships[0]?.plan.name,
    }));

    return (
      <InstructorDashboardView
        instructorName={session.name}
        stats={{
          totalRegisteredStudents,
          activeStudents,
          activeSubscriptions,
          todayRegistrations,
          tomorrowRegistrations,
          upcomingRegistrations7Days,
          todayScheduledClasses,
          upcomingLiveSessions,
          monthlyEarnings: Number(monthlyEarningsAgg._sum.amount || 0),
          yearlyEarnings: Number(yearlyEarningsAgg._sum.amount || 0),
          pendingPaymentsCount,
          pendingPaymentsAmount: Number(pendingPaymentsAgg._sum.amount || 0),
          expiringMemberships,
        }}
        monthlyRevenueChart={monthlyRevenueChart}
        studentRegistrationsChart={studentRegistrationsChart}
        subscriptionDistribution={subscriptionDistribution}
        planDistribution={planDistribution}
        teachingSchedules={teachingSchedules}
        recentLearners={formattedLearners}
        recentActivity={recentActivity.slice(0, 6)}
      />
    );
  }

  // Learner Dashboard View: fetch learner data
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
        slug: true,
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
        meetingUrlEncrypted: true,
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
              <LiveSessionJoinButton
                sessionId={liveSessions[0].id}
                sessionTitle={liveSessions[0].title}
              />
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
