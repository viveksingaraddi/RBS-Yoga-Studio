import { prisma } from '@/lib/prisma';
import { getBusinessSettings } from '@/lib/settings';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, MapPin, Video, Users, ArrowRight } from 'lucide-react';

export const revalidate = 30;

export default async function SchedulePage() {
  const settings = await getBusinessSettings();
  const schedules = await prisma.classSchedule.findMany({
    where: {
      isCancelled: false,
      startTime: { gte: new Date() },
    },
    include: {
      class: true,
    },
    orderBy: { startTime: 'asc' },
  });

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
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
              Shala Timetable & Sittings
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-normal text-forest leading-tight">
              Class Schedule
            </h1>
            <div className="w-16 h-[2px] bg-earth mx-auto my-3" />
            <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed font-normal">
              Book your spot in advance to ensure dedicated individual attention.
              Sessions are capped to preserve optimal instructor guidance by Master Sangu.
            </p>
          </div>

          {/* Schedule List */}
          {schedules.length === 0 ? (
            <div className="text-center py-20 bg-sage-light border border-sage-dark/40">
              <CalendarIcon className="w-10 h-10 text-earth mx-auto mb-3" />
              <p className="font-serif text-2xl text-forest">No Upcoming Sittings Scheduled</p>
              <p className="text-xs text-charcoal/70 mt-1">
                Please check back soon or contact the studio on WhatsApp for custom scheduling.
              </p>
            </div>
          ) : (
            <div className="bg-ivory border border-sage-dark/40 shadow-card divide-y divide-sage-dark/30">
              {schedules.map((schedule) => {
                const start = new Date(schedule.startTime);
                const end = new Date(schedule.endTime);
                const spotsLeft = Math.max(0, schedule.capacity - schedule.bookedCount);
                const isFull = spotsLeft <= 0;

                const timeStr = `${start.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                const dateStr = start.toLocaleDateString([], {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={schedule.id}
                    className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-sage-light/40 transition-colors"
                  >
                    <div className="flex items-start sm:items-center space-x-6">
                      <div className="w-18 h-18 bg-sage flex flex-col items-center justify-center border border-olive/20 shrink-0">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-olive">
                          {start.toLocaleDateString([], { month: 'short' })}
                        </span>
                        <span className="font-serif text-3xl font-semibold text-forest">
                          {start.getDate()}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-earth font-medium">
                          {start.toLocaleDateString([], { weekday: 'short' })}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs uppercase tracking-widest text-earth font-semibold">
                            {dateStr}
                          </span>
                          <span className="text-xs text-olive">·</span>
                          <span className="text-xs text-olive font-medium flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-earth" />
                            <span>{timeStr}</span>
                          </span>
                        </div>

                        <h3 className="font-serif text-2xl sm:text-3xl text-forest font-medium">
                          {schedule.class.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal/70">
                          <span className="font-medium text-forest">
                            Instructor: {schedule.class.instructor}
                          </span>
                          <span>·</span>
                          <span className="flex items-center space-x-1">
                            {schedule.deliveryType === 'ONLINE' ? (
                              <Video className="w-3.5 h-3.5 text-earth" />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 text-earth" />
                            )}
                            <span>{schedule.location || 'Studio Shala'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end space-x-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-sage-dark/30">
                      <div className="text-left lg:text-right">
                        <div className="text-xs text-olive font-medium flex items-center space-x-1.5 lg:justify-end">
                          <Users className="w-3.5 h-3.5 text-earth" />
                          <span>
                            {isFull ? (
                              <strong className="text-red-700">Class Full</strong>
                            ) : (
                              <span>{spotsLeft} of {schedule.capacity} spots open</span>
                            )}
                          </span>
                        </div>
                        <span className="font-serif text-2xl font-semibold text-forest block">
                          ₹{Number(schedule.class.price)}
                        </span>
                      </div>

                      <Link
                        href={isFull ? '#' : `/schedule/book/${schedule.id}`}
                        className={`inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold px-7 py-4 transition-all ${
                          isFull
                            ? 'bg-sage text-olive cursor-not-allowed'
                            : 'bg-forest text-ivory hover:bg-forest-light shadow-card'
                        }`}
                      >
                        <span>{isFull ? 'Waitlist Full' : 'Book Your Mat'}</span>
                        {!isFull && <ArrowRight className="w-3.5 h-3.5" />}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
