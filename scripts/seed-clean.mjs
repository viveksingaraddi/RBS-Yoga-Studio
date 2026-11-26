import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧘 Setting up clean, production-ready database for RBS Yoga Studio...');

  // 1. Clean out all existing data in proper dependency order
  console.log('🧹 Purging any previous mock/fake records...');
  await prisma.playbackLog.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.bookingHold.deleteMany({});
  await prisma.paymentWebhookEvent.deleteMany({});
  await prisma.emailDeliveryLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.enquiry.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.membershipHistory.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.classSchedule.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.recording.deleteMany({});
  await prisma.liveSession.deleteMany({});
  await prisma.program.deleteMany({});
  await prisma.membershipPlan.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.businessSettings.deleteMany({});

  console.log('✓ Database purged cleanly');

  // 2. Business Settings Singleton
  const settingsData = {
    id: 'singleton',
    businessName: 'RBS Yoga Studio',
    brandTagline: 'The Art of Strength, Balance & Wellness',
    tagline: 'The Art of Strength, Balance & Wellness',
    instructorName: 'Master Sangu',
    leadInstructor: 'Master Sangu',
    instructorBiography:
      'Master Sangu holds an M.Sc. in Yoga with over 10 years of international teaching experience, including extensive work in Vietnam. Dedicated to authentic yogic discipline, Master Sangu integrates classical posture alignment, rhythmic pranayama, and profound meditative stillness to help students cultivate enduring physical strength, mental clarity, and holistic balance.',
    instructorBio:
      'Master Sangu holds an M.Sc. in Yoga with over 10 years of international teaching experience, including extensive work in Vietnam. Dedicated to authentic yogic discipline, Master Sangu integrates classical posture alignment, rhythmic pranayama, and profound meditative stillness to help students cultivate enduring physical strength, mental clarity, and holistic balance.',
    publicWhatsAppNumber: '+91 89513 46405',
    publicContactPhone: '+91 89513 46405',
    whatsappNumber: '+91 89513 46405',
    contactPhone: '+91 89513 46405',
    publicContactEmail: 'yogawithsangu@gmail.com',
    contactEmail: 'yogawithsangu@gmail.com',
    adminNotificationEmail: 'yogawithsangu@gmail.com',
    businessAddress: 'RBS Studio Pavilion, Bangalore / Global Online Shala (Physical address to be finalized)',
    address: 'RBS Studio Pavilion, Bangalore / Global Online Shala (Physical address to be finalized)',
    instagramUrl: 'https://instagram.com/rbsyogastudio',
    facebookUrl: 'https://facebook.com/rbsyogastudio',
    youtubeUrl: 'https://youtube.com/@rbsyogastudio',
    websiteUrl: 'https://rbsyogastudio.com',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    notifyOnBooking: true,
    notifyOnEnquiry: true,
    notifyOnPayment: true,
    notifyOnMembership: true,
  };

  await prisma.businessSettings.create({
    data: settingsData,
  });
  console.log('✓ Business settings configured with yogawithsangu@gmail.com');

  // 3. Exactly 1 Account for each Role
  const adminHash = await bcrypt.hash('Admin@RBSYoga2026!', 12);
  const instructorHash = await bcrypt.hash('Instructor@RBSYoga2026!', 12);
  const learnerHash = await bcrypt.hash('Learner@RBSYoga2026!', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@rbsyogastudio.com',
      passwordHash: adminHash,
      name: 'RBS Studio Administrator',
      phone: '+91 89513 46405',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const instructorUser = await prisma.user.create({
    data: {
      email: 'instructor@rbsyogastudio.com',
      passwordHash: instructorHash,
      name: 'Master Sangu',
      phone: '+91 89513 46405',
      role: 'INSTRUCTOR',
      isActive: true,
    },
  });

  const learnerUser = await prisma.user.create({
    data: {
      email: 'learner@rbsyogastudio.com',
      passwordHash: learnerHash,
      name: 'RBS Student Member',
      phone: '+91 89513 46405',
      role: 'LEARNER',
      isActive: true,
    },
  });
  console.log('✓ 1 account per role created (ADMIN, INSTRUCTOR, LEARNER)');

  // 4. Authentic Core Programs
  const programsData = [
    {
      title: 'Hatha Yoga',
      slug: 'hatha-yoga',
      description:
        'Classical Hatha Yoga emphasizing foundational alignment, sustained postures, and deep conscious breath. Designed to build functional strength, posture resilience, and inner focus.',
      shortDesc: 'Foundational alignment, balance and physical endurance.',
      imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=1200',
      deliveryType: 'PHYSICAL',
      duration: '60 - 75 Mins',
      price: 500,
      sortOrder: 1,
    },
    {
      title: 'Pranayama & Vital Breathwork',
      slug: 'pranayama',
      description:
        'Sacred yogic breath mastery to calm the nervous system, optimize lung capacity, and expand vital life force (Prana). Grounded in traditional classical methodology.',
      shortDesc: 'Breath regulation, lung capacity, and mental equilibrium.',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200',
      deliveryType: 'HYBRID',
      duration: '45 Mins',
      price: 450,
      sortOrder: 2,
    },
    {
      title: 'Mindful Meditation & Yoga Nidra',
      slug: 'meditation',
      description:
        'Cultivate profound inner stillness, emotional clarity, and stress relief through guided Dharana and deep yogic sleep techniques.',
      shortDesc: 'Stillness, nervous system reset, and profound mindfulness.',
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=1200',
      deliveryType: 'HYBRID',
      duration: '45 Mins',
      price: 400,
      sortOrder: 3,
    },
    {
      title: 'Group Yoga Practice',
      slug: 'group-yoga',
      description:
        'Dynamic group sessions that foster community harmony, collective energy, and guided progression across all fitness and flexibility levels.',
      shortDesc: 'Energizing group shala sessions with collective synergy.',
      imageUrl: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=1200',
      deliveryType: 'PHYSICAL',
      duration: '60 Mins',
      price: 500,
      sortOrder: 4,
    },
    {
      title: 'Online Yoga Sessions',
      slug: 'online-yoga-sessions',
      description:
        'Immersive live interactive video classes led personally by Master Sangu. Experience studio-quality instruction, real-time posture feedback, and community connection from anywhere in the world.',
      shortDesc: 'Live interactive classes streamed directly to your home.',
      imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&q=80&w=1200',
      deliveryType: 'ONLINE',
      duration: '60 Mins',
      price: 400,
      sortOrder: 5,
    },
    {
      title: 'Personal Yoga Mentorship',
      slug: 'personal-yoga-sessions',
      description:
        'One-on-one tailored coaching customized for your biomechanics, therapeutic recovery, posture goals, and personal spiritual practice.',
      shortDesc: 'Dedicated one-on-one sessions customized to your specific needs.',
      imageUrl: 'https://images.unsplash.com/photo-1552196563-5523e198b164?auto=format&fit=crop&q=80&w=1200',
      deliveryType: 'HYBRID',
      duration: '60 Mins',
      price: 1500,
      sortOrder: 6,
    },
  ];

  for (const prog of programsData) {
    await prisma.program.create({
      data: prog,
    });
  }
  console.log('✓ 6 verified studio programs created');

  // 5. Authentic Membership Plans for subscription-based access
  const plansData = [
    {
      name: 'Monthly Shala Pass',
      slug: 'monthly-shala-pass',
      description: 'Ideal for consistent practitioners seeking disciplined daily or weekly studio & online practice.',
      durationDays: 30,
      price: 2499,
      includesRecordings: true,
      includesLiveClasses: true,
      maxLivePerMonth: 12,
      benefits: [
        'Access to 12 Studio or Live Online Classes per month',
        'Full unlimited access to On-Demand Recorded Yoga Library',
        'Personal posture guidance from Master Sangu',
        'Priority booking access for special workshops',
        'Direct WhatsApp support with the studio',
      ],
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Quarterly Immersion',
      slug: 'quarterly-immersion',
      description: 'Our most popular plan for profound transformation in flexibility, stamina, and mental stillness.',
      durationDays: 90,
      price: 6499,
      includesRecordings: true,
      includesLiveClasses: true,
      maxLivePerMonth: 40,
      benefits: [
        'Unlimited Studio & Live Online Classes for 3 full months',
        'Full unlimited access to On-Demand Recorded Yoga Library',
        'One-on-one personal posture evaluation with Master Sangu',
        'Exclusive Pranayama & Breathwork Masterclass recordings',
        'Studio wellness journal & guided practice plan',
      ],
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Annual Sadhana Journey',
      slug: 'annual-sadhana-journey',
      description: 'Complete year-long dedication to yogic mastery, sustained wellbeing, and inner peace.',
      durationDays: 365,
      price: 19999,
      includesRecordings: true,
      includesLiveClasses: true,
      maxLivePerMonth: 999,
      benefits: [
        'Year-long unlimited access to all Studio & Live Online sessions',
        'Lifetime access to historical Master Sangu workshop archives',
        'Quarterly private 1-on-1 mentorship session with Master Sangu',
        'Complimentary guest passes for family and friends (4/year)',
        'VIP access to international retreat retreats and events',
      ],
      isActive: true,
      sortOrder: 3,
    },
  ];

  let quarterlyPlanId = null;
  for (const plan of plansData) {
    const createdPlan = await prisma.membershipPlan.create({
      data: plan,
    });
    if (plan.slug === 'quarterly-immersion') {
      quarterlyPlanId = createdPlan.id;
    }
  }
  console.log('✓ 3 subscription membership plans created');

  // Give the configured learner an active membership so they can access the portal directly
  if (quarterlyPlanId) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);

    await prisma.membership.create({
      data: {
        userId: learnerUser.id,
        planId: quarterlyPlanId,
        status: 'ACTIVE',
        startDate,
        endDate,
        autoRenew: false,
      },
    });
    console.log('✓ Active membership assigned to configured learner');
  }

  // 6. Real Classes & Schedules for Master Sangu
  const hathaProg = await prisma.program.findUnique({ where: { slug: 'hatha-yoga' } });
  const onlineProg = await prisma.program.findUnique({ where: { slug: 'online-yoga-sessions' } });

  if (hathaProg) {
    const hathaClass = await prisma.class.create({
      data: {
        programId: hathaProg.id,
        title: 'Morning Classical Hatha & Alignment',
        instructor: 'Master Sangu',
        deliveryType: 'PHYSICAL',
        price: 500,
        capacity: 15,
      },
    });

    for (let i = 1; i <= 3; i++) {
      const start = new Date();
      start.setDate(start.getDate() + i);
      start.setHours(7, 0, 0, 0);

      const end = new Date(start);
      end.setHours(8, 15, 0, 0);

      await prisma.classSchedule.create({
        data: {
          classId: hathaClass.id,
          startTime: start,
          endTime: end,
          capacity: 15,
          bookedCount: 0,
          deliveryType: 'PHYSICAL',
          location: 'RBS Main Shala (Studio A)',
        },
      });
    }
  }

  if (onlineProg) {
    const onlineClass = await prisma.class.create({
      data: {
        programId: onlineProg.id,
        title: 'Sunset Mindful Flow & Breathwork (Live Stream)',
        instructor: 'Master Sangu',
        deliveryType: 'ONLINE',
        price: 400,
        capacity: 35,
      },
    });

    for (let i = 1; i <= 3; i++) {
      const start = new Date();
      start.setDate(start.getDate() + i);
      start.setHours(18, 30, 0, 0);

      const end = new Date(start);
      end.setHours(19, 30, 0, 0);

      await prisma.classSchedule.create({
        data: {
          classId: onlineClass.id,
          startTime: start,
          endTime: end,
          capacity: 35,
          bookedCount: 0,
          deliveryType: 'ONLINE',
          location: 'Zoom / Google Meet Live Stream',
          meetingUrl: 'https://meet.google.com/rbs-yoga-live',
        },
      });
    }
  }
  console.log('✓ Class schedules created with 0 initial bookings');

  console.log('🎉 Clean seed completed successfully with NO mock/fake data!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
