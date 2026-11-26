'use client';

import Link from 'next/link';
import {
  Users,
  Calendar,
  Video,
  Clock,
  ArrowRight,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Award,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  BookOpen,
  DollarSign,
  Activity,
  ShieldCheck,
  CalendarDays,
  PlusCircle,
} from 'lucide-react';

export interface InstructorScheduleItem {
  id: string;
  startTime: Date;
  endTime: Date;
  deliveryType: string;
  location?: string | null;
  meetingUrl?: string | null;
  capacity: number;
  class: {
    title: string;
    instructor?: string;
  };
  bookings: {
    id: string;
    bookingNumber: string;
    status: string;
    user: {
      name: string;
      email: string;
      phone?: string | null;
    };
  }[];
}

export interface ActivityItem {
  id: string;
  type: 'BOOKING' | 'PAYMENT' | 'STUDENT' | 'MEMBERSHIP' | 'SESSION';
  title: string;
  subtitle: string;
  timestamp: Date;
  statusBadge?: string;
  badgeTone?: 'emerald' | 'amber' | 'blue' | 'purple';
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface InstructorDashboardStats {
  totalRegisteredStudents: number;
  activeStudents: number;
  activeSubscriptions: number;
  todayRegistrations: number;
  tomorrowRegistrations: number;
  upcomingRegistrations7Days: number;
  todayScheduledClasses: number;
  upcomingLiveSessions: number;
  monthlyEarnings: number;
  yearlyEarnings: number;
  pendingPaymentsCount: number;
  pendingPaymentsAmount: number;
  expiringMemberships: number;
}

export default function InstructorDashboardView({
  instructorName,
  stats,
  monthlyRevenueChart,
  studentRegistrationsChart,
  subscriptionDistribution,
  planDistribution,
  teachingSchedules,
  recentLearners,
  recentActivity,
}: {
  instructorName: string;
  stats: InstructorDashboardStats;
  monthlyRevenueChart: ChartDataPoint[];
  studentRegistrationsChart: ChartDataPoint[];
  subscriptionDistribution: ChartDataPoint[];
  planDistribution: ChartDataPoint[];
  teachingSchedules: InstructorScheduleItem[];
  recentLearners: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    createdAt: Date;
    membershipName?: string;
    isActive: boolean;
  }[];
  recentActivity: ActivityItem[];
}) {
  // Max values for responsive SVG chart scaling
  const maxMonthlyRevenue = Math.max(...monthlyRevenueChart.map((d) => d.value), 1000);
  const maxRegistrations = Math.max(...studentRegistrationsChart.map((d) => d.value), 5);
  const totalSubDistribution = subscriptionDistribution.reduce((acc, curr) => acc + curr.value, 0) || 1;

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Sanctuary Header */}
      <div className="bg-ivory border border-sage-dark/50 p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-earth/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-bold">
              Yoga Shala Master Console
            </span>
            <span className="inline-flex items-center px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-widest font-semibold">
              M.Sc. Yoga · Lead Faculty
            </span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-earth/20 text-forest text-[9px] uppercase tracking-wider font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Studio Active</span>
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-forest">
            Namaste, {instructorName}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/75 max-w-2xl leading-relaxed">
            Lead instructor dashboard for student onboarding, weekly batch management, interactive live broadcasts, recorded sadhana library, and studio earnings.
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 relative z-10">
          <Link
            href="/portal/students"
            className="inline-flex items-center space-x-1.5 bg-forest text-ivory px-4 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light transition-all shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 text-earth" />
            <span>Add Student</span>
          </Link>
          <Link
            href="/portal/classes"
            className="inline-flex items-center space-x-1.5 border border-forest text-forest px-4 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-forest hover:text-ivory transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-earth" />
            <span>New Batch</span>
          </Link>
          <Link
            href="/portal/live-sessions"
            className="inline-flex items-center space-x-1.5 bg-earth text-forest px-4 py-2.5 text-xs uppercase tracking-wider font-bold hover:bg-earth-dark hover:text-ivory transition-all shadow-sm"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Live Transmission</span>
          </Link>
        </div>
      </div>

      {/* 12-Metric Operational KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Total Students */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-olive">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Total Students</span>
            <Users className="w-3.5 h-3.5 text-earth" />
          </div>
          <div className="mt-2">
            <p className="font-serif text-2xl font-bold text-forest">{stats.totalRegisteredStudents}</p>
            <span className="text-[10px] text-olive/80">Registered learners</span>
          </div>
        </div>

        {/* Active Students */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-olive">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Active Members</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-2">
            <p className="font-serif text-2xl font-bold text-emerald-800">{stats.activeStudents}</p>
            <span className="text-[10px] text-olive/80">Active passholders</span>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-olive">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Active Passes</span>
            <Award className="w-3.5 h-3.5 text-earth" />
          </div>
          <div className="mt-2">
            <p className="font-serif text-2xl font-bold text-forest">{stats.activeSubscriptions}</p>
            <span className="text-[10px] text-olive/80">Valid studio passes</span>
          </div>
        </div>

        {/* Scheduled Batches Today */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-olive">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Classes Today</span>
            <Calendar className="w-3.5 h-3.5 text-earth" />
          </div>
          <div className="mt-2">
            <p className="font-serif text-2xl font-bold text-forest">{stats.todayScheduledClasses}</p>
            <span className="text-[10px] text-olive/80">Scheduled shala batches</span>
          </div>
        </div>

        {/* Upcoming Live Sessions */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-olive">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Live Streams</span>
            <Video className="w-3.5 h-3.5 text-earth" />
          </div>
          <div className="mt-2">
            <p className="font-serif text-2xl font-bold text-forest">{stats.upcomingLiveSessions}</p>
            <span className="text-[10px] text-olive/80">Online transmissions</span>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-olive">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Expiring (14d)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2">
            <p className="font-serif text-2xl font-bold text-amber-700">{stats.expiringMemberships}</p>
            <span className="text-[10px] text-olive/80">Pass renewals due</span>
          </div>
        </div>

        {/* Monthly Earnings */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-olive">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Month Revenue</span>
            <CreditCard className="w-3.5 h-3.5 text-forest" />
          </div>
          <div className="mt-2">
            <p className="font-serif text-xl sm:text-2xl font-bold text-forest">
              ₹{stats.monthlyEarnings.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-olive/80">Captured this month</span>
          </div>
        </div>

        {/* Yearly Earnings */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-olive">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Annual Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-earth" />
          </div>
          <div className="mt-2">
            <p className="font-serif text-xl sm:text-2xl font-bold text-forest">
              ₹{stats.yearlyEarnings.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-olive/80">Year-to-date total</span>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-olive">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Pending Due</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2">
            <p className="font-serif text-xl sm:text-2xl font-bold text-amber-800">
              ₹{stats.pendingPaymentsAmount.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-olive/80">
              {stats.pendingPaymentsCount} awaiting settlement
            </span>
          </div>
        </div>

        {/* Today's Registrations */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-olive">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Today Bookings</span>
            <CalendarDays className="w-3.5 h-3.5 text-forest" />
          </div>
          <div className="mt-2">
            <p className="font-serif text-2xl font-bold text-forest">{stats.todayRegistrations}</p>
            <span className="text-[10px] text-olive/80">Mats reserved today</span>
          </div>
        </div>

        {/* Tomorrow's Registrations */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-olive">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Tomorrow</span>
            <CalendarDays className="w-3.5 h-3.5 text-forest" />
          </div>
          <div className="mt-2">
            <p className="font-serif text-2xl font-bold text-forest">{stats.tomorrowRegistrations}</p>
            <span className="text-[10px] text-olive/80">Mats booked tomorrow</span>
          </div>
        </div>

        {/* Next 7 Days Registrations */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-olive">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Next 7 Days</span>
            <CalendarDays className="w-3.5 h-3.5 text-earth" />
          </div>
          <div className="mt-2">
            <p className="font-serif text-2xl font-bold text-forest">{stats.upcomingRegistrations7Days}</p>
            <span className="text-[10px] text-olive/80">Upcoming week bookings</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: 4 Dedicated Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Revenue Trend */}
        <div className="bg-ivory border border-sage-dark/40 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-sage-dark/30 pb-3">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-earth font-bold block">
                Financial Growth
              </span>
              <h3 className="font-serif text-lg text-forest font-medium">Monthly Revenue (Past 6 Months)</h3>
            </div>
            <span className="text-xs font-semibold text-forest">
              ₹{stats.monthlyEarnings.toLocaleString('en-IN')} this month
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-2">
            <div className="h-48 flex items-end gap-3 sm:gap-6 pt-6 px-2 border-b border-sage-dark/40">
              {monthlyRevenueChart.map((d, i) => {
                const heightPercent = Math.max(Math.round((d.value / maxMonthlyRevenue) * 100), 6);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-sans text-forest font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-forest hover:bg-earth transition-all rounded-t-sm relative group-hover:shadow-md"
                    />
                    <span className="text-[11px] text-olive font-medium mt-1 uppercase tracking-wider">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 2: Student Registrations Trend */}
        <div className="bg-ivory border border-sage-dark/40 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-sage-dark/30 pb-3">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-earth font-bold block">
                Community Expansion
              </span>
              <h3 className="font-serif text-lg text-forest font-medium">Student Registrations</h3>
            </div>
            <span className="text-xs font-semibold text-forest">
              {stats.totalRegisteredStudents} total students
            </span>
          </div>

          <div className="pt-2">
            <div className="h-48 flex items-end gap-3 sm:gap-6 pt-6 px-2 border-b border-sage-dark/40">
              {studentRegistrationsChart.map((d, i) => {
                const heightPercent = Math.max(Math.round((d.value / maxRegistrations) * 100), 6);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-sans text-forest font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.value}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-earth hover:bg-forest transition-all rounded-t-sm group-hover:shadow-md"
                    />
                    <span className="text-[11px] text-olive font-medium mt-1 uppercase tracking-wider">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 3: Subscription Status Distribution */}
        <div className="bg-ivory border border-sage-dark/40 p-6 shadow-card space-y-4">
          <div className="border-b border-sage-dark/30 pb-3">
            <span className="text-[10px] uppercase tracking-widest text-earth font-bold block">
              Membership Health
            </span>
            <h3 className="font-serif text-lg text-forest font-medium">Subscription Status Distribution</h3>
          </div>

          <div className="space-y-3 pt-2">
            {subscriptionDistribution.map((item, idx) => {
              const pct = Math.round((item.value / totalSubDistribution) * 100);
              const toneClass =
                item.label === 'ACTIVE'
                  ? 'bg-forest'
                  : item.label === 'PENDING_PAYMENT'
                  ? 'bg-amber-600'
                  : item.label === 'EXPIRED'
                  ? 'bg-charcoal/40'
                  : 'bg-red-700';

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-forest uppercase tracking-wider text-[11px]">
                      {item.label.replace('_', ' ')}
                    </span>
                    <span className="text-olive font-semibold">
                      {item.value} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-sage-light h-2.5 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full transition-all duration-500 ${toneClass}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Plan-wise Membership Distribution */}
        <div className="bg-ivory border border-sage-dark/40 p-6 shadow-card space-y-4">
          <div className="border-b border-sage-dark/30 pb-3">
            <span className="text-[10px] uppercase tracking-widest text-earth font-bold block">
              Package Popularity
            </span>
            <h3 className="font-serif text-lg text-forest font-medium">Plan-Wise Active Enrollments</h3>
          </div>

          <div className="space-y-3 pt-2">
            {planDistribution.length === 0 ? (
              <p className="text-xs text-charcoal/60 py-6 text-center">No active plan enrollments recorded yet.</p>
            ) : (
              planDistribution.map((item, idx) => {
                const maxPlanVal = Math.max(...planDistribution.map((p) => p.value), 1);
                const pct = Math.round((item.value / maxPlanVal) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-forest truncate max-w-[220px]">
                        {item.label}
                      </span>
                      <span className="text-olive font-semibold shrink-0">
                        {item.value} {item.value === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                    <div className="w-full bg-sage-light h-2.5 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-earth hover:bg-forest transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Operational Tables: Upcoming Teaching Batches & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Upcoming Batches & Enrolled Rosters */}
        <div className="lg:col-span-2 bg-ivory border border-sage-dark/40 p-6 shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sage-dark/30 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-earth font-bold block">
                Daily Shala Timetable
              </span>
              <h2 className="font-serif text-xl text-forest">Upcoming Teaching Batches</h2>
            </div>
            <Link
              href="/portal/classes"
              className="text-xs uppercase tracking-wider text-forest hover:text-earth font-bold underline"
            >
              Class Management →
            </Link>
          </div>

          {teachingSchedules.length === 0 ? (
            <div className="text-center py-10 bg-sage-light/40 border border-dashed border-sage-dark/40 p-6">
              <Calendar className="w-8 h-8 text-olive mx-auto mb-2 opacity-50" />
              <p className="text-sm text-charcoal/70">No teaching sessions scheduled for today.</p>
              <Link
                href="/portal/classes"
                className="mt-3 inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-semibold text-earth hover:underline"
              >
                <span>Schedule a new batch</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-sage-dark/30">
              {teachingSchedules.map((schedule) => {
                const start = new Date(schedule.startTime);
                const end = new Date(schedule.endTime);
                const bookedCount = schedule.bookings.length;

                return (
                  <div key={schedule.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
                          {schedule.deliveryType}
                        </span>
                        <span className="text-[11px] uppercase tracking-wider text-earth font-bold">
                          {schedule.deliveryType === 'ONLINE' ? 'Online Live Stream' : 'In-Studio Shala'}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg text-forest font-medium">
                        {schedule.class.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal/75">
                        <div className="flex items-center space-x-1 text-olive">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {start.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })},{' '}
                            {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} –{' '}
                            {end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {schedule.location && (
                          <div className="flex items-center space-x-1 text-olive">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{schedule.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="bg-sage-light px-3 py-1.5 border border-sage-dark/40 text-center">
                        <span className="text-[9px] uppercase tracking-wider text-olive font-semibold block">
                          Mats Booked
                        </span>
                        <span className="font-serif text-base font-bold text-forest">
                          {bookedCount} / {schedule.capacity}
                        </span>
                      </div>

                      {schedule.meetingUrl && (
                        <a
                          href={schedule.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 bg-earth text-forest px-3 py-2 text-xs uppercase tracking-wider font-bold hover:bg-earth-dark hover:text-ivory transition-colors shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Stream</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 span): Live Activity Feed */}
        <div className="bg-ivory border border-sage-dark/40 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-sage-dark/30 pb-3">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-earth font-bold block">
                Audit Trail
              </span>
              <h2 className="font-serif text-xl text-forest">Recent Studio Activity</h2>
            </div>
            <Activity className="w-4 h-4 text-earth" />
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-xs text-charcoal/60 py-6 text-center">No recent activity logged yet.</p>
          ) : (
            <div className="space-y-3.5 divide-y divide-sage-dark/20">
              {recentActivity.map((act) => (
                <div key={act.id} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-xs text-forest leading-snug">
                      {act.title}
                    </span>
                    {act.statusBadge && (
                      <span className="px-1.5 py-0.5 bg-sage text-forest text-[9px] uppercase tracking-wider font-semibold shrink-0">
                        {act.statusBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-olive">{act.subtitle}</p>
                  <span className="text-[9px] text-charcoal/50 block">
                    {new Date(act.timestamp).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Student Registrations Table */}
      <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sage-dark/30 pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-earth font-bold block">
              Practitioner Community
            </span>
            <h2 className="font-serif text-2xl text-forest">Recent Student Registrations</h2>
          </div>
          <Link
            href="/portal/students"
            className="text-xs uppercase tracking-wider text-forest hover:text-earth font-bold underline"
          >
            All Students ({stats.totalRegisteredStudents}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sage-dark/40 text-olive uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Active Membership</th>
                <th className="py-3 px-3">Registered On</th>
                <th className="py-3 px-3 text-right">Account</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-dark/20 text-charcoal/80">
              {recentLearners.map((learner) => (
                <tr key={learner.id} className="hover:bg-sage-light/30 transition-colors">
                  <td className="py-3 px-3 font-medium text-forest font-serif text-sm">
                    {learner.name}
                  </td>
                  <td className="py-3 px-3">{learner.email}</td>
                  <td className="py-3 px-3 text-olive">{learner.phone || '—'}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 bg-sage text-forest text-[10px] font-semibold">
                      {learner.membershipName || 'No Active Pass'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-olive">
                    {new Date(learner.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-flex items-center space-x-1 font-semibold text-[10px] px-2 py-0.5 ${
                        learner.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-earth" />
                      <span>{learner.isActive ? 'Active' : 'Deactivated'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
