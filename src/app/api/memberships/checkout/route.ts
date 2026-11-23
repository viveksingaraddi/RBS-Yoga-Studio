import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { planSlug } = await req.json();
    if (!planSlug) {
      return NextResponse.json({ success: false, message: 'Plan slug is required' }, { status: 400 });
    }

    const plan = await prisma.membershipPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json({ success: false, message: 'Membership plan not found or inactive' }, { status: 404 });
    }

    const amountInINR = Number(plan.price);

    // Create pending membership
    const membership = await prisma.membership.create({
      data: {
        userId: user.userId,
        planId: plan.id,
        status: 'PENDING_PAYMENT',
        autoRenew: false,
      },
    });

    const receipt = `MBR-${Date.now().toString().slice(-6)}`;
    const order = await createRazorpayOrder({
      amountInINR,
      receipt,
      notes: {
        membershipId: membership.id,
        userId: user.userId,
        planName: plan.name,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.orderId,
        membershipId: membership.id,
        amount: amountInINR,
        currency: 'INR',
        status: 'CREATED',
      },
    });

    await logAuditEvent({
      userId: user.userId,
      action: 'MEMBERSHIP_ORDER_CREATED',
      targetType: 'Membership',
      targetId: membership.id,
      details: { planSlug, amount: amountInINR, orderId: order.orderId },
    });

    return NextResponse.json({
      success: true,
      membershipId: membership.id,
      plan: {
        name: plan.name,
        price: amountInINR,
        durationDays: plan.durationDays,
      },
      order: {
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        keyId: order.keyId,
        isTestMode: order.isTestMode,
      },
    });
  } catch (error: any) {
    console.error('Membership checkout error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to initialize membership checkout' },
      { status: 500 }
    );
  }
}
