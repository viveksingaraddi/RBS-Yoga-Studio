import { NextRequest, NextResponse } from 'next/server';
import { consumePasswordResetToken, verifyPasswordResetToken } from '@/lib/activation';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Reset token is required.' }, { status: 400 });
    }

    const record = await verifyPasswordResetToken(token);
    if (!record) {
      return NextResponse.json({ valid: false, error: 'Reset link is invalid or has expired.' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      user: {
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

    await consumePasswordResetToken(token, password);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Password reset failed.' }, { status: 400 });
  }
}
