'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Printer,
  X,
  FileText,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface PaymentItem {
  id: string;
  orderId: string;
  paymentId?: string | null;
  receiptNumber?: string | null;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  title: string;
  studentName: string;
  studentEmail: string;
  recordedBy?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface PendingMembershipOption {
  id: string;
  studentName: string;
  studentEmail: string;
  planName: string;
  planPrice: number;
}

interface LearnerOption {
  id: string;
  name: string;
  email: string;
}

export default function PaymentsClient({
  payments: initialPayments,
  pendingMemberships,
  learners,
  aggregates,
}: {
  payments: PaymentItem[];
  pendingMemberships: PendingMembershipOption[];
  learners: LearnerOption[];
  aggregates: {
    totalCollected: number;
    currentMonth: number;
    previousMonth: number;
    yearlyRevenue: number;
    pendingAmount: number;
    refundedAmount: number;
  };
}) {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentItem[]>(initialPayments);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentItem | null>(null);

  // Record Form
  const [recordForm, setRecordForm] = useState({
    membershipId: '',
    userId: '',
    amount: '',
    paymentMethod: 'CASH',
    receiptNumber: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Month-over-month growth rate
  const growthRate =
    aggregates.previousMonth > 0
      ? Math.round(((aggregates.currentMonth - aggregates.previousMonth) / aggregates.previousMonth) * 100)
      : null;

  const filteredPayments = payments.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.receiptNumber && p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handlers
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage(null);

    try {
      const res = await fetch('/api/instructor/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordForm),
      });
      const data = await res.json();

      if (res.ok) {
        setActionMessage({
          text: `Payment of ₹${recordForm.amount} successfully recorded and receipt dispatched!`,
          type: 'success',
        });
        setIsRecordModalOpen(false);
        setRecordForm({
          membershipId: '',
          userId: '',
          amount: '',
          paymentMethod: 'CASH',
          receiptNumber: '',
          notes: '',
        });
        router.refresh();
      } else {
        setActionMessage({ text: data.error || 'Failed to record payment.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Network error recording payment.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefund = async (id: string, name: string) => {
    if (!confirm(`Mark payment as REFUNDED for ${name}?`)) return;

    try {
      const res = await fetch(`/api/instructor/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REFUND' }),
      });
      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: 'REFUNDED' } : p))
        );
        setActionMessage({ text: 'Payment marked as REFUNDED.', type: 'success' });
      } else {
        setActionMessage({ text: 'Failed to update payment status.', type: 'error' });
      }
    } catch {
      setActionMessage({ text: 'Network error processing refund.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-dark/40 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-bold">
              Treasury &amp; Financial Ledger
            </span>
            <span className="px-2 py-0.5 bg-forest text-ivory text-[9px] uppercase tracking-wider font-semibold">
              Live Real-Time
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest mt-1">
            Payments &amp; Earnings
          </h1>
          <p className="text-xs text-charcoal/75 max-w-xl">
            Track studio revenue, manage manual shala cash and UPI payments, generate official receipts, and audit transactions.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-forest text-ivory px-5 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light transition-all shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-earth" />
          <span>Record Manual Payment</span>
        </button>
      </div>

      {/* 6-KPI Revenue Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Total Collected */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Total Revenue</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-forest mt-1">
            ₹{aggregates.totalCollected.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-olive/80">All-time collected</span>
        </div>

        {/* Current Month */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">This Month</span>
            {growthRate !== null && (
              <span className={`text-[10px] font-bold ${growthRate >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {growthRate >= 0 ? `+${growthRate}%` : `${growthRate}%`}
              </span>
            )}
          </div>
          <p className="font-serif text-xl sm:text-2xl font-bold text-forest mt-1">
            ₹{aggregates.currentMonth.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-olive/80">Current calendar month</span>
        </div>

        {/* Previous Month */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Last Month</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-forest mt-1">
            ₹{aggregates.previousMonth.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-olive/80">Prior month total</span>
        </div>

        {/* Yearly Revenue */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Year to Date</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-forest mt-1">
            ₹{aggregates.yearlyRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-olive/80">Calendar year {new Date().getFullYear()}</span>
        </div>

        {/* Pending Due */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Pending Due</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-amber-800 mt-1">
            ₹{aggregates.pendingAmount.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-olive/80">Unsettled passes</span>
        </div>

        {/* Refunded */}
        <div className="bg-ivory p-4 border border-sage-dark/40 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">Refunds</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-charcoal/70 mt-1">
            ₹{aggregates.refundedAmount.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-olive/80">Returned amount</span>
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
            placeholder="Search by student name, email, receipt number, or order ID..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-sage-dark/40 bg-white focus:outline-none focus:border-forest text-forest"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {['ALL', 'CAPTURED', 'CREATED', 'REFUNDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                statusFilter === st ? 'bg-forest text-ivory' : 'bg-sage-light text-forest hover:bg-sage'
              }`}
            >
              {st === 'CAPTURED' ? 'Paid / Settled' : st === 'CREATED' ? 'Pending' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CreditCard className="w-8 h-8 text-olive mx-auto opacity-50" />
            <h3 className="font-serif text-lg text-forest">No transactions recorded</h3>
            <p className="text-xs text-charcoal/60">
              Transactions recorded via Razorpay or manual shala payments will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal/80">
              <thead className="bg-sage text-forest uppercase tracking-wider text-[10px] font-semibold border-b border-sage-dark/40">
                <tr>
                  <th className="px-5 py-3">Practitioner</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Payment Mode</th>
                  <th className="px-5 py-3">Receipt #</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-dark/20">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-sage-light/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-serif text-sm font-medium text-forest block">{p.studentName}</span>
                      <span className="text-[10px] text-olive">{p.studentEmail}</span>
                    </td>

                    <td className="px-5 py-3.5 max-w-xs">
                      <span className="font-medium text-forest block truncate">{p.title}</span>
                      {p.notes && <span className="text-[10px] text-olive block truncate">{p.notes}</span>}
                    </td>

                    <td className="px-5 py-3.5 font-serif text-sm font-bold text-forest">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-sage-light text-forest text-[10px] font-semibold uppercase tracking-wider border border-sage-dark/30">
                        {p.paymentMethod}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[11px] text-forest font-semibold">
                      {p.receiptNumber || '—'}
                    </td>

                    <td className="px-5 py-3.5 text-olive">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold ${
                          p.status === 'CAPTURED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'REFUNDED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedReceiptPayment(p)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] uppercase font-bold bg-sage-light text-forest hover:bg-forest hover:text-ivory transition-colors"
                        title="View & Print Official Receipt"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>

                      {p.status === 'CAPTURED' && (
                        <button
                          onClick={() => handleRefund(p.id, p.studentName)}
                          className="px-2 py-1 text-red-700 hover:bg-red-50 text-[10px] uppercase font-semibold"
                        >
                          Refund
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

      {/* Record Manual Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-ivory border border-sage-dark max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRecordModalOpen(false)}
              className="absolute top-5 right-5 text-charcoal/60 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-sage-dark/40 pb-4 mb-4">
              <span className="text-[10px] uppercase tracking-widest text-earth font-bold">
                Treasury Settlement
              </span>
              <h2 className="font-serif text-2xl text-forest">Record Manual Shala Payment</h2>
              <p className="text-xs text-charcoal/70 mt-1">
                Record cash, direct UPI, or bank transfers. If tied to a pending pass, it activates immediately and sends an email receipt.
              </p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              {/* Option A: Select from Pending Passes */}
              {pendingMemberships.length > 0 && (
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Select Pending Membership (Recommended)
                  </label>
                  <select
                    value={recordForm.membershipId}
                    onChange={(e) => {
                      const sel = pendingMemberships.find((m) => m.id === e.target.value);
                      setRecordForm({
                        ...recordForm,
                        membershipId: e.target.value,
                        amount: sel ? String(sel.planPrice) : recordForm.amount,
                      });
                    }}
                    className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest text-xs"
                  >
                    <option value="">-- Or choose student directly below --</option>
                    {pendingMemberships.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.studentName} — {m.planName} (₹{m.planPrice.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Option B: Direct Student Selection */}
              {!recordForm.membershipId && (
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Select Student *
                  </label>
                  <select
                    required
                    value={recordForm.userId}
                    onChange={(e) => setRecordForm({ ...recordForm, userId: e.target.value })}
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
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Amount Paid (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={recordForm.amount}
                    onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
                    placeholder="e.g. 3000"
                    className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={recordForm.paymentMethod}
                    onChange={(e) => setRecordForm({ ...recordForm, paymentMethod: e.target.value })}
                    className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest text-xs"
                  >
                    <option value="CASH">Cash in Shala</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                    <option value="RAZORPAY_OFFLINE">External Card / POS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Custom Receipt Number (Optional)
                </label>
                <input
                  type="text"
                  value={recordForm.receiptNumber}
                  onChange={(e) => setRecordForm({ ...recordForm, receiptNumber: e.target.value })}
                  placeholder="Leave empty to auto-generate"
                  className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                  Payment Reference / Remarks
                </label>
                <textarea
                  rows={2}
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  placeholder="e.g. Received via GPay reference #..."
                  className="w-full p-2.5 border border-sage-dark/40 bg-white text-forest"
                />
              </div>

              <div className="pt-3 border-t border-sage-dark/30 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 uppercase tracking-wider font-semibold text-charcoal/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 uppercase tracking-wider font-semibold bg-forest text-ivory hover:bg-forest-light"
                >
                  {submitting ? 'Recording...' : 'Record & Issue Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {selectedReceiptPayment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-ivory border border-sage-dark max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-5">
            <button
              onClick={() => setSelectedReceiptPayment(null)}
              className="absolute top-5 right-5 text-charcoal/60 hover:text-charcoal print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Printable Card */}
            <div className="border border-sage-dark/40 p-6 bg-white space-y-4">
              <div className="text-center border-b border-sage-dark/30 pb-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-bold block">
                  Official Receipt
                </span>
                <h3 className="font-serif text-2xl text-forest">RBS Yoga Studio</h3>
                <p className="text-[10px] text-olive">Under Master Sangu (M.Sc. Yoga) · Bangalore &amp; Global Shala</p>
              </div>

              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-olive">Receipt Number:</span>
                  <span className="font-mono font-bold text-forest">{selectedReceiptPayment.receiptNumber || selectedReceiptPayment.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-olive">Date:</span>
                  <span className="font-medium text-forest">
                    {new Date(selectedReceiptPayment.createdAt).toLocaleDateString('en-IN', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-olive">Student Practitioner:</span>
                  <span className="font-semibold text-forest">{selectedReceiptPayment.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-olive">Email:</span>
                  <span className="text-forest">{selectedReceiptPayment.studentEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-olive">Payment Mode:</span>
                  <span className="text-forest font-semibold">{selectedReceiptPayment.paymentMethod}</span>
                </div>
              </div>

              <div className="p-3 bg-sage-light/50 border border-sage-dark/30 flex justify-between items-center text-sm font-bold text-forest">
                <span>Amount Paid:</span>
                <span className="font-serif text-lg">₹{selectedReceiptPayment.amount.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 text-center text-[10px] text-olive/80">
                <p>Status: <strong>{selectedReceiptPayment.status}</strong></p>
                {selectedReceiptPayment.recordedBy && <p>Recorded by: {selectedReceiptPayment.recordedBy}</p>}
                <p className="mt-2 text-forest italic">Om Shanti Shanti Shanti</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 print:hidden">
              <button
                onClick={() => setSelectedReceiptPayment(null)}
                className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-charcoal/70"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs uppercase tracking-wider font-semibold bg-forest text-ivory hover:bg-forest-light"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
