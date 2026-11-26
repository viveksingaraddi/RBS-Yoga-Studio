import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import PaymentsClient from './PaymentsClient';

export default async function PaymentsPage() {
  const session = await getCurrentUser();
  if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
    redirect('/login');
  }

  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    payments,
    totalCollectedAgg,
    currentMonthAgg,
    prevMonthAgg,
    yearlyAgg,
    pendingAgg,
    refundedAgg,
    pendingMemberships,
    learners,
  ] = await Promise.all([
    prisma.payment.findMany({
      include: {
        membership: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            plan: true,
          },
        },
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            schedule: { include: { class: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 60,
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'CAPTURED' },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'CAPTURED', createdAt: { gte: startOfCurrentMonth } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'CAPTURED',
        createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'CAPTURED', createdAt: { gte: startOfYear } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: { in: ['CREATED', 'AUTHORIZED'] } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'REFUNDED' },
    }),
    prisma.membership.findMany({
      where: { status: 'PENDING_PAYMENT' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, name: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: 'LEARNER', isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const formattedPayments = payments.map((p) => {
    const studentUser = p.membership?.user || p.booking?.user;
    const title = p.membership
      ? `Membership: ${p.membership.plan.name}`
      : p.booking
      ? `Class Pass: ${p.booking.schedule.class.title}`
      : 'Studio Payment';

    return {
      id: p.id,
      orderId: p.orderId,
      paymentId: p.paymentId,
      receiptNumber: p.receiptNumber,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      paymentMethod: p.paymentMethod || 'Online',
      title,
      studentName: studentUser?.name || 'Walk-in Practitioner',
      studentEmail: studentUser?.email || '—',
      recordedBy: p.recordedBy,
      notes: p.notes,
      createdAt: p.createdAt.toISOString(),
    };
  });

  const formattedPending = pendingMemberships.map((m) => ({
    id: m.id,
    studentName: m.user.name,
    studentEmail: m.user.email,
    planName: m.plan.name,
    planPrice: Number(m.plan.price),
  }));

  return (
    <PaymentsClient
      payments={formattedPayments}
      pendingMemberships={formattedPending}
      learners={learners}
      aggregates={{
        totalCollected: Number(totalCollectedAgg._sum.amount || 0),
        currentMonth: Number(currentMonthAgg._sum.amount || 0),
        previousMonth: Number(prevMonthAgg._sum.amount || 0),
        yearlyRevenue: Number(yearlyAgg._sum.amount || 0),
        pendingAmount: Number(pendingAgg._sum.amount || 0),
        refundedAmount: Number(refundedAgg._sum.amount || 0),
      }}
    />
  );
}
