import nodemailer from 'nodemailer';
import { prisma } from './prisma';
import { getBusinessSettings } from './settings';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  eventType: 'ENQUIRY_RECEIVED' | 'OWNER_BOOKING_ALERT' | 'BOOKING_CONFIRMED' | 'PAYMENT_RECEIVED' | 'MEMBERSHIP_ACTIVATED' | 'USER_CREDENTIALS_DISPATCH' | string;
}

export interface SendCredentialsEmailParams {
  to: string;
  name: string;
  password?: string;
  role?: string;
  isNewUser?: boolean;
  membershipPlanName?: string;
  validUntil?: string;
}

export async function sendUserCredentialsEmail({
  to,
  name,
  password,
  role = 'LEARNER',
  isNewUser = true,
  membershipPlanName,
  validUntil,
}: SendCredentialsEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const loginUrl = `${appUrl}/login`;
  const membershipUrl = `${appUrl}/memberships`;
  const passwordUpdateUrl = `${appUrl}/portal/settings`;

  const subject = membershipPlanName
    ? `[RBS Yoga Studio] Welcome & Login Credentials for ${membershipPlanName}`
    : `[RBS Yoga Studio] Welcome to RBS Yoga Studio — Your Login Credentials`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #F8F6F0; border: 1px solid #E9EDE5; padding: 32px; color: #1E3029;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #E9EDE5; padding-bottom: 20px;">
        <span style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #B69B73; font-weight: 600; display: block; margin-bottom: 6px;">The Art of Strength, Balance &amp; Wellness</span>
        <h1 style="font-family: Georgia, serif; font-size: 28px; color: #173F34; margin: 0; font-weight: normal;">RBS Yoga Studio</h1>
      </div>

      <p style="font-size: 16px; line-height: 1.6;">Namaste <strong>${name}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #1E3029;">
        Welcome to RBS Yoga Studio, guided under the leadership of <strong>Master Sangu (M.Sc. Yoga)</strong>.
        ${
          membershipPlanName
            ? `Your subscription for <strong>${membershipPlanName}</strong> has been successfully activated.`
            : `Your practitioner account has been successfully initialized.`
        }
      </p>

      <div style="background-color: #ffffff; border: 1px solid #E9EDE5; padding: 20px; margin: 24px 0; border-radius: 4px;">
        <h3 style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #173F34; margin-top: 0; margin-bottom: 14px; border-bottom: 1px solid #F8F6F0; padding-bottom: 8px;">Your Portal Login Credentials</h3>
        <p style="margin: 8px 0; font-size: 14px;"><strong>Portal Login URL:</strong> <a href="${loginUrl}" style="color: #173F34; text-decoration: underline;">${loginUrl}</a></p>
        <p style="margin: 8px 0; font-size: 14px;"><strong>Registered Email:</strong> <code style="background: #E9EDE5; padding: 2px 6px; font-size: 13px;">${to}</code></p>
        ${
          password
            ? `<p style="margin: 8px 0; font-size: 14px;"><strong>Initial Password:</strong> <code style="background: #E9EDE5; padding: 2px 6px; font-size: 13px;">${password}</code></p>`
            : `<p style="margin: 8px 0; font-size: 14px; color: #68776B;"><em>(Use the password created during your registration)</em></p>`
        }
        ${
          validUntil
            ? `<p style="margin: 8px 0; font-size: 14px;"><strong>Membership Valid Until:</strong> ${validUntil}</p>`
            : ''
        }
        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #E9EDE5; font-size: 12px; color: #68776B;">
          🔒 <strong>Security Tip:</strong> You can update your password anytime once logged in by visiting <a href="${passwordUpdateUrl}" style="color: #173F34;">Security &amp; Password Settings</a>.
        </div>
      </div>

      ${
        !membershipPlanName
          ? `
        <div style="background-color: #E9EDE5; border-left: 3px solid #B69B73; padding: 14px; margin: 20px 0; font-size: 13px; line-height: 1.5; color: #1E3029;">
          <strong>Access Notice:</strong> Student Portal video sessions, interactive livestreams, and shala bookings require an active membership or class pass.
          <br /><a href="${membershipUrl}" style="color: #173F34; font-weight: 600; text-decoration: underline;">Explore Studio Membership Plans &amp; Passes &rarr;</a>
        </div>
      `
          : ''
      }

      <div style="text-align: center; margin: 28px 0;">
        <a href="${loginUrl}" style="background-color: #173F34; color: #F8F6F0; padding: 12px 28px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; font-weight: 600; display: inline-block;">
          Sign In to Student Portal &rarr;
        </a>
      </div>

      <div style="border-top: 1px solid #E9EDE5; padding-top: 18px; margin-top: 32px; font-size: 11px; color: #68776B; line-height: 1.5; text-align: center;">
        <p style="margin: 0;">Sent officially from <strong>yogawithsangu@gmail.com</strong></p>
        <p style="margin: 4px 0 0 0;">RBS Yoga Studio · WhatsApp: +91 89513 46405 · Bangalore &amp; Global Online Shala</p>
      </div>
    </div>
  `;

  return sendEmailNotification({
    to,
    subject,
    html,
    eventType: 'USER_CREDENTIALS_DISPATCH',
  });
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
