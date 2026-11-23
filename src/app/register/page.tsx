'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/portal');
        router.refresh();
      } else {
        setErrorMsg(data.message || 'Registration failed. Please check your information.');
      }
    } catch {
      setErrorMsg('A network error occurred. Please try again.');
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
              Begin Your Sadhana
            </span>
            <h1 className="font-serif text-3xl font-normal text-forest">
              Create Learner Account
            </h1>
            <p className="text-xs text-charcoal/70">
              Join RBS Yoga Studio to book classes, attend live virtual sessions, and unlock video teachings.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-800 text-xs border border-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditi Sharma"
                  className="w-full bg-sage-light/40 border border-sage-dark/60 pl-10 pr-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest"
                />
                <User className="w-4 h-4 text-olive absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aditi@example.com"
                  className="w-full bg-sage-light/40 border border-sage-dark/60 pl-10 pr-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest"
                />
                <Mail className="w-4 h-4 text-olive absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-sage-light/40 border border-sage-dark/60 pl-10 pr-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest"
                />
                <Phone className="w-4 h-4 text-olive absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1.5">
                Choose Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-sage-light/40 border border-sage-dark/60 pl-10 pr-4 py-3 text-sm text-charcoal focus:outline-none focus:border-forest"
                />
                <Lock className="w-4 h-4 text-olive absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest text-ivory py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-forest-light transition-all flex items-center justify-center space-x-2 shadow-card mt-2"
            >
              <span>{loading ? 'Creating Account...' : 'Register as Learner'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-sage-dark/40 text-center">
            <p className="text-xs text-charcoal/70">
              Already registered?{' '}
              <Link href="/login" className="text-forest font-semibold underline">
                Sign In Here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
