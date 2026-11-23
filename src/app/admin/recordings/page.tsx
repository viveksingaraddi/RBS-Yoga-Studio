import { prisma } from '@/lib/prisma';
import { Film, Clock, Play, Cloud } from 'lucide-react';

export default async function AdminRecordingsPage() {
  const recordings = await prisma.recording.findMany({
    include: {
      playbackLogs: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-sage-dark/40 pb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
          Digital Media Vault
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-forest">
          Recorded Video Teachings
        </h1>
        <p className="text-xs text-charcoal/70">
          Upload and organize on-demand practices. Streamed via signed URLs using Cloudflare Stream / private media storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recordings.map((rec) => (
          <div
            key={rec.id}
            className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/10] bg-forest/5">
                <img
                  src={rec.thumbnailUrl}
                  alt={rec.title}
                  className="w-full h-full object-cover filter saturate-[0.9]"
                />
                <div className="absolute bottom-2 right-2 bg-forest/90 text-ivory text-[10px] px-2 py-0.5">
                  {Math.round(rec.durationSeconds / 60)} Mins
                </div>
              </div>

              <div className="p-5 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-olive font-semibold">
                  {rec.category}
                </span>
                <h3 className="font-serif text-xl text-forest font-medium line-clamp-2">
                  {rec.title}
                </h3>
                <p className="text-xs text-charcoal/70 line-clamp-2">
                  {rec.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-sage-dark/30 mt-4 flex items-center justify-between text-xs text-olive">
              <span className="flex items-center space-x-1 font-mono text-[11px]">
                <Cloud className="w-3.5 h-3.5 text-earth" />
                <span>{rec.streamVideoId.slice(0, 18)}...</span>
              </span>
              <span className="font-semibold text-forest">
                {rec.playbackLogs.length} Views
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
