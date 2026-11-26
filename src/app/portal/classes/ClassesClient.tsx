'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Video,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  X,
  UserPlus,
  RefreshCw,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';

interface BookingRosterItem {
  id: string;
  bookingNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string | null;
  attendanceStatus: string;
}

interface ScheduleItem {
  id: string;
  classId: string;
  title: string;
  instructor: string;
  deliveryType: string;
  location?: string | null;
  meetingUrl?: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  isCancelled: boolean;
  bookings: BookingRosterItem[];
}

interface ClassOption {
  id: string;
  title: string;
  deliveryType: string;
  capacity: number;
  instructor: string;
}

interface LearnerOption {
  id: string;
  name: string;
  email: string;
}

export default function ClassesClient({
  schedules: initialSchedules,
  classes,
  learners,
  stats,
}: {
  schedules: ScheduleItem[];
  classes: ClassOption[];
  learners: LearnerOption[];
  stats: {
    todayCount: number;
    totalActiveBatches: number;
    totalReserved: number;
    onlineCount: number;
  };
}) {
  const router = useRouter();
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [filter, setFilter] = useState<'ALL' | 'MORNING' | 'EVENING' | 'ONLINE' | 'PHYSICAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeRosterSchedule, setActiveRosterSchedule] = useState<ScheduleItem | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<ScheduleItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ScheduleItem | null>(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    title: 'Morning Sadhana Batch',
    category: 'Hatha Yoga',
    instructor: 'Master Sangu',
    deliveryType: 'PHYSICAL',
    capacity: '20',
    location: 'Main Shala / RBS Studio',
    meetingUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTimeStr: '06:00',
    endTimeStr: '07:00',
    selectedDays: [1, 2, 3, 4, 5], // Mon to Fri
  });

  const [rescheduleForm, setRescheduleForm] = useState({
    newStartTime: '',
    newEndTime: '',
  });

  const [cancelReason, setCancelReason] = useState('Instructor schedule adjustment');
  const [manualEnrollUserId, setManualEnrollUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filtered schedules
  const filteredSchedules = schedules.filter((s) => {
    const start = new Date(s.startTime);
    const hour = start.getHours();

    let matchesFilter = true;
    if (filter === 'MORNING') matchesFilter = hour < 12;
    if (filter === 'EVENING') matchesFilter = hour >= 12;
    if (filter === 'ONLINE') matchesFilter = s.deliveryType === 'ONLINE';
    if (filter === 'PHYSICAL') matchesFilter = s.deliveryType === 'PHYSICAL';

    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.location && s.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.bookings.some((b) => b.userName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Handlers
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage(null);

    try {
      const res = await fetch('/api/instructor/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();

      if (res.ok) {
        setActionMessage({
          text: `Successfully created ${data.occurrencesCreated} recurring session occurrences for ${createForm.title}!`,
          type: 'success',
        });
        setIsCreateModalOpen(false);
        router.refresh();
      } else {
        setActionMessage({ text: data.error || 'Failed to create batch schedules.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Network error generating batch schedules.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttendanceChange = async (scheduleId: string, userId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/instructor/classes/${scheduleId}/attendance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      if (res.ok) {
        // Update local state in activeRosterSchedule
        if (activeRosterSchedule) {
          setActiveRosterSchedule({
            ...activeRosterSchedule,
            bookings: activeRosterSchedule.bookings.map((b) =>
              b.userId === userId ? { ...b, attendanceStatus: newStatus } : b
            ),
          });
        }
        setActionMessage({ text: `Attendance updated to ${newStatus}.`, type: 'success' });
      }
    } catch {
      setActionMessage({ text: 'Failed to update attendance.', type: 'error' });
    }
  };

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRosterSchedule || !manualEnrollUserId) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/instructor/classes/${activeRosterSchedule.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: manualEnrollUserId }),
      });
      const data = await res.json();

      if (res.ok) {
        setActionMessage({ text: data.message || 'Student enrolled successfully.', type: 'success' });
        setManualEnrollUserId('');
        router.refresh();
      } else {
        setActionMessage({ text: data.error || 'Enrollment failed.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Network error enrolling student.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/instructor/classes/${cancelTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL', reason: cancelReason }),
      });
      const data = await res.json();
      if (res.ok) {
        setSchedules((prev) =>
          prev.map((s) => (s.id === cancelTarget.id ? { ...s, isCancelled: true } : s))
        );
        setActionMessage({ text: data.message || 'Class session cancelled.', type: 'success' });
        setCancelTarget(null);
      } else {
        setActionMessage({ text: data.error || 'Failed to cancel session.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Network error cancelling session.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRescheduleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget || !rescheduleForm.newStartTime || !rescheduleForm.newEndTime) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/instructor/classes/${rescheduleTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESCHEDULE',
          newStartTime: rescheduleForm.newStartTime,
          newEndTime: rescheduleForm.newEndTime,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ text: data.message || 'Class rescheduled successfully.', type: 'success' });
        setRescheduleTarget(null);
        router.refresh();
      } else {
        setActionMessage({ text: data.error || 'Reschedule failed.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Network error rescheduling class.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-dark/40 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-bold">
              Timetable &amp; Schedule Architecture
            </span>
            <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
              Master Sangu (M.Sc. Yoga)
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest mt-1">
            Class &amp; Batch Management
          </h1>
          <p className="text-xs text-charcoal/75 max-w-xl">
            Configure weekly recurring batches, monitor live shala capacity, view booked practitioner rosters, take attendance, and manage cancellations.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-forest text-ivory px-5 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light transition-all shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-earth" />
          <span>Schedule Recurring Batch</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Today Batches</span>
          <p className="font-serif text-2xl font-bold text-forest mt-1">{stats.todayCount}</p>
          <span className="text-[10px] text-olive/80">Scheduled today</span>
        </div>
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Active Batches</span>
          <p className="font-serif text-2xl font-bold text-forest mt-1">{stats.totalActiveBatches}</p>
          <span className="text-[10px] text-olive/80">Upcoming schedule slots</span>
        </div>
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Total Mats Reserved</span>
          <p className="font-serif text-2xl font-bold text-forest mt-1">{stats.totalReserved}</p>
          <span className="text-[10px] text-olive/80">Enrolled bookings</span>
        </div>
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Virtual Streams</span>
          <p className="font-serif text-2xl font-bold text-forest mt-1">{stats.onlineCount}</p>
          <span className="text-[10px] text-olive/80">Online live sessions</span>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 border flex items-center justify-between text-xs transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-charcoal/60 hover:text-charcoal p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="bg-ivory border border-sage-dark/40 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-olive absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by class title, shala location, or student..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-sage-dark/40 bg-white focus:outline-none focus:border-forest text-forest"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Batches' },
            { id: 'MORNING', label: 'Morning Batches', icon: Sun },
            { id: 'EVENING', label: 'Evening Batches', icon: Moon },
            { id: 'ONLINE', label: 'Online Streams' },
            { id: 'PHYSICAL', label: 'In-Studio Shala' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                filter === item.id ? 'bg-forest text-ivory' : 'bg-sage-light text-forest hover:bg-sage'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Batches Grid */}
      <div className="space-y-4">
        {filteredSchedules.length === 0 ? (
          <div className="bg-ivory border border-sage-dark/40 p-12 text-center space-y-2">
            <Calendar className="w-8 h-8 text-olive mx-auto opacity-50" />
            <h3 className="font-serif text-lg text-forest">No batches match this filter</h3>
            <p className="text-xs text-charcoal/60">Try choosing a different filter or generate a new batch series.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSchedules.map((schedule) => {
              const start = new Date(schedule.startTime);
              const end = new Date(schedule.endTime);
              const bookedCount = schedule.bookings.length;
              const capacityPercent = Math.min(100, Math.round((bookedCount / schedule.capacity) * 100));

              return (
                <div
                  key={schedule.id}
                  className={`bg-ivory border p-5 shadow-sm flex flex-col justify-between transition-all ${
                    schedule.isCancelled
                      ? 'border-red-300 opacity-70 bg-red-50/20'
                      : 'border-sage-dark/50 hover:shadow-card'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-earth">
                        {start.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
                          {schedule.deliveryType}
                        </span>
                        {schedule.isCancelled && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[9px] uppercase tracking-wider font-bold">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif text-xl text-forest font-medium">{schedule.title}</h3>
                      <p className="text-xs text-olive">Lead: {schedule.instructor}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-olive pt-1 border-t border-sage-dark/30">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-earth shrink-0" />
                        <span>
                          {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} –{' '}
                          {end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-earth shrink-0" />
                        <span className="truncate">{schedule.location || 'Studio Shala'}</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-olive font-medium">Capacity</span>
                        <span className="font-semibold text-forest">
                          {bookedCount} / {schedule.capacity} Mats
                        </span>
                      </div>
                      <div className="w-full bg-sage-light h-2 overflow-hidden">
                        <div
                          style={{ width: `${capacityPercent}%` }}
                          className={`h-full transition-all ${
                            capacityPercent >= 100
                              ? 'bg-red-700'
                              : capacityPercent >= 75
                              ? 'bg-amber-600'
                              : 'bg-forest'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Batch Card Actions */}
                  <div className="pt-4 border-t border-sage-dark/30 mt-4 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setActiveRosterSchedule(schedule)}
                      className="inline-flex items-center space-x-1 uppercase tracking-wider font-bold text-forest hover:text-earth underline text-[11px]"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Roster ({bookedCount})</span>
                    </button>

                    {!schedule.isCancelled && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setRescheduleTarget(schedule);
                            setRescheduleForm({
                              newStartTime: schedule.startTime.slice(0, 16),
                              newEndTime: schedule.endTime.slice(0, 16),
                            });
                          }}
                          className="px-2 py-1 bg-sage-light hover:bg-sage text-[10px] uppercase font-semibold text-forest"
                          title="Reschedule session"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => setCancelTarget(schedule)}
                          className="px-2 py-1 text-red-700 hover:bg-red-50 text-[10px] uppercase font-semibold"
                          title="Cancel session"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Roster & Attendance Drawer Modal */}
      {activeRosterSchedule && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-ivory border border-sage-dark max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setActiveRosterSchedule(null)}
              className="absolute top-5 right-5 text-charcoal/60 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-sage-dark/40 pb-4">
              <span className="text-[10px] uppercase tracking-widest text-earth font-bold block">
                Batch Attendance &amp; Roster
              </span>
              <h2 className="font-serif text-2xl text-forest">{activeRosterSchedule.title}</h2>
              <p className="text-xs text-olive mt-1">
                {new Date(activeRosterSchedule.startTime).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })} · {activeRosterSchedule.bookings.length} / {activeRosterSchedule.capacity} Enrolled
              </p>
            </div>

            {/* Quick Enroll Form */}
            <form onSubmit={handleManualEnroll} className="p-4 bg-sage-light/60 border border-sage-dark/30 flex items-center gap-3">
              <div className="flex-1">
                <select
                  required
                  value={manualEnrollUserId}
                  onChange={(e) => setManualEnrollUserId(e.target.value)}
                  className="w-full p-2 border border-sage-dark/40 bg-white text-xs text-forest"
                >
                  <option value="">-- Enroll Practitioner into this Batch --</option>
                  {learners
                    .filter((l) => !activeRosterSchedule.bookings.some((b) => b.userId === l.id))
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.email})
                      </option>
                    ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting || !manualEnrollUserId}
                className="px-4 py-2 bg-forest text-ivory text-xs uppercase tracking-wider font-semibold hover:bg-forest-light disabled:opacity-50"
              >
                Enroll Student
              </button>
            </form>

            {/* Booked Students Table */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider font-bold text-forest block">
                Enrolled Practitioners
              </span>

              {activeRosterSchedule.bookings.length === 0 ? (
                <p className="text-xs text-charcoal/60 py-6 text-center italic">
                  No practitioners have booked this session mat yet.
                </p>
              ) : (
                <div className="divide-y divide-sage-dark/20 text-xs">
                  {activeRosterSchedule.bookings.map((booking) => (
                    <div key={booking.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-serif text-base font-medium text-forest">{booking.userName}</h4>
                        <div className="flex items-center space-x-3 text-[11px] text-olive mt-0.5">
                          <span>{booking.userEmail}</span>
                          {booking.userPhone && <span>· {booking.userPhone}</span>}
                          <span>· #{booking.bookingNumber}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[10px] text-olive font-semibold uppercase">Attendance:</span>
                        <button
                          onClick={() => handleAttendanceChange(activeRosterSchedule.id, booking.userId, 'ATTENDED')}
                          className={`px-2.5 py-1 text-[10px] uppercase font-bold transition-all ${
                            booking.attendanceStatus === 'ATTENDED'
                              ? 'bg-emerald-700 text-ivory'
                              : 'bg-sage-light text-forest hover:bg-emerald-100'
                          }`}
                        >
                          Attended
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(activeRosterSchedule.id, booking.userId, 'MISSED')}
                          className={`px-2.5 py-1 text-[10px] uppercase font-bold transition-all ${
                            booking.attendanceStatus === 'MISSED'
                              ? 'bg-red-700 text-ivory'
                              : 'bg-sage-light text-forest hover:bg-red-100'
                          }`}
                        >
                          Missed
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recurring Batch Schedule Generator Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-ivory border border-sage-dark max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-charcoal/60 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-sage-dark/40 pb-4 mb-4">
              <span className="text-[10px] uppercase tracking-widest text-earth font-bold">
                Batch Generator
              </span>
              <h2 className="font-serif text-2xl text-forest">Schedule Recurring Shala Batches</h2>
              <p className="text-xs text-charcoal/70 mt-1">
                Generates weekly recurring session slots with automatic time conflict prevention.
              </p>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Class Title *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g. 21 Days Morning Transformation Sadhana"
                  className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Yoga Category
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest text-xs"
                  >
                    <option value="Hatha Yoga">Hatha Yoga</option>
                    <option value="Pranayama">Pranayama</option>
                    <option value="Meditation">Meditation</option>
                    <option value="Strength & Mobility">Strength &amp; Mobility</option>
                    <option value="Vinyasa Flow">Vinyasa Flow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Delivery Mode
                  </label>
                  <select
                    value={createForm.deliveryType}
                    onChange={(e) => setCreateForm({ ...createForm, deliveryType: e.target.value })}
                    className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest text-xs"
                  >
                    <option value="PHYSICAL">In-Studio Shala</option>
                    <option value="ONLINE">Online Live Stream</option>
                    <option value="HYBRID">Hybrid (Studio + Online)</option>
                  </select>
                </div>
              </div>

              {/* Weekday Selection */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1.5">
                  Select Recurring Days
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { day: 1, label: 'Mon' },
                    { day: 2, label: 'Tue' },
                    { day: 3, label: 'Wed' },
                    { day: 4, label: 'Thu' },
                    { day: 5, label: 'Fri' },
                    { day: 6, label: 'Sat' },
                    { day: 0, label: 'Sun' },
                  ].map((d) => {
                    const isChecked = createForm.selectedDays.includes(d.day);
                    return (
                      <button
                        type="button"
                        key={d.day}
                        onClick={() => {
                          const newDays = isChecked
                            ? createForm.selectedDays.filter((x) => x !== d.day)
                            : [...createForm.selectedDays, d.day];
                          setCreateForm({ ...createForm, selectedDays: newDays });
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-all ${
                          isChecked
                            ? 'bg-forest text-ivory border-forest'
                            : 'bg-white text-forest border-sage-dark/40 hover:bg-sage-light'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Start Time (IST)
                  </label>
                  <input
                    type="time"
                    required
                    value={createForm.startTimeStr}
                    onChange={(e) => setCreateForm({ ...createForm, startTimeStr: e.target.value })}
                    className="w-full p-2.5 border border-sage-dark/40 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    End Time (IST)
                  </label>
                  <input
                    type="time"
                    required
                    value={createForm.endTimeStr}
                    onChange={(e) => setCreateForm({ ...createForm, endTimeStr: e.target.value })}
                    className="w-full p-2.5 border border-sage-dark/40 bg-white"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Series From
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    className="w-full p-2 border border-sage-dark/40 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Series To
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    className="w-full p-2 border border-sage-dark/40 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Mat Capacity
                  </label>
                  <input
                    type="number"
                    required
                    value={createForm.capacity}
                    onChange={(e) => setCreateForm({ ...createForm, capacity: e.target.value })}
                    className="w-full p-2 border border-sage-dark/40 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Shala Location
                  </label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    className="w-full p-2 border border-sage-dark/40 bg-white"
                  />
                </div>
              </div>

              {createForm.deliveryType !== 'PHYSICAL' && (
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Google Meet / Zoom URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={createForm.meetingUrl}
                    onChange={(e) => setCreateForm({ ...createForm, meetingUrl: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="w-full p-2 border border-sage-dark/40 bg-white"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-sage-dark/30 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 uppercase tracking-wider font-semibold text-charcoal/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 uppercase tracking-wider font-semibold bg-forest text-ivory hover:bg-forest-light"
                >
                  {submitting ? 'Generating Batches...' : 'Schedule Batch Series'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-ivory border border-sage-dark max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setRescheduleTarget(null)}
              className="absolute top-5 right-5 text-charcoal/60 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl text-forest mb-2">Reschedule Session</h3>
            <p className="text-xs text-olive mb-4">
              Rescheduling will update this session and automatically notify all {rescheduleTarget.bookings.length} booked students via email.
            </p>

            <form onSubmit={handleRescheduleConfirm} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  New Start Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleForm.newStartTime}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, newStartTime: e.target.value })}
                  className="w-full p-2 border border-sage-dark/40 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  New End Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleForm.newEndTime}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, newEndTime: e.target.value })}
                  className="w-full p-2 border border-sage-dark/40 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-sage-dark/30 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="px-4 py-2 uppercase tracking-wider font-semibold text-charcoal/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 uppercase tracking-wider font-semibold bg-forest text-ivory hover:bg-forest-light"
                >
                  {submitting ? 'Updating...' : 'Confirm & Notify Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-ivory border border-sage-dark max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="font-serif text-xl text-red-800">Cancel Class Session</h3>
            <p className="text-xs text-charcoal/80">
              Are you sure you want to cancel <strong>{cancelTarget.title}</strong>? All {cancelTarget.bookings.length} enrolled students will receive an official cancellation notification email.
            </p>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                Reason for Cancellation (included in email)
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border border-sage-dark/40 bg-white text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2 text-xs">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 uppercase tracking-wider font-semibold text-charcoal/70"
              >
                Close
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleCancelConfirm}
                className="px-5 py-2 uppercase tracking-wider font-semibold bg-red-700 text-ivory hover:bg-red-800"
              >
                {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
