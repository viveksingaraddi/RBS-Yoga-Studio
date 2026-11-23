'use client';

import { useState } from 'react';
import { Save, CheckCircle2, AlertCircle, Building2, Phone, Bell, Globe2, Share2, HelpCircle } from 'lucide-react';

export default function AdminSettingsForm({ initialSettings }: { initialSettings: any }) {
  const [formData, setFormData] = useState({
    // Section 1: Brand Identity
    businessName: initialSettings?.businessName || 'RBS Yoga Studio',
    brandTagline: initialSettings?.brandTagline || initialSettings?.tagline || 'The Art of Strength, Balance & Wellness',
    instructorName: initialSettings?.instructorName || initialSettings?.leadInstructor || 'Master Sangu',
    instructorBiography: initialSettings?.instructorBiography || initialSettings?.instructorBio || '',

    // Section 2: Public Contact Information
    publicWhatsAppNumber: initialSettings?.publicWhatsAppNumber || initialSettings?.whatsappNumber || '+91 89513 46405',
    publicContactPhone: initialSettings?.publicContactPhone || initialSettings?.contactPhone || '+91 89513 46405',
    publicContactEmail: initialSettings?.publicContactEmail || initialSettings?.contactEmail || 'contact@rbsyogastudio.com',
    businessAddress: initialSettings?.businessAddress || initialSettings?.address || 'Studio Location - To be finalized upon studio opening',

    // Section 3: Notification Configuration
    adminNotificationEmail: initialSettings?.adminNotificationEmail || 'owner@rbsyogastudio.com',
    notifyOnBooking: initialSettings?.notifyOnBooking ?? true,
    notifyOnEnquiry: initialSettings?.notifyOnEnquiry ?? true,
    notifyOnPayment: initialSettings?.notifyOnPayment ?? true,
    notifyOnMembership: initialSettings?.notifyOnMembership ?? true,

    // Section 4: Regional Settings
    timezone: initialSettings?.timezone || 'Asia/Kolkata',
    currency: initialSettings?.currency || 'INR',

    // Section 5: Social Media & Links
    instagramUrl: initialSettings?.instagramUrl || 'https://instagram.com/rbsyogastudio',
    facebookUrl: initialSettings?.facebookUrl || 'https://facebook.com/rbsyogastudio',
    youtubeUrl: initialSettings?.youtubeUrl || 'https://youtube.com/@rbsyogastudio',
    websiteUrl: initialSettings?.websiteUrl || 'https://rbsyogastudio.com',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setErrorMsg(data.message || 'Failed to update settings');
      }
    } catch {
      setErrorMsg('Network error while saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-900 text-xs border border-emerald-300 flex items-center space-x-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>All business settings and notification configurations updated and persisted to PostgreSQL.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-900 text-xs border border-red-300 flex items-center space-x-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1 — BRAND IDENTITY */}
      <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center space-x-3 border-b border-sage-dark/30 pb-4">
          <Building2 className="w-5 h-5 text-earth" />
          <div>
            <h2 className="font-serif text-2xl text-forest font-medium">Section 1 — Brand Identity</h2>
            <p className="text-xs text-olive">Configure the official studio name, brand tagline, and lead instructor profile.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
              Studio Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
            <p className="text-[11px] text-olive mt-1">Appears in header brand block, hero text, and meta titles.</p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
              Brand Tagline *
            </label>
            <input
              type="text"
              required
              value={formData.brandTagline}
              onChange={(e) => setFormData({ ...formData, brandTagline: e.target.value })}
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
            <p className="text-[11px] text-olive mt-1">Appears directly below the studio name in the navbar & footer.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
              Lead Yoga Instructor *
            </label>
            <input
              type="text"
              required
              value={formData.instructorName}
              onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
            <p className="text-[11px] text-olive mt-1">Default: Master Sangu (M.Sc. Yoga)</p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
              Website Official URL
            </label>
            <input
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
            <p className="text-[11px] text-olive mt-1">Canonical studio website address.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
            Master Sangu Biography & Teaching Philosophy
          </label>
          <textarea
            rows={3}
            value={formData.instructorBiography}
            onChange={(e) => setFormData({ ...formData, instructorBiography: e.target.value })}
            className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest resize-none leading-relaxed"
          />
          <p className="text-[11px] text-olive mt-1">Displayed on the public homepage instructor section and dedicated profile pages.</p>
        </div>
      </div>

      {/* SECTION 2 — PUBLIC CONTACT INFORMATION */}
      <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center space-x-3 border-b border-sage-dark/30 pb-4">
          <Phone className="w-5 h-5 text-earth" />
          <div>
            <h2 className="font-serif text-2xl text-forest font-medium">Section 2 — Public Contact Information</h2>
            <p className="text-xs text-olive">Manage public customer-facing communication channels.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
              Public WhatsApp Business Number *
            </label>
            <input
              type="text"
              required
              value={formData.publicWhatsAppNumber}
              onChange={(e) => setFormData({ ...formData, publicWhatsAppNumber: e.target.value })}
              placeholder="+91 89513 46405"
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest font-medium"
            />
            <p className="text-[11px] text-olive mt-1">
              Powers floating WhatsApp pill and prefilled WhatsApp redirects. (e.g. <code>+91 89513 46405</code>)
            </p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
              Public Contact Phone *
            </label>
            <input
              type="text"
              required
              value={formData.publicContactPhone}
              onChange={(e) => setFormData({ ...formData, publicContactPhone: e.target.value })}
              placeholder="+91 89513 46405"
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
            <p className="text-[11px] text-olive mt-1">Displayed on contact page and website footer.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
              Public Contact Email *
            </label>
            <input
              type="email"
              required
              value={formData.publicContactEmail}
              onChange={(e) => setFormData({ ...formData, publicContactEmail: e.target.value })}
              placeholder="contact@rbsyogastudio.com"
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
            <p className="text-[11px] text-olive mt-1">Publicly displayed email for student questions.</p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
              Studio Physical Address
            </label>
            <input
              type="text"
              value={formData.businessAddress}
              onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
            <p className="text-[11px] text-olive mt-1">Physical address for shala sessions.</p>
          </div>
        </div>
      </div>

      {/* SECTION 3 — NOTIFICATION CONFIGURATION */}
      <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center space-x-3 border-b border-sage-dark/30 pb-4">
          <Bell className="w-5 h-5 text-earth" />
          <div>
            <h2 className="font-serif text-2xl text-forest font-medium">Section 3 — Notification Configuration</h2>
            <p className="text-xs text-olive">Configure the studio owner's administrative Gmail inbox and toggle alert events.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
            Admin Notification Email * (Separate from public contact email)
          </label>
          <input
            type="email"
            required
            value={formData.adminNotificationEmail}
            onChange={(e) => setFormData({ ...formData, adminNotificationEmail: e.target.value })}
            placeholder="owner@rbsyogastudio.com"
            className="w-full max-w-md bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
          />
          <p className="text-[11px] text-olive mt-1">All booking alerts, new inquiry summaries, and payment notices are routed to this inbox.</p>
        </div>

        <div className="pt-2 space-y-3">
          <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold">
            Notification Event Toggles
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 p-3 bg-sage-light/50 border border-sage-dark/40 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyOnBooking}
                onChange={(e) => setFormData({ ...formData, notifyOnBooking: e.target.checked })}
                className="w-4 h-4 text-forest accent-forest"
              />
              <div>
                <span className="text-xs font-semibold text-forest block">New Class Booking Alert</span>
                <span className="text-[11px] text-olive">Email admin when a learner books a seat.</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-sage-light/50 border border-sage-dark/40 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyOnEnquiry}
                onChange={(e) => setFormData({ ...formData, notifyOnEnquiry: e.target.checked })}
                className="w-4 h-4 text-forest accent-forest"
              />
              <div>
                <span className="text-xs font-semibold text-forest block">Website Enquiry Alert</span>
                <span className="text-[11px] text-olive">Email admin when an inquiry is submitted.</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-sage-light/50 border border-sage-dark/40 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyOnPayment}
                onChange={(e) => setFormData({ ...formData, notifyOnPayment: e.target.checked })}
                className="w-4 h-4 text-forest accent-forest"
              />
              <div>
                <span className="text-xs font-semibold text-forest block">Payment Received Alert</span>
                <span className="text-[11px] text-olive">Email admin on verified Razorpay transaction.</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-sage-light/50 border border-sage-dark/40 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyOnMembership}
                onChange={(e) => setFormData({ ...formData, notifyOnMembership: e.target.checked })}
                className="w-4 h-4 text-forest accent-forest"
              />
              <div>
                <span className="text-xs font-semibold text-forest block">Membership Pass Activation Alert</span>
                <span className="text-[11px] text-olive">Email admin when a pass is purchased.</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 4 — REGIONAL SETTINGS */}
      <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center space-x-3 border-b border-sage-dark/30 pb-4">
          <Globe2 className="w-5 h-5 text-earth" />
          <div>
            <h2 className="font-serif text-2xl text-forest font-medium">Section 4 — Regional & Currency Settings</h2>
            <p className="text-xs text-olive">Operating timezone and monetary display.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
              Timezone (Default: Asia/Kolkata)
            </label>
            <input
              type="text"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
              Currency (Default: INR)
            </label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5 — SOCIAL MEDIA */}
      <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center space-x-3 border-b border-sage-dark/30 pb-4">
          <Share2 className="w-5 h-5 text-earth" />
          <div>
            <h2 className="font-serif text-2xl text-forest font-medium">Section 5 — Social Media Channels</h2>
            <p className="text-xs text-olive">Manage external social links displayed in the footer.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
              Instagram URL
            </label>
            <input
              type="url"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
              Facebook URL
            </label>
            <input
              type="url"
              value={formData.facebookUrl}
              onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
              YouTube URL
            </label>
            <input
              type="url"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
          </div>
        </div>
      </div>

      {/* Unified Save Action */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-sage-dark/40">
        <button
          type="submit"
          disabled={saving}
          className="bg-forest text-ivory px-8 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-forest-light transition-all flex items-center space-x-2.5 shadow-card"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Configurations...' : 'Save All Business Settings'}</span>
        </button>
      </div>
    </form>
  );
}
