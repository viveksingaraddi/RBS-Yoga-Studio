'use client';

import { useState } from 'react';
import { MessageSquare, Phone, Mail, MapPin, Send, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface ContactSectionProps {
  businessName?: string;
  publicContactPhone?: string;
  publicWhatsAppNumber?: string;
  publicContactEmail?: string;
  businessAddress?: string;
  instructorName?: string;
}

export default function ContactSection({
  businessName = 'RBS Yoga Studio',
  publicContactPhone = '+91 89513 46405',
  publicWhatsAppNumber = '+91 89513 46405',
  publicContactEmail = 'contact@rbsyogastudio.com',
  businessAddress = 'Studio Location - To be finalized upon studio opening',
  instructorName = 'Master Sangu',
}: ContactSectionProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    interestedProgram: 'Hatha Yoga',
    preferredType: 'PHYSICAL',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cleanPhone = publicWhatsAppNumber.replace(/\D/g, '') || '918951346405';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        // Redirect to WhatsApp immediately after saving enquiry to DB
        if (data.whatsappUrl) {
          setTimeout(() => {
            window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
          }, 800);
        }
      } else {
        setErrorMsg(data.message || 'Could not submit enquiry. Please check your information.');
      }
    } catch {
      setErrorMsg('Network error. Please try again or contact us directly on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32 bg-sage-light border-t border-sage-dark/40 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Direct Info & Editorial */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
                Begin The Dialogue
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-forest leading-tight">
                Connect with {businessName}
              </h2>
              <p className="text-sm text-charcoal/80 leading-relaxed font-normal">
                Whether seeking class recommendations, scheduling personal guidance with {instructorName},
                or inquiring about memberships, we welcome your journey.
              </p>
            </div>

            <div className="space-y-6 pt-4 border-t border-sage-dark/50">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-forest text-ivory flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-forest">WhatsApp & Direct Phone</h4>
                  <p className="text-xs text-olive font-medium">{publicContactPhone}</p>
                  <span className="text-[11px] text-charcoal/60">Dedicated Studio Line</span>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-forest text-ivory flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-forest">Official Email</h4>
                  <p className="text-xs text-olive font-medium">{publicContactEmail}</p>
                  <span className="text-[11px] text-charcoal/60">Responsive within 24 hours</span>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-forest text-ivory flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-forest">Studio Location</h4>
                  <p className="text-xs text-olive">{businessAddress}</p>
                  <span className="text-[11px] text-charcoal/60">Global Virtual Shala Active Daily</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-ivory p-8 sm:p-12 border border-sage-dark/50 shadow-card">
              <div className="space-y-2 mb-8">
                <div className="inline-flex items-center space-x-2 text-earth text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Direct Studio Enquiry</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-forest">
                  Send Your Enquiry
                </h3>
                <p className="text-xs text-charcoal/70">
                  Submitting this form records your enquiry in our database and opens a prefilled message directly to {instructorName} on WhatsApp ({publicWhatsAppNumber}).
                </p>
              </div>

              {success ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-sage text-forest mx-auto flex items-center justify-center rounded-full">
                    <CheckCircle className="w-8 h-8 text-earth" />
                  </div>
                  <h4 className="font-serif text-2xl text-forest">
                    Enquiry Recorded Successfully
                  </h4>
                  <p className="text-sm text-charcoal/80 max-w-md mx-auto">
                    We have saved your details and initiated your WhatsApp conversation with {instructorName}. If WhatsApp did not open automatically, click below:
                  </p>
                  <div className="pt-4">
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-2 bg-[#25D366] text-white px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#1EBE5D] transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Open WhatsApp Chat ({publicWhatsAppNumber})</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 text-red-800 text-xs border border-red-200 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Aditi Sharma"
                        className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                        Phone Number (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@domain.com"
                        className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                        Interested Program
                      </label>
                      <select
                        value={formData.interestedProgram}
                        onChange={(e) => setFormData({ ...formData, interestedProgram: e.target.value })}
                        className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest"
                      >
                        <option value="Hatha Yoga">Classical Hatha Yoga</option>
                        <option value="Pranayama">Pranayama & Breathwork</option>
                        <option value="Meditation">Mindfulness & Yoga Nidra</option>
                        <option value="Group Yoga">Group Yoga Sessions</option>
                        <option value="Online Yoga">Online Yoga Stream</option>
                        <option value="Personal Yoga">Personal 1-on-1 Mentorship</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                      Preferred Mode
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['PHYSICAL', 'ONLINE', 'HYBRID'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setFormData({ ...formData, preferredType: mode })}
                          className={`py-2 text-xs uppercase tracking-wider font-semibold border transition-all ${
                            formData.preferredType === mode
                              ? 'bg-forest text-ivory border-forest'
                              : 'bg-sage-light/30 border-sage-dark/50 text-charcoal/70'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                      Your Message or Practice Goals *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={`Tell us about your prior experience, flexibility, health considerations or questions for ${instructorName}...`}
                      className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-forest text-ivory py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-forest-light transition-all flex items-center justify-center space-x-2 shadow-card"
                  >
                    <span>{loading ? 'Recording Enquiry...' : `Submit & Connect on WhatsApp (${publicWhatsAppNumber})`}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
