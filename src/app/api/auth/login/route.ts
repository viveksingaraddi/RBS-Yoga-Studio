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
