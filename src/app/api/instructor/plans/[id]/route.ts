import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const {
      name,
      description,
      durationDays,
      price,
      benefits,
      includesRecordings,
      includesLiveClasses,
      maxLivePerMonth,
      isActive,
      sortOrder,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (durationDays !== undefined) updateData.durationDays = parseInt(durationDays, 10);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (benefits !== undefined) updateData.benefits = Array.isArray(benefits) ? benefits : [benefits];
    if (includesRecordings !== undefined) updateData.includesRecordings = Boolean(includesRecordings);
    if (includesLiveClasses !== undefined) updateData.includesLiveClasses = Boolean(includesLiveClasses);
    if (maxLivePerMonth !== undefined) updateData.maxLivePerMonth = maxLivePerMonth ? parseInt(maxLivePerMonth, 10) : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10);

    const updatedPlan = await prisma.membershipPlan.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'PLAN_UPDATED',
        targetType: 'MEMBERSHIP_PLAN',
        targetId: id,
        details: `Instructor ${session.name} updated membership plan ${updatedPlan.name}: ${JSON.stringify(updateData)}`,
      },
    });

    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (err: any) {
    console.error('Error updating plan:', err);
    return NextResponse.json({ error: err.message || 'Failed to update plan' }, { status: 500 });
  }
}
