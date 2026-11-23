import { prisma } from '@/lib/prisma';
import { Video, Clock, Lock, Users } from 'lucide-react';

export default async function AdminLiveSessionsPage() {
  const liveSessions = await prisma.liveSession.findMany({
    orderBy: { startTime: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-sage-dark/40 pb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
          Broadcast Command
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-forest">
          Live Session Schedules
        </h1>
        <p className="text-xs text-charcoal/70">
          Manage Google Meet / Zoom virtual streams. Meeting links are stored securely and delivered only to authorized members.
        </p>
      </div>

      <div className="bg-ivory border border-sage-dark/40 shadow-card divide-y divide-sage-dark/30">
        {liveSessions.map((session) => (
          <div key={session.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-earth/20 text-forest text-[10px] uppercase tracking-wider font-semibold">
                  {session.meetingProvider}
                </span>
                <span className="text-xs text-olive">·</span>
                <span className="text-xs text-olive font-medium">
                  {new Date(session.startTime).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              <h3 className="font-serif text-2xl text-forest font-medium">
                {session.title}
              </h3>

              <div className="flex items-center space-x-2 text-xs text-olive">
                <Lock className="w-3.5 h-3.5 text-earth" />
                <span className="truncate max-w-md font-mono text-[11px]">
                  Protected URL: {session.meetingUrlEncrypted.slice(0, 30)}...
                </span>
              </div>
            </div>

            <div className="text-right border-t md:border-t-0 pt-4 md:pt-0 border-sage-dark/30">
              <span className="text-[10px] uppercase text-olive block">Requirement</span>
              <span className="font-medium text-xs text-forest">
                {session.requiresMembership ? 'Active Pass Required' : 'Open Registration'}
              </span>
              <div className="mt-2">
                <span className="px-2.5 py-1 bg-sage text-forest text-[10px] uppercase font-semibold">
                  {session.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
