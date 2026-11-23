import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { scheduleId } = await req.json();
    if (!scheduleId) {
      return NextResponse.json({ success: false, message: 'Schedule ID is required' }, { status: 400 });
    }

    const HOLD_DURATION_MINUTES = 10;
    const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);
    const now = new Date();

    // Concurrency-safe atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock and fetch schedule
      const schedule = await tx.classSchedule.findUnique({
        where: { id: scheduleId },
        include: { class: true },
      });

      if (!schedule || schedule.isCancelled) {
        throw new Error('Schedule not available or cancelled');
      }

      // 2. Count active unexpired holds excluding current user's existing holds
      const activeHolds = await tx.bookingHold.count({
        where: {
          scheduleId,
          expiresAt: { gt: now },
          userId: { not: user.userId },
        },
      });

      // 3. Count confirmed bookings
      const confirmedBookings = schedule.bookedCount;

      const availableSlots = schedule.capacity - (confirmedBookings + activeHolds);
      if (availableSlots <= 0) {
        throw new Error('No spots available for this session');
      }

      // 4. Remove any previous holds for this user on this schedule
      await tx.bookingHold.deleteMany({
        where: {
          scheduleId,
          userId: user.userId,
        },
      });

      // 5. Create new hold
      const hold = await tx.bookingHold.create({
        data: {
          scheduleId,
          userId: user.userId,
          expiresAt: holdExpiresAt,
        },
      });

      return { hold, schedule };
    });

    return NextResponse.json({
      success: true,
      holdId: result.hold.id,
      expiresAt: result.hold.expiresAt,
      schedule: {
        id: result.schedule.id,
        title: result.schedule.class.title,
        price: Number(result.schedule.class.price),
        startTime: result.schedule.startTime,
        endTime: result.schedule.endTime,
        deliveryType: result.schedule.deliveryType,
        location: result.schedule.location,
      },
    });
  } catch (error: any) {
    console.error('Booking hold error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Could not reserve hold slot' },
      { status: 400 }
    );
  }
}
