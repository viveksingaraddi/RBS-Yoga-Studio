'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Zap, Calendar, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface PlanItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationDays: number;
  price: number | string;
  benefits: string[];
  sortOrder: number;
}

export default function MembershipsSection({
  plans,
  instructorName = 'Master Sangu',
}: {
  plans: PlanItem[];
  instructorName?: string;
}) {
  const [activeTab, setActiveTab] = useState<'MEMBERSHIP' | 'CHALLENGE'>('MEMBERSHIP');
  const sectionRef = useRef<HTMLElement>(null);

  const regularPlans = plans.filter((p) => !p.slug.includes('challenge'));
  const challengePlans = plans.filter((p) => p.slug.includes('challenge'));

  const displayedPlans = activeTab === 'MEMBERSHIP' ? regularPlans : challengePlans;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.memberships-header', {
        opacity: 0,
        y: 25,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
      });

      gsap.from('.membership-plan-card', {
        opacity: 0,
        y: 35,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [activeTab]);

  return (
    <section ref={sectionRef} id="memberships" className="py-14 sm:py-20 bg-sage-light border-t border-sage-dark/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="memberships-header text-center max-w-3xl mx-auto space-y-3 mb-8 sm:mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
            Commitment to Growth
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-forest leading-tight">
            Memberships & Intensive Challenges
          </h2>
          <div className="w-16 h-[2px] bg-earth mx-auto my-3" />
          <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed font-normal">
            Disciplined 5-day weekly practice (Monday to Friday) under {instructorName}.
            Choose regular ongoing memberships or our intensive 21-Day and 90-Day transformation challenges.
          </p>

          {/* Tab Selector */}
          <div className="inline-flex items-center p-1.5 bg-ivory border border-sage-dark/50 shadow-sm mt-4">
            <button
              onClick={() => setActiveTab('MEMBERSHIP')}
              className={`flex items-center space-x-2 px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition-all ${
                activeTab === 'MEMBERSHIP'
                  ? 'bg-forest text-ivory shadow-sm'
                  : 'text-charcoal/70 hover:text-forest'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Regular Memberships (1 to 12 Mos)</span>
            </button>
            <button
              onClick={() => setActiveTab('CHALLENGE')}
              className={`flex items-center space-x-2 px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition-all ${
                activeTab === 'CHALLENGE'
                  ? 'bg-earth text-forest shadow-sm'
                  : 'text-charcoal/70 hover:text-forest'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>21 & 90 Days Challenges</span>
            </button>
          </div>
        </div>

        {/* Membership Cards Grid */}
        <div className={`memberships-grid grid grid-cols-1 ${activeTab === 'MEMBERSHIP' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6 items-stretch`}>
          {displayedPlans.map((plan, idx) => {
            const isFeatured = plan.slug === '4-month-membership' || plan.slug === '90-day-challenge-morning';

            return (
              <div
                key={plan.id}
                className={`membership-plan-card relative bg-ivory flex flex-col justify-between p-6 sm:p-8 border transition-all duration-300 ${
                  isFeatured
                    ? 'border-earth shadow-elevated ring-1 ring-earth/40 bg-ivory-pure'
                    : 'border-sage-dark/40 shadow-card hover:border-earth/40'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-earth text-forest text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 shadow-sm whitespace-nowrap">
                    Best Value Sadhana
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-widest text-olive font-semibold block">
                        {plan.durationDays} Days Sadhana
                      </span>
                      {plan.slug.includes('morning') && (
                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-sage text-forest font-semibold">
                          Morning Batch
                        </span>
                      )}
                      {plan.slug.includes('evening') && (
                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-forest/10 text-forest font-semibold">
                          Evening Batch
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-2xl text-forest font-medium leading-snug">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-charcoal/70 mt-2 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="py-3 border-y border-sage-dark/30">
                    <span className="text-[11px] text-olive block">Investment</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="font-serif text-3xl sm:text-4xl font-semibold text-forest">
                        ₹{Number(plan.price).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-olive">/ pass</span>
                    </div>
                  </div>

                  {/* Benefits Checklist */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-forest block">
                      Privileges:
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
                    className={`w-full py-3.5 text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center space-x-2 transition-all ${
                      isFeatured
                        ? 'bg-forest text-ivory hover:bg-forest-light shadow-md'
                        : 'border border-forest text-forest hover:bg-forest hover:text-ivory'
                    }`}
                  >
                    <span>Enroll Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
