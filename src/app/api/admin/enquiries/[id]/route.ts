import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id: enquiryId } = await params;
    const { status, internalNotes } = await req.json();

    const updated = await prisma.enquiry.update({
      where: { id: enquiryId },
      data: {
        ...(status ? { status } : {}),
        ...(internalNotes !== undefined ? { internalNotes } : {}),
      },
    });

    await logAuditEvent({
      userId: user.userId,
      action: 'ENQUIRY_UPDATED',
      targetType: 'Enquiry',
      targetId: enquiryId,
      details: { status, internalNotes },
    });

    return NextResponse.json({ success: true, enquiry: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update enquiry' },
      { status: 500 }
    );
  }
}
