import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventId = event.id || `evt_${Date.now()}`;

    // Enforce idempotency: check if event has already been processed
    const existingEvent = await prisma.paymentWebhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent && existingEvent.processed) {
      return NextResponse.json({ success: true, message: 'Event already processed' });
    }

    // Record webhook event
    await prisma.paymentWebhookEvent.upsert({
      where: { eventId },
      update: {},
      create: {
        eventId,
        eventType: event.event || 'unknown',
        payload: rawBody,
        processed: false,
      },
    });

    // Handle payment events
    const eventType = event.event;
    if (eventType === 'payment.captured') {
      const paymentPayload = event.payload.payment.entity;
      const orderId = paymentPayload.order_id;
      const paymentId = paymentPayload.id;

      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          paymentId,
          status: 'CAPTURED',
          paymentMethod: paymentPayload.method,
        },
      });
    } else if (eventType === 'payment.failed') {
      const paymentPayload = event.payload.payment.entity;
      const orderId = paymentPayload.order_id;

      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          status: 'FAILED',
          failureReason: paymentPayload.error_description || 'Payment failed',
        },
      });
    }

    // Mark event processed
    await prisma.paymentWebhookEvent.update({
      where: { eventId },
      data: { processed: true },
    });

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
