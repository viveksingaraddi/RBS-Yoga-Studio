import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, extensionDays = 30, paymentMethod = 'CASH', paymentAmount, notes } = body;

    const membership = await prisma.membership.findUnique({
      where: { id },
      include: { user: true, plan: true },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Membership record not found' }, { status: 404 });
    }

    const now = new Date();

    if (action === 'CONFIRM_PAYMENT') {
      // Transition from PENDING_PAYMENT to ACTIVE
      const start = membership.startDate || now;
      const end = membership.endDate || new Date(start.getTime() + membership.plan.durationDays * 24 * 60 * 60 * 1000);
      const amount = paymentAmount ? parseFloat(paymentAmount) : Number(membership.plan.price);
      const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;

      await prisma.$transaction([
        prisma.membership.update({
          where: { id },
          data: {
            status: 'ACTIVE',
            startDate: start,
            endDate: end,
          },
        }),
        prisma.payment.create({
          data: {
            orderId: `MANUAL_${Date.now()}_${membership.userId.slice(0, 4)}`,
            paymentId: `PAY_MANUAL_${Date.now()}`,
            membershipId: membership.id,
            amount,
            status: 'CAPTURED',
            paymentMethod,
            receiptNumber,
            recordedBy: session.email,
            notes: notes || `Manual payment confirmed by ${session.name}`,
          },
        }),
        prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: 'MEMBERSHIP_PAYMENT_CONFIRMED',
            targetType: 'MEMBERSHIP',
            targetId: id,
            details: `Instructor ${session.name} confirmed manual payment of ₹${amount} for ${membership.user.name} (${membership.plan.name})`,
          },
        }),
      ]);

      sendSubscriptionConfirmationEmail({
        to: membership.user.email,
        name: membership.user.name,
        planName: membership.plan.name,
        durationDays: membership.plan.durationDays,
        amount,
        validUntil: end.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      }).catch((e) => console.error(e));

      return NextResponse.json({ success: true, message: 'Payment confirmed and pass activated.' });
    }

    if (action === 'EXTEND') {
      // Add custom days to existing endDate
      const currentEnd = membership.endDate && membership.endDate > now ? membership.endDate : now;
      const newEnd = new Date(currentEnd.getTime() + parseInt(extensionDays, 10) * 24 * 60 * 60 * 1000);

      await prisma.$transaction([
        prisma.membership.update({
          where: { id },
          data: {
            status: 'ACTIVE',
            endDate: newEnd,
          },
        }),
        prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: 'MEMBERSHIP_EXTENDED',
            targetType: 'MEMBERSHIP',
            targetId: id,
            details: `Instructor ${session.name} extended ${membership.user.name}'s pass by ${extensionDays} days until ${newEnd.toISOString()}`,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: `Pass extended by ${extensionDays} days.` });
    }

    if (action === 'RENEW') {
      // Extend by full duration of plan
      const currentEnd = membership.endDate && membership.endDate > now ? membership.endDate : now;
      const newEnd = new Date(currentEnd.getTime() + membership.plan.durationDays * 24 * 60 * 60 * 1000);
      const amount = paymentAmount ? parseFloat(paymentAmount) : Number(membership.plan.price);
      const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;

      await prisma.$transaction([
        prisma.membership.update({
          where: { id },
          data: {
            status: 'ACTIVE',
            endDate: newEnd,
          },
        }),
        prisma.payment.create({
          data: {
            orderId: `MANUAL_RENEW_${Date.now()}_${membership.userId.slice(0, 4)}`,
            paymentId: `PAY_RENEW_${Date.now()}`,
            membershipId: membership.id,
            amount,
            status: 'CAPTURED',
            paymentMethod,
            receiptNumber,
            recordedBy: session.email,
            notes: notes || `Renewal payment recorded by ${session.name}`,
          },
        }),
        prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: 'MEMBERSHIP_RENEWED',
            targetType: 'MEMBERSHIP',
            targetId: id,
            details: `Instructor ${session.name} renewed pass for ${membership.user.name} (${membership.plan.name}) for ₹${amount}`,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: 'Membership pass renewed successfully.' });
    }

    if (action === 'CANCEL') {
      await prisma.$transaction([
        prisma.membership.update({
          where: { id },
          data: { status: 'CANCELLED' },
        }),
        prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: 'MEMBERSHIP_CANCELLED',
            targetType: 'MEMBERSHIP',
            targetId: id,
            details: `Instructor ${session.name} cancelled membership pass for ${membership.user.name} (${membership.plan.name})`,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: 'Membership pass cancelled.' });
    }

    return NextResponse.json({ error: 'Unknown action specified' }, { status: 400 });
  } catch (err: any) {
    console.error('Error modifying membership:', err);
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}
