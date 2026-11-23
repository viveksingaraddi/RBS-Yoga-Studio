import { prisma } from '@/lib/prisma';
import BookingCancelButton from '@/components/portal/BookingCancelButton';

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      user: true,
      schedule: {
        include: { class: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-sage-dark/40 pb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
          Reservation Management
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-forest">
          All Class Bookings
        </h1>
        <p className="text-xs text-charcoal/70">
          Track confirmed, pending, and cancelled reservations across all physical shala and live classes.
        </p>
      </div>

      <div className="bg-ivory border border-sage-dark/40 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal/80">
            <thead className="bg-sage uppercase tracking-wider text-[10px] font-semibold text-forest border-b border-sage-dark/40">
              <tr>
                <th className="px-6 py-3">Booking #</th>
                <th className="px-6 py-3">Learner</th>
                <th className="px-6 py-3">Class & Format</th>
                <th className="px-6 py-3">Schedule Date & Time</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-dark/30">
              {bookings.map((booking) => {
                const start = new Date(booking.schedule.startTime);

                return (
                  <tr key={booking.id} className="hover:bg-sage-light/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-earth">
                      {booking.bookingNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-forest">{booking.user.name}</div>
                      <div className="text-[11px] text-olive">{booking.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-serif text-sm font-medium text-forest">
                        {booking.schedule.class.title}
                      </div>
                      <div className="text-[10px] uppercase text-olive font-semibold">
                        {booking.schedule.deliveryType}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-olive">
                      {start.toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4 font-serif text-base font-semibold text-forest">
                      ₹{Number(booking.amountPaid)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-semibold ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-sage text-forest'
                            : booking.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {booking.status === 'CONFIRMED' && (
                        <BookingCancelButton bookingId={booking.id} />
                      )}
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
