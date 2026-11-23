'use client';

import { useEffect, useRef } from 'react';
import { Activity, Wind, Brain, Target, Shield, Eye } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PhilosophySection({ businessName = 'RBS Yoga Studio' }: { businessName?: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  const pillars = [
    {
      icon: Activity,
      title: 'Physical Strength',
      subtitle: 'Sthira Sukham Asanam',
      description:
        'Cultivate enduring posture stability, functional core strength, and natural spinal alignment that supports lifelong mobility.',
    },
    {
      icon: Wind,
      title: 'Conscious Breathing',
      subtitle: 'Pranayama & Life Force',
      description:
        'Regulate the nervous system and expand vital lung capacity through time-tested rhythmic breath control techniques.',
    },
    {
      icon: Brain,
      title: 'Mental Stillness',
      subtitle: 'Citta Vritti Nirodha',
      description:
        'Quiet mental turbulence and chronic stress, transitioning brainwaves into states of deep, restorative equanimity.',
    },
    {
      icon: Eye,
      title: 'Mindful Presence',
      subtitle: 'Dharana & Awareness',
      description:
        'Heighten bodily awareness, emotional clarity, and present-moment attention that radiates into every everyday choice.',
    },
    {
      icon: Target,
      title: 'Devoted Discipline',
      subtitle: 'Sadhana & Consistency',
      description:
        'Build self-sustaining daily rituals that transform temporary effort into a joyful, disciplined lifelong lifestyle.',
    },
    {
      icon: Shield,
      title: 'Self-Awareness',
      subtitle: 'Svadhyaya & Inner Truth',
      description:
        'Awaken deep harmony between the physical body, the subtle breath, and the inner observer with gentle non-judgment.',
    },
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header entrance
      gsap.from('.philosophy-header', {
        opacity: 0,
        y: 35,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.philosophy-header',
          start: 'top 85%',
        },
      });

      // Sequential staggered appearance of the 6 philosophy cards
      gsap.from('.philosophy-card', {
        opacity: 0,
        y: 45,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.philosophy-grid',
          start: 'top 80%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="philosophy"
      className="py-24 sm:py-32 bg-sage-light border-y border-sage-dark/40 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="philosophy-header text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
            The Studio Philosophy
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-forest leading-tight">
            More Than Movement. <br />
            <span className="italic font-light">A Way of Living.</span>
          </h2>
          <div className="w-16 h-[2px] bg-earth mx-auto my-4" />
          <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed font-normal">
            At {businessName}, we believe yoga transcends mere exercise. It is a profound
            science of living that unifies physical resilience, mental poise, conscious breath,
            and unshakeable peace.
          </p>
        </div>

        {/* 6 Pillars Grid */}
        <div className="philosophy-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="philosophy-card bg-ivory/90 backdrop-blur-sm p-8 sm:p-10 border border-sage-dark/30 hover:border-earth/50 transition-all duration-300 hover:shadow-card group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-sage text-forest group-hover:bg-forest group-hover:text-ivory transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-serif text-2xl text-earth/50 font-light">
                    0{idx + 1}
                  </span>
                </div>

                <span className="block text-[11px] uppercase tracking-widest text-olive font-semibold mb-1">
                  {pillar.subtitle}
                </span>

                <h3 className="font-serif text-2xl text-forest mb-3">
                  {pillar.title}
                </h3>

                <p className="text-sm text-charcoal/75 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
