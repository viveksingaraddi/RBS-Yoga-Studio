'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Send,
  KeyRound,
  ExternalLink,
  X,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface StudentItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  activeMembership: {
    planName: string;
    startDate: string | null;
    endDate: string | null;
  } | null;
  totalBookings: number;
  totalAttendances: number;
  totalPayments: number;
}

interface PlanItem {
  id: string;
  name: string;
  durationDays: number;
  price: number;
}

export default function StudentsDirectoryClient({
  initialStudents,
  plans,
  totalStudents,
  activePassholdersCount,
  currentPage,
  totalPages,
  initialQuery,
  initialStatus,
}: {
  initialStudents: StudentItem[];
  plans: PlanItem[];
  totalStudents: number;
  activePassholdersCount: number;
  currentPage: number;
  totalPages: number;
  initialQuery: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'PAID', // PAID, PENDING
    paymentMethod: 'CASH',
    paymentAmount: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/portal/students?q=${encodeURIComponent(searchQuery)}&status=${statusFilter}&page=1`);
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    router.push(`/portal/students?q=${encodeURIComponent(searchQuery)}&status=${newStatus}&page=1`);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/instructor/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s))
        );
        setActionMessage({
          text: `Student status updated to ${!currentStatus ? 'Active' : 'Deactivated'}.`,
          type: 'success',
        });
      }
    } catch {
      setActionMessage({ text: 'Failed to update student status.', type: 'error' });
    }
  };

  const handleResendActivation = async (id: string, email: string) => {
    try {
      const res = await fetch(`/api/instructor/students/${id}/resend-activation`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          text: `Activation invitation sent successfully to ${email}.`,
          type: 'success',
        });
      } else {
        setActionMessage({ text: data.error || 'Failed to dispatch email.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Network error sending activation invitation.', type: 'error' });
    }
  };

  const handleTriggerPasswordReset = async (id: string, email: string) => {
    try {
      const res = await fetch(`/api/instructor/students/${id}/reset-password`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          text: `Password reset link sent to ${email}.`,
          type: 'success',
        });
      } else {
        setActionMessage({ text: data.error || 'Failed to send reset email.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Error dispatching password reset.', type: 'error' });
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionMessage(null);

    try {
      const res = await fetch('/api/instructor/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setActionMessage({
          text: `Student ${formData.name} successfully created! An activation link has been dispatched to ${formData.email}.`,
          type: 'success',
        });
        setIsModalOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          planId: '',
          startDate: new Date().toISOString().split('T')[0],
          paymentStatus: 'PAID',
          paymentMethod: 'CASH',
          paymentAmount: '',
          notes: '',
        });
        router.refresh();
      } else {
        setActionMessage({ text: data.error || 'Failed to create student.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'An unexpected network error occurred.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-dark/40 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-bold">
              Student Sanctuary Directory
            </span>
            <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
              {totalStudents} Practitioners
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest mt-1">
            Student Management
          </h1>
          <p className="text-xs text-charcoal/75 max-w-xl">
            Register students, manage membership passes, monitor attendance and bookings, and trigger secure activation invitations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-forest text-ivory px-5 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light transition-all shadow-sm shrink-0"
        >
          <UserPlus className="w-4 h-4 text-earth" />
          <span>Add New Student</span>
        </button>
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
          <button
            onClick={() => setActionMessage(null)}
            className="text-charcoal/60 hover:text-charcoal p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-ivory border border-sage-dark/40 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-olive absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, or mobile..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-sage-dark/40 bg-white focus:outline-none focus:border-forest text-forest placeholder:text-charcoal/40"
            />
          </div>
          <button
            type="submit"
            className="bg-forest text-ivory px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light transition-colors"
          >
            Search
          </button>
        </form>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => handleStatusFilterChange('ALL')}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-forest text-ivory'
                : 'bg-sage-light text-forest hover:bg-sage'
            }`}
          >
            All ({totalStudents})
          </button>
          <button
            onClick={() => handleStatusFilterChange('ACTIVE')}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-forest text-ivory'
                : 'bg-sage-light text-forest hover:bg-sage'
            }`}
          >
            Active Passes ({activePassholdersCount})
          </button>
          <button
            onClick={() => handleStatusFilterChange('INACTIVE')}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold transition-all ${
              statusFilter === 'INACTIVE'
                ? 'bg-forest text-ivory'
                : 'bg-sage-light text-forest hover:bg-sage'
            }`}
          >
            Deactivated
          </button>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden">
        {students.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <Users className="w-10 h-10 text-olive mx-auto opacity-40" />
            <h3 className="font-serif text-lg text-forest">No students found</h3>
            <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
              No registered practitioners match your search criteria. Try modifying your search or enroll a new student.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal/80">
              <thead className="bg-sage uppercase tracking-wider text-[10px] font-semibold text-forest border-b border-sage-dark/40">
                <tr>
                  <th className="px-5 py-3">Practitioner</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Active Sadhana Pass</th>
                  <th className="px-5 py-3 text-center">Bookings</th>
                  <th className="px-5 py-3 text-center">Attendances</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-dark/20">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-sage-light/30 transition-colors">
                    {/* Practitioner Name */}
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/portal/students/${student.id}`}
                        className="font-serif text-sm font-medium text-forest hover:text-earth transition-colors block"
                      >
                        {student.name}
                      </Link>
                      <span className="text-[10px] text-olive">
                        Joined {new Date(student.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3.5 space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-xs text-forest">
                        <Mail className="w-3 h-3 text-olive" />
                        <span>{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center space-x-1.5 text-[11px] text-olive">
                          <Phone className="w-3 h-3 text-olive" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Active Membership */}
                    <td className="px-5 py-3.5">
                      {student.activeMembership ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 bg-forest text-ivory text-[10px] font-semibold uppercase tracking-wider">
                            {student.activeMembership.planName}
                          </span>
                          {student.activeMembership.endDate && (
                            <span className="text-[10px] text-olive block">
                              Valid until {new Date(student.activeMembership.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 bg-sage text-forest text-[10px] font-semibold">
                          No Active Pass
                        </span>
                      )}
                    </td>

                    {/* Bookings */}
                    <td className="px-5 py-3.5 text-center font-serif text-sm font-semibold text-forest">
                      {student.totalBookings}
                    </td>

                    {/* Attendances */}
                    <td className="px-5 py-3.5 text-center font-serif text-sm font-semibold text-forest">
                      {student.totalAttendances}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleActive(student.id, student.isActive)}
                        className={`inline-flex items-center space-x-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 transition-all ${
                          student.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {student.isActive ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3 text-red-700" />
                            <span>Deactivated</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <Link
                        href={`/portal/students/${student.id}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-sage-light text-forest hover:bg-forest hover:text-ivory transition-colors"
                        title="View Full Profile"
                      >
                        <span>Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => handleResendActivation(student.id, student.email)}
                        className="inline-flex items-center px-2 py-1 text-[11px] text-olive hover:text-forest hover:bg-sage-light transition-colors"
                        title="Resend Account Activation Invitation"
                      >
                        <Send className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleTriggerPasswordReset(student.id, student.email)}
                        className="inline-flex items-center px-2 py-1 text-[11px] text-olive hover:text-forest hover:bg-sage-light transition-colors"
                        title="Dispatch Secure Password Reset Email"
                      >
                        <KeyRound className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-sage-dark/30 flex items-center justify-between text-xs text-olive">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              {currentPage > 1 && (
                <Link
                  href={`/portal/students?q=${encodeURIComponent(searchQuery)}&status=${statusFilter}&page=${currentPage - 1}`}
                  className="px-3 py-1 bg-sage-light text-forest hover:bg-forest hover:text-ivory uppercase tracking-wider font-semibold text-[10px]"
                >
                  Previous
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/portal/students?q=${encodeURIComponent(searchQuery)}&status=${statusFilter}&page=${currentPage + 1}`}
                  className="px-3 py-1 bg-sage-light text-forest hover:bg-forest hover:text-ivory uppercase tracking-wider font-semibold text-[10px]"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add New Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-ivory border border-sage-dark max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-charcoal/60 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-sage-dark/40 pb-4 mb-5">
              <span className="text-[10px] uppercase tracking-widest text-earth font-bold">
                Instructor Onboarding
              </span>
              <h2 className="font-serif text-2xl text-forest">Add Practitioner to Sanctuary</h2>
              <p className="text-xs text-charcoal/70 mt-1">
                Creates a student account, optionally provisions a membership pass, and dispatches a single-use activation email.
              </p>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full p-2.5 border border-sage-dark/40 bg-white focus:outline-none focus:border-forest text-forest"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. ananya@example.com"
                  className="w-full p-2.5 border border-sage-dark/40 bg-white focus:outline-none focus:border-forest text-forest"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 border border-sage-dark/40 bg-white focus:outline-none focus:border-forest text-forest"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Assign Membership Pass (Optional)
                </label>
                <select
                  value={formData.planId}
                  onChange={(e) => {
                    const selPlan = plans.find((p) => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      planId: e.target.value,
                      paymentAmount: selPlan ? String(selPlan.price) : '',
                    });
                  }}
                  className="w-full p-2.5 border border-sage-dark/40 bg-white focus:outline-none focus:border-forest text-forest"
                >
                  <option value="">No Plan / Direct Onboarding</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.durationDays} Days) — ₹{p.price.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {formData.planId && (
                <div className="p-4 bg-sage-light/50 border border-sage-dark/30 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-forest mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full p-2 border border-sage-dark/40 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-forest mb-1">
                        Payment Status
                      </label>
                      <select
                        value={formData.paymentStatus}
                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                        className="w-full p-2 border border-sage-dark/40 bg-white text-xs"
                      >
                        <option value="PAID">Paid / Settled</option>
                        <option value="PENDING">Pending Payment</option>
                      </select>
                    </div>
                  </div>

                  {formData.paymentStatus === 'PAID' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-forest mb-1">
                          Payment Mode
                        </label>
                        <select
                          value={formData.paymentMethod}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="w-full p-2 border border-sage-dark/40 bg-white text-xs"
                        >
                          <option value="CASH">Cash in Shala</option>
                          <option value="UPI">UPI / GPay / PhonePe</option>
                          <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                          <option value="RAZORPAY_OFFLINE">External POS / Card</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-forest mb-1">
                          Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.paymentAmount}
                          onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                          className="w-full p-2 border border-sage-dark/40 bg-white text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Onboarding Notes / Health Considerations
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Beginner in Vinyasa, lower back sensitivity..."
                  className="w-full p-2.5 border border-sage-dark/40 bg-white focus:outline-none focus:border-forest text-forest"
                />
              </div>

              <div className="pt-3 border-t border-sage-dark/30 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-charcoal/70 hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold bg-forest text-ivory hover:bg-forest-light disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Onboarding Student...' : 'Create & Send Activation Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
