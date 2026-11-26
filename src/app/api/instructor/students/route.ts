import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createActivationToken } from '@/lib/activation';
import { sendStudentActivationEmail } from '@/lib/email';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.trim() || '';
    const status = searchParams.get('status') || 'ALL'; // ALL, ACTIVE, INACTIVE
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '15', 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      role: 'LEARNER',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'ACTIVE') {
      where.isActive = true;
    } else if (status === 'INACTIVE') {
      where.isActive = false;
    }

    const [total, students] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          memberships: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              status: true,
              startDate: true,
              endDate: true,
              plan: {
                select: {
                  id: true,
                  name: true,
                  durationDays: true,
                  price: true,
                },
              },
            },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              bookings: true,
              attendances: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('Error fetching students:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      planId,
      startDate,
      paymentStatus = 'PENDING', // PAID, PENDING
      paymentAmount,
      paymentMethod = 'CASH',
      notes,
    } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Full name and email are mandatory.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate user
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A student or account already exists with this email address.' },
        { status: 409 }
      );
    }

    // Temporary random password hash until activation
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const passwordHash = await hashPassword(tempPassword);

    // Create student and optional membership in transaction
    const newStudent = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          phone: phone?.trim() || null,
          passwordHash,
          role: 'LEARNER',
          isActive: true,
        },
      });

      // If a plan is selected, assign membership
      if (planId) {
        const plan = await tx.membershipPlan.findUnique({ where: { id: planId } });
        if (plan) {
          const start = startDate ? new Date(startDate) : new Date();
          const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
          const isPaid = paymentStatus === 'PAID';

          const membership = await tx.membership.create({
            data: {
              userId: user.id,
              planId: plan.id,
              status: isPaid ? 'ACTIVE' : 'PENDING_PAYMENT',
              startDate: isPaid ? start : null,
              endDate: isPaid ? end : null,
              createdBy: session.email,
              notes: notes || 'Assigned during instructor onboarding',
            },
          });

          // If paid, create payment record
          if (isPaid) {
            const amount = paymentAmount ? Number(paymentAmount) : Number(plan.price);
            const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;
            await tx.payment.create({
              data: {
                orderId: `MANUAL_${Date.now()}_${user.id.slice(0, 4)}`,
                paymentId: `PAY_MANUAL_${Date.now()}`,
                membershipId: membership.id,
                amount,
                status: 'CAPTURED',
                paymentMethod,
                receiptNumber,
                recordedBy: session.email,
                notes: `Manual payment recorded by ${session.name}`,
              },
            });
          }
        }
      }

      // Record audit log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'STUDENT_CREATED',
          targetType: 'USER',
          targetId: user.id,
          details: `Instructor ${session.name} onboarded student ${name} (${normalizedEmail})`,
        },
      });

      return user;
    });

    // Generate single-use activation token
    const rawActivationToken = await createActivationToken(newStudent.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const activationUrl = `${appUrl}/activate?token=${rawActivationToken}`;

    // Dispatch activation email asynchronously
    sendStudentActivationEmail({
      to: newStudent.email,
      name: newStudent.name,
      activationUrl,
    }).catch((err) => console.error('Failed to dispatch student activation email:', err));

    return NextResponse.json({
      success: true,
      student: newStudent,
      activationUrl,
    });
  } catch (err: any) {
    console.error('Error creating student:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
