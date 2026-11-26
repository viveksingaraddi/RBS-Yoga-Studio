import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Award,
  MessageSquare,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const revalidate = 0; // Dynamic real-time metrics

export default async function AdminOverviewPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Execute all dashboard metrics and recent lists concurrently in parallel
  const [
    totalLearners,
    activeMemberships,
    todayBookingsCount,
    upcomingClassesCount,
    totalEnquiries,
    newEnquiries,
    revenueAgg,
    recentEnquiries,
    recentBookings,
  ] = await Promise.all([
    // 1. Total Learners count
    prisma.user.count({ where: { role: 'LEARNER' } }),

    // 2. Active memberships count
    prisma.membership.count({
      where: {
        status: 'ACTIVE',
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
    }),

    // 3. Today's bookings count
    prisma.booking.count({
      where: { createdAt: { gte: startOfToday } },
    }),

    // 4. Upcoming classes count
    prisma.classSchedule.count({
      where: { isCancelled: false, startTime: { gte: now } },
    }),

    // 5. Total Enquiries count & NEW enquiries
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: 'NEW' } }),

    // 6. Real revenue calculated from captured payments
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'CAPTURED' },
    }),

    // 7. Recent enquiries (column projection)
    prisma.enquiry.findMany({
      select: {
        id: true,
        fullName: true,
        phone: true,
        message: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),

    // 8. Recent bookings (column projection)
    prisma.booking.findMany({
      select: {
        id: true,
        bookingNumber: true,
        status: true,
        amountPaid: true,
        createdAt: true,
        user: {
          select: { name: true, email: true },
        },
        schedule: {
          select: {
            startTime: true,
            deliveryType: true,
            class: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.amount || 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-dark/40 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
            Executive Studio Center
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest">
            Studio Operations Overview
          </h1>
          <p className="text-xs text-charcoal/70">
            Real-time business performance metrics, active learner counts, and verified revenue.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/schedules"
            className="bg-forest text-ivory px-5 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light transition-all shadow-sm"
          >
            + New Schedule
          </Link>
          <Link
            href="/admin/enquiries"
            className="border border-forest/40 text-forest px-4 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-sage/40 transition-colors"
          >
            View Enquiries ({newEnquiries})
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Verified Revenue */}
        <div className="bg-ivory border border-sage-dark/40 p-6 shadow-card space-y-3">
          <div className="flex items-center justify-between text-xs text-olive font-semibold uppercase tracking-wider">
            <span>Verified Revenue</span>
            <DollarSign className="w-4 h-4 text-earth" />
          </div>
          <h3 className="font-serif text-3xl text-forest font-semibold">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-olive">Real captured transaction total</p>
        </div>

        {/* Metric 2: Total Learners */}
        <div className="bg-ivory border border-sage-dark/40 p-6 shadow-card space-y-3">
          <div className="flex items-center justify-between text-xs text-olive font-semibold uppercase tracking-wider">
            <span>Registered Learners</span>
            <Users className="w-4 h-4 text-earth" />
          </div>
          <h3 className="font-serif text-3xl text-forest font-semibold">
            {totalLearners}
          </h3>
          <p className="text-[11px] text-olive">{activeMemberships} active passholders</p>
        </div>

        {/* Metric 3: Upcoming Classes */}
        <div className="bg-ivory border border-sage-dark/40 p-6 shadow-card space-y-3">
          <div className="flex items-center justify-between text-xs text-olive font-semibold uppercase tracking-wider">
            <span>Upcoming Classes</span>
            <Calendar className="w-4 h-4 text-earth" />
          </div>
          <h3 className="font-serif text-3xl text-forest font-semibold">
            {upcomingClassesCount}
          </h3>
          <p className="text-[11px] text-olive">{todayBookingsCount} booked today</p>
        </div>

        {/* Metric 4: Enquiries */}
        <div className="bg-ivory border border-sage-dark/40 p-6 shadow-card space-y-3">
          <div className="flex items-center justify-between text-xs text-olive font-semibold uppercase tracking-wider">
            <span>WhatsApp Enquiries</span>
            <MessageSquare className="w-4 h-4 text-earth" />
          </div>
          <h3 className="font-serif text-3xl text-forest font-semibold">
            {totalEnquiries}
          </h3>
          <p className="text-[11px] text-earth font-semibold">{newEnquiries} awaiting response</p>
        </div>
      </div>

      {/* Two Column Section: Recent Bookings & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-sage-dark/30 pb-4">
            <h2 className="font-serif text-2xl text-forest">Recent Class Bookings</h2>
            <Link
              href="/admin/bookings"
              className="text-xs uppercase tracking-wider text-forest font-semibold hover:text-earth underline"
            >
              All Bookings
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-xs text-charcoal/60 py-6 text-center">No bookings recorded yet.</p>
          ) : (
            <div className="divide-y divide-sage-dark/30">
              {recentBookings.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-earth font-semibold">
                      {b.bookingNumber}
                    </span>
                    <h4 className="font-serif text-lg text-forest">{b.user.name}</h4>
                    <p className="text-[11px] text-olive">
                      {b.schedule.class.title} · ₹{Number(b.amountPaid)}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                      b.status === 'CONFIRMED'
                        ? 'bg-sage text-forest'
                        : 'bg-yellow-50 text-yellow-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Enquiries */}
        <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-sage-dark/30 pb-4">
            <h2 className="font-serif text-2xl text-forest">Recent Enquiries</h2>
            <Link
              href="/admin/enquiries"
              className="text-xs uppercase tracking-wider text-forest font-semibold hover:text-earth underline"
            >
              All Enquiries
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <p className="text-xs text-charcoal/60 py-6 text-center">No enquiries received yet.</p>
          ) : (
            <div className="divide-y divide-sage-dark/30">
              {recentEnquiries.map((enq) => (
                <div key={enq.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-olive">
                      {enq.interestedProgram || 'General'} · {enq.preferredType}
                    </span>
                    <h4 className="font-serif text-lg text-forest">{enq.fullName}</h4>
                    <p className="text-[11px] text-olive">{enq.phone}</p>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                      enq.status === 'NEW'
                        ? 'bg-earth/20 text-forest'
                        : 'bg-sage text-forest'
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
