import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(validated.password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Configured primary role accounts that are always permitted
    const CONFIG_SYSTEM_EMAILS = [
      'admin@rbsyogastudio.com',
      'instructor@rbsyogastudio.com',
      'learner@rbsyogastudio.com',
      'yogawithsangu@gmail.com',
    ];

    const isConfiguredUser = CONFIG_SYSTEM_EMAILS.includes(user.email.toLowerCase());

    // Access control:
    // ADMIN and INSTRUCTOR can always log in.
    // Pre-configured role accounts are always permitted.
    // All other users must have an appropriate active membership or confirmed subscription booking.
    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR' && !isConfiguredUser) {
      const now = new Date();
      const activeMembership = await prisma.membership.findFirst({
        where: {
          userId: user.id,
          status: 'ACTIVE',
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      });

      const activeBooking = await prisma.booking.findFirst({
        where: {
          userId: user.id,
          status: 'CONFIRMED',
        },
      });

      if (!activeMembership && !activeBooking) {
        return NextResponse.json(
          {
            success: false,
            requiresSubscription: true,
            message:
              'Active membership or subscription required to access the student portal. Please purchase a membership pass to activate your account.',
            redirectUrl: '/memberships',
          },
          { status: 403 }
        );
      }
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setAuthCookie(token);

    await logAuditEvent({
      userId: user.id,
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: user.id,
      details: { email: user.email, role: user.role },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectUrl: user.role === 'ADMIN' ? '/admin' : '/portal',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during login.' },
      { status: 500 }
    );
  }
}
