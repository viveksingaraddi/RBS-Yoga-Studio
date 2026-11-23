import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, Clock, Tag } from 'lucide-react';

export default async function AdminProgramsPage() {
  const programs = await prisma.program.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-dark/40 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
            Curriculum Architecture
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest">
            Yogic Programs Catalog
          </h1>
          <p className="text-xs text-charcoal/70">
            Manage public disciplines, descriptions, and pricing options.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((prog) => (
          <div
            key={prog.id}
            className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/10] bg-forest/5">
                <img
                  src={prog.imageUrl}
                  alt={prog.title}
                  className="w-full h-full object-cover filter saturate-[0.9]"
                />
                <div className="absolute top-3 left-3 bg-forest text-ivory text-[10px] uppercase tracking-wider px-2 py-0.5 font-semibold">
                  {prog.deliveryType}
                </div>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-olive font-medium">
                  <Clock className="w-3.5 h-3.5 text-earth" />
                  <span>{prog.duration}</span>
                </div>
                <h3 className="font-serif text-2xl text-forest font-medium">
                  {prog.title}
                </h3>
                <p className="text-xs text-charcoal/70 line-clamp-3">
                  {prog.description}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-sage-dark/30 mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-olive block">Single Session</span>
                <span className="font-serif text-xl font-bold text-forest">
                  ₹{Number(prog.price || 0)}
                </span>
              </div>
              <span className="px-2 py-0.5 bg-sage text-forest text-[10px] uppercase font-semibold">
                {prog.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
