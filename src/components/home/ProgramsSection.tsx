'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProgramItem {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  imageUrl: string;
  deliveryType: string;
  duration: string;
  price: number | null;
}

export default function ProgramsSection({
  programs,
  instructorName = 'Master Sangu',
}: {
  programs: ProgramItem[];
  instructorName?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.programs-header', {
        opacity: 0,
        y: 25,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
      });

      gsap.from('.program-card', {
        opacity: 0,
        y: 30,
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
  }, []);

  return (
    <section ref={sectionRef} id="programs" className="py-14 sm:py-20 bg-ivory-pure border-t border-sage-dark/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="programs-header flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
              Holistic Offerings
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-forest leading-tight">
              Curated Yogic Disciplines
            </h2>
            <p className="text-sm text-charcoal/80 leading-relaxed font-normal">
              Whether you are taking your first mindful breath or seeking advanced mastery,
              our programs are architected to meet your schedule and elevate your wellbeing under {instructorName}.
            </p>
          </div>

          <Link
            href="/schedule"
            className="mt-6 md:mt-0 inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-forest font-semibold hover:text-earth transition-colors group"
          >
            <span>View Full Timetable</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Programs Grid */}
        <div className="programs-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program) => (
            <div
              key={program.id}
              className="program-card bg-ivory border border-sage-dark/40 overflow-hidden hover:border-earth/50 hover:shadow-card transition-all duration-300 flex flex-col group"
            >
              {/* Image Frame */}
              <div className="relative aspect-[16/10] overflow-hidden bg-forest/5">
                <img
                  src={program.imageUrl}
                  alt={program.title}
                  className="w-full h-full object-cover object-center filter saturate-[0.9] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-forest/90 text-ivory text-[10px] uppercase tracking-widest font-semibold backdrop-blur-sm">
                    {program.deliveryType}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-xs text-olive font-medium">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-earth" />
                      <span>{program.duration}</span>
                    </span>
                    <span>·</span>
                    <span>{instructorName}</span>
                  </div>

                  <h3 className="font-serif text-2xl text-forest group-hover:text-forest-light transition-colors">
                    {program.title}
                  </h3>

                  <p className="text-sm text-charcoal/75 leading-relaxed line-clamp-3">
                    {program.shortDesc ||
                      'Authentic yogic instruction focusing on posture precision, breath synchronization, and mindful calmness.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-sage-dark/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-olive block">
                      Single Session
                    </span>
                    <span className="font-serif text-xl font-semibold text-forest">
                      {program.price ? `₹${program.price}` : 'Configurable'}
                    </span>
                  </div>

                  <Link
                    href={`/schedule?program=${program.slug}`}
                    className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-semibold bg-forest text-ivory px-4 py-2.5 hover:bg-forest-light transition-all shadow-sm"
                  >
                    <span>Reserve</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
