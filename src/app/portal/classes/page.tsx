import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ClassesClient from './ClassesClient';

export default async function ClassesPage() {
  const session = await getCurrentUser();
  if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
    redirect('/login');
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const [schedules, classes, learners] = await Promise.all([
    prisma.classSchedule.findMany({
      where: {
        startTime: { gte: startOfToday },
      },
      include: {
        class: true,
        bookings: {
          where: { status: 'CONFIRMED' },
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            attendance: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.class.findMany({
      orderBy: { title: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'LEARNER', isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const formattedSchedules = schedules.map((s) => ({
    id: s.id,
    classId: s.classId,
    title: s.class.title,
    instructor: s.class.instructor,
    deliveryType: s.deliveryType,
    location: s.location,
    meetingUrl: s.meetingUrl,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime.toISOString(),
    capacity: s.capacity,
    isCancelled: s.isCancelled,
    bookings: s.bookings.map((b) => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      userId: b.user.id,
      userName: b.user.name,
      userEmail: b.user.email,
      userPhone: b.user.phone,
      attendanceStatus: b.attendance?.status || 'REGISTERED',
    })),
  }));

  const formattedClasses = classes.map((c) => ({
    id: c.id,
    title: c.title,
    deliveryType: c.deliveryType,
    capacity: c.capacity,
    instructor: c.instructor,
  }));

  const todayCount = formattedSchedules.filter((s) => {
    const d = new Date(s.startTime);
    return d.toDateString() === now.toDateString() && !s.isCancelled;
  }).length;

  const totalReserved = formattedSchedules.reduce((acc, s) => acc + s.bookings.length, 0);

  return (
    <ClassesClient
      schedules={formattedSchedules}
      classes={formattedClasses}
      learners={learners}
      stats={{
        todayCount,
        totalActiveBatches: formattedSchedules.filter((s) => !s.isCancelled).length,
        totalReserved,
        onlineCount: formattedSchedules.filter((s) => s.deliveryType === 'ONLINE' && !s.isCancelled).length,
      }}
    />
  );
}
