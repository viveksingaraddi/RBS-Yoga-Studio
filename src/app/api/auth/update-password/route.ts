import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, comparePassword, hashPassword } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = updatePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User account not found' },
        { status: 404 }
      );
    }

    const isMatch = await comparePassword(validated.currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Current password does not match our records.' },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(validated.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'PASSWORD_UPDATED',
      targetType: 'User',
      targetId: user.id,
      details: { email: user.email },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully! You can now use your new password on future sign-ins.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }
    console.error('Password update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while updating password' },
      { status: 500 }
    );
  }
}
