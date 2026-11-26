'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [student, setStudent] = useState<{ name: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Activation link is missing or invalid.');
      setLoading(false);
      return;
    }

    fetch(`/api/auth/activate?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setValid(true);
          setStudent(data.student);
        } else {
          setError(data.error || 'This activation link is invalid or has expired.');
        }
      })
      .catch(() => {
        setError('Network error verifying activation link.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/portal');
        }, 2000);
      } else {
        setError(data.error || 'Account activation failed.');
      }
    } catch {
      setError('A network error occurred during activation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sage-light flex items-center justify-center p-4">
        <div className="bg-ivory border border-sage-dark/40 p-8 text-center max-w-md w-full shadow-card space-y-3">
          <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-lg text-forest">Verifying Student Invitation...</p>
          <p className="text-xs text-olive">Please hold while we validate your sanctuary pass.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-light flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-ivory border border-sage-dark/50 p-8 shadow-card space-y-6">
        <div className="text-center space-y-2 border-b border-sage-dark/30 pb-6">
          <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-bold block">
            Welcome to the Sanctuary
          </span>
          <h1 className="font-serif text-3xl text-forest">Activate Your Account</h1>
          <p className="text-xs text-charcoal/70">
            RBS Yoga Studio · Guided by Master Sangu (M.Sc. Yoga)
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="font-serif text-2xl text-forest">Sanctuary Access Activated</h2>
            <p className="text-xs text-olive">
              Namaste {student?.name}! Your account is now fully active. Redirecting you to your student portal...
            </p>
            <div className="pt-2">
              <Link
                href="/portal"
                className="inline-flex items-center space-x-2 bg-forest text-ivory px-6 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light transition-all"
              >
                <span>Enter Sanctuary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : valid && student ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="bg-sage-light/60 p-3.5 border border-sage-dark/30 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-olive font-semibold block">
                Practitioner Details
              </span>
              <p className="font-serif text-base text-forest font-medium">{student.name}</p>
              <p className="text-xs text-olive">{student.email}</p>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                Create Secure Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-olive absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 border border-sage-dark/40 bg-white focus:outline-none focus:border-forest text-forest"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-forest mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-olive absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2.5 border border-sage-dark/40 bg-white focus:outline-none focus:border-forest text-forest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-forest text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-forest-light disabled:opacity-50 transition-all shadow-sm"
            >
              {submitting ? 'Activating Sanctuary Account...' : 'Complete Activation & Sign In'}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4">
            <p className="text-xs text-charcoal/70">
              If your link has expired, please contact Master Sangu or request a new invitation link from your instructor.
            </p>
            <Link
              href="/login"
              className="inline-block text-xs uppercase tracking-wider text-forest font-semibold hover:text-earth underline"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-sage-light flex items-center justify-center p-4">
          <div className="bg-ivory border border-sage-dark/40 p-8 text-center max-w-md w-full shadow-card">
            <p className="font-serif text-lg text-forest">Loading Sanctuary Activation...</p>
          </div>
        </div>
      }
    >
      <ActivateContent />
    </Suspense>
  );
}
