'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface InstructorSectionProps {
  instructorName?: string;
  instructorBiography?: string;
}

export default function InstructorSection({
  instructorName = 'Master Sangu',
  instructorBiography,
}: InstructorSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const defaultBio =
    `${instructorName} is the Lead Yoga Instructor at RBS Yoga Studio, bringing an authentic ` +
    `blend of rigorous academic study and deep practical immersion to every practitioner. ` +
    `Holding a prestigious M.Sc. in Yoga, ${instructorName} possesses over a decade of ` +
    `dedicated teaching experience across premier studios, including extensive international instruction in Vietnam.`;

  const bioToDisplay = instructorBiography || defaultBio;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Image reveal from left
      gsap.from('.instructor-portrait-card', {
        opacity: 0,
        x: -45,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.instructor-portrait-card',
          start: 'top 80%',
        },
      });

      // Text entrance from right
      gsap.from('.instructor-bio-text', {
        opacity: 0,
        x: 45,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.instructor-bio-text',
          start: 'top 80%',
        },
      });

      // Sequential credentials checklist
      gsap.from('.instructor-credential', {
        opacity: 0,
        y: 20,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.instructor-credentials-grid',
          start: 'top 85%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="instructor" className="py-24 sm:py-32 bg-ivory relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Portrait and Credentials Card */}
          <div className="lg:col-span-5 relative instructor-portrait-card">
            <div className="relative aspect-[3/4] overflow-hidden shadow-elevated border border-earth/25 bg-forest/5">
              <img
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200"
                alt={`Lead Yoga Instructor ${instructorName}`}
                className="w-full h-full object-cover object-center filter saturate-[0.88] hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 text-ivory">
                <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-earth font-semibold mb-1">
                  Lead Yoga Instructor
                </span>
                <h3 className="font-serif text-3xl font-medium tracking-wide">
                  {instructorName}
                </h3>
                <p className="text-xs text-ivory/80 mt-1">
                  M.Sc. Yoga · 10+ Years Teaching Experience
                </p>
              </div>
            </div>

            {/* Vietnam Experience Badge */}
            <div className="absolute -top-4 -right-4 bg-forest text-ivory px-4 py-3 shadow-card border border-earth/30">
              <span className="block text-[10px] uppercase tracking-widest text-earth font-semibold">
                International Experience
              </span>
              <span className="font-serif text-lg">
                Vietnam
              </span>
            </div>
          </div>

          {/* Right Column: Instructor Biography and Verified Credentials */}
          <div className="lg:col-span-7 space-y-6 instructor-bio-text">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
                Guiding Your Sadhana
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-forest leading-tight">
                Authentic Wisdom. <br />
                <span className="italic font-light">Rooted in Mastery.</span>
              </h2>
            </div>

            <p className="text-base text-charcoal/85 leading-relaxed font-normal">
              {bioToDisplay}
            </p>

            <p className="text-sm text-charcoal/75 leading-relaxed">
              His pedagogical philosophy emphasizes non-competitive progression, anatomical safety,
              breath synchronization, and unlocking inner mental stability. Whether guiding beginner
              seekers through foundational Hatha asanas or coaching advanced disciples in subtle
              pranayama, his compassionate presence empowers authentic transformation.
            </p>

            {/* Verified Credentials Checklist */}
            <div className="instructor-credentials-grid pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-sage-dark/50">
              <div className="instructor-credential flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-earth shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif text-lg text-forest">M.Sc. Yoga</h4>
                  <p className="text-xs text-olive">Postgraduate Degree in Yogic Science</p>
                </div>
              </div>

              <div className="instructor-credential flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-earth shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif text-lg text-forest">10+ Years Experience</h4>
                  <p className="text-xs text-olive">Dedicated Full-Time Teaching</p>
                </div>
              </div>

              <div className="instructor-credential flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-earth shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif text-lg text-forest">International Work</h4>
                  <p className="text-xs text-olive">Extensive Teaching Experience in Vietnam</p>
                </div>
              </div>

              <div className="instructor-credential flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-earth shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif text-lg text-forest">Lead Yoga Instructor</h4>
                  <p className="text-xs text-olive">Curriculum & Practice Director</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                href="/schedule"
                className="inline-flex items-center justify-center space-x-2 bg-forest text-ivory px-7 py-3.5 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-forest-light transition-all shadow-sm"
              >
                <span>Book Class with {instructorName}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center space-x-2 border border-forest/30 text-forest px-7 py-3.5 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-sage/40 transition-colors"
              >
                <span>Request Personal Mentorship</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
