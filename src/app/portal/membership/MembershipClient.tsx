'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Check,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Receipt,
  FileText,
  Printer,
  X,
  History,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number | any;
  durationDays: number;
  benefits: string[];
}

interface Membership {
  id: string;
  status: string;
  startDate: string | Date | null;
  endDate: string | Date | null;
  createdAt: string | Date;
  plan: Plan;
}

interface PaymentRecord {
  id: string;
  orderId: string;
  paymentId: string | null;
  receiptNumber: string | null;
  amount: number | string | any;
  currency: string;
  status: string;
  paymentMethod: string | null;
  createdAt: string | Date;
  membershipPlanName?: string;
}

interface MembershipClientProps {
  activeMembership: Membership | null;
  pastMemberships: Membership[];
  payments: PaymentRecord[];
  userName: string;
  userEmail: string;
}

export default function MembershipClient({
  activeMembership,
  pastMemberships,
  payments,
  userName,
  userEmail,
}: MembershipClientProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="border-b border-sage-dark/40 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
            Sadhana Status
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest">
            My Membership &amp; Receipts
          </h1>
          <p className="text-xs text-charcoal/70 mt-1">
            Review your active privileges, valid term duration, subscription history, and official fee receipts.
          </p>
        </div>

        <Link
          href="/memberships"
          className="bg-forest text-ivory px-5 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>{activeMembership ? 'Renew / Upgrade' : 'Explore Passes'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Active Membership Section */}
      {activeMembership ? (
        <div className="bg-ivory border border-earth/40 p-6 sm:p-8 shadow-elevated space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sage-dark/30 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-earth font-semibold">
                Active Pass
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-forest">
                {activeMembership.plan.name}
              </h2>
              <p className="text-xs text-charcoal/70">{activeMembership.plan.description}</p>
            </div>

            <span className="px-3.5 py-1.5 bg-forest text-ivory text-xs uppercase tracking-widest font-semibold self-start md:self-auto">
              Status: {activeMembership.status}
            </span>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-sage-light/60 p-5 border border-sage-dark/30">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-olive block">
                Activated On
              </span>
              <p className="font-serif text-base text-forest font-medium">
                {activeMembership.startDate
                  ? new Date(activeMembership.startDate).toLocaleDateString([], { dateStyle: 'medium' })
                  : 'Active'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-olive block">
                Valid Until
              </span>
              <p className="font-serif text-base text-forest font-medium">
                {activeMembership.endDate
                  ? new Date(activeMembership.endDate).toLocaleDateString([], { dateStyle: 'medium' })
                  : 'Open'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-olive block">
                Duration
              </span>
              <p className="font-serif text-base text-forest font-medium">
                {activeMembership.plan.durationDays} Days Term
              </p>
            </div>
          </div>

          {/* Included Benefits */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-forest font-semibold">
              Included Entitlements &amp; Privileges
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-charcoal/80">
              {activeMembership.plan.benefits.map((b, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-earth shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-ivory border border-sage-dark/40 p-8 sm:p-12 text-center shadow-card space-y-4">
          <Award className="w-12 h-12 text-earth mx-auto" />
          <h2 className="font-serif text-2xl text-forest">No Active Pass Found</h2>
          <p className="text-xs text-charcoal/70 max-w-md mx-auto">
            Subscribe to a regular membership or sadhana challenge to unlock our full recorded video library and attend live virtual transmissions.
          </p>
          <div className="pt-2">
            <Link
              href="/memberships"
              className="bg-forest text-ivory px-8 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all inline-block"
            >
              Explore Membership Plans
            </Link>
          </div>
        </div>
      )}

      {/* Official Payment Receipts History */}
      <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex items-center space-x-2 pb-4 border-b border-sage-dark/30">
          <Receipt className="w-5 h-5 text-forest" />
          <div>
            <h2 className="font-serif text-xl text-forest font-normal">Official Payment Receipts</h2>
            <p className="text-xs text-charcoal/65">
              Verified tax receipts for tuition, subscription passes, and booking enrollments.
            </p>
          </div>
        </div>

        {payments.length === 0 ? (
          <p className="text-xs text-charcoal/60 py-4 text-center">
            No payment transaction records found on file.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal">
              <thead className="bg-sage-light text-forest uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Receipt / Order ID</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-dark/30">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-sage-light/30">
                    <td className="py-3 px-3">
                      {new Date(p.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-forest">
                      {p.receiptNumber || p.orderId}
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {p.membershipPlanName || 'Yoga Studio Sadhana Fee'}
                    </td>
                    <td className="py-3 px-3 font-serif font-semibold text-forest">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${
                          p.status === 'CAPTURED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(p)}
                        className="text-earth font-semibold hover:underline inline-flex items-center space-x-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past Membership Subscriptions */}
      {pastMemberships.length > 0 && (
        <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex items-center space-x-2 pb-4 border-b border-sage-dark/30">
            <History className="w-5 h-5 text-forest" />
            <div>
              <h2 className="font-serif text-xl text-forest font-normal">Subscription History</h2>
              <p className="text-xs text-charcoal/65">Previous sadhana terms and expired passes.</p>
            </div>
          </div>

          <div className="divide-y divide-sage-dark/30">
            {pastMemberships.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base text-forest">{m.plan.name}</h4>
                  <p className="text-xs text-charcoal/60">
                    Term: {m.startDate ? new Date(m.startDate).toLocaleDateString() : 'N/A'} –{' '}
                    {m.endDate ? new Date(m.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-sage text-forest font-semibold">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-forest/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory border border-earth/60 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative print:p-0 print:border-none">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 text-charcoal/60 hover:text-forest print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="text-center border-b border-sage-dark/40 pb-5">
              <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
                Official Tuition Receipt
              </span>
              <h3 className="font-serif text-2xl text-forest mt-1">RBS YOGA STUDIO</h3>
              <p className="text-[11px] text-charcoal/70">
                The Art of Strength, Balance &amp; Wellness • Lead Instructor: Master Sangu
              </p>
              <p className="text-[10px] text-charcoal/60">yogawithsangu@gmail.com • +91 89513 46405</p>
            </div>

            {/* Receipt Details Grid */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-sage-dark/20 pb-2">
                <span className="text-olive">Receipt No:</span>
                <span className="font-mono text-forest font-semibold">
                  {selectedReceipt.receiptNumber || selectedReceipt.orderId}
                </span>
              </div>
              <div className="flex justify-between border-b border-sage-dark/20 pb-2">
                <span className="text-olive">Issued To:</span>
                <span className="font-semibold text-charcoal">
                  {userName} ({userEmail})
                </span>
              </div>
              <div className="flex justify-between border-b border-sage-dark/20 pb-2">
                <span className="text-olive">Date:</span>
                <span>
                  {new Date(selectedReceipt.createdAt).toLocaleDateString([], {
                    dateStyle: 'long',
                  })}
                </span>
              </div>
              <div className="flex justify-between border-b border-sage-dark/20 pb-2">
                <span className="text-olive">Program / Term:</span>
                <span>{selectedReceipt.membershipPlanName || 'Yoga Studio Sadhana Pass'}</span>
              </div>
              <div className="flex justify-between border-b border-sage-dark/20 pb-2">
                <span className="text-olive">Payment Status:</span>
                <span className="font-semibold text-emerald-800">{selectedReceipt.status}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-semibold text-forest">
                <span>Total Amount Paid:</span>
                <span className="font-serif text-lg">
                  ₹{Number(selectedReceipt.amount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-charcoal/60 bg-sage-light/50 p-3 border border-sage-dark/30">
              This receipt confirms full settlement for yogic instruction and transmission access under Master Sangu.
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-2 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-forest text-ivory px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="border border-sage-dark/60 text-charcoal px-4 py-2 text-xs uppercase tracking-wider hover:bg-sage-light"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
