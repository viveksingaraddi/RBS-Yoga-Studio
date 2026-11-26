import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendEmailNotification, sendUserCredentialsEmail } from '@/lib/email';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { membershipId, orderId, paymentId, signature } = await req.json();

    if (!membershipId || !orderId || !paymentId) {
      return NextResponse.json(
        { success: false, message: 'Missing parameters for membership activation' },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature(orderId, paymentId, signature || 'test_verified');
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid payment signature' }, { status: 400 });
    }

    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      include: { plan: true, user: true },
    });

    if (!membership) {
      return NextResponse.json({ success: false, message: 'Membership not found' }, { status: 404 });
    }

    if (membership.status === 'ACTIVE') {
      return NextResponse.json({ success: true, message: 'Membership is already active' });
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + membership.plan.durationDays);

    // Concurrency safe transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update Payment status
      await tx.payment.updateMany({
        where: { orderId },
        data: {
          paymentId,
          signature: signature || 'test_verified',
          status: 'CAPTURED',
        },
      });

      // 2. Activate membership
      await tx.membership.update({
        where: { id: membershipId },
        data: {
          status: 'ACTIVE',
          startDate: now,
          endDate,
        },
      });

      // 3. Log membership history
      await tx.membershipHistory.create({
        data: {
          membershipId,
          fromStatus: 'PENDING_PAYMENT',
          toStatus: 'ACTIVE',
          reason: 'Verified payment confirmation',
        },
      });
    });

    // Send confirmation and credentials access email from yogawithsangu@gmail.com
    sendUserCredentialsEmail({
      to: membership.user.email,
      name: membership.user.name,
      role: 'LEARNER',
      isNewUser: false,
      membershipPlanName: membership.plan.name,
      validUntil: endDate.toLocaleDateString('en-IN', { dateStyle: 'full' }),
    }).catch((err) => console.error('Failed to send membership activation credentials email:', err));

    await logAuditEvent({
      userId: user.userId,
      action: 'MEMBERSHIP_ACTIVATED',
      targetType: 'Membership',
      targetId: membershipId,
      details: { planName: membership.plan.name, orderId, paymentId },
    });

    return NextResponse.json({
      success: true,
      membershipId,
      status: 'ACTIVE',
      endDate: endDate.toISOString(),
      message: 'Membership activated successfully!',
    });
  } catch (error: any) {
    console.error('Membership confirm error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Membership activation failed' },
      { status: 500 }
    );
  }
}
