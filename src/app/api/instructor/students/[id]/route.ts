import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const student = await prisma.user.findUnique({
      where: { id, role: 'LEARNER' },
      include: {
        memberships: {
          include: {
            plan: true,
            payments: {
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        bookings: {
          include: {
            schedule: {
              include: {
                class: true,
              },
            },
            payments: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        attendances: {
          include: {
            schedule: {
              include: { class: true },
            },
            liveSession: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        playbackLogs: {
          include: {
            recording: {
              select: {
                id: true,
                title: true,
                category: true,
                durationSeconds: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (err: any) {
    console.error('Error fetching student details:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, phone, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.user.update({
      where: { id, role: 'LEARNER' },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'STUDENT_UPDATED',
        targetType: 'USER',
        targetId: id,
        details: `Instructor ${session.name} updated student ${updated.email}: ${JSON.stringify(updateData)}`,
      },
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (err: any) {
    console.error('Error updating student:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
