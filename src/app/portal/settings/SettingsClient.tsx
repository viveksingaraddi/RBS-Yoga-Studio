'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  BellRing,
  ArrowRight,
  Save,
  UserCheck,
} from 'lucide-react';
import type { StudioBusinessSettings } from '@/lib/settings';

interface SettingsClientProps {
  userRole: 'ADMIN' | 'INSTRUCTOR' | 'LEARNER';
  userEmail: string;
  userName: string;
  initialSettings: StudioBusinessSettings | null;
}

export default function SettingsClient({
  userRole,
  userEmail,
  userName,
  initialSettings,
}: SettingsClientProps) {
  const isInstructorOrAdmin = userRole === 'INSTRUCTOR' || userRole === 'ADMIN';

  // Active Tab
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'notifications' | 'security'>(
    isInstructorOrAdmin ? 'profile' : 'security'
  );

  // Settings State
  const [settings, setSettings] = useState<StudioBusinessSettings>(
    initialSettings || {
      id: 'singleton',
      businessName: 'RBS Yoga Studio',
      brandTagline: 'The Art of Strength, Balance & Wellness',
      instructorName: 'Master Sangu',
      instructorBiography:
        'Master Sangu holds an M.Sc. in Yoga with over 10 years of international teaching experience.',
      publicWhatsAppNumber: '+91 89513 46405',
      publicContactPhone: '+91 89513 46405',
      publicContactEmail: 'yogawithsangu@gmail.com',
      adminNotificationEmail: 'yogawithsangu@gmail.com',
      businessAddress: 'RBS Studio Pavilion, Bangalore / Global Online Shala',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      instagramUrl: 'https://instagram.com/rbsyogastudio',
      facebookUrl: 'https://facebook.com/rbsyogastudio',
      youtubeUrl: 'https://youtube.com/@rbsyogastudio',
      websiteUrl: 'https://rbsyogastudio.com',
      notifyOnBooking: true,
      notifyOnEnquiry: true,
      notifyOnPayment: true,
      notifyOnMembership: true,
    }
  );

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess('');
    setSettingsError('');

    try {
      const res = await fetch('/api/instructor/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsSuccess('Studio business settings successfully updated and live!');
        if (data.settings) {
          setSettings(data.settings);
        }
      } else {
        setSettingsError(data.message || 'Failed to update settings.');
      }
    } catch {
      setSettingsError('Network error while saving settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordSuccess(data.message || 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.message || 'Failed to update password.');
      }
    } catch {
      setPasswordError('A network error occurred while updating password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-sage-dark/40 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
            {isInstructorOrAdmin ? 'Studio Operations' : 'Account Security'}
          </span>
          <h1 className="font-serif text-3xl font-normal text-forest mt-1">
            {isInstructorOrAdmin ? 'Studio Settings & Control Center' : 'Security & Password Settings'}
          </h1>
          <p className="text-xs text-charcoal/70 mt-1">
            {isInstructorOrAdmin
              ? 'Configure studio branding, public communication channels, notification automations, and credentials.'
              : 'Manage your credentials, update your password, and secure your learner portal account.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-forest bg-sage-light/80 px-3.5 py-2 border border-sage-dark/40 self-start sm:self-auto">
          <UserCheck className="w-4 h-4 text-earth" />
          <span>
            Logged in as <strong>{userName}</strong> ({userRole})
          </span>
        </div>
      </div>

      {/* Tabs Navigation (For Instructors) */}
      {isInstructorOrAdmin && (
        <div className="flex flex-wrap gap-2 border-b border-sage-dark/30 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-forest text-ivory shadow-card'
                : 'bg-ivory text-charcoal/70 hover:bg-sage-light/60 border border-sage-dark/30'
            }`}
          >
            Studio Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'contact'
                ? 'bg-forest text-ivory shadow-card'
                : 'bg-ivory text-charcoal/70 hover:bg-sage-light/60 border border-sage-dark/30'
            }`}
          >
            Public Contact &amp; Channels
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'notifications'
                ? 'bg-forest text-ivory shadow-card'
                : 'bg-ivory text-charcoal/70 hover:bg-sage-light/60 border border-sage-dark/30'
            }`}
          >
            Notification Automations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-forest text-ivory shadow-card'
                : 'bg-ivory text-charcoal/70 hover:bg-sage-light/60 border border-sage-dark/30'
            }`}
          >
            Credentials &amp; Password
          </button>
        </div>
      )}

      {/* Global Alerts for Settings */}
      {settingsSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center space-x-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{settingsSuccess}</span>
        </div>
      )}

      {settingsError && (
        <div className="p-4 bg-red-50 text-red-900 border border-red-200 flex items-center space-x-3 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{settingsError}</span>
        </div>
      )}

      {/* Tab 1: Studio Profile */}
      {isInstructorOrAdmin && activeTab === 'profile' && (
        <form onSubmit={handleSaveSettings} className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-sage-dark/30">
            <Building2 className="w-5 h-5 text-forest" />
            <div>
              <h2 className="font-serif text-xl text-forest font-normal">Studio Brand &amp; Lead Instructor</h2>
              <p className="text-xs text-charcoal/65">Public-facing brand profile and teaching authority details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Studio Business Name
              </label>
              <input
                type="text"
                required
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                required
                value={settings.brandTagline}
                onChange={(e) => setSettings({ ...settings, brandTagline: e.target.value })}
                className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Lead Instructor Name
              </label>
              <input
                type="text"
                required
                value={settings.instructorName}
                onChange={(e) => setSettings({ ...settings, instructorName: e.target.value })}
                className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Studio Primary Currency
              </label>
              <input
                type="text"
                disabled
                value={`${settings.currency} (Indian Rupee)`}
                className="w-full bg-sage-light/80 border border-sage-dark/40 px-4 py-2.5 text-xs text-charcoal/60 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
              Master Sangu Biography &amp; International Teaching Experience
            </label>
            <textarea
              rows={4}
              required
              value={settings.instructorBiography}
              onChange={(e) => setSettings({ ...settings, instructorBiography: e.target.value })}
              className="w-full bg-sage-light/40 border border-sage-dark/60 p-3 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="bg-forest text-ivory px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all flex items-center space-x-2 shadow-card"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSettings ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Public Contact & Channels */}
      {isInstructorOrAdmin && activeTab === 'contact' && (
        <form onSubmit={handleSaveSettings} className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-sage-dark/30">
            <Phone className="w-5 h-5 text-forest" />
            <div>
              <h2 className="font-serif text-xl text-forest font-normal">Contact Channels &amp; Physical Shala</h2>
              <p className="text-xs text-charcoal/65">Public inquiry phone, WhatsApp direct support, and notifications inbox.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Official Studio Email (Dispatches &amp; Notifications)
              </label>
              <input
                type="email"
                required
                value={settings.publicContactEmail}
                onChange={(e) => setSettings({ ...settings, publicContactEmail: e.target.value })}
                className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Lead Instructor Notification Inbox
              </label>
              <input
                type="email"
                required
                value={settings.adminNotificationEmail}
                onChange={(e) => setSettings({ ...settings, adminNotificationEmail: e.target.value })}
                className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Master Sangu WhatsApp Number
              </label>
              <input
                type="text"
                required
                value={settings.publicWhatsAppNumber}
                onChange={(e) => setSettings({ ...settings, publicWhatsAppNumber: e.target.value })}
                className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Public Studio Phone
              </label>
              <input
                type="text"
                required
                value={settings.publicContactPhone}
                onChange={(e) => setSettings({ ...settings, publicContactPhone: e.target.value })}
                className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
              Studio Address &amp; Shala Location
            </label>
            <input
              type="text"
              required
              value={settings.businessAddress}
              onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
              className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-sage-dark/30">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Instagram Profile Link
              </label>
              <input
                type="url"
                value={settings.instagramUrl || ''}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                YouTube Channel Link
              </label>
              <input
                type="url"
                value={settings.youtubeUrl || ''}
                onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                className="w-full bg-sage-light/40 border border-sage-dark/60 px-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="bg-forest text-ivory px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all flex items-center space-x-2 shadow-card"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSettings ? 'Saving...' : 'Save Contact Channels'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Notification Automations */}
      {isInstructorOrAdmin && activeTab === 'notifications' && (
        <form onSubmit={handleSaveSettings} className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-sage-dark/30">
            <BellRing className="w-5 h-5 text-forest" />
            <div>
              <h2 className="font-serif text-xl text-forest font-normal">Automated Email Dispatches &amp; Queue Alerts</h2>
              <p className="text-xs text-charcoal/65">Toggle event triggers for automated transactional and admin dispatches.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start space-x-3 p-4 bg-sage-light/50 border border-sage-dark/30 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyOnBooking}
                onChange={(e) => setSettings({ ...settings, notifyOnBooking: e.target.checked })}
                className="mt-0.5 rounded text-forest focus:ring-forest"
              />
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-forest block">
                  Class Bookings &amp; Mat Reservations
                </span>
                <span className="text-xs text-charcoal/70">
                  Send immediate booking confirmation email with calendar details to student, and notify Master Sangu.
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-4 bg-sage-light/50 border border-sage-dark/30 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyOnEnquiry}
                onChange={(e) => setSettings({ ...settings, notifyOnEnquiry: e.target.checked })}
                className="mt-0.5 rounded text-forest focus:ring-forest"
              />
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-forest block">
                  Prospective Student Inquiries
                </span>
                <span className="text-xs text-charcoal/70">
                  Send instant notification to yogawithsangu@gmail.com whenever a visitor submits a contact or enrollment inquiry.
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-4 bg-sage-light/50 border border-sage-dark/30 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyOnPayment}
                onChange={(e) => setSettings({ ...settings, notifyOnPayment: e.target.checked })}
                className="mt-0.5 rounded text-forest focus:ring-forest"
              />
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-forest block">
                  Successful Payments &amp; Invoices
                </span>
                <span className="text-xs text-charcoal/70">
                  Email branded payment receipt to student upon Razorpay confirmation, manual cash settlement, or bank transfer.
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-4 bg-sage-light/50 border border-sage-dark/30 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyOnMembership}
                onChange={(e) => setSettings({ ...settings, notifyOnMembership: e.target.checked })}
                className="mt-0.5 rounded text-forest focus:ring-forest"
              />
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-forest block">
                  Membership Activations &amp; Onboarding
                </span>
                <span className="text-xs text-charcoal/70">
                  Send secure account activation token link and welcome message to newly registered students.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="bg-forest text-ivory px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all flex items-center space-x-2 shadow-card"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSettings ? 'Saving...' : 'Save Notification Preferences'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Security & Password Update */}
      {activeTab === 'security' && (
        <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-sage-dark/30">
            <KeyRound className="w-5 h-5 text-forest" />
            <div>
              <h2 className="font-serif text-xl text-forest font-normal">
                {isInstructorOrAdmin ? 'Update Instructor Portal Password' : 'Change Account Password'}
              </h2>
              <p className="text-xs text-charcoal/65">
                Enter your current/initial password followed by your chosen secure password.
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center space-x-3 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-4 bg-red-50 text-red-900 border border-red-200 flex items-center space-x-3 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-sage-light/40 border border-sage-dark/60 pl-10 pr-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
                />
                <Lock className="w-3.5 h-3.5 text-olive absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-sage-light/40 border border-sage-dark/60 pl-10 pr-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                  <Lock className="w-3.5 h-3.5 text-olive absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-sage-light/40 border border-sage-dark/60 pl-10 pr-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
                  />
                  <Lock className="w-3.5 h-3.5 text-olive absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="bg-forest text-ivory px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all flex items-center space-x-2 shadow-card"
              >
                <span>{savingPassword ? 'Updating Password...' : 'Save New Password'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Support & Studio Policy */}
      <div className="bg-sage-light/60 p-5 border border-sage-dark/30 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-earth shrink-0 mt-0.5" />
        <div className="text-xs text-charcoal/80 space-y-1">
          <p className="font-semibold text-forest">Official Shala Support &amp; Contact</p>
          <p>
            Official notifications and pass updates originate from{' '}
            <strong>yogawithsangu@gmail.com</strong>. For urgent queries, contact Master Sangu on
            WhatsApp at <strong>+91 89513 46405</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
