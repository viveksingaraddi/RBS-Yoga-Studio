import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Video, ArrowRight, XCircle } from 'lucide-react';
import BookingCancelButton from '@/components/portal/BookingCancelButton';

export default async function MyBookingsPage() {
  const session = await getCurrentUser();
  if (!session) return null;

  const bookings = await prisma.booking.findMany({
    where: { userId: session.userId },
    include: {
      schedule: {
        include: { class: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-dark/40 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
            Attendance Record
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-forest">
            My Reserved Sittings
          </h1>
          <p className="text-xs text-charcoal/70">
            View upcoming and past class reservations. Cancellations release mat capacity back to fellow seekers.
          </p>
        </div>

        <Link
          href="/schedule"
          className="self-start sm:self-auto bg-forest text-ivory px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all shadow-sm"
        >
          Book New Class
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-ivory border border-sage-dark/40 shadow-card">
          <Calendar className="w-10 h-10 text-earth mx-auto mb-3" />
          <h3 className="font-serif text-2xl text-forest">No Class Reservations</h3>
          <p className="text-xs text-charcoal/70 mt-1 max-w-sm mx-auto">
            You haven't reserved any class sessions yet. Explore our live timetable to book your mat.
          </p>
          <div className="mt-6">
            <Link
              href="/schedule"
              className="bg-forest text-ivory px-6 py-3 text-xs uppercase tracking-wider font-semibold inline-block"
            >
              Browse Schedule
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const start = new Date(booking.schedule.startTime);
            const isPast = start.getTime() < Date.now();

            return (
              <div
                key={booking.id}
                className="bg-ivory border border-sage-dark/40 p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-semibold text-earth">
                      {booking.bookingNumber}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-sage text-forest'
                          : booking.status === 'CANCELLED'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-yellow-50 text-yellow-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-forest/5 text-forest font-semibold">
                      {booking.schedule.deliveryType}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl text-forest font-medium">
                    {booking.schedule.class.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-olive font-medium">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-earth" />
                      <span>{start.toLocaleDateString([], { dateStyle: 'full' })}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-earth" />
                      <span>
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      {booking.schedule.deliveryType === 'ONLINE' ? (
                        <Video className="w-3.5 h-3.5 text-earth" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-earth" />
                      )}
                      <span>{booking.schedule.location || 'Studio Shala'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 border-t md:border-t-0 pt-4 md:pt-0 border-sage-dark/30">
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-olive block">Paid Fee</span>
                    <span className="font-serif text-xl font-bold text-forest">
                      ₹{Number(booking.amountPaid)}
                    </span>
                  </div>

                  {booking.status === 'CONFIRMED' && !isPast && (
                    <BookingCancelButton bookingId={booking.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
