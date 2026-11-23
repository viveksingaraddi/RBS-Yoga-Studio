import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Video, Calendar, Clock, AlertCircle } from 'lucide-react';
import LiveSessionJoinButton from '@/components/portal/LiveSessionJoinButton';

export default async function LiveSessionsPage() {
  const session = await getCurrentUser();
  if (!session) return null;

  const now = new Date();

  // Fetch upcoming scheduled live sessions
  const liveSessions = await prisma.liveSession.findMany({
    where: {
      status: { in: ['SCHEDULED', 'LIVE'] },
      startTime: { gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) }, // Current or within 2 hours
    },
    orderBy: { startTime: 'asc' },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-sage-dark/40 pb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
          Virtual Studio Transmission
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-forest">
          Live Interactive Sessions
        </h1>
        <p className="text-xs text-charcoal/70">
          Direct Google Meet / Zoom broadcasts led personally by Master Sangu. Meeting URLs are protected and verified server-side.
        </p>
      </div>

      {liveSessions.length === 0 ? (
        <div className="bg-ivory border border-sage-dark/40 p-12 text-center shadow-card space-y-3">
          <Video className="w-10 h-10 text-earth mx-auto" />
          <h3 className="font-serif text-2xl text-forest">No Live Streams Currently Broadcast</h3>
          <p className="text-xs text-charcoal/70">
            Please check back according to the shala timetable or browse the recorded video library.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {liveSessions.map((ls) => {
            const start = new Date(ls.startTime);
            const end = new Date(ls.endTime);

            return (
              <div
                key={ls.id}
                className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] uppercase tracking-widest font-bold animate-pulse">
                      Live Broadcast
                    </span>
                    <span className="text-xs text-olive font-medium">
                      Provider: {ls.meetingProvider}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl text-forest font-medium">
                    {ls.title}
                  </h3>

                  <p className="text-xs text-charcoal/75 max-w-2xl leading-relaxed">
                    {ls.description || 'Guided practice, posture adjustment, and conscious breathwork with Master Sangu.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-olive pt-1">
                    <span className="flex items-center space-x-1 font-semibold text-forest">
                      <Clock className="w-3.5 h-3.5 text-earth" />
                      <span>
                        {start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} ·{' '}
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                      </span>
                    </span>
                    <span>·</span>
                    <span>Duration: {ls.durationMinutes} Mins</span>
                    <span>·</span>
                    <span>Lead: Master Sangu</span>
                  </div>
                </div>

                <div className="border-t md:border-t-0 pt-4 md:pt-0 border-sage-dark/30">
                  <LiveSessionJoinButton sessionId={ls.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
