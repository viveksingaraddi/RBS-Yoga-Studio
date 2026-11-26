import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MembershipClient from './MembershipClient';
import { redirect } from 'next/navigation';

export default async function MyMembershipPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login');
  }

  const now = new Date();

  const [activeMembership, pastMemberships, payments] = await Promise.all([
    // Active membership
    prisma.membership.findFirst({
      where: {
        userId: session.userId,
        status: 'ACTIVE',
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Past memberships
    prisma.membership.findMany({
      where: {
        userId: session.userId,
        NOT: {
          AND: [
            { status: 'ACTIVE' },
            { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          ],
        },
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Payments associated with user's memberships or bookings
    prisma.payment.findMany({
      where: {
        OR: [
          { membership: { userId: session.userId } },
          { booking: { userId: session.userId } },
        ],
      },
      include: {
        membership: {
          include: { plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const formattedPayments = payments.map((p) => ({
    id: p.id,
    orderId: p.orderId,
    paymentId: p.paymentId,
    receiptNumber: p.receiptNumber,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status,
    paymentMethod: p.paymentMethod,
    createdAt: p.createdAt.toISOString(),
    membershipPlanName: p.membership?.plan?.name,
  }));

  const formattedActive = activeMembership
    ? {
        ...activeMembership,
        startDate: activeMembership.startDate?.toISOString() || null,
        endDate: activeMembership.endDate?.toISOString() || null,
        createdAt: activeMembership.createdAt.toISOString(),
      }
    : null;

  const formattedPast = pastMemberships.map((m) => ({
    ...m,
    startDate: m.startDate?.toISOString() || null,
    endDate: m.endDate?.toISOString() || null,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <MembershipClient
      activeMembership={formattedActive}
      pastMemberships={formattedPast}
      payments={formattedPayments}
      userName={session.name}
      userEmail={session.email}
    />
  );
}
