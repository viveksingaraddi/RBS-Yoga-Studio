'use client';

import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp({
  whatsAppNumber = '+91 89513 46405',
}: {
  whatsAppNumber?: string;
}) {
  const cleanPhone = whatsAppNumber.replace(/\D/g, '') || '918951346405';
  const prefilledMessage = encodeURIComponent(
    'Namaste RBS Yoga Studio! I would like to enquire about your yoga programs with Master Sangu.'
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${prefilledMessage}`;

  return (
    <aside
      aria-label="Direct studio enquiry"
      className="fixed bottom-6 right-6 z-40 flex items-center group"
    >
      <span className="hidden sm:inline-block mr-3 px-3 py-1.5 bg-forest text-ivory text-xs font-medium tracking-wide shadow-card rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Enquire with Master Sangu
      </span>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Direct WhatsApp enquiry with RBS Yoga Studio"
        className="w-13 h-13 p-3.5 bg-[#25D366] text-white rounded-full shadow-elevated hover:bg-[#1EBE5D] transition-transform duration-300 hover:scale-105 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>
    </aside>
  );
}
