import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Award, Check, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

export default async function MyMembershipPage() {
  const session = await getCurrentUser();
  if (!session) return null;

  const now = new Date();

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.userId,
      status: 'ACTIVE',
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    include: {
      plan: true,
    },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-sage-dark/40 pb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
          Sadhana Status
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-forest">
          My Membership Pass
        </h1>
        <p className="text-xs text-charcoal/70">
          Review your active privileges, valid term duration, and renewal details.
        </p>
      </div>

      {membership ? (
        <div className="bg-ivory border border-earth/40 p-8 sm:p-10 shadow-elevated space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-sage-dark/30 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-earth font-semibold">
                Active Pass
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-forest">
                {membership.plan.name}
              </h2>
              <p className="text-xs text-charcoal/70">{membership.plan.description}</p>
            </div>

            <span className="px-4 py-1.5 bg-forest text-ivory text-xs uppercase tracking-widest font-semibold self-start md:self-auto">
              Status: Active
            </span>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-sage-light/60 p-6 border border-sage-dark/30">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-olive block">
                Activated On
              </span>
              <p className="font-serif text-lg text-forest font-medium">
                {membership.startDate
                  ? new Date(membership.startDate).toLocaleDateString([], { dateStyle: 'medium' })
                  : 'Active'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-olive block">
                Valid Until
              </span>
              <p className="font-serif text-lg text-forest font-medium">
                {membership.endDate
                  ? new Date(membership.endDate).toLocaleDateString([], { dateStyle: 'medium' })
                  : 'Open'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-olive block">
                Duration
              </span>
              <p className="font-serif text-lg text-forest font-medium">
                {membership.plan.durationDays} Days Term
              </p>
            </div>
          </div>

          {/* Included Benefits */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-forest font-semibold">
              Included Entitlements & Privileges
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-charcoal/80">
              {membership.plan.benefits.map((b, idx) => (
                <li key={idx} className="flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-earth shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-sage-dark/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-olive flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-earth" />
              <span>Full recording library and live session access enabled.</span>
            </div>

            <Link
              href="/memberships"
              className="bg-forest text-ivory px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all"
            >
              Extend / Upgrade Pass
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-ivory border border-sage-dark/40 p-8 sm:p-12 text-center shadow-card space-y-4">
          <Award className="w-12 h-12 text-earth mx-auto" />
          <h2 className="font-serif text-2xl text-forest">No Active Pass Found</h2>
          <p className="text-xs text-charcoal/70 max-w-md mx-auto">
            Subscribe to a monthly, quarterly, or annual pass to unlock our full recorded video library and attend live virtual transmissions.
          </p>
          <div className="pt-4">
            <Link
              href="/memberships"
              className="bg-forest text-ivory px-8 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all inline-block"
            >
              Explore Membership Plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
