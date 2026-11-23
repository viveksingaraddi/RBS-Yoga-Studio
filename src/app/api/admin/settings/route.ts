import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const settings = await prisma.businessSettings.findUnique({
    where: { id: 'singleton' },
  });
  return NextResponse.json({ success: true, settings });
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();

    const normalizedData = {
      ...body,
      // Synchronize backward-compatibility fields
      tagline: body.brandTagline || body.tagline,
      leadInstructor: body.instructorName || body.leadInstructor,
      instructorBio: body.instructorBiography || body.instructorBio,
      contactPhone: body.publicContactPhone || body.contactPhone,
      whatsappNumber: body.publicWhatsAppNumber || body.whatsappNumber,
      contactEmail: body.publicContactEmail || body.contactEmail,
      address: body.businessAddress || body.address,
    };

    const updated = await prisma.businessSettings.upsert({
      where: { id: 'singleton' },
      update: normalizedData,
      create: {
        id: 'singleton',
        ...normalizedData,
      },
    });

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
      { success: false, message: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
