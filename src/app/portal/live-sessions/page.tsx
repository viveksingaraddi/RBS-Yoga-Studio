import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import LiveSessionsClient from './LiveSessionsClient';

export default async function LiveSessionsPage() {
  const session = await getCurrentUser();
  if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
    redirect('/login');
  }

  const now = new Date();

  const [sessions, schedules] = await Promise.all([
    prisma.liveSession.findMany({
      include: {
        _count: {
          select: { attendances: true },
        },
      },
      orderBy: { startTime: 'desc' },
    }),
    prisma.classSchedule.findMany({
      where: {
        startTime: { gte: now },
        isCancelled: false,
      },
      include: { class: { select: { title: true } } },
      orderBy: { startTime: 'asc' },
      take: 10,
    }),
  ]);

  const formattedSessions = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    instructor: s.instructor,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime.toISOString(),
    durationMinutes: s.durationMinutes,
    meetingProvider: s.meetingProvider,
    meetingUrl: s.meetingUrl || '',
    requiresMembership: s.requiresMembership,
    status: s.status,
    attendeesCount: s._count.attendances,
  }));

  const formattedSchedules = schedules.map((sc) => ({
    id: sc.id,
    title: sc.class.title,
    startTime: sc.startTime.toISOString(),
  }));

  const liveNowCount = formattedSessions.filter((s) => s.status === 'LIVE').length;
  const upcomingCount = formattedSessions.filter((s) => s.status === 'SCHEDULED' && new Date(s.startTime) >= now).length;
  const completedCount = formattedSessions.filter((s) => s.status === 'COMPLETED').length;

  return (
    <LiveSessionsClient
      sessions={formattedSessions}
      schedules={formattedSchedules}
      stats={{
        liveNowCount,
        upcomingCount,
        completedCount,
        totalSessions: formattedSessions.length,
      }}
    />
  );
}
