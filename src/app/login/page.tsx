'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

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
            <div className="mb-6 p-3 bg-red-50 text-red-800 text-xs border border-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
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
              className="w-full bg-forest text-ivory py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-forest-light transition-all flex items-center justify-center space-x-2 shadow-card"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Seed demo credential helper */}
          <div className="mt-8 pt-6 border-t border-sage-dark/40 text-center space-y-3">
            <p className="text-xs text-charcoal/70">
              Don't have an account yet?{' '}
              <Link href="/register" className="text-forest font-semibold underline">
                Create Learner Account
              </Link>
            </p>

            <div className="p-3 bg-sage text-[11px] text-charcoal/80 text-left space-y-1 border border-sage-dark/50">
              <span className="font-semibold block text-forest">Development Access:</span>
              <div>Admin: <code>admin@rbsyogastudio.com</code> / <code>Admin@RBSYoga2026!</code></div>
              <div>Learner: <code>learner@rbsyogastudio.com</code> / <code>Learner@RBSYoga2026!</code></div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
