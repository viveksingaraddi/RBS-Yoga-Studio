import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Users, MapPin, Video, Clock } from 'lucide-react';

export default async function AdminSchedulesPage() {
  const schedules = await prisma.classSchedule.findMany({
    include: {
      class: true,
      bookings: {
        where: { status: 'CONFIRMED' },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-dark/40 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
            Shala Timetable Configuration
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest">
            Class Schedules & Capacity
          </h1>
          <p className="text-xs text-charcoal/70">
            Configure real session capacity, monitor reserved spots, and manage physical vs online sittings.
          </p>
        </div>
      </div>

      <div className="bg-ivory border border-sage-dark/40 shadow-card divide-y divide-sage-dark/30">
        {schedules.map((schedule) => {
          const start = new Date(schedule.startTime);
          const end = new Date(schedule.endTime);
          const spotsLeft = Math.max(0, schedule.capacity - schedule.bookedCount);

          return (
            <div key={schedule.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-earth">
                    {start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-xs text-olive">·</span>
                  <span className="text-xs text-olive font-medium flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-earth" />
                    <span>
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                  <span className="px-2 py-0.5 bg-sage text-forest text-[10px] uppercase font-semibold">
                    {schedule.deliveryType}
                  </span>
                </div>

                <h3 className="font-serif text-2xl text-forest font-medium">
                  {schedule.class.title}
                </h3>

                <p className="text-xs text-olive">
                  Location: {schedule.location || 'Studio Shala'} · Price: ₹{Number(schedule.class.price)}
                </p>
              </div>

              <div className="flex items-center space-x-6 border-t md:border-t-0 pt-4 md:pt-0 border-sage-dark/30">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-olive block">Capacity</span>
                  <div className="flex items-center space-x-1.5 font-semibold text-forest text-sm">
                    <Users className="w-4 h-4 text-earth" />
                    <span>
                      {schedule.bookedCount} / {schedule.capacity} Booked
                    </span>
                  </div>
                  <span className="text-[11px] text-olive">{spotsLeft} spots available</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
