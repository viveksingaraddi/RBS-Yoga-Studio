'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Video,
  PlusCircle,
  Clock,
  Calendar,
  Users,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  Square,
  Edit2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

interface LiveSessionItem {
  id: string;
  title: string;
  description?: string | null;
  instructor: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  meetingProvider: string;
  meetingUrl: string;
  requiresMembership: boolean;
  status: string; // SCHEDULED, LIVE, COMPLETED, CANCELLED
  attendeesCount: number;
}

interface ScheduleOption {
  id: string;
  title: string;
  startTime: string;
}

export default function LiveSessionsClient({
  sessions: initialSessions,
  schedules,
  stats,
}: {
  sessions: LiveSessionItem[];
  schedules: ScheduleOption[];
  stats: {
    liveNowCount: number;
    upcomingCount: number;
    completedCount: number;
    totalSessions: number;
  };
}) {
  const router = useRouter();
  const [sessions, setSessions] = useState<LiveSessionItem[]>(initialSessions);
  const [filter, setFilter] = useState<'ALL' | 'LIVE' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSessionItem | null>(null);

  // Create Form
  const [form, setForm] = useState({
    title: 'Pranayama & Vital Breathwork Live Transmission',
    description: 'Interactive morning livestream with Master Sangu focusing on breath regulation, spinal alignment, and nervous system balance.',
    instructor: 'Master Sangu',
    meetingUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    startTimeStr: '07:15',
    durationMinutes: '60',
    requiresMembership: true,
    status: 'SCHEDULED',
    classScheduleId: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'LIVE') return s.status === 'LIVE';
    if (filter === 'UPCOMING') return s.status === 'SCHEDULED';
    if (filter === 'COMPLETED') return s.status === 'COMPLETED';
    return true;
  });

  const liveSessionNow = sessions.find((s) => s.status === 'LIVE');

  // Handlers
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage(null);

    try {
      const res = await fetch('/api/instructor/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setActionMessage({
          text: `Live broadcast "${form.title}" published! Automated student email reminders have been queued.`,
          type: 'success',
        });
        setIsCreateModalOpen(false);
        router.refresh();
      } else {
        setActionMessage({ text: data.error || 'Failed to create live session.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Network error publishing session.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/instructor/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        );
        setActionMessage({ text: `Live broadcast status updated to ${newStatus}.`, type: 'success' });
      }
    } catch {
      setActionMessage({ text: 'Failed to update broadcast status.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-dark/40 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-bold">
              Virtual Shala Control Center
            </span>
            <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
              Live Broadcasts
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest mt-1">
            Live Session Management
          </h1>
          <p className="text-xs text-charcoal/75 max-w-xl">
            Host interactive Google Meet and Zoom livestreams, supervise practitioner attendance, schedule broadcast reminders, and restrict entry to active passholders.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-forest text-ivory px-5 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light transition-all shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-earth" />
          <span>Create Live Broadcast</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">On Air Now</span>
          <p className="font-serif text-2xl font-bold text-emerald-800 mt-1">{stats.liveNowCount}</p>
          <span className="text-[10px] text-olive/80">Active transmissions</span>
        </div>
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Upcoming</span>
          <p className="font-serif text-2xl font-bold text-forest mt-1">{stats.upcomingCount}</p>
          <span className="text-[10px] text-olive/80">Scheduled broadcasts</span>
        </div>
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Completed</span>
          <p className="font-serif text-2xl font-bold text-forest mt-1">{stats.completedCount}</p>
          <span className="text-[10px] text-olive/80">Past transmissions</span>
        </div>
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Total Sessions</span>
          <p className="font-serif text-2xl font-bold text-forest mt-1">{stats.totalSessions}</p>
          <span className="text-[10px] text-olive/80">All-time archives</span>
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

      {/* Live Now Active Banner (if live) */}
      {liveSessionNow && (
        <div className="bg-forest text-ivory p-6 shadow-card border-l-4 border-earth flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs uppercase tracking-widest font-bold text-earth">
                Broadcasting Live Now
              </span>
              <span className="px-2 py-0.5 bg-earth/20 text-ivory text-[9px] uppercase font-bold">
                {liveSessionNow.meetingProvider}
              </span>
            </div>
            <h2 className="font-serif text-2xl text-ivory">{liveSessionNow.title}</h2>
            <p className="text-xs text-ivory/80 max-w-xl">{liveSessionNow.description}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {liveSessionNow.meetingUrl && (
              <a
                href={liveSessionNow.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 bg-earth text-forest px-5 py-3 text-xs uppercase tracking-wider font-bold hover:bg-earth-dark hover:text-ivory transition-all shadow-md"
              >
                <Video className="w-4 h-4" />
                <span>Join Shala as Host</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            )}
            <button
              onClick={() => handleUpdateStatus(liveSessionNow.id, 'COMPLETED')}
              className="inline-flex items-center space-x-1.5 bg-red-700 hover:bg-red-800 text-ivory px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all"
            >
              <Square className="w-3.5 h-3.5" />
              <span>End Broadcast</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs / Filter Toolbar */}
      <div className="flex items-center justify-between border-b border-sage-dark/40 pb-3">
        <div className="flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold">
          {[
            { id: 'ALL', label: 'All Sessions' },
            { id: 'UPCOMING', label: 'Upcoming' },
            { id: 'LIVE', label: 'On Air' },
            { id: 'COMPLETED', label: 'Completed Archive' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3 py-1.5 transition-all ${
                filter === item.id
                  ? 'bg-forest text-ivory'
                  : 'bg-sage-light text-forest hover:bg-sage'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="bg-ivory border border-sage-dark/40 p-12 text-center space-y-2">
            <Video className="w-8 h-8 text-olive mx-auto opacity-50" />
            <h3 className="font-serif text-lg text-forest">No live sessions found</h3>
            <p className="text-xs text-charcoal/60">
              Create a Google Meet or Zoom live broadcast to stream with your students.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSessions.map((session) => {
              const start = new Date(session.startTime);
              const end = new Date(session.endTime);

              return (
                <div
                  key={session.id}
                  className={`bg-ivory border p-6 shadow-sm flex flex-col justify-between transition-all ${
                    session.status === 'LIVE'
                      ? 'border-emerald-500 shadow-md ring-1 ring-emerald-400'
                      : session.status === 'CANCELLED'
                      ? 'border-red-200 opacity-60'
                      : 'border-sage-dark/50 hover:shadow-card'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
                          {session.meetingProvider}
                        </span>
                        {session.requiresMembership && (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-earth/20 text-forest text-[9px] font-bold">
                            <ShieldCheck className="w-3 h-3 text-earth" />
                            <span>Pass Required</span>
                          </span>
                        )}
                      </div>

                      <span
                        className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold ${
                          session.status === 'LIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : session.status === 'SCHEDULED'
                            ? 'bg-sage text-forest'
                            : session.status === 'COMPLETED'
                            ? 'bg-charcoal/10 text-charcoal/70'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-xl text-forest font-medium">{session.title}</h3>
                      {session.description && (
                        <p className="text-xs text-charcoal/70 mt-1 line-clamp-2">{session.description}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-olive pt-2 border-t border-sage-dark/30">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-earth shrink-0" />
                        <span>
                          {start.toLocaleDateString('en-IN', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-earth shrink-0" />
                        <span>
                          {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} –{' '}
                          {end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ({session.durationMinutes} mins)
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-earth shrink-0" />
                        <span>{session.attendeesCount} attendees joined</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-sage-dark/30 mt-4 flex items-center justify-between text-xs">
                    {session.meetingUrl ? (
                      <a
                        href={session.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-forest hover:text-earth font-bold uppercase tracking-wider text-[11px] underline"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Open Meeting Room</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-olive italic">Meeting link protected</span>
                    )}

                    <div className="flex items-center space-x-2">
                      {session.status === 'SCHEDULED' && (
                        <button
                          onClick={() => {
                            handleUpdateStatus(session.id, 'LIVE');
                            if (session.meetingUrl) window.open(session.meetingUrl, '_blank');
                          }}
                          className="px-3 py-1.5 bg-emerald-700 text-ivory text-[10px] uppercase font-bold hover:bg-emerald-800 transition-colors shadow-xs"
                        >
                          Go Live Now
                        </button>
                      )}

                      {session.status === 'LIVE' && (
                        <button
                          onClick={() => handleUpdateStatus(session.id, 'COMPLETED')}
                          className="px-3 py-1.5 bg-charcoal text-ivory text-[10px] uppercase font-bold hover:bg-black transition-colors"
                        >
                          Complete
                        </button>
                      )}

                      {session.status !== 'CANCELLED' && session.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateStatus(session.id, 'CANCELLED')}
                          className="px-2 py-1 text-red-700 hover:bg-red-50 text-[10px] uppercase font-semibold"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Live Broadcast Modal */}
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
                Broadcast Transmitter
              </span>
              <h2 className="font-serif text-2xl text-forest">Schedule Live Video Broadcast</h2>
              <p className="text-xs text-charcoal/70 mt-1">
                Enter your verified Google Meet or Zoom URL. Reminders will be dispatched to students 60 and 30 minutes before start.
              </p>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Broadcast Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Pranayama &amp; Guided Breathwork Live"
                  className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Google Meet / Zoom URL *
                </label>
                <input
                  type="url"
                  required
                  value={form.meetingUrl}
                  onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
                  placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/..."
                  className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest font-mono text-[11px]"
                />
                <span className="text-[10px] text-olive mt-1 block">
                  Only verified active student members will receive this link. It is never exposed in public responses.
                </span>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Session Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Instructions for students (props, hydration, breathwork space)..."
                  className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full p-2 border border-sage-dark/40 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Start Time (IST) *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.startTimeStr}
                    onChange={(e) => setForm({ ...form, startTimeStr: e.target.value })}
                    className="w-full p-2 border border-sage-dark/40 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                    className="w-full p-2 border border-sage-dark/40 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Publication Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full p-2 border border-sage-dark/40 bg-white text-xs"
                  >
                    <option value="SCHEDULED">Schedule for Later</option>
                    <option value="LIVE">Publish &amp; Broadcast Now</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.requiresMembership}
                    onChange={(e) => setForm({ ...form, requiresMembership: e.target.checked })}
                    className="w-4 h-4 text-forest"
                  />
                  <span className="text-xs text-forest font-semibold">
                    Require Active Membership Pass to Join
                  </span>
                </label>
              </div>

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
                  {submitting ? 'Transmitting...' : 'Save & Schedule Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
