import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('q')?.trim() || '';

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const subscriptions = await prisma.membership.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        plan: true,
        payments: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ subscriptions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      userId,
      planId,
      startDate,
      paymentStatus = 'PENDING', // PAID, PENDING
      paymentMethod = 'CASH',
      paymentAmount,
      notes,
    } = body;

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Student and Membership Plan are required.' }, { status: 400 });
    }

    const [user, plan] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.membershipPlan.findUnique({ where: { id: planId } }),
    ]);

    if (!user || !plan) {
      return NextResponse.json({ error: 'Student or Plan not found.' }, { status: 404 });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    const isPaid = paymentStatus === 'PAID';

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the membership
      const membership = await tx.membership.create({
        data: {
          userId,
          planId,
          status: isPaid ? 'ACTIVE' : 'PENDING_PAYMENT',
          startDate: isPaid ? start : null,
          endDate: isPaid ? end : null,
          createdBy: session.email,
          notes: notes?.trim() || null,
        },
      });

      // 2. If PAID, create manual payment record with receipt
      if (isPaid) {
        const amount = paymentAmount ? parseFloat(paymentAmount) : Number(plan.price);
        const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;
        await tx.payment.create({
          data: {
            orderId: `MANUAL_${Date.now()}_${userId.slice(0, 4)}`,
            paymentId: `PAY_MANUAL_${Date.now()}`,
            membershipId: membership.id,
            amount,
            status: 'CAPTURED',
            paymentMethod,
            receiptNumber,
            recordedBy: session.email,
            notes: `Manual payment confirmed during pass assignment by ${session.name}`,
          },
        });
      }

      // 3. Record Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'MEMBERSHIP_ASSIGNED',
          targetType: 'MEMBERSHIP',
          targetId: membership.id,
          details: `Instructor ${session.name} assigned ${plan.name} to ${user.name} (Status: ${isPaid ? 'ACTIVE' : 'PENDING_PAYMENT'})`,
        },
      });

      return membership;
    });

    if (isPaid) {
      sendSubscriptionConfirmationEmail({
        to: user.email,
        name: user.name,
        planName: plan.name,
        durationDays: plan.durationDays,
        amount: paymentAmount ? Number(paymentAmount) : Number(plan.price),
        validUntil: end.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      }).catch((e) => console.error('Subscription email error:', e));
    }

    return NextResponse.json({ success: true, membership: result });
  } catch (err: any) {
    console.error('Error assigning membership:', err);
    return NextResponse.json({ error: err.message || 'Failed to assign membership' }, { status: 500 });
  }
}
