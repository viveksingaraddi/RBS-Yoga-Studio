import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createActivationToken } from '@/lib/activation';
import { sendStudentActivationEmail } from '@/lib/email';

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

    const rawActivationToken = await createActivationToken(student.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const activationUrl = `${appUrl}/activate?token=${rawActivationToken}`;

    await sendStudentActivationEmail({
      to: student.email,
      name: student.name,
      activationUrl,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'ACTIVATION_INVITATION_RESENT',
        targetType: 'USER',
        targetId: student.id,
        details: `Instructor ${session.name} resent activation link to ${student.email}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Activation invitation successfully dispatched to ${student.email}`,
      activationUrl,
    });
  } catch (err: any) {
    console.error('Error resending activation email:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
