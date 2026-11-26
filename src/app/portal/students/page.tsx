import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import StudentsDirectoryClient from './StudentsDirectoryClient';

export default async function StudentsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const session = await getCurrentUser();
  if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const search = resolvedParams?.q?.trim() || '';
  const status = resolvedParams?.status || 'ALL';
  const page = Math.max(1, parseInt(resolvedParams?.page || '1', 10));
  const limit = 15;
  const skip = (page - 1) * limit;

  const where: any = { role: 'LEARNER' };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status === 'ACTIVE') {
    where.isActive = true;
  } else if (status === 'INACTIVE') {
    where.isActive = false;
  }

  const [totalStudents, activePassholdersCount, plans, students] = await Promise.all([
    prisma.user.count({ where }),
    prisma.membership.count({
      where: {
        status: 'ACTIVE',
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
    }),
    prisma.membershipPlan.findMany({
      where: { isActive: true },
      select: { id: true, name: true, durationDays: true, price: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        memberships: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            plan: {
              select: {
                id: true,
                name: true,
                durationDays: true,
                price: true,
              },
            },
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            bookings: true,
            attendances: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  const formattedPlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    durationDays: p.durationDays,
    price: Number(p.price),
  }));

  const formattedStudents = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
    activeMembership: s.memberships[0]
      ? {
          planName: s.memberships[0].plan.name,
          startDate: s.memberships[0].startDate?.toISOString() || null,
          endDate: s.memberships[0].endDate?.toISOString() || null,
        }
      : null,
    totalBookings: s._count.bookings,
    totalAttendances: s._count.attendances,
    totalPayments: 0,
  }));

  return (
    <StudentsDirectoryClient
      initialStudents={formattedStudents}
      plans={formattedPlans}
      totalStudents={totalStudents}
      activePassholdersCount={activePassholdersCount}
      currentPage={page}
      totalPages={Math.ceil(totalStudents / limit)}
      initialQuery={search}
      initialStatus={status}
    />
  );
}
