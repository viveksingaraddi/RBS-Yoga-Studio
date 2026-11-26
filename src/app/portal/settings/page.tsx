'use client';

import { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';

export default function PortalSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(data.message || 'Failed to update password.');
      }
    } catch {
      setErrorMsg('A network error occurred while updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-earth font-semibold">
          Account Security
        </span>
        <h1 className="font-serif text-3xl font-normal text-forest mt-1">
          Security &amp; Password Settings
        </h1>
        <p className="text-sm text-charcoal/70 mt-1">
          Manage your credentials, update your password, and secure your practitioner portal account.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center space-x-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-900 border border-red-200 flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Password Update Card */}
      <div className="bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card">
        <div className="flex items-center space-x-3 pb-6 border-b border-sage-dark/30 mb-6">
          <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-forest">
            <KeyRound className="w-5 h-5 text-forest" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-forest font-normal">Change Portal Password</h2>
            <p className="text-xs text-charcoal/65">
              Enter your initial/current password followed by your chosen new password.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
              Current / Initial Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-sage-light/40 border border-sage-dark/60 pl-10 pr-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest"
              />
              <Lock className="w-4 h-4 text-olive absolute left-3.5 top-3.5" />
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
                  className="w-full bg-sage-light/40 border border-sage-dark/60 pl-10 pr-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest"
                />
                <Lock className="w-4 h-4 text-olive absolute left-3.5 top-3.5" />
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
                  className="w-full bg-sage-light/40 border border-sage-dark/60 pl-10 pr-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest"
                />
                <Lock className="w-4 h-4 text-olive absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-forest text-ivory px-6 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all flex items-center space-x-2 shadow-card"
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Support & Studio Policy */}
      <div className="bg-sage-light/60 p-5 border border-sage-dark/30 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-earth shrink-0 mt-0.5" />
        <div className="text-xs text-charcoal/80 space-y-1">
          <p className="font-semibold text-forest">Account &amp; Security Support</p>
          <p>
            Official notifications and password reset dispatches are generated directly from{' '}
            <strong>yogawithsangu@gmail.com</strong>. If you experience difficulty accessing your
            account or need assistance with your subscription pass, contact Master Sangu on
            WhatsApp at <strong>+91 89513 46405</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
