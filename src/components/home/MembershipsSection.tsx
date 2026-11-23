'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.memberships-header', {
        opacity: 0,
        y: 35,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.memberships-header',
          start: 'top 85%',
        },
      });

      gsap.from('.membership-plan-card', {
        opacity: 0,
        y: 45,
        duration: 0.85,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.memberships-grid',
          start: 'top 80%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="memberships" className="py-24 sm:py-32 bg-sage-light border-t border-sage-dark/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="memberships-header text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
            Commitment to Growth
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-forest leading-tight">
            Memberships & Passes
          </h2>
          <div className="w-16 h-[2px] bg-earth mx-auto my-3" />
          <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed font-normal">
            Choose a continuous pathway of practice. Memberships unlock unlimited class bookings,
            access to our curated video recording library, and personal guidance from {instructorName}.
          </p>
        </div>

        {/* Membership Cards Grid */}
        <div className="memberships-grid grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const isFeatured = idx === 1; // Middle plan is highlighted

            return (
              <div
                key={plan.id}
                className={`membership-plan-card relative bg-ivory flex flex-col justify-between p-8 sm:p-10 border transition-all duration-300 ${
                  isFeatured
                    ? 'border-earth shadow-elevated ring-1 ring-earth/30'
                    : 'border-sage-dark/40 shadow-card hover:border-earth/40'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-earth text-forest text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-1 shadow-sm">
                    Most Popular Sadhana
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-olive font-semibold block mb-1">
                      {plan.durationDays} Days Duration
                    </span>
                    <h3 className="font-serif text-3xl text-forest font-medium">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-charcoal/70 mt-2 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="py-4 border-y border-sage-dark/30">
                    <span className="text-xs text-olive block">Contribution</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="font-serif text-4xl sm:text-5xl font-semibold text-forest">
                        ₹{Number(plan.price).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-olive">/ term</span>
                    </div>
                  </div>

                  {/* Benefits Checklist */}
                  <div className="space-y-3">
                    <span className="text-xs uppercase tracking-wider font-semibold text-forest block">
                      Includes:
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
                    <span>Choose Plan</span>
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
