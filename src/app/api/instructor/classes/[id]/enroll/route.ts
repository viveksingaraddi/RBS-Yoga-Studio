import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: scheduleId } = await params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 });
    }

    const [schedule, user] = await Promise.all([
      prisma.classSchedule.findUnique({
        where: { id: scheduleId },
        include: {
          class: true,
          bookings: { where: { status: 'CONFIRMED' } },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          memberships: {
            where: {
              status: 'ACTIVE',
              OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
            },
          },
        },
      }),
    ]);

    if (!schedule || !user) {
      return NextResponse.json({ error: 'Schedule or Student not found.' }, { status: 404 });
    }

    // 1. Capacity validation: prevent overbooking
    if (schedule.bookings.length >= schedule.capacity) {
      return NextResponse.json({ error: 'This class batch has reached maximum capacity.' }, { status: 409 });
    }

    // 2. Check if already booked
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId,
        scheduleId,
        status: 'CONFIRMED',
      },
    });

    if (existingBooking) {
      return NextResponse.json({ error: 'Student is already booked for this session.' }, { status: 400 });
    }

    // 3. Create booking and attendance record in transaction
    const bookingNumber = `BK-${Date.now().toString().slice(-6)}`;

    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          bookingNumber,
          userId,
          scheduleId,
          status: 'CONFIRMED',
          notes: `Enrolled manually by instructor ${session.name}`,
        },
      });

      // Update schedule booked count
      await tx.classSchedule.update({
        where: { id: scheduleId },
        data: { bookedCount: { increment: 1 } },
      });

      // Create attendance entry
      await tx.attendance.create({
        data: {
          userId,
          scheduleId,
          bookingId: b.id,
          status: 'REGISTERED',
        },
      });

      // Log action
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'STUDENT_ENROLLED_TO_BATCH',
          targetType: 'BOOKING',
          targetId: b.id,
          details: `Instructor ${session.name} assigned ${user.name} to ${schedule.class.title} on ${schedule.startTime.toISOString()}`,
        },
      });

      return b;
    });

    return NextResponse.json({
      success: true,
      booking,
      message: `${user.name} enrolled into ${schedule.class.title}.`,
    });
  } catch (err: any) {
    console.error('Error enrolling student:', err);
    return NextResponse.json({ error: err.message || 'Enrollment failed' }, { status: 500 });
  }
}
