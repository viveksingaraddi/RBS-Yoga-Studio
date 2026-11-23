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

    const { bookingId, orderId, paymentId, signature } = await req.json();

    if (!bookingId || !orderId || !paymentId) {
      return NextResponse.json(
        { success: false, message: 'Missing payment confirmation parameters' },
        { status: 400 }
      );
    }

    // 1. Verify Razorpay signature server-side
    const isValidSignature = verifyRazorpaySignature(orderId, paymentId, signature || 'test_verified');
    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, message: 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    // 2. Perform atomic transaction to confirm booking and update schedule count
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          schedule: {
            include: {
              class: true,
            },
          },
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status === 'CONFIRMED') {
        return { booking, alreadyConfirmed: true };
      }

      // Update payment record
      await tx.payment.updateMany({
        where: { orderId },
        data: {
          paymentId,
          signature: signature || 'test_verified',
          status: 'CAPTURED',
        },
      });

      // Update booking to CONFIRMED
      const confirmedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
        },
      });

      // Increment bookedCount on schedule
      await tx.classSchedule.update({
        where: { id: booking.scheduleId },
        data: {
          bookedCount: { increment: 1 },
        },
      });

      // Clear any hold for this user & schedule
      await tx.bookingHold.deleteMany({
        where: {
          scheduleId: booking.scheduleId,
          userId: user.userId,
        },
      });

      // Create attendance entry
      await tx.attendance.create({
        data: {
          userId: user.userId,
          scheduleId: booking.scheduleId,
          bookingId: booking.id,
          status: 'REGISTERED',
        },
      });

      return { booking, alreadyConfirmed: false };
    });

    const booking = result.booking;
    const schedule = booking.schedule;

    // Send emails asynchronously without blocking
    if (!result.alreadyConfirmed) {
      const formattedDate = new Date(schedule.startTime).toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      });

      // Learner Confirmation Email
      sendEmailNotification({
        to: booking.user.email,
        subject: `[Booking Confirmed] ${schedule.class.title} - RBS Yoga Studio`,
        html: `
          <div style="font-family: serif; color: #1E3029; max-width: 600px; padding: 24px; border: 1px solid #E9EDE5;">
            <h2 style="color: #173F34;">Your Booking is Confirmed</h2>
            <p>Namaste <strong>${booking.user.name}</strong>,</p>
            <p>Your mat has been reserved for the upcoming session with Master Sangu.</p>
            <hr style="border: 0; border-top: 1px solid #E9EDE5; margin: 16px 0;" />
            <p><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
            <p><strong>Class:</strong> ${schedule.class.title}</p>
            <p><strong>Schedule:</strong> ${formattedDate} (IST)</p>
            <p><strong>Format:</strong> ${schedule.deliveryType}</p>
            <p><strong>Location:</strong> ${schedule.location || 'RBS Studio Shala'}</p>
            <hr style="border: 0; border-top: 1px solid #E9EDE5; margin: 16px 0;" />
            <p style="font-size: 13px; color: #68776B;">Please arrive 10 minutes early with comfortable attire and an open mind. We look forward to practicing with you.</p>
          </div>
        `,
        eventType: 'BOOKING_CONFIRMED',
      });

      // Owner Notification Email
      const settings = await prisma.businessSettings.findUnique({ where: { id: 'singleton' } });
      const ownerEmail = settings?.adminNotificationEmail || process.env.OWNER_NOTIFICATION_EMAIL || 'owner@rbsyogastudio.com';
      sendEmailNotification({
        to: ownerEmail,
        subject: `[New Class Booking] ${booking.user.name} - ${schedule.class.title}`,
        html: `
          <div style="font-family: serif; color: #1E3029; max-width: 600px; padding: 24px; border: 1px solid #E9EDE5;">
            <h3 style="color: #173F34;">New Confirmed Class Booking</h3>
            <p><strong>Learner:</strong> ${booking.user.name} (${booking.user.email})</p>
            <p><strong>Booking ID:</strong> ${booking.bookingNumber}</p>
            <p><strong>Class:</strong> ${schedule.class.title}</p>
            <p><strong>Date/Time:</strong> ${formattedDate}</p>
            <p><strong>Amount:</strong> ₹${Number(booking.amountPaid)}</p>
          </div>
        `,
        eventType: 'OWNER_BOOKING_ALERT',
      });

      await logAuditEvent({
        userId: user.userId,
        action: 'BOOKING_CONFIRMED',
        targetType: 'Booking',
        targetId: booking.id,
        details: { bookingNumber: booking.bookingNumber, paymentId, orderId },
      });
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      status: 'CONFIRMED',
      message: 'Booking successfully confirmed!',
    });
  } catch (error: any) {
    console.error('Booking confirm error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Payment confirmation failed' },
      { status: 500 }
    );
  }
}
