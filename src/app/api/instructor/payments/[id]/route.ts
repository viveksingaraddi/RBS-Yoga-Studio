import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { action, notes } = body;

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (action === 'REFUND') {
      const updated = await prisma.payment.update({
        where: { id },
        data: {
          status: 'REFUNDED',
          notes: notes || `Refunded by ${session.name} on ${new Date().toISOString()}`,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'PAYMENT_REFUNDED',
          targetType: 'PAYMENT',
          targetId: id,
          details: `Instructor ${session.name} marked payment of ₹${payment.amount} (#${payment.receiptNumber}) as REFUNDED.`,
        },
      });

      return NextResponse.json({ success: true, payment: updated, message: 'Payment marked as REFUNDED.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Error modifying payment:', err);
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}
