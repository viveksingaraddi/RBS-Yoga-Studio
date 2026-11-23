import nodemailer from 'nodemailer';
import { prisma } from './prisma';
import { getBusinessSettings } from './settings';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  eventType: 'ENQUIRY_RECEIVED' | 'OWNER_BOOKING_ALERT' | 'BOOKING_CONFIRMED' | 'PAYMENT_RECEIVED' | 'MEMBERSHIP_ACTIVATED' | string;
}

export async function sendEmailNotification({
  to,
  subject,
  html,
  eventType,
}: SendEmailParams) {
  // Check business settings for notification toggles if sending to admin
  const settings = await getBusinessSettings();

  if (eventType === 'ENQUIRY_RECEIVED' && !settings.notifyOnEnquiry) {
    console.log(`[Email Notification Suppressed: ${eventType} disabled in settings]`);
    return { success: true, suppressed: true };
  }

  if (eventType === 'OWNER_BOOKING_ALERT' && !settings.notifyOnBooking) {
    console.log(`[Email Notification Suppressed: ${eventType} disabled in settings]`);
    return { success: true, suppressed: true };
  }

  if (eventType === 'PAYMENT_RECEIVED' && !settings.notifyOnPayment) {
    console.log(`[Email Notification Suppressed: ${eventType} disabled in settings]`);
    return { success: true, suppressed: true };
  }

  if (eventType === 'MEMBERSHIP_ACTIVATED' && to === settings.adminNotificationEmail && !settings.notifyOnMembership) {
    console.log(`[Email Notification Suppressed: ${eventType} disabled in settings]`);
    return { success: true, suppressed: true };
  }

  // 1. Create a notification record in database
  const notification = await prisma.notification.create({
    data: {
      recipient: to,
      subject,
      content: html,
      eventType,
      status: 'QUEUED',
    },
  });

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || `"${settings.businessName}" <${settings.publicContactEmail}>`;

  // 2. Option A: Gmail SMTP / Custom SMTP via Nodemailer
  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${settings.businessName}" <${gmailUser}>`,
        to,
        subject,
        html,
      });

      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENT', sentAt: new Date() },
      });

      await prisma.emailDeliveryLog.create({
        data: {
          notificationId: notification.id,
          provider: 'GMAIL_SMTP',
          responseId: info.messageId,
          statusCode: 200,
        },
      });

      return { success: true, id: info.messageId, provider: 'GMAIL_SMTP' };
    } catch (err: any) {
      console.error('Gmail SMTP Delivery Error:', err);
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'FAILED', error: err.message },
      });

      await prisma.emailDeliveryLog.create({
        data: {
          notificationId: notification.id,
          provider: 'GMAIL_SMTP',
          statusCode: 500,
          errorMessage: err.message,
        },
      });

      return { success: false, error: err.message };
    }
  }

  // 3. Option B: Resend API Delivery
  if (resendApiKey && !resendApiKey.startsWith('re_test_mock')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [to],
          subject,
          html,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'SENT', sentAt: new Date() },
        });

        await prisma.emailDeliveryLog.create({
          data: {
            notificationId: notification.id,
            provider: 'RESEND',
            responseId: data.id,
            statusCode: response.status,
          },
        });
        return { success: true, id: data.id, provider: 'RESEND' };
      } else {
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'FAILED', error: JSON.stringify(data) },
        });

        await prisma.emailDeliveryLog.create({
          data: {
            notificationId: notification.id,
            provider: 'RESEND',
            statusCode: response.status,
            errorMessage: JSON.stringify(data),
          },
        });
        return { success: false, error: data };
      }
    } catch (err: any) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'FAILED', error: err.message },
      });
      return { success: false, error: err.message };
    }
  }

  // 4. Option C: Logged Developer Delivery
  console.log(`[Email Notification Logged: ${eventType}] to=${to} subject="${subject}"`);
  await prisma.notification.update({
    where: { id: notification.id },
    data: { status: 'SENT', sentAt: new Date() },
  });
  await prisma.emailDeliveryLog.create({
    data: {
      notificationId: notification.id,
      provider: 'DEV_LOGGER',
      statusCode: 200,
      responseId: `mock_email_${Date.now()}`,
    },
  });

  return { success: true, id: notification.id, provider: 'DEV_LOGGER' };
}
