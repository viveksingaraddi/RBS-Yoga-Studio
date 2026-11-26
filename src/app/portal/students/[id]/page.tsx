import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import StudentProfileClient from './StudentProfileClient';

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentUser();
  if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
    redirect('/login');
  }

  const { id } = await params;

  const student = await prisma.user.findUnique({
    where: { id, role: 'LEARNER' },
    include: {
      memberships: {
        include: {
          plan: true,
          payments: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      bookings: {
        include: {
          schedule: {
            include: {
              class: true,
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      attendances: {
        include: {
          schedule: {
            include: { class: true },
          },
          liveSession: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      playbackLogs: {
        include: {
          recording: {
            select: {
              id: true,
              title: true,
              category: true,
              durationSeconds: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      },
    },
  });

  if (!student) {
    notFound();
  }

  const formattedMemberships = student.memberships.map((m) => ({
    id: m.id,
    planName: m.plan.name,
    status: m.status,
    startDate: m.startDate?.toISOString() || null,
    endDate: m.endDate?.toISOString() || null,
    price: Number(m.plan.price),
    notes: m.notes,
    payments: m.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      status: p.status,
      method: p.paymentMethod,
      receiptNumber: p.receiptNumber,
      createdAt: p.createdAt.toISOString(),
    })),
  }));

  const formattedBookings = student.bookings.map((b) => ({
    id: b.id,
    bookingNumber: b.bookingNumber,
    classTitle: b.schedule.class.title,
    instructor: b.schedule.class.instructor,
    deliveryType: b.schedule.deliveryType,
    startTime: b.schedule.startTime.toISOString(),
    endTime: b.schedule.endTime.toISOString(),
    location: b.schedule.location,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }));

  const formattedAttendances = student.attendances.map((a) => ({
    id: a.id,
    title: a.schedule?.class.title || a.liveSession?.title || 'Yoga Sadhana',
    status: a.status,
    type: a.schedule ? 'IN_STUDIO' : 'ONLINE_LIVE',
    date: a.createdAt.toISOString(),
  }));

  const formattedLogs = student.playbackLogs.map((l) => ({
    id: l.id,
    title: l.recording.title,
    category: l.recording.category,
    watchedSeconds: l.watchedSeconds,
    durationSeconds: l.recording.durationSeconds,
    isCompleted: l.isCompleted,
    updatedAt: l.updatedAt.toISOString(),
  }));

  return (
    <StudentProfileClient
      student={{
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        isActive: student.isActive,
        createdAt: student.createdAt.toISOString(),
        memberships: formattedMemberships,
        bookings: formattedBookings,
        attendances: formattedAttendances,
        playbackLogs: formattedLogs,
      }}
    />
  );
}
