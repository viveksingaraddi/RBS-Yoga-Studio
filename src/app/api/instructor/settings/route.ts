import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';
import { getBusinessSettings, invalidateSettingsCache } from '@/lib/settings';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const settings = await getBusinessSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();

    const normalizedData = {
      businessName: body.businessName ?? 'RBS Yoga Studio',
      brandTagline: body.brandTagline ?? 'The Art of Strength, Balance & Wellness',
      tagline: body.brandTagline ?? 'The Art of Strength, Balance & Wellness',
      instructorName: body.instructorName ?? 'Master Sangu',
      leadInstructor: body.instructorName ?? 'Master Sangu',
      instructorBiography: body.instructorBiography ?? '',
      instructorBio: body.instructorBiography ?? '',
      publicWhatsAppNumber: body.publicWhatsAppNumber ?? '+91 89513 46405',
      whatsappNumber: body.publicWhatsAppNumber ?? '+91 89513 46405',
      publicContactPhone: body.publicContactPhone ?? '+91 89513 46405',
      contactPhone: body.publicContactPhone ?? '+91 89513 46405',
      publicContactEmail: body.publicContactEmail ?? 'yogawithsangu@gmail.com',
      contactEmail: body.publicContactEmail ?? 'yogawithsangu@gmail.com',
      adminNotificationEmail: body.adminNotificationEmail ?? 'yogawithsangu@gmail.com',
      businessAddress: body.businessAddress ?? 'RBS Studio Pavilion, Bangalore / Global Online Shala',
      address: body.businessAddress ?? 'RBS Studio Pavilion, Bangalore / Global Online Shala',
      timezone: body.timezone ?? 'Asia/Kolkata',
      currency: body.currency ?? 'INR',
      instagramUrl: body.instagramUrl ?? null,
      facebookUrl: body.facebookUrl ?? null,
      youtubeUrl: body.youtubeUrl ?? null,
      websiteUrl: body.websiteUrl ?? 'https://rbsyogastudio.com',
      notifyOnBooking: Boolean(body.notifyOnBooking),
      notifyOnEnquiry: Boolean(body.notifyOnEnquiry),
      notifyOnPayment: Boolean(body.notifyOnPayment),
      notifyOnMembership: Boolean(body.notifyOnMembership),
    };

    const updated = await prisma.businessSettings.upsert({
      where: { id: 'singleton' },
      update: normalizedData,
      create: {
        id: 'singleton',
        ...normalizedData,
      },
    });

    invalidateSettingsCache();

    await logAuditEvent({
      userId: user.userId,
      action: 'BUSINESS_SETTINGS_UPDATED',
      targetType: 'BusinessSettings',
      targetId: 'singleton',
      details: body,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update studio settings' },
      { status: 500 }
    );
  }
}
