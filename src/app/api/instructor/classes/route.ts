import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [classes, schedules, programs] = await Promise.all([
      prisma.class.findMany({
        include: {
          program: true,
          _count: { select: { schedules: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.classSchedule.findMany({
        include: {
          class: true,
          bookings: {
            where: { status: 'CONFIRMED' },
            include: {
              user: { select: { id: true, name: true, email: true, phone: true } },
              attendance: true,
            },
          },
        },
        orderBy: { startTime: 'asc' },
      }),
      prisma.program.findMany({
        select: { id: true, title: true, slug: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return NextResponse.json({ classes, schedules, programs });
  } catch (err: any) {
    console.error('Error fetching classes:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch classes' }, { status: 500 });
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
      title,
      programId,
      instructor = 'Master Sangu',
      deliveryType = 'PHYSICAL', // PHYSICAL, ONLINE, HYBRID
      capacity = 20,
      description,
      // Scheduling details
      startDate,
      endDate,
      startTimeStr, // e.g. "06:00"
      endTimeStr,   // e.g. "07:00"
      selectedDays = [1, 2, 3, 4, 5], // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
      location = 'Main Shala / RBS Studio',
      meetingUrl,
    } = body;

    if (!title || !startDate || !startTimeStr || !endTimeStr) {
      return NextResponse.json({ error: 'Title, start date, start time, and end time are required.' }, { status: 400 });
    }

    // Find or default program
    let targetProgramId = programId;
    if (!targetProgramId) {
      const defaultProgram = await prisma.program.findFirst();
      if (defaultProgram) {
        targetProgramId = defaultProgram.id;
      } else {
        const createdProg = await prisma.program.create({
          data: {
            title: 'Authentic Traditional Yoga Sadhana',
            slug: 'authentic-traditional-yoga-sadhana',
            description: 'Core daily yoga practice curated by Master Sangu',
            imageUrl: '/images/hero-bg.jpg',
            deliveryType: 'PHYSICAL',
            duration: '60 mins',
          },
        });
        targetProgramId = createdProg.id;
      }
    }

    // 1. Create or find existing class
    let targetClass = await prisma.class.findFirst({
      where: { title: title.trim(), programId: targetProgramId },
    });

    if (!targetClass) {
      targetClass = await prisma.class.create({
        data: {
          title: title.trim(),
          programId: targetProgramId,
          instructor,
          deliveryType,
          capacity: parseInt(String(capacity), 10),
          description: description?.trim() || null,
        },
      });
    }

    // 2. Generate recurring batch schedule occurrences
    const startRange = new Date(startDate);
    const endRange = endDate ? new Date(endDate) : new Date(startRange.getTime() + 28 * 24 * 60 * 60 * 1000); // 4 weeks
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);

    const generatedSchedules = [];
    const currentDate = new Date(startRange);

    while (currentDate <= endRange) {
      const dayOfWeek = currentDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      if (selectedDays.includes(dayOfWeek)) {
        const batchStart = new Date(currentDate);
        batchStart.setHours(startH, startM, 0, 0);

        const batchEnd = new Date(currentDate);
        batchEnd.setHours(endH, endM, 0, 0);

        // Conflict check: Check if instructor or same class is already scheduled at this time
        const conflict = await prisma.classSchedule.findFirst({
          where: {
            classId: targetClass.id,
            isCancelled: false,
            startTime: batchStart,
          },
        });

        if (!conflict) {
          generatedSchedules.push({
            classId: targetClass.id,
            startTime: batchStart,
            endTime: batchEnd,
            capacity: parseInt(String(capacity), 10),
            deliveryType,
            location: deliveryType === 'ONLINE' ? 'Virtual Shala' : location,
            meetingUrl: meetingUrl?.trim() || null,
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (generatedSchedules.length > 0) {
      await prisma.classSchedule.createMany({
        data: generatedSchedules,
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'BATCH_SCHEDULES_CREATED',
        targetType: 'CLASS_SCHEDULE',
        targetId: targetClass.id,
        details: `Instructor ${session.name} scheduled ${generatedSchedules.length} batch occurrences for ${targetClass.title}`,
      },
    });

    return NextResponse.json({
      success: true,
      class: targetClass,
      occurrencesCreated: generatedSchedules.length,
    });
  } catch (err: any) {
    console.error('Error creating class batch:', err);
    return NextResponse.json({ error: err.message || 'Failed to create batch schedules' }, { status: 500 });
  }
}
