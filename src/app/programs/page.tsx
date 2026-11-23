import { prisma } from '@/lib/prisma';
import { getBusinessSettings } from '@/lib/settings';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import Link from 'next/link';
import { Clock, ArrowRight, CheckCircle2, Video, MapPin, Sparkles } from 'lucide-react';

export const revalidate = 60;

export default async function ProgramsPage() {
  const settings = await getBusinessSettings();
  const programs = await prisma.program.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar
        businessName={settings.businessName}
        brandTagline={settings.brandTagline}
        whatsAppNumber={settings.publicWhatsAppNumber}
      />

      <main className="flex-grow pt-32 pb-24 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
              The Path of Sadhana
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-normal text-forest leading-tight">
              Yogic Disciplines & Masteries
            </h1>
            <div className="w-16 h-[2px] bg-earth mx-auto my-3" />
            <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed font-normal">
              Each discipline at RBS Yoga Studio is personally guided by Master Sangu (M.Sc. Yoga).
              From classical alignment to subtle vital breathwork, experience authentic practices tailored
              for genuine bodily strength and conscious stillness.
            </p>
          </div>

          {/* Detailed Program Cards */}
          <div className="space-y-16">
            {programs.map((prog, index) => {
              const isEven = index % 2 === 1;

              return (
                <div
                  key={prog.id}
                  id={prog.slug}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-ivory-pure border border-sage-dark/40 p-6 sm:p-10 shadow-card ${
                    isEven ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Image Column */}
                  <div
                    className={`lg:col-span-5 relative aspect-[4/3] overflow-hidden bg-forest/5 ${
                      isEven ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <img
                      src={prog.imageUrl}
                      alt={prog.title}
                      className="w-full h-full object-cover filter saturate-[0.9] hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-forest text-ivory text-[10px] uppercase tracking-widest font-semibold px-3 py-1">
                      {prog.deliveryType}
                    </div>
                  </div>

                  {/* Content Column */}
                  <div
                    className={`lg:col-span-7 space-y-5 ${
                      isEven ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div className="flex items-center space-x-3 text-xs text-olive font-semibold uppercase tracking-wider">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-earth" />
                        <span>{prog.duration}</span>
                      </span>
                      <span>·</span>
                      <span>Master Sangu</span>
                    </div>

                    <h2 className="font-serif text-3xl sm:text-4xl text-forest">
                      {prog.title}
                    </h2>

                    <p className="text-sm text-charcoal/85 leading-relaxed">
                      {prog.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-sage-dark/40">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-olive block">
                          Single Session
                        </span>
                        <span className="font-serif text-2xl font-semibold text-forest">
                          {prog.price ? `₹${prog.price}` : 'Configurable'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/schedule?program=${prog.slug}`}
                          className="inline-flex items-center space-x-2 bg-forest text-ivory px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all shadow-sm"
                        >
                          <span>Reserve Slot</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href="/#contact"
                          className="inline-flex items-center space-x-2 border border-forest/30 text-forest px-5 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-sage/40 transition-colors"
                        >
                          <span>Enquire</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
