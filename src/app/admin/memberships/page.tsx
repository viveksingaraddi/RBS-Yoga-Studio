import { prisma } from '@/lib/prisma';
import { Award, Check, Users } from 'lucide-react';

export default async function AdminMembershipsPage() {
  const memberships = await prisma.membership.findMany({
    include: {
      user: true,
      plan: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-sage-dark/40 pb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
          Passholder Registry
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-forest">
          Active Memberships & Passes
        </h1>
        <p className="text-xs text-charcoal/70">
          Track active membership passes, terms, expiration dates, and recurring status.
        </p>
      </div>

      <div className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal/80">
            <thead className="bg-sage uppercase tracking-wider text-[10px] font-semibold text-forest border-b border-sage-dark/40">
              <tr>
                <th className="px-6 py-3">Learner</th>
                <th className="px-6 py-3">Plan Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Start Date</th>
                <th className="px-6 py-3">End Date</th>
                <th className="px-6 py-3">Term Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-dark/30">
              {memberships.map((m) => (
                <tr key={m.id} className="hover:bg-sage-light/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-forest">{m.user.name}</div>
                    <div className="text-[11px] text-olive">{m.user.email}</div>
                  </td>
                  <td className="px-6 py-4 font-serif text-base font-semibold text-forest">
                    {m.plan.name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-semibold ${
                        m.status === 'ACTIVE'
                          ? 'bg-sage text-forest'
                          : 'bg-yellow-50 text-yellow-800'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-olive">
                    {m.startDate
                      ? new Date(m.startDate).toLocaleDateString([], { dateStyle: 'medium' })
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-olive">
                    {m.endDate
                      ? new Date(m.endDate).toLocaleDateString([], { dateStyle: 'medium' })
                      : '—'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-forest">
                    {m.plan.durationDays} Days
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
