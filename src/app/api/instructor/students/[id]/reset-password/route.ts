import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createPasswordResetToken } from '@/lib/activation';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(
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
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const rawResetToken = await createPasswordResetToken(student.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${rawResetToken}`;

    await sendPasswordResetEmail({
      to: student.email,
      name: student.name,
      resetUrl,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'PASSWORD_RESET_TRIGGERED',
        targetType: 'USER',
        targetId: student.id,
        details: `Instructor ${session.name} triggered password reset email for ${student.email}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Password reset email dispatched to ${student.email}`,
      resetUrl,
    });
  } catch (err: any) {
    console.error('Error triggering password reset:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
