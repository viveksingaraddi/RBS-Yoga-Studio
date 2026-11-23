import Link from 'next/link';
import { ArrowUpRight, Instagram, Facebook, Youtube, Phone, Mail, MapPin, Globe } from 'lucide-react';

interface FooterProps {
  businessName?: string;
  brandTagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  timezone?: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  websiteUrl?: string | null;
  instructorName?: string;
}

export default function Footer({
  businessName = 'RBS Yoga Studio',
  brandTagline = 'The Art of Strength, Balance & Wellness',
  contactEmail = 'contact@rbsyogastudio.com',
  contactPhone = '+91 89513 46405',
  address = 'RBS Studio Pavilion, Bangalore / Global Online Shala (Physical address to be finalized)',
  timezone = 'Asia/Kolkata',
  instagramUrl = 'https://instagram.com/rbsyogastudio',
  facebookUrl = 'https://facebook.com/rbsyogastudio',
  youtubeUrl = 'https://youtube.com/@rbsyogastudio',
  websiteUrl = 'https://rbsyogastudio.com',
  instructorName = 'Master Sangu',
}: FooterProps) {
  return (
    <footer className="bg-forest text-ivory pt-20 pb-12 border-t border-earth/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-ivory/10">
          {/* Column 1: Studio Vision & Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block">
              <span className="font-serif text-3xl font-semibold tracking-wider text-ivory">
                {businessName}
              </span>
              <p className="text-xs uppercase tracking-[0.25em] text-earth mt-1 font-medium">
                {brandTagline}
              </p>
            </Link>
            <p className="text-sm text-ivory/70 leading-relaxed max-w-sm">
              Rooted in classical yogic traditions and guided by {instructorName} (M.Sc. Yoga).
              We combine posture precision, conscious breathwork, and deep mental stillness to
              empower life-long balance and vitality.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-earth">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="hover:text-ivory transition-colors p-2.5 bg-forest-light border border-earth/20 rounded-none"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="hover:text-ivory transition-colors p-2.5 bg-forest-light border border-earth/20 rounded-none"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="hover:text-ivory transition-colors p-2.5 bg-forest-light border border-earth/20 rounded-none"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Official Website"
                  className="hover:text-ivory transition-colors p-2.5 bg-forest-light border border-earth/20 rounded-none"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Programs */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-earth font-semibold">
              Yoga Programs
            </h4>
            <ul className="space-y-2.5 text-sm text-ivory/75">
              <li>
                <Link href="/programs#hatha-yoga" className="hover:text-ivory transition-colors">
                  Classical Hatha Yoga
                </Link>
              </li>
              <li>
                <Link href="/programs#pranayama" className="hover:text-ivory transition-colors">
                  Pranayama & Breathwork
                </Link>
              </li>
              <li>
                <Link href="/programs#meditation" className="hover:text-ivory transition-colors">
                  Mindfulness & Yoga Nidra
                </Link>
              </li>
              <li>
                <Link href="/programs#group-yoga" className="hover:text-ivory transition-colors">
                  Group Shala Sessions
                </Link>
              </li>
              <li>
                <Link href="/programs#online-yoga-sessions" className="hover:text-ivory transition-colors">
                  Online Live Classes
                </Link>
              </li>
              <li>
                <Link href="/programs#personal-yoga-sessions" className="hover:text-ivory transition-colors">
                  Personal Mentorship
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-earth font-semibold">
              Explore & Join
            </h4>
            <ul className="space-y-2.5 text-sm text-ivory/75">
              <li>
                <Link href="/#philosophy" className="hover:text-ivory transition-colors">
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link href="/#instructor" className="hover:text-ivory transition-colors">
                  {instructorName} Profile
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="hover:text-ivory transition-colors">
                  Class Timetable
                </Link>
              </li>
              <li>
                <Link href="/memberships" className="hover:text-ivory transition-colors">
                  Memberships & Passes
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-ivory transition-colors">
                  Studio Gallery
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-ivory transition-colors">
                  Learner Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Dynamic Verified Contact */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-earth font-semibold">
              Studio Information
            </h4>
            <div className="space-y-3 text-sm text-ivory/75">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-earth shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">{address}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-earth shrink-0" />
                <span className="text-xs">{contactEmail}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-earth shrink-0" />
                <span className="text-xs">{contactPhone}</span>
              </div>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 text-[11px] uppercase tracking-wider bg-earth/20 text-earth font-semibold">
                  Timezone: {timezone}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory/50 space-y-4 sm:space-y-0">
          <p>
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-ivory transition-colors">
              Guided by {instructorName} (M.Sc. Yoga)
            </span>
            <span className="text-earth">·</span>
            <Link href="/admin" className="hover:text-earth transition-colors">
              Studio Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
