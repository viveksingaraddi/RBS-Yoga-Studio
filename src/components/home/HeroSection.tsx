'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroSectionProps {
  instructorName?: string;
  brandTagline?: string;
}

export default function HeroSection({
  instructorName = 'Master Sangu',
  brandTagline = 'The Art of Strength, Balance & Wellness',
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Staggered text & badge reveals
      gsap.from('.hero-badge', {
        opacity: 0,
        y: -15,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('.hero-headline-line', {
        opacity: 0,
        y: 40,
        duration: 1.1,
        stagger: 0.18,
        ease: 'power3.out',
        delay: 0.15,
      });

      gsap.from('.hero-desc', {
        opacity: 0,
        y: 25,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.45,
      });

      gsap.from('.hero-cta-btn', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        delay: 0.65,
      });

      gsap.from('.hero-stat', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.85,
      });

      // 2. Right Image Reveal & subtle scale
      gsap.from('.hero-img-container', {
        opacity: 0,
        scale: 0.96,
        duration: 1.2,
        ease: 'power2.out',
        delay: 0.3,
      });

      // 3. Gentle parallax on scroll
      if (imgRef.current) {
        gsap.to(imgRef.current, {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }

      if (quoteRef.current) {
        gsap.to(quoteRef.current, {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-ivory"
    >
      {/* Background Subtle Gradient & Decorative Texture */}
      <div className="absolute inset-0 bg-radial-gradient from-sage-light/60 via-ivory to-ivory opacity-80 pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Editorial Headline & CTAs */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10">
          <div className="hero-badge inline-flex items-center space-x-2.5 px-3.5 py-1.5 bg-sage text-forest text-xs uppercase tracking-[0.2em] font-semibold border border-olive/20">
            <Sparkles className="w-3.5 h-3.5 text-earth" />
            <span>Classical Yoga with {instructorName} (M.Sc. Yoga)</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-forest leading-[1.08] tracking-tight">
            <span className="hero-headline-line block">Find Your Balance.</span>
            <span className="hero-headline-line block italic font-light text-forest-light">
              Discover Your Strength.
            </span>
          </h1>

          <p className="hero-desc text-base sm:text-lg text-charcoal/80 max-w-xl font-normal leading-relaxed">
            Step into a journey of mindful movement, inner strength and lasting wellness.
            Rooted in authentic tradition, guided by over a decade of international teaching excellence.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-5">
            <Link
              href="/schedule"
              className="hero-cta-btn inline-flex items-center justify-center space-x-3 bg-forest text-ivory px-8 py-4 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-forest-light transition-all shadow-card group"
            >
              <span>Begin Your Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/#programs"
              className="hero-cta-btn inline-flex items-center justify-center space-x-2 border border-forest/30 text-forest px-8 py-4 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-sage/40 transition-colors"
            >
              <span>Explore Programs</span>
            </Link>
          </div>

          {/* Verified Badges */}
          <div className="pt-6 grid grid-cols-3 gap-4 border-t border-sage-dark/60 max-w-lg">
            <div className="hero-stat">
              <span className="block font-serif text-2xl sm:text-3xl font-semibold text-forest">
                10+ Years
              </span>
              <span className="text-[11px] sm:text-xs text-olive uppercase tracking-wider">
                Teaching Legacy
              </span>
            </div>
            <div className="hero-stat">
              <span className="block font-serif text-2xl sm:text-3xl font-semibold text-forest">
                M.Sc. Yoga
              </span>
              <span className="text-[11px] sm:text-xs text-olive uppercase tracking-wider">
                Academic Rigor
              </span>
            </div>
            <div className="hero-stat">
              <span className="block font-serif text-2xl sm:text-3xl font-semibold text-forest">
                Vietnam
              </span>
              <span className="text-[11px] sm:text-xs text-olive uppercase tracking-wider">
                Global Practice
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Image Composition */}
        <div className="lg:col-span-5 relative hero-img-container">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            {/* Main Portrait Card */}
            <div
              ref={imgRef}
              className="relative aspect-[3/4] overflow-hidden shadow-elevated border border-earth/20 bg-forest/5"
            >
              <img
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=1200"
                alt="Classical Yoga Asana Practice at RBS Yoga Studio"
                className="w-full h-full object-cover object-center filter saturate-[0.9] hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/75 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 text-ivory">
                <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
                  Lead Instructor
                </span>
                <p className="font-serif text-2xl font-medium tracking-wide">
                  {instructorName}, M.Sc. Yoga
                </p>
                <p className="text-xs text-ivory/80 mt-1">
                  10+ Years International Experience
                </p>
              </div>
            </div>

            {/* Floating Accented Quote Badge */}
            <div
              ref={quoteRef}
              className="hidden sm:block absolute -bottom-6 -left-8 bg-ivory/95 backdrop-blur-md p-5 border border-earth/30 shadow-card max-w-xs z-20"
            >
              <p className="font-serif italic text-forest text-sm leading-relaxed">
                "Yoga is not about touching your toes; it is about what you learn on the way down."
              </p>
              <span className="block text-[10px] uppercase tracking-widest text-olive mt-2 font-medium">
                — {brandTagline}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
