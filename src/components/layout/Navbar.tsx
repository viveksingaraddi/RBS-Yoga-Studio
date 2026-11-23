'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User, Calendar, ChevronDown, MessageCircle, Sparkles } from 'lucide-react';

interface NavbarProps {
  businessName?: string;
  brandTagline?: string;
  whatsAppNumber?: string;
}

export default function Navbar({
  businessName = 'RBS Yoga Studio',
  brandTagline = 'The Art of Strength, Balance & Wellness',
  whatsAppNumber = '+91 89513 46405',
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const cleanPhone = whatsAppNumber.replace(/\D/g, '') || '918951346405';
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Namaste RBS Yoga Studio! I would like to enquire about your yoga sessions with Master Sangu.'
  )}`;

  const primaryLinks = [
    { name: 'Philosophy', href: '/#philosophy' },
    { name: 'Master Sangu', href: '/#instructor' },
    { name: 'Programs', href: '/#programs' },
    { name: 'Schedule', href: '/schedule' },
    { name: 'Memberships', href: '/memberships' },
    { name: 'Contact', href: '/contact' },
  ];

  const secondaryLinks = [
    { name: 'Mental Wellbeing', href: '/#wellbeing' },
    { name: 'Studio Gallery', href: '/gallery' },
    { name: 'All Programs Guide', href: '/programs' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ivory/95 backdrop-blur-md shadow-subtle py-2.5 sm:py-3 border-b border-sage-dark/40'
          : 'bg-ivory/80 lg:bg-transparent py-4 sm:py-5 border-b border-sage-dark/20 lg:border-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* BRAND IDENTITY BLOCK */}
        <Link
          href="/"
          className="group flex flex-col justify-center min-w-[205px] max-w-[240px] select-none text-left"
        >
          <span className="font-serif text-[24px] sm:text-[27px] lg:text-[29px] font-semibold text-forest leading-none tracking-tight group-hover:text-forest-light transition-colors whitespace-nowrap">
            {businessName}
          </span>
          <span className="text-[10px] sm:text-[11px] tracking-[0.19em] sm:tracking-[0.22em] uppercase text-olive font-medium mt-1 truncate block">
            {brandTagline}
          </span>
        </Link>

        {/* DESKTOP PRIMARY NAVIGATION */}
        <nav className="hidden xl:flex items-center space-x-6 text-[12px] uppercase tracking-[0.16em] font-medium text-charcoal/85">
          {primaryLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="py-1 hover:text-forest transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-earth hover:after:w-full after:transition-all"
            >
              {link.name}
            </Link>
          ))}

          {/* EXPLORE DROPDOWN */}
          <div
            className="relative"
            onMouseEnter={() => setExploreOpen(true)}
            onMouseLeave={() => setExploreOpen(false)}
          >
            <button
              onClick={() => setExploreOpen(!exploreOpen)}
              className="inline-flex items-center space-x-1 py-1 hover:text-forest transition-colors uppercase tracking-[0.16em]"
              aria-expanded={exploreOpen}
            >
              <span>Explore</span>
              <ChevronDown className={`w-3.5 h-3.5 text-earth transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`} />
            </button>

            {exploreOpen && (
              <div className="absolute top-full right-0 w-48 bg-ivory border border-sage-dark/50 shadow-card py-2 mt-1 animate-in fade-in-50 zoom-in-95 duration-150">
                {secondaryLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setExploreOpen(false)}
                    className="block px-4 py-2 text-xs uppercase tracking-wider text-charcoal/80 hover:bg-sage/40 hover:text-forest transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Medium Screen Nav (1024px - 1279px): streamlined links */}
        <nav className="hidden lg:flex xl:hidden items-center space-x-4 text-[11px] uppercase tracking-wider font-medium text-charcoal/85">
          <Link href="/#philosophy" className="hover:text-forest transition-colors">Philosophy</Link>
          <Link href="/#instructor" className="hover:text-forest transition-colors">Master Sangu</Link>
          <Link href="/#programs" className="hover:text-forest transition-colors">Programs</Link>
          <Link href="/schedule" className="hover:text-forest transition-colors">Schedule</Link>
          <Link href="/memberships" className="hover:text-forest transition-colors">Memberships</Link>
          <Link href="/contact" className="hover:text-forest transition-colors">Contact</Link>
        </nav>

        {/* ACTIONS: PORTAL & BOOK CTA */}
        <div className="hidden sm:flex items-center space-x-3.5">
          <Link
            href="/login"
            className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider text-forest font-semibold px-3 py-2 hover:text-forest-dark transition-colors"
          >
            <User className="w-3.5 h-3.5 text-earth" />
            <span>Portal</span>
          </Link>

          <Link
            href="/schedule"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold bg-forest text-ivory px-5 py-2.5 hover:bg-forest-light transition-all shadow-sm"
          >
            <span>Book a Class</span>
            <Calendar className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
          className="lg:hidden p-2 text-forest hover:text-forest-dark focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE FULL-SCREEN RESPONSIVE DRAWER */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-[65px] bg-ivory z-50 flex flex-col justify-between p-6 sm:p-8 overflow-y-auto border-t border-sage-dark/40 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-6">
            <div className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold border-b border-sage-dark/30 pb-2">
              Studio Navigation
            </div>

            <nav className="flex flex-col space-y-3.5 text-sm uppercase tracking-widest font-medium text-charcoal">
              {primaryLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="py-1 hover:text-forest transition-colors flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <span className="text-earth text-xs">→</span>
                </Link>
              ))}

              <div className="border-t border-sage-dark/30 pt-3 space-y-3 text-xs text-olive">
                {secondaryLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-1 hover:text-forest transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <div className="space-y-3 pt-6 border-t border-sage-dark/40">
            <Link
              href="/schedule"
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-xs uppercase tracking-widest font-semibold bg-forest text-ivory py-3.5 shadow-sm block"
            >
              Book a Class with Master Sangu
            </Link>

            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-xs uppercase tracking-widest font-semibold border border-forest/40 text-forest py-3 block hover:bg-forest/5"
            >
              Learner Portal Sign In
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-xs uppercase tracking-widest font-semibold bg-[#25D366] text-white py-3 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Direct Enquiry</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
