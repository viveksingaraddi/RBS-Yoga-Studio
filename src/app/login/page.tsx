'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [requiresSubscription, setRequiresSubscription] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setRequiresSubscription(false);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(data.redirectUrl || '/portal');
        router.refresh();
      } else {
        setErrorMsg(data.message || 'Login failed. Please verify credentials.');
        if (data.requiresSubscription) {
          setRequiresSubscription(true);
        }
      }
    } catch {
      setErrorMsg('An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar />

      <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-6 sm:px-8">
        <div className="w-full max-w-md bg-ivory border border-sage-dark/50 p-8 sm:p-10 shadow-card">
          <div className="text-center space-y-2 mb-8">
            <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
              RBS Portal Access
            </span>
            <h1 className="font-serif text-3xl font-normal text-forest">
              Welcome Back
            </h1>
            <p className="text-xs text-charcoal/70">
              Access your booked classes, active memberships, and recorded video library.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-amber-50 text-amber-900 text-xs border border-amber-200 space-y-2">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              {requiresSubscription && (
                <div className="pt-2 border-t border-amber-200">
                  <Link
                    href="/memberships"
                    className="inline-flex items-center space-x-1.5 text-forest font-semibold underline hover:text-forest-light"
                  >
                    <span>Explore Studio Membership Plans & Passes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="learner@rbsyogastudio.com"
                  className="w-full bg-sage-light/40 border border-sage-dark/60 pl-10 pr-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest"
                />
                <Mail className="w-4 h-4 text-olive absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-sage-light/40 border border-sage-dark/60 pl-10 pr-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest"
                />
                <Lock className="w-4 h-4 text-olive absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-xs uppercase tracking-[0.2em] font-semibold transition-all flex items-center justify-center space-x-2 shadow-card cursor-pointer ${
                loading
                  ? 'bg-forest/80 text-ivory/90 cursor-wait'
                  : 'bg-forest text-ivory hover:bg-forest-light'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-earth" />
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Account helpers */}
          <div className="mt-8 pt-6 border-t border-sage-dark/40 text-center space-y-3">
            <p className="text-xs text-charcoal/70">
              Don't have an active pass?{' '}
              <Link href="/memberships" className="text-forest font-semibold underline">
                Browse Memberships
              </Link>
              {' · '}
              <Link href="/register" className="text-forest font-semibold underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
