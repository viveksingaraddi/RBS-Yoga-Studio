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
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
              Sustained Transformation
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-normal text-forest leading-tight">
              Memberships & Sadhana Passes
            </h1>
            <div className="w-16 h-[2px] bg-earth mx-auto my-3" />
            <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed font-normal">
              True yogic progress unfolds with consistent, disciplined practice. Our tiered passes
              provide comprehensive access to physical shala classes, live interactive streams,
              and our full archive of recorded video practices.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
            {plans.map((plan, idx) => {
              const isFeatured = idx === 1;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-ivory flex flex-col justify-between p-8 sm:p-10 border transition-all duration-300 ${
                    isFeatured
                      ? 'border-earth shadow-elevated ring-1 ring-earth/30'
                      : 'border-sage-dark/40 shadow-card hover:border-earth/40'
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-earth text-forest text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-1 shadow-sm">
                      Recommended
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-olive font-semibold block mb-1">
                        {plan.durationDays} Days Term
                      </span>
                      <h2 className="font-serif text-3xl text-forest font-medium">
                        {plan.name}
                      </h2>
                      <p className="text-xs text-charcoal/70 mt-2 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="py-4 border-y border-sage-dark/30">
                      <span className="text-xs text-olive block">Investment</span>
                      <div className="flex items-baseline space-x-1">
                        <span className="font-serif text-4xl sm:text-5xl font-semibold text-forest">
                          ₹{Number(plan.price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-olive">/ term</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs uppercase tracking-wider font-semibold text-forest block">
                        Included Privileges:
                      </span>
                      <ul className="space-y-2.5 text-xs text-charcoal/80">
                        {plan.benefits.map((benefit, bIdx) => (
                          <li key={bIdx} className="flex items-start space-x-2.5">
                            <Check className="w-4 h-4 text-earth shrink-0 mt-0.5" />
                            <span className="leading-snug">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-8">
                    <Link
                      href={`/memberships/checkout?plan=${plan.slug}`}
                      className={`w-full py-4 text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center space-x-2 transition-all ${
                        isFeatured
                          ? 'bg-forest text-ivory hover:bg-forest-light shadow-md'
                          : 'border border-forest text-forest hover:bg-forest hover:text-ivory'
                      }`}
                    >
                      <span>Join Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
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
