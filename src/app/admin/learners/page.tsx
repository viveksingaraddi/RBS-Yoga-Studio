import { prisma } from '@/lib/prisma';
import { Users, Search, Award } from 'lucide-react';

export default async function AdminLearnersPage() {
  const learners = await prisma.user.findMany({
    where: { role: 'LEARNER' },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: { plan: true },
      },
      bookings: {
        where: { status: 'CONFIRMED' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-sage-dark/40 pb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
          Practitioner Registry
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-forest">
          Learner Directory
        </h1>
        <p className="text-xs text-charcoal/70">
          Manage registered yoga practitioners, view active passes, and inspect booking history.
        </p>
      </div>

      <div className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden">
        <div className="p-4 border-b border-sage-dark/30 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-forest">
            Total Learners: {learners.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal/80">
            <thead className="bg-sage uppercase tracking-wider text-[10px] font-semibold text-forest border-b border-sage-dark/40">
              <tr>
                <th className="px-6 py-3">Learner Name</th>
                <th className="px-6 py-3">Email & Phone</th>
                <th className="px-6 py-3">Active Pass</th>
                <th className="px-6 py-3">Confirmed Bookings</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-dark/30">
              {learners.map((learner) => {
                const activePlan = learner.memberships[0]?.plan;

                return (
                  <tr key={learner.id} className="hover:bg-sage-light/40 transition-colors">
                    <td className="px-6 py-4 font-serif text-base font-medium text-forest">
                      {learner.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{learner.email}</div>
                      <div className="text-[11px] text-olive">{learner.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {activePlan ? (
                        <span className="px-2 py-0.5 bg-earth/20 text-forest font-semibold text-[10px] uppercase">
                          {activePlan.name}
                        </span>
                      ) : (
                        <span className="text-charcoal/40">No active pass</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-forest">
                      {learner.bookings.length} Classes
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-sage text-forest text-[10px] uppercase font-semibold">
                        {learner.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-olive">
                      {new Date(learner.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
