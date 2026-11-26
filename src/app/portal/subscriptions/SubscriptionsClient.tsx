'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  X,
  CreditCard,
  UserPlus,
  RefreshCw,
  Edit2,
  Check,
  ChevronRight,
} from 'lucide-react';

interface PlanItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationDays: number;
  price: number;
  benefits: string[];
  includesRecordings: boolean;
  includesLiveClasses: boolean;
  isActive: boolean;
  activeSubscribersCount: number;
}

interface MembershipItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string | null;
  planId: string;
  planName: string;
  durationDays: number;
  planPrice: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdBy?: string | null;
  notes?: string | null;
  createdAt: string;
  payments: {
    id: string;
    amount: number;
    status: string;
    method?: string | null;
    receiptNumber?: string | null;
    createdAt: string;
  }[];
}

interface LearnerOption {
  id: string;
  name: string;
  email: string;
}

export default function SubscriptionsClient({
  plans: initialPlans,
  memberships: initialMemberships,
  learners,
  stats,
}: {
  plans: PlanItem[];
  memberships: MembershipItem[];
  learners: LearnerOption[];
  stats: {
    activeCount: number;
    pendingCount: number;
    expiringCount: number;
    totalPlans: number;
  };
}) {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans);
  const [memberships, setMemberships] = useState<MembershipItem[]>(initialMemberships);
  const [activeTab, setActiveTab] = useState<'passes' | 'plans'>('passes');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [selectedMembershipForAction, setSelectedMembershipForAction] = useState<MembershipItem | null>(null);
  const [actionType, setActionType] = useState<'EXTEND' | 'RENEW' | 'CONFIRM_PAYMENT' | null>(null);

  // Assign Form
  const [assignForm, setAssignForm] = useState({
    userId: '',
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'PAID',
    paymentMethod: 'CASH',
    paymentAmount: '',
    notes: '',
  });

  // Action Form (Extend / Renew / Confirm)
  const [actionForm, setActionForm] = useState({
    extensionDays: '30',
    paymentMethod: 'CASH',
    paymentAmount: '',
    notes: '',
  });

  // Plan Form
  const [planForm, setPlanForm] = useState({
    name: '',
    slug: '',
    description: '',
    durationDays: '30',
    price: '',
    benefits: '5 Days / week live guided sadhana\nDirect personal posture alignment\nFull unlimited recorded library access',
    includesRecordings: true,
    includesLiveClasses: true,
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);

  // Filtered passes
  const filteredMemberships = memberships.filter((m) => {
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchesSearch =
      m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.planName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handlers
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/instructor/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ text: 'Membership pass successfully assigned to practitioner.', type: 'success' });
        setIsAssignModalOpen(false);
        router.refresh();
      } else {
        setActionMessage({ text: data.error || 'Failed to assign pass.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Network error assigning pass.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMembershipForAction || !actionType) return;
    setSubmitting(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/instructor/subscriptions/${selectedMembershipForAction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          ...actionForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ text: data.message || 'Pass updated successfully.', type: 'success' });
        setSelectedMembershipForAction(null);
        setActionType(null);
        router.refresh();
      } else {
        setActionMessage({ text: data.error || 'Operation failed.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Network error performing action.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPass = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to cancel the membership pass for ${name}?`)) return;
    try {
      const res = await fetch(`/api/instructor/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL' }),
      });
      if (res.ok) {
        setMemberships((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: 'CANCELLED' } : m))
        );
        setActionMessage({ text: 'Membership pass cancelled.', type: 'success' });
      }
    } catch {
      setActionMessage({ text: 'Failed to cancel pass.', type: 'error' });
    }
  };

  const handleTogglePlanActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/instructor/plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setPlans((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
        );
        setActionMessage({ text: `Plan status updated to ${!currentStatus ? 'Active' : 'Inactive'}.`, type: 'success' });
      }
    } catch {
      setActionMessage({ text: 'Failed to update plan status.', type: 'error' });
    }
  };

  const handlePlanFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage(null);

    const payload = {
      ...planForm,
      benefits: planForm.benefits.split('\n').filter((b) => b.trim().length > 0),
    };

    try {
      const url = editingPlan ? `/api/instructor/plans/${editingPlan.id}` : '/api/instructor/plans';
      const method = editingPlan ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          text: `Membership plan ${editingPlan ? 'updated' : 'created'} successfully.`,
          type: 'success',
        });
        setIsPlanModalOpen(false);
        setEditingPlan(null);
        router.refresh();
      } else {
        setActionMessage({ text: data.error || 'Failed to save plan.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Network error saving plan.', type: 'error' });
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
              Studio Membership Console
            </span>
            <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
              Subscriptions &amp; Plans
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest mt-1">
            Membership Management
          </h1>
          <p className="text-xs text-charcoal/75 max-w-xl">
            Design and price membership passes, assign subscriptions to practitioners, monitor renewals and expiry dates, and manage manual payments.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setEditingPlan(null);
              setPlanForm({
                name: '',
                slug: '',
                description: '',
                durationDays: '30',
                price: '',
                benefits: '5 Days / week live guided sadhana\nDirect personal posture alignment\nFull unlimited recorded library access',
                includesRecordings: true,
                includesLiveClasses: true,
                isActive: true,
              });
              setIsPlanModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 border border-forest text-forest px-4 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-forest hover:text-ivory transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-earth" />
            <span>Create Plan</span>
          </button>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-forest text-ivory px-4 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light transition-all shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 text-earth" />
            <span>Assign Pass</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Active Passes</span>
          <p className="font-serif text-2xl font-bold text-forest mt-1">{stats.activeCount}</p>
          <span className="text-[10px] text-olive/80">Currently valid</span>
        </div>
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Pending Payment</span>
          <p className="font-serif text-2xl font-bold text-amber-700 mt-1">{stats.pendingCount}</p>
          <span className="text-[10px] text-olive/80">Awaiting confirmation</span>
        </div>
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Expiring (14d)</span>
          <p className="font-serif text-2xl font-bold text-amber-800 mt-1">{stats.expiringCount}</p>
          <span className="text-[10px] text-olive/80">Renewals required</span>
        </div>
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Available Plans</span>
          <p className="font-serif text-2xl font-bold text-forest mt-1">{stats.totalPlans}</p>
          <span className="text-[10px] text-olive/80">In studio catalog</span>
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

      {/* Top Tabs */}
      <div className="flex border-b border-sage-dark/40 space-x-3 text-xs uppercase tracking-wider font-semibold">
        <button
          onClick={() => setActiveTab('passes')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'passes'
              ? 'border-forest text-forest bg-ivory font-bold'
              : 'border-transparent text-olive hover:text-forest'
          }`}
        >
          <Award className="w-4 h-4 text-earth" />
          <span>Practitioner Passes ({memberships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'plans'
              ? 'border-forest text-forest bg-ivory font-bold'
              : 'border-transparent text-olive hover:text-forest'
          }`}
        >
          <CreditCard className="w-4 h-4 text-earth" />
          <span>Membership Packages &amp; Pricing ({plans.length})</span>
        </button>
      </div>

      {/* TAB 1: PRACTITIONER PASSES */}
      {activeTab === 'passes' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-ivory border border-sage-dark/40 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-olive absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by student name, email, or pass..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-sage-dark/40 bg-white focus:outline-none focus:border-forest text-forest"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {['ALL', 'ACTIVE', 'PENDING_PAYMENT', 'EXPIRED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-forest text-ivory'
                      : 'bg-sage-light text-forest hover:bg-sage'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden">
            {filteredMemberships.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Award className="w-8 h-8 text-olive mx-auto opacity-50" />
                <p className="font-serif text-base text-forest">No membership records found</p>
                <p className="text-xs text-charcoal/60">Try clearing search filters or assign a pass to a student.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-charcoal/80">
                  <thead className="bg-sage text-forest uppercase tracking-wider text-[10px] font-semibold border-b border-sage-dark/40">
                    <tr>
                      <th className="px-5 py-3">Practitioner</th>
                      <th className="px-5 py-3">Membership Pass</th>
                      <th className="px-5 py-3">Validity Window</th>
                      <th className="px-5 py-3">Payment</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-dark/20">
                    {filteredMemberships.map((m) => (
                      <tr key={m.id} className="hover:bg-sage-light/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-serif text-sm font-medium text-forest block">{m.userName}</span>
                          <span className="text-[10px] text-olive">{m.userEmail}</span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="font-medium text-forest block">{m.planName}</span>
                          <span className="text-[10px] text-olive">₹{m.planPrice.toLocaleString('en-IN')} · {m.durationDays}d</span>
                        </td>

                        <td className="px-5 py-3.5 text-olive space-y-0.5">
                          {m.startDate && (
                            <p>
                              Start: <span className="text-forest font-medium">{new Date(m.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </p>
                          )}
                          {m.endDate && (
                            <p>
                              End: <span className="text-forest font-medium">{new Date(m.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          {m.payments[0] ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold uppercase">
                              Paid (₹{m.payments[0].amount})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold uppercase">
                              Unpaid / Pending
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold ${
                              m.status === 'ACTIVE'
                                ? 'bg-forest text-ivory'
                                : m.status === 'PENDING_PAYMENT'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-charcoal/10 text-charcoal/70'
                            }`}
                          >
                            {m.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {m.status === 'PENDING_PAYMENT' && (
                            <button
                              onClick={() => {
                                setSelectedMembershipForAction(m);
                                setActionType('CONFIRM_PAYMENT');
                                setActionForm({
                                  extensionDays: '30',
                                  paymentMethod: 'CASH',
                                  paymentAmount: String(m.planPrice),
                                  notes: '',
                                });
                              }}
                              className="px-2.5 py-1 bg-emerald-700 text-ivory text-[10px] uppercase font-bold hover:bg-emerald-800"
                            >
                              Confirm Payment
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedMembershipForAction(m);
                              setActionType('EXTEND');
                              setActionForm({
                                extensionDays: '15',
                                paymentMethod: 'CASH',
                                paymentAmount: '',
                                notes: '',
                              });
                            }}
                            className="px-2 py-1 bg-sage-light text-forest hover:bg-sage text-[10px] uppercase font-semibold"
                            title="Add extension days to expiry"
                          >
                            Extend
                          </button>

                          <button
                            onClick={() => {
                              setSelectedMembershipForAction(m);
                              setActionType('RENEW');
                              setActionForm({
                                extensionDays: String(m.durationDays),
                                paymentMethod: 'CASH',
                                paymentAmount: String(m.planPrice),
                                notes: '',
                              });
                            }}
                            className="px-2 py-1 bg-sage-light text-forest hover:bg-forest hover:text-ivory text-[10px] uppercase font-semibold"
                            title="Renew pass for full plan period"
                          >
                            Renew
                          </button>

                          {m.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancelPass(m.id, m.userName)}
                              className="px-2 py-1 text-red-700 hover:bg-red-50 text-[10px] uppercase font-semibold"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MEMBERSHIP PLANS CATALOG */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-ivory border p-6 shadow-sm flex flex-col justify-between transition-all ${
                plan.isActive ? 'border-sage-dark/50' : 'border-dashed border-charcoal/30 opacity-75'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-earth font-bold">
                    {plan.durationDays} Days Sadhana
                  </span>
                  <button
                    onClick={() => handleTogglePlanActive(plan.id, plan.isActive)}
                    className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold ${
                      plan.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-charcoal/10 text-charcoal/60'
                    }`}
                  >
                    {plan.isActive ? 'Active Plan' : 'Inactive / Hidden'}
                  </button>
                </div>

                <div>
                  <h3 className="font-serif text-2xl text-forest font-medium">{plan.name}</h3>
                  <p className="text-xs text-charcoal/70 mt-1 line-clamp-2">{plan.description || 'Complete yoga pass'}</p>
                </div>

                <div className="py-2 border-y border-sage-dark/30 flex items-baseline justify-between">
                  <div>
                    <span className="font-serif text-3xl font-bold text-forest">
                      ₹{plan.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-olive ml-1">/ pass</span>
                  </div>
                  <span className="text-[11px] text-olive font-semibold">
                    {plan.activeSubscribersCount} active subscribers
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-olive block">
                    Plan Privileges
                  </span>
                  <ul className="text-xs space-y-1.5 text-charcoal/80">
                    {plan.benefits.slice(0, 4).map((b, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-earth shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-sage-dark/30 mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[10px] text-olive font-semibold">
                  {plan.includesRecordings && <span>• Video Library</span>}
                  {plan.includesLiveClasses && <span>• Live Streams</span>}
                </div>
                <button
                  onClick={() => {
                    setEditingPlan(plan);
                    setPlanForm({
                      name: plan.name,
                      slug: plan.slug,
                      description: plan.description,
                      durationDays: String(plan.durationDays),
                      price: String(plan.price),
                      benefits: plan.benefits.join('\n'),
                      includesRecordings: plan.includesRecordings,
                      includesLiveClasses: plan.includesLiveClasses,
                      isActive: plan.isActive,
                    });
                    setIsPlanModalOpen(true);
                  }}
                  className="inline-flex items-center space-x-1 text-xs uppercase tracking-wider font-semibold text-forest hover:text-earth underline"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Plan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Pass Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-ivory border border-sage-dark max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute top-5 right-5 text-charcoal/60 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-sage-dark/40 pb-4 mb-4">
              <span className="text-[10px] uppercase tracking-widest text-earth font-bold">
                Manual Enrollment
              </span>
              <h2 className="font-serif text-2xl text-forest">Assign Membership Pass</h2>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Select Registered Student *
                </label>
                <select
                  required
                  value={assignForm.userId}
                  onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                  className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest text-xs"
                >
                  <option value="">-- Choose Practitioner --</option>
                  {learners.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Select Membership Plan *
                </label>
                <select
                  required
                  value={assignForm.planId}
                  onChange={(e) => {
                    const sel = plans.find((p) => p.id === e.target.value);
                    setAssignForm({
                      ...assignForm,
                      planId: e.target.value,
                      paymentAmount: sel ? String(sel.price) : '',
                    });
                  }}
                  className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest text-xs"
                >
                  <option value="">-- Choose Membership Plan --</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.durationDays} Days) — ₹{p.price.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-forest mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={assignForm.startDate}
                    onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })}
                    className="w-full p-2 border border-sage-dark/40 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-forest mb-1">
                    Payment Status
                  </label>
                  <select
                    value={assignForm.paymentStatus}
                    onChange={(e) => setAssignForm({ ...assignForm, paymentStatus: e.target.value })}
                    className="w-full p-2 border border-sage-dark/40 bg-white"
                  >
                    <option value="PAID">Paid &amp; Activate Now</option>
                    <option value="PENDING">Pending (Do not activate)</option>
                  </select>
                </div>
              </div>

              {assignForm.paymentStatus === 'PAID' && (
                <div className="p-3 bg-sage-light/60 border border-sage-dark/30 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-forest mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={assignForm.paymentMethod}
                      onChange={(e) => setAssignForm({ ...assignForm, paymentMethod: e.target.value })}
                      className="w-full p-2 border border-sage-dark/40 bg-white text-xs"
                    >
                      <option value="CASH">Cash in Shala</option>
                      <option value="UPI">UPI / GPay</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-forest mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={assignForm.paymentAmount}
                      onChange={(e) => setAssignForm({ ...assignForm, paymentAmount: e.target.value })}
                      className="w-full p-2 border border-sage-dark/40 bg-white text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  placeholder="e.g. Received via GPay from student..."
                  className="w-full p-2 border border-sage-dark/40 bg-white text-xs"
                />
              </div>

              <div className="pt-3 border-t border-sage-dark/30 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 uppercase tracking-wider font-semibold text-charcoal/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 uppercase tracking-wider font-semibold bg-forest text-ivory hover:bg-forest-light"
                >
                  {submitting ? 'Assigning...' : 'Assign Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Create / Edit Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-ivory border border-sage-dark max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPlanModalOpen(false)}
              className="absolute top-5 right-5 text-charcoal/60 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-sage-dark/40 pb-4 mb-4">
              <span className="text-[10px] uppercase tracking-widest text-earth font-bold">
                Package Architect
              </span>
              <h2 className="font-serif text-2xl text-forest">
                {editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
              </h2>
            </div>

            <form onSubmit={handlePlanFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g. 6 Months Transformation Sadhana"
                  className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    required
                    value={planForm.durationDays}
                    onChange={(e) => setPlanForm({ ...planForm, durationDays: e.target.value })}
                    placeholder="e.g. 30, 90, 180"
                    className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    placeholder="e.g. 3500"
                    className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="Summary of this pass immersion..."
                  className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Privileges / Bullet Points (one per line)
                </label>
                <textarea
                  rows={3}
                  value={planForm.benefits}
                  onChange={(e) => setPlanForm({ ...planForm, benefits: e.target.value })}
                  className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                />
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.includesRecordings}
                    onChange={(e) => setPlanForm({ ...planForm, includesRecordings: e.target.checked })}
                    className="w-4 h-4 text-forest"
                  />
                  <span>Includes Recorded Library</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.includesLiveClasses}
                    onChange={(e) => setPlanForm({ ...planForm, includesLiveClasses: e.target.checked })}
                    className="w-4 h-4 text-forest"
                  />
                  <span>Includes Live Streams</span>
                </label>
              </div>

              <div className="pt-3 border-t border-sage-dark/30 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 uppercase tracking-wider font-semibold text-charcoal/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 uppercase tracking-wider font-semibold bg-forest text-ivory hover:bg-forest-light"
                >
                  {submitting ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Modal (Extend / Renew / Confirm Payment) */}
      {selectedMembershipForAction && actionType && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-ivory border border-sage-dark max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setSelectedMembershipForAction(null);
                setActionType(null);
              }}
              className="absolute top-5 right-5 text-charcoal/60 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl text-forest mb-3">
              {actionType === 'CONFIRM_PAYMENT' && 'Confirm Manual Payment & Activate'}
              {actionType === 'EXTEND' && 'Extend Membership Pass'}
              {actionType === 'RENEW' && 'Renew Membership Pass'}
            </h3>
            <p className="text-xs text-olive mb-4">
              Practitioner: <strong>{selectedMembershipForAction.userName}</strong> ({selectedMembershipForAction.planName})
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
              {actionType === 'EXTEND' && (
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Extension Duration (Days)
                  </label>
                  <input
                    type="number"
                    required
                    value={actionForm.extensionDays}
                    onChange={(e) => setActionForm({ ...actionForm, extensionDays: e.target.value })}
                    className="w-full p-2 border border-sage-dark/40 bg-white"
                  />
                </div>
              )}

              {(actionType === 'CONFIRM_PAYMENT' || actionType === 'RENEW') && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-forest mb-1">
                        Payment Mode
                      </label>
                      <select
                        value={actionForm.paymentMethod}
                        onChange={(e) => setActionForm({ ...actionForm, paymentMethod: e.target.value })}
                        className="w-full p-2 border border-sage-dark/40 bg-white text-xs"
                      >
                        <option value="CASH">Cash in Shala</option>
                        <option value="UPI">UPI / GPay</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-forest mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={actionForm.paymentAmount}
                        onChange={(e) => setActionForm({ ...actionForm, paymentAmount: e.target.value })}
                        className="w-full p-2 border border-sage-dark/40 bg-white text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Notes / Receipt Reference
                </label>
                <textarea
                  rows={2}
                  value={actionForm.notes}
                  onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                  placeholder="e.g. Paid in cash at reception..."
                  className="w-full p-2 border border-sage-dark/40 bg-white text-xs"
                />
              </div>

              <div className="pt-3 border-t border-sage-dark/30 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMembershipForAction(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 uppercase tracking-wider font-semibold text-charcoal/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 uppercase tracking-wider font-semibold bg-forest text-ivory hover:bg-forest-light"
                >
                  {submitting ? 'Processing...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
