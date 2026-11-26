import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendPaymentConfirmationEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('q')?.trim() || '';

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { orderId: { contains: search, mode: 'insensitive' } },
        { receiptNumber: { contains: search, mode: 'insensitive' } },
        { membership: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { booking: { user: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [
      payments,
      totalCollectedAgg,
      currentMonthAgg,
      prevMonthAgg,
      yearlyAgg,
      pendingAgg,
      refundedAgg,
    ] = await Promise.all([
      prisma.payment.findMany({
        where,
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
    ]);

    return NextResponse.json({
      payments,
      aggregates: {
        totalCollected: Number(totalCollectedAgg._sum.amount || 0),
        currentMonth: Number(currentMonthAgg._sum.amount || 0),
        previousMonth: Number(prevMonthAgg._sum.amount || 0),
        yearlyRevenue: Number(yearlyAgg._sum.amount || 0),
        pendingAmount: Number(pendingAgg._sum.amount || 0),
        refundedAmount: Number(refundedAgg._sum.amount || 0),
      },
    });
  } catch (err: any) {
    console.error('Error fetching payments:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch payments' }, { status: 500 });
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
      amount,
      paymentMethod = 'CASH', // CASH, UPI, BANK_TRANSFER, RAZORPAY_OFFLINE
      membershipId,
      bookingId,
      receiptNumber: customReceipt,
      notes,
    } = body;

    if (!amount || (!membershipId && !bookingId && !userId)) {
      return NextResponse.json({ error: 'Amount and student/membership are required.' }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    const receiptNumber = customReceipt?.trim() || `REC-${Date.now().toString().slice(-6)}`;
    const orderId = `MANUAL_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const paymentId = `PAY_${Date.now()}`;

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          orderId,
          paymentId,
          amount: numAmount,
          currency: 'INR',
          status: 'CAPTURED',
          paymentMethod,
          receiptNumber,
          recordedBy: session.email,
          notes: notes?.trim() || `Manual payment recorded by ${session.name}`,
          membershipId: membershipId || null,
          bookingId: bookingId || null,
        },
        include: {
          membership: { include: { user: true, plan: true } },
          booking: { include: { user: true } },
        },
      });

      // If associated with a membership that is pending payment, activate it!
      if (membershipId) {
        const membership = await tx.membership.findUnique({
          where: { id: membershipId },
          include: { plan: true },
        });

        if (membership && membership.status === 'PENDING_PAYMENT') {
          const now = new Date();
          const end = new Date(now.getTime() + membership.plan.durationDays * 24 * 60 * 60 * 1000);
          await tx.membership.update({
            where: { id: membershipId },
            data: {
              status: 'ACTIVE',
              startDate: now,
              endDate: end,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'MANUAL_PAYMENT_RECORDED',
          targetType: 'PAYMENT',
          targetId: p.id,
          details: `Instructor ${session.name} recorded manual payment of ₹${numAmount} (#${receiptNumber}, ${paymentMethod})`,
        },
      });

      return p;
    });

    // Send receipt email to student
    const studentUser = payment.membership?.user || payment.booking?.user;
    if (studentUser) {
      sendPaymentConfirmationEmail({
        to: studentUser.email,
        name: studentUser.name,
        amount: numAmount,
        orderId,
        paymentId,
        receiptNumber,
      }).catch((e) => console.error('Error sending payment receipt email:', e));
    }

    return NextResponse.json({ success: true, payment });
  } catch (err: any) {
    console.error('Error recording payment:', err);
    return NextResponse.json({ error: err.message || 'Failed to record payment' }, { status: 500 });
  }
}
