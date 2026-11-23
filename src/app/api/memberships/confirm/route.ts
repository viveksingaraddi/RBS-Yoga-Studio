import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendEmailNotification } from '@/lib/email';
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

    // Send confirmation email
    sendEmailNotification({
      to: membership.user.email,
      subject: `[Membership Activated] Welcome to ${membership.plan.name} - RBS Yoga Studio`,
      html: `
        <div style="font-family: serif; color: #1E3029; max-width: 600px; padding: 24px; border: 1px solid #E9EDE5;">
          <h2 style="color: #173F34;">Welcome to RBS Yoga Studio Membership</h2>
          <p>Namaste <strong>${membership.user.name}</strong>,</p>
          <p>Your <strong>${membership.plan.name}</strong> is now officially active!</p>
          <hr style="border: 0; border-top: 1px solid #E9EDE5; margin: 16px 0;" />
          <p><strong>Plan:</strong> ${membership.plan.name}</p>
          <p><strong>Duration:</strong> ${membership.plan.durationDays} Days</p>
          <p><strong>Valid Until:</strong> ${endDate.toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
          <p><strong>Privileges:</strong> Unlimited Library Access & Live Sessions</p>
          <hr style="border: 0; border-top: 1px solid #E9EDE5; margin: 16px 0;" />
          <p style="font-size: 13px; color: #68776B;">You can now access your learner portal to stream on-demand video sessions and reserve upcoming classes.</p>
        </div>
      `,
      eventType: 'MEMBERSHIP_ACTIVATED',
    });

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
