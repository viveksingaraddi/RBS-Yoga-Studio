'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function WellbeingSection() {
  const [activeTab, setActiveTab] = useState<'calm' | 'breath' | 'clarity'>('calm');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.wellbeing-text-block', {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.wellbeing-text-block',
          start: 'top 80%',
        },
      });

      gsap.from('.wellbeing-image-frame', {
        opacity: 0,
        scale: 0.95,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.wellbeing-image-frame',
          start: 'top 80%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="wellbeing"
      className="py-24 sm:py-32 bg-forest text-ivory relative overflow-hidden"
    >
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-forest-light/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-earth/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Editorial Header */}
          <div className="lg:col-span-6 space-y-6 wellbeing-text-block">
            <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
              Mental Wellbeing & Mindfulness
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-ivory leading-tight">
              Your Body Needs Movement. <br />
              <span className="italic font-light text-earth">
                Your Mind Needs Stillness.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-ivory/80 leading-relaxed font-normal">
              In a relentless, high-demand world, true health is more than muscular exertion.
              It is the conscious art of releasing nervous system tension, centering wandering
              thoughts, and reconnecting with an abiding sense of inner peace.
            </p>

            {/* Interactive Tab Switcher */}
            <div className="pt-4 flex items-center space-x-4 border-b border-ivory/15 pb-4">
              <button
                onClick={() => setActiveTab('calm')}
                className={`text-xs uppercase tracking-widest pb-2 px-1 transition-all ${
                  activeTab === 'calm'
                    ? 'text-earth font-semibold border-b-2 border-earth'
                    : 'text-ivory/60 hover:text-ivory'
                }`}
              >
                Stress Relief
              </button>
              <button
                onClick={() => setActiveTab('breath')}
                className={`text-xs uppercase tracking-widest pb-2 px-1 transition-all ${
                  activeTab === 'breath'
                    ? 'text-earth font-semibold border-b-2 border-earth'
                    : 'text-ivory/60 hover:text-ivory'
                }`}
              >
                Breath & Sleep
              </button>
              <button
                onClick={() => setActiveTab('clarity')}
                className={`text-xs uppercase tracking-widest pb-2 px-1 transition-all ${
                  activeTab === 'clarity'
                    ? 'text-earth font-semibold border-b-2 border-earth'
                    : 'text-ivory/60 hover:text-ivory'
                }`}
              >
                Mental Clarity
              </button>
            </div>

            {/* Tab Descriptions */}
            <div className="min-h-[110px] text-sm text-ivory/75 leading-relaxed">
              {activeTab === 'calm' && (
                <p>
                  Experience the physiological shift as cortisol levels diminish. Master Sangu's
                  gentle restorative sequencing and prolonged relaxation asanas activate the
                  parasympathetic nervous system, melting accumulated stress.
                </p>
              )}
              {activeTab === 'breath' && (
                <p>
                  Classical Pranayama techniques (Anulom Vilom, Bhramari, Sheetali) harmonize
                  vagus nerve activity, easing chronic insomnia and restoring the natural circadian
                  rhythms of revitalizing sleep.
                </p>
              )}
              {activeTab === 'clarity' && (
                <p>
                  Through guided Dharana (one-pointed focus) and silent meditation, practitioners
                  cultivate non-reactive emotional poise, heightened cognitive clarity, and a
                  steadfast sense of presence.
                </p>
              )}
            </div>

            <div className="pt-2">
              <Link
                href="/schedule"
                className="inline-flex items-center space-x-2 bg-earth text-forest px-7 py-3.5 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-earth-light transition-all shadow-card"
              >
                <span>Experience Mindful Stillness</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Editorial Visual Composition */}
          <div className="lg:col-span-6 relative wellbeing-image-frame">
            <div className="relative aspect-[4/3] overflow-hidden shadow-elevated border border-earth/25 bg-forest-dark">
              <img
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=1200"
                alt="Meditation and Mindful Breathing at RBS Yoga Studio"
                className="w-full h-full object-cover filter saturate-[0.85] contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 p-4 bg-forest/80 backdrop-blur-md border border-earth/20">
                <div className="flex items-center space-x-2 text-earth text-xs font-semibold uppercase tracking-widest mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Breath Cycle Principle</span>
                </div>
                <p className="text-xs text-ivory/80 leading-relaxed font-light">
                  "When the breath wanders, the mind is unsteady; but when the breath is stilled,
                  the mind also will become calm." — Hatha Yoga Pradipika
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
