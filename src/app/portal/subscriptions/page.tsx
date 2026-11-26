import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SubscriptionsClient from './SubscriptionsClient';

export default async function SubscriptionsPage() {
  const session = await getCurrentUser();
  if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
    redirect('/login');
  }

  const now = new Date();
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [plans, memberships, learners] = await Promise.all([
    prisma.membershipPlan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            memberships: { where: { status: 'ACTIVE' } },
          },
        },
      },
    }),
    prisma.membership.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        plan: true,
        payments: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: 'LEARNER', isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const formattedPlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    durationDays: p.durationDays,
    price: Number(p.price),
    benefits: p.benefits,
    includesRecordings: p.includesRecordings,
    includesLiveClasses: p.includesLiveClasses,
    isActive: p.isActive,
    activeSubscribersCount: p._count.memberships,
  }));

  const formattedMemberships = memberships.map((m) => ({
    id: m.id,
    userId: m.userId,
    userName: m.user.name,
    userEmail: m.user.email,
    userPhone: m.user.phone,
    planId: m.planId,
    planName: m.plan.name,
    durationDays: m.plan.durationDays,
    planPrice: Number(m.plan.price),
    status: m.status,
    startDate: m.startDate?.toISOString() || null,
    endDate: m.endDate?.toISOString() || null,
    createdBy: m.createdBy,
    notes: m.notes,
    createdAt: m.createdAt.toISOString(),
    payments: m.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      status: p.status,
      method: p.paymentMethod,
      receiptNumber: p.receiptNumber,
      createdAt: p.createdAt.toISOString(),
    })),
  }));

  const activeCount = formattedMemberships.filter((m) => m.status === 'ACTIVE').length;
  const pendingCount = formattedMemberships.filter((m) => m.status === 'PENDING_PAYMENT').length;
  const expiringCount = formattedMemberships.filter((m) => {
    if (m.status !== 'ACTIVE' || !m.endDate) return false;
    const end = new Date(m.endDate);
    return end >= now && end <= in14Days;
  }).length;

  return (
    <SubscriptionsClient
      plans={formattedPlans}
      memberships={formattedMemberships}
      learners={learners}
      stats={{
        activeCount,
        pendingCount,
        expiringCount,
        totalPlans: formattedPlans.length,
      }}
    />
  );
}
