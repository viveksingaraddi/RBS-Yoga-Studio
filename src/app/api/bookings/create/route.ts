import { NextResponse } from 'next/server';
import crypto from 'crypto';
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

    const { scheduleId, notes } = await req.json();
    if (!scheduleId) {
      return NextResponse.json({ success: false, message: 'Schedule ID is required' }, { status: 400 });
    }

    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: { class: true },
    });

    if (!schedule || schedule.isCancelled) {
      return NextResponse.json({ success: false, message: 'Schedule not found or cancelled' }, { status: 404 });
    }

    // Generate unique booking number
    const randomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const bookingNumber = `RBS-${Date.now().toString().slice(-6)}-${randomCode}`;
    const amountInINR = Number(schedule.class.price);

    // Create Booking record with PENDING status
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        userId: user.userId,
        scheduleId,
        status: 'PENDING',
        amountPaid: amountInINR,
        notes: notes || null,
      },
    });

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amountInINR,
      receipt: booking.bookingNumber,
      notes: {
        bookingId: booking.id,
        userId: user.userId,
        classTitle: schedule.class.title,
      },
    });

    // Create Payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.orderId,
        bookingId: booking.id,
        amount: amountInINR,
        currency: 'INR',
        status: 'CREATED',
      },
    });

    await logAuditEvent({
      userId: user.userId,
      action: 'BOOKING_INITIATED',
      targetType: 'Booking',
      targetId: booking.id,
      details: { bookingNumber, orderId: order.orderId, amount: amountInINR },
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        amount: amountInINR,
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
    console.error('Booking create error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to initiate booking' },
      { status: 500 }
    );
  }
}
