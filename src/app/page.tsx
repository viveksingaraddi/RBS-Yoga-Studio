import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { getBusinessSettings } from '@/lib/settings';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import HeroSection from '@/components/home/HeroSection';
import PhilosophySection from '@/components/home/PhilosophySection';
import InstructorSection from '@/components/home/InstructorSection';
import ProgramsSection from '@/components/home/ProgramsSection';
import WellbeingSection from '@/components/home/WellbeingSection';
import TimetableSection from '@/components/home/TimetableSection';
import MembershipsSection from '@/components/home/MembershipsSection';
import GallerySection from '@/components/home/GallerySection';
import ContactSection from '@/components/home/ContactSection';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 1. Fetch dynamic business & branding settings
  const settings = await getBusinessSettings();

  // 2. Fetch real programs
  let programs: Prisma.ProgramGetPayload<Record<string, never>>[] = [];
  try {
    programs = await prisma.program.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
  }

  // 3. Fetch upcoming schedules
  let schedules: Prisma.ClassScheduleGetPayload<{ include: { class: true } }>[] = [];
  try {
    schedules = await prisma.classSchedule.findMany({
      where: {
        isCancelled: false,
        startTime: { gte: new Date() },
      },
      include: {
        class: true,
      },
      orderBy: { startTime: 'asc' },
      take: 8,
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
  }

  // 4. Fetch membership plans
  let plans: Prisma.MembershipPlanGetPayload<Record<string, never>>[] = [];
  try {
    plans = await prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching membership plans:', error);
  }

  // Serialized data for client components
  const serializedPrograms = programs.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDesc: p.shortDesc,
    imageUrl: p.imageUrl,
    deliveryType: p.deliveryType,
    duration: p.duration,
    price: p.price ? Number(p.price) : null,
  }));

  const serializedSchedules = schedules.map((s) => ({
    id: s.id,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime.toISOString(),
    capacity: s.capacity,
    bookedCount: s.bookedCount,
    deliveryType: s.deliveryType,
    location: s.location,
    class: {
      title: s.class.title,
      price: Number(s.class.price),
      instructor: s.class.instructor,
    },
  }));

  const serializedPlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    durationDays: p.durationDays,
    price: Number(p.price),
    benefits: p.benefits,
    sortOrder: p.sortOrder,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        businessName={settings.businessName}
        brandTagline={settings.brandTagline}
        whatsAppNumber={settings.publicWhatsAppNumber}
      />

      <main className="flex-grow">
        <HeroSection
          instructorName={settings.instructorName}
          brandTagline={settings.brandTagline}
        />
        <PhilosophySection />
        <InstructorSection
          instructorName={settings.instructorName}
          instructorBiography={settings.instructorBiography}
        />
        <ProgramsSection programs={serializedPrograms} />
        <WellbeingSection />
        <TimetableSection schedules={serializedSchedules} />
        <MembershipsSection plans={serializedPlans} />
        <GallerySection />
        <ContactSection
          businessName={settings.businessName}
          publicContactPhone={settings.publicContactPhone}
          publicWhatsAppNumber={settings.publicWhatsAppNumber}
          publicContactEmail={settings.publicContactEmail}
          businessAddress={settings.businessAddress}
          instructorName={settings.instructorName}
        />
      </main>

      <Footer
        businessName={settings.businessName}
        brandTagline={settings.brandTagline}
        contactEmail={settings.publicContactEmail}
        contactPhone={settings.publicContactPhone}
        address={settings.businessAddress}
        timezone={settings.timezone}
        instagramUrl={settings.instagramUrl}
        facebookUrl={settings.facebookUrl}
        youtubeUrl={settings.youtubeUrl}
        websiteUrl={settings.websiteUrl}
        instructorName={settings.instructorName}
      />
      <FloatingWhatsApp whatsAppNumber={settings.publicWhatsAppNumber} />
    </div>
  );
}
