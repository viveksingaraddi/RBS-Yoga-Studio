import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for RBS Yoga Studio...');

  // 1. Business Settings
  const settingsData = {
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
    publicContactEmail: 'contact@rbsyogastudio.com',
    contactEmail: 'contact@rbsyogastudio.com',
    adminNotificationEmail: 'owner@rbsyogastudio.com',
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

  const settings = await prisma.businessSettings.upsert({
    where: { id: 'singleton' },
    update: settingsData,
    create: {
      id: 'singleton',
      ...settingsData,
    },
  });
  console.log('✓ Business settings configured');

  // 2. Admin User & Test Learner
  const adminPasswordHash = await bcrypt.hash('Admin@RBSYoga2026!', 12);
  const learnerPasswordHash = await bcrypt.hash('Learner@RBSYoga2026!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@rbsyogastudio.com' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'admin@rbsyogastudio.com',
      passwordHash: adminPasswordHash,
      name: 'RBS Studio Administrator',
      phone: '+91 98765 00001',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const testLearner = await prisma.user.upsert({
    where: { email: 'learner@rbsyogastudio.com' },
    update: { passwordHash: learnerPasswordHash },
    create: {
      email: 'learner@rbsyogastudio.com',
      passwordHash: learnerPasswordHash,
      name: 'Aditi Sharma',
      phone: '+91 98765 00002',
      role: 'LEARNER',
      isActive: true,
    },
  });
  console.log('✓ Admin and test learner created');

  // 3. Programs
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
    await prisma.program.upsert({
      where: { slug: prog.slug },
      update: prog,
      create: prog,
    });
  }
  console.log('✓ 6 Core programs created');

  // 4. Classes & Schedules
  const hathaProg = await prisma.program.findUnique({ where: { slug: 'hatha-yoga' } });
  const onlineProg = await prisma.program.findUnique({ where: { slug: 'online-yoga-sessions' } });
  const pranayamaProg = await prisma.program.findUnique({ where: { slug: 'pranayama' } });

  if (hathaProg) {
    const hathaClass = await prisma.class.upsert({
      where: { id: 'class-hatha-morning' },
      update: {},
      create: {
        id: 'class-hatha-morning',
        programId: hathaProg.id,
        title: 'Morning Hatha Flow & Alignment',
        instructor: 'Master Sangu',
        deliveryType: 'PHYSICAL',
        price: 500,
        capacity: 15,
      },
    });

    // Create 3 schedules for tomorrow, day after, and 3 days later
    for (let i = 1; i <= 5; i++) {
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
          bookedCount: i === 1 ? 4 : 2,
          deliveryType: 'PHYSICAL',
          location: 'RBS Main Shala (Studio A)',
        },
      });
    }
  }

  if (onlineProg) {
    const onlineClass = await prisma.class.upsert({
      where: { id: 'class-online-evening' },
      update: {},
      create: {
        id: 'class-online-evening',
        programId: onlineProg.id,
        title: 'Sunset Mindful Flow (Live Stream)',
        instructor: 'Master Sangu',
        deliveryType: 'ONLINE',
        price: 400,
        capacity: 35,
      },
    });

    for (let i = 1; i <= 5; i++) {
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
          bookedCount: 6,
          deliveryType: 'ONLINE',
          location: 'Zoom / Google Meet Live Stream',
          meetingUrl: 'https://meet.google.com/rbs-yoga-live',
        },
      });
    }
  }

  console.log('✓ Classes and schedules seeded');

  // 5. Membership Plans
  const plans = [
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

  for (const plan of plans) {
    await prisma.membershipPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }
  console.log('✓ Membership plans seeded');

  // Give test learner an active quarterly membership for testing portal features
  const quarterlyPlan = await prisma.membershipPlan.findUnique({ where: { slug: 'quarterly-immersion' } });
  if (quarterlyPlan && testLearner) {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 85);

    await prisma.membership.create({
      data: {
        userId: testLearner.id,
        planId: quarterlyPlan.id,
        status: 'ACTIVE',
        startDate: start,
        endDate: end,
        autoRenew: false,
      },
    });
  }

  // 6. Live Sessions
  const tomorrowSessionStart = new Date();
  tomorrowSessionStart.setDate(tomorrowSessionStart.getDate() + 1);
  tomorrowSessionStart.setHours(6, 30, 0, 0);

  const tomorrowSessionEnd = new Date(tomorrowSessionStart);
  tomorrowSessionEnd.setHours(7, 30, 0, 0);

  await prisma.liveSession.create({
    data: {
      title: 'Sunrise Prana & Core Stability with Master Sangu',
      description: 'Awaken your body with mindful dynamic asana sequences, core integration, and calming breathwork.',
      instructor: 'Master Sangu',
      startTime: tomorrowSessionStart,
      endTime: tomorrowSessionEnd,
      durationMinutes: 60,
      deliveryType: 'ONLINE',
      meetingProvider: 'GOOGLE_MEET',
      meetingUrlEncrypted: 'https://meet.google.com/rbs-yoga-live',
      requiresMembership: true,
      status: 'SCHEDULED',
    },
  });

  // 7. Video Recordings Library
  const recordingsData = [
    {
      title: 'Foundations of Classical Hatha: Grounding & Hip Opening',
      slug: 'foundations-classical-hatha',
      description: 'Master Sangu details foundational pelvic alignment, hip mobility, and steady breathing for grounding.',
      category: 'Hatha Yoga',
      instructor: 'Master Sangu',
      durationSeconds: 2700, // 45 mins
      thumbnailUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800',
      streamVideoId: 'cloudflare_video_stream_hatha_01',
      streamPlaybackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isPublished: true,
    },
    {
      title: 'Anulom Vilom & Nadi Shodhana: Breath Purification Masterclass',
      slug: 'pranayama-breath-purification',
      description: 'Deep dive into alternate nostril breathing to balance sympathetic and parasympathetic nervous channels.',
      category: 'Pranayama',
      instructor: 'Master Sangu',
      durationSeconds: 1800, // 30 mins
      thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
      streamVideoId: 'cloudflare_video_stream_pranayama_02',
      streamPlaybackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      isPublished: true,
    },
    {
      title: 'Yoga Nidra for Restorative Sleep & Nervous System Reset',
      slug: 'yoga-nidra-restorative',
      description: 'Somatic body scan and guided visualization to induce alpha-theta brainwaves and release chronic fatigue.',
      category: 'Meditation',
      instructor: 'Master Sangu',
      durationSeconds: 2100, // 35 mins
      thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
      streamVideoId: 'cloudflare_video_stream_nidra_03',
      streamPlaybackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      isPublished: true,
    },
    {
      title: 'Spinal Mobility, Twist Architecture & Shoulder Release',
      slug: 'spinal-mobility-shoulder-release',
      description: 'Relieve desk strain and restore spinal articulation through gentle yet deeply effective rotational asanas.',
      category: 'Hatha Yoga',
      instructor: 'Master Sangu',
      durationSeconds: 2400, // 40 mins
      thumbnailUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&q=80&w=800',
      streamVideoId: 'cloudflare_video_stream_spinal_04',
      streamPlaybackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      isPublished: true,
    },
  ];

  for (const rec of recordingsData) {
    await prisma.recording.upsert({
      where: { slug: rec.slug },
      update: rec,
      create: rec,
    });
  }
  console.log('✓ Video recording library seeded');

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
