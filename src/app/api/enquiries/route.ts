import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendEmailNotification } from '@/lib/email';
import { createWhatsAppEnquiryLink } from '@/lib/whatsapp';

const enquirySchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  email: z.string().email().optional().or(z.literal('')),
  interestedProgram: z.string().optional().nullable(),
  preferredType: z.enum(['PHYSICAL', 'ONLINE', 'HYBRID']).default('PHYSICAL'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = enquirySchema.parse(body);

    // 1. Save enquiry to database with status NEW
    const enquiry = await prisma.enquiry.create({
      data: {
        fullName: validated.fullName,
        phone: validated.phone,
        email: validated.email || null,
        interestedProgram: validated.interestedProgram || null,
        preferredType: validated.preferredType,
        message: validated.message,
        status: 'NEW',
        whatsappClicked: true,
      },
    });

    // 2. Fetch business settings to get notification email & WhatsApp number
    const settings = await prisma.businessSettings.findUnique({
      where: { id: 'singleton' },
    });

    const ownerEmail = settings?.adminNotificationEmail || process.env.OWNER_NOTIFICATION_EMAIL || settings?.contactEmail || 'owner@rbsyogastudio.com';
    const rawWhatsApp = settings?.publicWhatsAppNumber || settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '+91 89513 46405';
    const whatsappNumber = rawWhatsApp.replace(/\D/g, '') || '918951346405';

    // 3. Dispatch notification email event for studio owner
    await sendEmailNotification({
      to: ownerEmail,
      subject: `[New Enquiry] ${validated.fullName} - ${validated.interestedProgram || 'General Enquiry'}`,
      html: `
        <div style="font-family: serif; color: #1E3029; max-width: 600px; padding: 24px; border: 1px solid #E9EDE5;">
          <h2 style="color: #173F34; margin-bottom: 8px;">New Enquiry for RBS Yoga Studio</h2>
          <p style="color: #68776B; font-size: 14px; margin-top: 0;">Lead Instructor: Master Sangu</p>
          <hr style="border: 0; border-top: 1px solid #E9EDE5; margin: 16px 0;" />
          <p><strong>Name:</strong> ${validated.fullName}</p>
          <p><strong>Phone:</strong> ${validated.phone}</p>
          ${validated.email ? `<p><strong>Email:</strong> ${validated.email}</p>` : ''}
          <p><strong>Interested Program:</strong> ${validated.interestedProgram || 'General'}</p>
          <p><strong>Preferred Mode:</strong> ${validated.preferredType}</p>
          <p><strong>Message:</strong><br />${validated.message}</p>
          <hr style="border: 0; border-top: 1px solid #E9EDE5; margin: 16px 0;" />
          <p style="font-size: 12px; color: #888;">Enquiry ID: ${enquiry.id} | Status: NEW</p>
        </div>
      `,
      eventType: 'ENQUIRY_RECEIVED',
    });

    // 4. Generate the prefilled WhatsApp link
    const whatsappUrl = createWhatsAppEnquiryLink({
      phone: whatsappNumber,
      fullName: validated.fullName,
      program: validated.interestedProgram,
      preferredType: validated.preferredType,
      message: validated.message,
    });

    return NextResponse.json({
      success: true,
      enquiryId: enquiry.id,
      whatsappUrl,
      message: 'Enquiry recorded successfully.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Enquiry error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while processing enquiry.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ success: true, enquiries });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch enquiries' },
      { status: 500 }
    );
  }
}
