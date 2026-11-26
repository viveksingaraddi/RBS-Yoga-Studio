import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { getBusinessSettings } from '@/lib/settings';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import Link from 'next/link';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MembershipsPage() {
  const settings = await getBusinessSettings();
  let plans: Prisma.MembershipPlanGetPayload<Record<string, never>>[] = [];
  try {
    plans = await prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching membership plans:', error);
  }

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
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
              Authentic Sadhana Passes
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-normal text-forest leading-tight">
              Memberships & Challenge Passes
            </h1>
            <div className="w-16 h-[2px] bg-earth mx-auto my-3" />
            <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed font-normal">
              Disciplined 5-day weekly practice (Monday to Friday) under Master Sangu.
              Choose continuous regular memberships or intensive 21-Day and 90-Day transformation challenges.
            </p>
          </div>

          {/* Regular Memberships Section */}
          <div className="mb-16">
            <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-sage-dark/40">
              <span className="px-3 py-1 bg-forest text-ivory text-xs uppercase tracking-widest font-semibold">
                Category 1
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-forest font-normal">
                Regular 5-Day Weekly Memberships (Monday to Friday)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {plans.filter(p => !p.slug.includes('challenge')).map((plan) => {
                const isFeatured = plan.slug === '4-month-membership';

                return (
                  <div
                    key={plan.id}
                    className={`group relative bg-ivory flex flex-col justify-between p-6 sm:p-7 border transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-elevated ${
                      isFeatured
                        ? 'border-earth ring-1 ring-earth/40 bg-ivory-pure shadow-card hover:border-earth hover:ring-earth/70'
                        : 'border-sage-dark/50 shadow-sm hover:border-earth/60 hover:bg-ivory-pure'
                    }`}
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-[3px] transition-colors duration-300 ${
                        isFeatured ? 'bg-earth' : 'bg-transparent group-hover:bg-earth/80'
                      }`}
                    />

                    {isFeatured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-earth text-forest text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1 shadow-sm whitespace-nowrap z-10">
                        Recommended
                      </div>
                    )}

                    <div className="space-y-5">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-olive font-semibold block mb-1">
                          {plan.durationDays} Days Term (5 Days/Wk)
                        </span>
                        <h3 className="font-serif text-2xl text-forest font-medium group-hover:text-forest-dark transition-colors">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-charcoal/70 mt-2 leading-relaxed min-h-[38px]">
                          {plan.description}
                        </p>
                      </div>

                      <div className="py-3 border-y border-sage-dark/30 group-hover:border-earth/30 transition-colors">
                        <span className="text-[11px] text-olive block font-medium">Investment</span>
                        <div className="flex items-baseline space-x-1 mt-0.5">
                          <span className="font-serif text-3xl sm:text-4xl font-semibold text-forest tracking-tight">
                            ₹{Number(plan.price).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-olive">/ term</span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-forest block">
                          Included Privileges:
                        </span>
                        <ul className="space-y-2 text-xs text-charcoal/80">
                          {plan.benefits.map((benefit, bIdx) => (
                            <li key={bIdx} className="flex items-start space-x-2">
                              <Check className="w-3.5 h-3.5 text-earth shrink-0 mt-0.5" />
                              <span className="leading-snug">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Link
                        href={`/memberships/checkout?plan=${plan.slug}`}
                        className={`w-full py-3.5 text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer ${
                          isFeatured
                            ? 'bg-forest text-ivory hover:bg-forest-light shadow-sm hover:shadow-md'
                            : 'border border-forest text-forest hover:bg-forest hover:text-ivory group-hover:border-forest group-hover:bg-forest group-hover:text-ivory'
                        }`}
                      >
                        <span>Join Plan</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intensive Challenges Section */}
          <div className="mb-20">
            <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-sage-dark/40">
              <span className="px-3 py-1 bg-earth text-forest text-xs uppercase tracking-widest font-semibold">
                Category 2
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-forest font-normal">
                Intensive Transformation Challenges (21 & 90 Days)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {plans.filter(p => p.slug.includes('challenge')).map((plan) => {
                const isFeatured = plan.slug === '90-day-challenge-morning';

                return (
                  <div
                    key={plan.id}
                    className={`group relative bg-ivory flex flex-col justify-between p-6 sm:p-7 border transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-elevated ${
                      isFeatured
                        ? 'border-earth ring-1 ring-earth/40 bg-ivory-pure shadow-card hover:border-earth hover:ring-earth/70'
                        : 'border-sage-dark/50 shadow-sm hover:border-earth/60 hover:bg-ivory-pure'
                    }`}
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-[3px] transition-colors duration-300 ${
                        isFeatured ? 'bg-earth' : 'bg-transparent group-hover:bg-earth/80'
                      }`}
                    />

                    {isFeatured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-earth text-forest text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1 shadow-sm whitespace-nowrap z-10">
                        Popular Challenge
                      </div>
                    )}

                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-[10px] uppercase tracking-widest text-olive font-semibold block">
                            {plan.durationDays} Days Intensive
                          </span>
                          <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-semibold rounded-xs ${
                            plan.slug.includes('morning') ? 'bg-sage text-forest' : 'bg-forest/10 text-forest'
                          }`}>
                            {plan.slug.includes('morning') ? 'Morning' : 'Evening'}
                          </span>
                        </div>
                        <h3 className="font-serif text-2xl text-forest font-medium group-hover:text-forest-dark transition-colors">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-charcoal/70 mt-2 leading-relaxed min-h-[38px]">
                          {plan.description}
                        </p>
                      </div>

                      <div className="py-3 border-y border-sage-dark/30 group-hover:border-earth/30 transition-colors">
                        <span className="text-[11px] text-olive block font-medium">Investment</span>
                        <div className="flex items-baseline space-x-1 mt-0.5">
                          <span className="font-serif text-3xl sm:text-4xl font-semibold text-forest tracking-tight">
                            ₹{Number(plan.price).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-olive">/ pass</span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-forest block">
                          Challenge Benefits:
                        </span>
                        <ul className="space-y-2 text-xs text-charcoal/80">
                          {plan.benefits.map((benefit, bIdx) => (
                            <li key={bIdx} className="flex items-start space-x-2">
                              <Check className="w-3.5 h-3.5 text-earth shrink-0 mt-0.5" />
                              <span className="leading-snug">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Link
                        href={`/memberships/checkout?plan=${plan.slug}`}
                        className={`w-full py-3.5 text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer ${
                          isFeatured
                            ? 'bg-forest text-ivory hover:bg-forest-light shadow-sm hover:shadow-md'
                            : 'border border-forest text-forest hover:bg-forest hover:text-ivory group-hover:border-forest group-hover:bg-forest group-hover:text-ivory'
                        }`}
                      >
                        <span>Join Challenge</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Membership Terms Notice */}
          <div className="bg-sage-light p-8 border border-sage-dark/40 max-w-4xl mx-auto space-y-3">
            <div className="flex items-center space-x-2 text-forest font-serif text-xl">
              <ShieldCheck className="w-5 h-5 text-earth" />
              <span>Membership Policy & Guidelines</span>
            </div>
            <ul className="text-xs text-charcoal/80 space-y-1.5 list-disc pl-5 leading-relaxed">
              <li>Memberships activate immediately upon verified payment receipt.</li>
              <li>Passes allow reservation across both physical studio shala classes and live interactive streams.</li>
              <li>Recorded video teachings remain unlocked throughout the active membership duration.</li>
              <li>Schedules and pricing are configured directly by the studio administration.</li>
            </ul>
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
