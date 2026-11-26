'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Send,
  KeyRound,
  CreditCard,
  BookOpen,
  Film,
  Edit2,
  AlertCircle,
  X,
} from 'lucide-react';

interface StudentProfileProps {
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    isActive: boolean;
    createdAt: string;
    memberships: {
      id: string;
      planName: string;
      status: string;
      startDate: string | null;
      endDate: string | null;
      price: number;
      notes?: string | null;
      payments: {
        id: string;
        amount: number;
        status: string;
        method?: string | null;
        receiptNumber?: string | null;
        createdAt: string;
      }[];
    }[];
    bookings: {
      id: string;
      bookingNumber: string;
      classTitle: string;
      instructor: string;
      deliveryType: string;
      startTime: string;
      endTime: string;
      location?: string | null;
      status: string;
      createdAt: string;
    }[];
    attendances: {
      id: string;
      title: string;
      status: string;
      type: string;
      date: string;
    }[];
    playbackLogs: {
      id: string;
      title: string;
      category: string;
      watchedSeconds: number;
      durationSeconds: number;
      isCompleted: boolean;
      updatedAt: string;
    }[];
  };
}

export default function StudentProfileClient({ student: initialStudent }: StudentProfileProps) {
  const [student, setStudent] = useState(initialStudent);
  const [activeTab, setActiveTab] = useState<'memberships' | 'bookings' | 'attendance' | 'videos'>('memberships');
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(student.name);
  const [editPhone, setEditPhone] = useState(student.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const activeMembership = student.memberships.find((m) => m.status === 'ACTIVE');

  const handleToggleActive = async () => {
    try {
      const res = await fetch(`/api/instructor/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !student.isActive }),
      });
      if (res.ok) {
        setStudent((prev) => ({ ...prev, isActive: !prev.isActive }));
        setActionMessage({
          text: `Practitioner account status successfully updated to ${!student.isActive ? 'Active' : 'Deactivated'}.`,
          type: 'success',
        });
      }
    } catch {
      setActionMessage({ text: 'Failed to update account status.', type: 'error' });
    }
  };

  const handleResendActivation = async () => {
    try {
      const res = await fetch(`/api/instructor/students/${student.id}/resend-activation`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          text: `Activation invitation resent to ${student.email}.`,
          type: 'success',
        });
      } else {
        setActionMessage({ text: data.error || 'Failed to dispatch email.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Error dispatching activation invitation.', type: 'error' });
    }
  };

  const handleTriggerPasswordReset = async () => {
    try {
      const res = await fetch(`/api/instructor/students/${student.id}/reset-password`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          text: `Password reset link successfully sent to ${student.email}.`,
          type: 'success',
        });
      } else {
        setActionMessage({ text: data.error || 'Failed to send reset link.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Error dispatching password reset.', type: 'error' });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/instructor/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      if (res.ok) {
        setStudent((prev) => ({ ...prev, name: editName, phone: editPhone }));
        setIsEditModalOpen(false);
        setActionMessage({ text: 'Practitioner information updated.', type: 'success' });
      }
    } catch {
      setActionMessage({ text: 'Failed to update practitioner info.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/portal/students"
          className="inline-flex items-center space-x-1.5 text-xs text-olive hover:text-forest uppercase tracking-wider font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Directory</span>
        </Link>
      </div>

      {/* Practitioner Banner */}
      <div className="bg-ivory border border-sage-dark/50 p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-bold">
              Yoga Practitioner Profile
            </span>
            <span
              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-bold ${
                student.isActive
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {student.isActive ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  <span>Account Active</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3 h-3 text-red-700" />
                  <span>Account Deactivated</span>
                </>
              )}
            </span>
            {activeMembership && (
              <span className="px-2.5 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
                {activeMembership.planName}
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-forest">{student.name}</h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-olive pt-1">
            <div className="flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-earth" />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-earth" />
              <span>{student.phone || 'No phone registered'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-earth" />
              <span>
                Joined {new Date(student.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold bg-sage-light border border-sage-dark/40 text-forest hover:bg-sage transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-olive" />
            <span>Edit Info</span>
          </button>

          <button
            onClick={handleResendActivation}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold bg-sage-light border border-sage-dark/40 text-forest hover:bg-forest hover:text-ivory transition-colors"
            title="Dispatch fresh activation link"
          >
            <Send className="w-3.5 h-3.5 text-earth" />
            <span>Resend Invite</span>
          </button>

          <button
            onClick={handleTriggerPasswordReset}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold bg-sage-light border border-sage-dark/40 text-forest hover:bg-forest hover:text-ivory transition-colors"
            title="Trigger password reset email"
          >
            <KeyRound className="w-3.5 h-3.5 text-earth" />
            <span>Reset Password</span>
          </button>

          <button
            onClick={handleToggleActive}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold border transition-colors ${
              student.isActive
                ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                : 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <span>{student.isActive ? 'Deactivate Account' : 'Reactivate Account'}</span>
          </button>
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
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-charcoal/60 hover:text-charcoal p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-sage-dark/40 space-x-2 overflow-x-auto text-xs uppercase tracking-wider font-semibold">
        <button
          onClick={() => setActiveTab('memberships')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'memberships'
              ? 'border-forest text-forest bg-ivory font-bold'
              : 'border-transparent text-olive hover:text-forest'
          }`}
        >
          <Award className="w-4 h-4 text-earth" />
          <span>Subscriptions &amp; Passes ({student.memberships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-forest text-forest bg-ivory font-bold'
              : 'border-transparent text-olive hover:text-forest'
          }`}
        >
          <Calendar className="w-4 h-4 text-earth" />
          <span>Scheduled Classes ({student.bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'border-forest text-forest bg-ivory font-bold'
              : 'border-transparent text-olive hover:text-forest'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-earth" />
          <span>Attendance Records ({student.attendances.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'videos'
              ? 'border-forest text-forest bg-ivory font-bold'
              : 'border-transparent text-olive hover:text-forest'
          }`}
        >
          <Film className="w-4 h-4 text-earth" />
          <span>Video Studies ({student.playbackLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Subscriptions & Passes */}
      {activeTab === 'memberships' && (
        <div className="space-y-6">
          {student.memberships.length === 0 ? (
            <div className="bg-ivory border border-sage-dark/40 p-8 text-center space-y-2">
              <Award className="w-8 h-8 text-olive mx-auto opacity-50" />
              <p className="text-sm text-forest font-serif">No subscription passes assigned yet</p>
              <p className="text-xs text-charcoal/60">
                You can assign a membership plan to this student from the Subscriptions module.
              </p>
              <Link
                href="/portal/subscriptions"
                className="mt-3 inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-semibold text-earth hover:underline"
              >
                <span>Assign Membership Pass →</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {student.memberships.map((m) => (
                <div key={m.id} className="bg-ivory border border-sage-dark/40 p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sage-dark/30 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif text-xl text-forest font-semibold">{m.planName}</span>
                        <span
                          className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold ${
                            m.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'PENDING_PAYMENT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-charcoal/10 text-charcoal/70'
                          }`}
                        >
                          {m.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-olive">Investment: ₹{m.price.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="text-xs text-olive sm:text-right space-y-0.5">
                      {m.startDate && (
                        <p>
                          Active From:{' '}
                          <span className="text-forest font-medium">
                            {new Date(m.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </p>
                      )}
                      {m.endDate && (
                        <p>
                          Expires On:{' '}
                          <span className="text-forest font-medium">
                            {new Date(m.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Records for this pass */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-olive block">
                      Associated Payment Transactions
                    </span>
                    {m.payments.length === 0 ? (
                      <p className="text-xs text-charcoal/50 italic">No payment record associated with this pass.</p>
                    ) : (
                      <div className="divide-y divide-sage-dark/20 text-xs">
                        {m.payments.map((p) => (
                          <div key={p.id} className="py-2 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-forest">₹{p.amount.toLocaleString('en-IN')}</span>
                              <span className="text-olive ml-2">via {p.method || 'Online'}</span>
                              {p.receiptNumber && <span className="text-[10px] text-olive/80 ml-2">#{p.receiptNumber}</span>}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-olive">
                                {new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="px-1.5 py-0.5 bg-sage text-forest text-[9px] uppercase font-bold">
                                {p.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bookings */}
      {activeTab === 'bookings' && (
        <div className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden">
          {student.bookings.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Calendar className="w-8 h-8 text-olive mx-auto opacity-50" />
              <p className="text-sm text-forest font-serif">No class bookings recorded</p>
              <p className="text-xs text-charcoal/60">This practitioner has not reserved any timetable mats yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sage text-forest uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-5 py-3">Booking #</th>
                    <th className="px-5 py-3">Class Session</th>
                    <th className="px-5 py-3">Schedule Time</th>
                    <th className="px-5 py-3">Delivery Mode</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-dark/20 text-charcoal/80">
                  {student.bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-sage-light/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-[11px] font-semibold text-forest">
                        {b.bookingNumber}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-serif text-sm font-medium text-forest block">{b.classTitle}</span>
                        <span className="text-[10px] text-olive">Instructor: {b.instructor}</span>
                      </td>
                      <td className="px-5 py-3 text-olive">
                        {new Date(b.startTime).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
                          {b.deliveryType}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="px-2 py-0.5 bg-sage text-forest text-[10px] uppercase font-bold">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Attendance Records */}
      {activeTab === 'attendance' && (
        <div className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden">
          {student.attendances.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-olive mx-auto opacity-50" />
              <p className="text-sm text-forest font-serif">No attendance logs logged yet</p>
              <p className="text-xs text-charcoal/60">Attendance entries are recorded when a student attends shala batches or opens live transmissions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sage text-forest uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-5 py-3">Session Title</th>
                    <th className="px-5 py-3">Mode</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-dark/20 text-charcoal/80">
                  {student.attendances.map((a) => (
                    <tr key={a.id} className="hover:bg-sage-light/30 transition-colors">
                      <td className="px-5 py-3 font-serif text-sm font-medium text-forest">
                        {a.title}
                      </td>
                      <td className="px-5 py-3 text-olive uppercase tracking-wider text-[10px]">
                        {a.type}
                      </td>
                      <td className="px-5 py-3 text-olive">
                        {new Date(a.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold">
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Video Studies */}
      {activeTab === 'videos' && (
        <div className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden">
          {student.playbackLogs.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Film className="w-8 h-8 text-olive mx-auto opacity-50" />
              <p className="text-sm text-forest font-serif">No video playback recorded</p>
              <p className="text-xs text-charcoal/60">This practitioner has not watched any digital sadhana library masterclasses yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-sage-dark/20 p-5 space-y-3">
              {student.playbackLogs.map((log) => {
                const pct = Math.min(100, Math.round((log.watchedSeconds / (log.durationSeconds || 1800)) * 100));
                return (
                  <div key={log.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-serif text-sm text-forest font-medium">{log.title}</h4>
                      <span className="text-[10px] text-olive uppercase tracking-wider">{log.category}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-sage-light h-2 overflow-hidden hidden sm:block">
                        <div style={{ width: `${pct}%` }} className="bg-forest h-full" />
                      </div>
                      <span className="text-olive font-semibold">{pct}% watched</span>
                      {log.isCompleted && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] uppercase font-bold">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-ivory border border-sage-dark max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 text-charcoal/60 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl text-forest mb-4">Edit Practitioner Info</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 border border-sage-dark/40 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 border border-sage-dark/40 bg-white"
                />
              </div>
              <div className="pt-3 border-t border-sage-dark/30 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-charcoal/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 text-xs uppercase tracking-wider font-semibold bg-forest text-ivory hover:bg-forest-light transition-colors"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
