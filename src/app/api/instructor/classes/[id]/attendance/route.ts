import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AttendanceStatus } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: scheduleId } = await params;
    const body = await req.json();
    const { userId, status = 'ATTENDED' } = body; // ATTENDED, MISSED, REGISTERED

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find or create attendance record
    const attendance = await prisma.attendance.findFirst({
      where: { scheduleId, userId },
    });

    if (attendance) {
      const updated = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          status: status as AttendanceStatus,
          confirmedAt: status === 'ATTENDED' ? new Date() : null,
        },
      });
      return NextResponse.json({ success: true, attendance: updated });
    } else {
      const created = await prisma.attendance.create({
        data: {
          userId,
          scheduleId,
          status: status as AttendanceStatus,
          confirmedAt: status === 'ATTENDED' ? new Date() : null,
        },
      });
      return NextResponse.json({ success: true, attendance: created });
    }
  } catch (err: any) {
    console.error('Error updating attendance:', err);
    return NextResponse.json({ error: err.message || 'Failed to update attendance' }, { status: 500 });
  }
}
