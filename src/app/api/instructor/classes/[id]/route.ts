import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendClassCancellationEmail, sendClassRescheduledEmail } from '@/lib/email';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // Schedule ID
    const body = await req.json();
    const { action, newStartTime, newEndTime, reason, location, meetingUrl, capacity } = body;

    const schedule = await prisma.classSchedule.findUnique({
      where: { id },
      include: {
        class: true,
        bookings: {
          where: { status: 'CONFIRMED' },
          include: { user: true },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Class schedule not found' }, { status: 404 });
    }

    if (action === 'CANCEL') {
      await prisma.classSchedule.update({
        where: { id },
        data: { isCancelled: true },
      });

      // Notify all booked students via email
      const scheduledTimeStr = new Date(schedule.startTime).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      schedule.bookings.forEach((b) => {
        sendClassCancellationEmail({
          to: b.user.email,
          name: b.user.name,
          classTitle: schedule.class.title,
          scheduledTime: scheduledTimeStr,
          reason,
        }).catch((e) => console.error(e));
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'CLASS_CANCELLED',
          targetType: 'CLASS_SCHEDULE',
          targetId: id,
          details: `Instructor ${session.name} cancelled session ${schedule.class.title} on ${scheduledTimeStr}. ${schedule.bookings.length} students notified.`,
        },
      });

      return NextResponse.json({ success: true, message: 'Class session cancelled and student alerts dispatched.' });
    }

    if (action === 'RESCHEDULE') {
      if (!newStartTime || !newEndTime) {
        return NextResponse.json({ error: 'New start and end time required.' }, { status: 400 });
      }

      const oldTimeStr = new Date(schedule.startTime).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const newStart = new Date(newStartTime);
      const newEnd = new Date(newEndTime);
      const newTimeStr = newStart.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });

      await prisma.classSchedule.update({
        where: { id },
        data: {
          startTime: newStart,
          endTime: newEnd,
          location: location || schedule.location,
          meetingUrl: meetingUrl !== undefined ? meetingUrl : schedule.meetingUrl,
          capacity: capacity ? parseInt(capacity, 10) : schedule.capacity,
        },
      });

      // Send rescheduling alerts
      schedule.bookings.forEach((b) => {
        sendClassRescheduledEmail({
          to: b.user.email,
          name: b.user.name,
          classTitle: schedule.class.title,
          oldTime: oldTimeStr,
          newTime: newTimeStr,
        }).catch((e) => console.error(e));
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'CLASS_RESCHEDULED',
          targetType: 'CLASS_SCHEDULE',
          targetId: id,
          details: `Instructor ${session.name} rescheduled ${schedule.class.title} from ${oldTimeStr} to ${newTimeStr}`,
        },
      });

      return NextResponse.json({ success: true, message: 'Class rescheduled and notifications sent.' });
    }

    // General schedule update (meetingUrl, location, capacity)
    const updateData: any = {};
    if (location !== undefined) updateData.location = location;
    if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity, 10);

    const updated = await prisma.classSchedule.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, schedule: updated });
  } catch (err: any) {
    console.error('Error modifying schedule:', err);
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}
