import { NextRequest, NextResponse } from 'next/server';
import { consumeActivationToken, verifyActivationToken } from '@/lib/activation';
import { sendAccountActivationConfirmationEmail } from '@/lib/email';
import { setAuthCookie, signToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Activation token is required.' }, { status: 400 });
    }

    const record = await verifyActivationToken(token);
    if (!record) {
      return NextResponse.json({ valid: false, error: 'Activation token is invalid or has expired.' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      student: {
        name: record.user.name,
        email: record.user.email,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const updatedUser = await consumeActivationToken(token, password);

    // Send confirmation email
    sendAccountActivationConfirmationEmail({
      to: updatedUser.email,
      name: updatedUser.name,
    }).catch((err) => console.error('Failed to send activation confirmation:', err));

    // Sign session token and set auth cookie for immediate login
    const sessionToken = signToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    });

    await setAuthCookie(sessionToken);

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully.',
      user: updatedUser,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Activation failed.' }, { status: 400 });
  }
}
