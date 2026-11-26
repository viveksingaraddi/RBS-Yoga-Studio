import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plans = await prisma.membershipPlan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            memberships: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    return NextResponse.json({ plans });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch plans' }, { status: 500 });
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
      slug,
      description,
      durationDays,
      price,
      benefits = [],
      includesRecordings = true,
      includesLiveClasses = true,
      maxLivePerMonth,
      isActive = true,
    } = body;

    if (!name || !durationDays || price === undefined) {
      return NextResponse.json({ error: 'Name, duration (days), and price are mandatory.' }, { status: 400 });
    }

    const generatedSlug = slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newPlan = await prisma.membershipPlan.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        description: description?.trim() || '',
        durationDays: parseInt(durationDays, 10),
        price: parseFloat(price),
        benefits: Array.isArray(benefits) ? benefits : [benefits],
        includesRecordings: Boolean(includesRecordings),
        includesLiveClasses: Boolean(includesLiveClasses),
        maxLivePerMonth: maxLivePerMonth ? parseInt(maxLivePerMonth, 10) : null,
        isActive: Boolean(isActive),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'PLAN_CREATED',
        targetType: 'MEMBERSHIP_PLAN',
        targetId: newPlan.id,
        details: `Instructor ${session.name} created membership plan ${newPlan.name} (₹${price}, ${durationDays}d)`,
      },
    });

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (err: any) {
    console.error('Error creating membership plan:', err);
    return NextResponse.json({ error: err.message || 'Failed to create plan' }, { status: 500 });
  }
}
