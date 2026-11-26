'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Clock, MapPin, Video, Users, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScheduleItem {
  id: string;
  startTime: string | Date;
  endTime: string | Date;
  capacity: number;
  bookedCount: number;
  deliveryType: string;
  location: string | null;
  class: {
    title: string;
    price: number | string;
    instructor: string;
  };
}

export default function TimetableSection({ schedules }: { schedules: ScheduleItem[] }) {
  const [filterType, setFilterType] = useState<'ALL' | 'PHYSICAL' | 'ONLINE'>('ALL');
  const sectionRef = useRef<HTMLElement>(null);

  const filtered = schedules.filter((s) => {
    if (filterType === 'ALL') return true;
    return s.deliveryType === filterType;
  });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.timetable-header', {
        opacity: 0,
        y: 25,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
      });

      gsap.from('.timetable-row', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [filtered.length]);

  return (
    <section ref={sectionRef} id="schedule" className="py-14 sm:py-20 bg-ivory border-t border-sage-dark/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="timetable-header flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
              Live Studio & Online Batches (Monday to Friday · 5 Days a Week)
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-forest leading-tight">
              Join a Daily Practice Batch
            </h2>
            <p className="text-sm text-charcoal/80 max-w-xl font-normal">
              Morning Batches: <strong>6:00 AM – 7:00 AM</strong> & <strong>7:15 AM – 8:15 AM</strong>.
              <br />
              Evening Batches: <strong>6:00 PM – 7:00 PM</strong> & <strong>7:15 PM – 8:15 PM</strong>.
            </p>
          </div>

          {/* Type Filter Buttons */}
          <div className="mt-6 md:mt-0 flex items-center space-x-2 bg-sage p-1 border border-sage-dark/40">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
                filterType === 'ALL'
                  ? 'bg-forest text-ivory shadow-sm'
                  : 'text-charcoal/70 hover:text-forest'
              }`}
            >
              All Formats
            </button>
            <button
              onClick={() => setFilterType('PHYSICAL')}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
                filterType === 'PHYSICAL'
                  ? 'bg-forest text-ivory shadow-sm'
                  : 'text-charcoal/70 hover:text-forest'
              }`}
            >
              Physical Shala
            </button>
            <button
              onClick={() => setFilterType('ONLINE')}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
                filterType === 'ONLINE'
                  ? 'bg-forest text-ivory shadow-sm'
                  : 'text-charcoal/70 hover:text-forest'
              }`}
            >
              Online Live
            </button>
          </div>
        </div>

        {/* Timetable List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-sage-light border border-sage-dark/30">
            <p className="text-charcoal/70 text-sm">
              No sessions found matching the selected filter.
            </p>
          </div>
        ) : (
          <div className="timetable-list divide-y divide-sage-dark/40 border-y border-sage-dark/40">
            {filtered.slice(0, 6).map((item) => {
              const start = new Date(item.startTime);
              const end = new Date(item.endTime);
              const availableSlots = Math.max(0, item.capacity - item.bookedCount);
              const isFull = availableSlots <= 0;

              const timeStr = `${start.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

              const dateStr = start.toLocaleDateString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={item.id}
                  className="timetable-row py-6 sm:py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-sage-light/50 px-4 transition-colors"
                >
                  {/* Date & Time Column */}
                  <div className="flex items-start sm:items-center space-x-6">
                    <div className="w-16 h-16 bg-sage flex flex-col items-center justify-center border border-olive/20 shrink-0">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-olive">
                        {start.toLocaleDateString([], { month: 'short' })}
                      </span>
                      <span className="font-serif text-2xl font-semibold text-forest">
                        {start.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs uppercase tracking-widest text-earth font-semibold">
                          {dateStr}
                        </span>
                        <span className="text-xs text-olive">·</span>
                        <span className="text-xs text-olive font-medium flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-earth" />
                          <span>{timeStr}</span>
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl text-forest font-medium">
                        {item.class.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal/70 pt-0.5">
                        <span className="font-medium text-forest">
                          Instructor: {item.class.instructor}
                        </span>
                        <span>·</span>
                        <span className="flex items-center space-x-1">
                          {item.deliveryType === 'ONLINE' ? (
                            <Video className="w-3.5 h-3.5 text-earth" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-earth" />
                          )}
                          <span>{item.location || 'Studio Shala'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing, Availability & Action CTA */}
                  <div className="flex items-center justify-between lg:justify-end space-x-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-sage-dark/30">
                    <div className="text-left lg:text-right">
                      <div className="text-xs text-olive font-medium flex items-center space-x-1.5 lg:justify-end">
                        <Users className="w-3.5 h-3.5 text-earth" />
                        <span>
                          {isFull ? (
                            <strong className="text-red-700">Full</strong>
                          ) : (
                            <span>{availableSlots} spots left</span>
                          )}
                        </span>
                      </div>
                      <span className="font-serif text-xl font-semibold text-forest block">
                        ₹{Number(item.class.price)}
                      </span>
                    </div>

                    <Link
                      href={isFull ? '#' : `/schedule/book/${item.id}`}
                      className={`inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold px-6 py-3.5 transition-all ${
                        isFull
                          ? 'bg-sage text-olive cursor-not-allowed'
                          : 'bg-forest text-ivory hover:bg-forest-light shadow-sm'
                      }`}
                    >
                      <span>{isFull ? 'Waitlist' : 'Reserve Slot'}</span>
                      {!isFull && <ArrowRight className="w-3.5 h-3.5" />}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/schedule"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-forest font-semibold hover:text-earth underline underline-offset-8 transition-colors"
          >
            <span>View Full Month Calendar & Sittings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
