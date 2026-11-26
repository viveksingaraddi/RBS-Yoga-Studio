'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GallerySection({ businessName = 'RBS Studio' }: { businessName?: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  const images = [
    {
      url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=1000',
      title: 'Precision Alignment & Asana Balance',
      category: 'Asana Practice',
    },
    {
      url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000',
      title: 'Morning Breathwork & Pranayama Sanctuary',
      category: 'Pranayama',
    },
    {
      url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=1000',
      title: 'Deep Mindful Stillness & Meditation',
      category: 'Meditation',
    },
    {
      url: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=1000',
      title: 'Community Shala Group Energy',
      category: 'Group Practice',
    },
    {
      url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&q=80&w=1000',
      title: 'Personal Posture Guidance',
      category: 'Instruction',
    },
    {
      url: 'https://images.unsplash.com/photo-1552196563-5523e198b164?auto=format&fit=crop&q=80&w=1000',
      title: 'Sunset Shala Harmony & Serenity',
      category: 'Studio Ambience',
    },
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.gallery-header', {
        opacity: 0,
        y: 25,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
      });

      gsap.from('.gallery-card', {
        opacity: 0,
        scale: 0.96,
        y: 25,
        duration: 0.75,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="gallery" className="py-14 sm:py-20 bg-ivory border-t border-sage-dark/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="gallery-header text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
            Visual Harmony
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-forest leading-tight">
            The Spirit of {businessName}
          </h2>
          <p className="text-sm text-charcoal/80 font-normal">
            Moments of devotion, mindful concentration, and serene atmosphere across our physical
            and virtual spaces.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="gallery-card group relative aspect-[4/3] overflow-hidden bg-forest/5 border border-sage-dark/40 shadow-sm"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover object-center filter saturate-[0.9] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-ivory pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-ivory">
                <span className="text-[10px] uppercase tracking-widest text-earth font-semibold">
                  {img.category}
                </span>
                <p className="font-serif text-lg font-medium">
                  {img.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
