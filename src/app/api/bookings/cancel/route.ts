import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ success: false, message: 'Booking ID required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { schedule: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    // Only owner of booking or admin can cancel
    if (booking.userId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ success: true, message: 'Booking is already cancelled' });
    }

    // Concurrency safe cancellation
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      // If was confirmed, decrement schedule count
      if (booking.status === 'CONFIRMED' && booking.schedule.bookedCount > 0) {
        await tx.classSchedule.update({
          where: { id: booking.scheduleId },
          data: {
            bookedCount: { decrement: 1 },
          },
        });
      }
    });

    await logAuditEvent({
      userId: user.userId,
      action: 'BOOKING_CANCELLED',
      targetType: 'Booking',
      targetId: bookingId,
      details: { bookingNumber: booking.bookingNumber },
    });

    return NextResponse.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
