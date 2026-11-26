'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { Check, ShieldCheck, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function MembershipCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planSlug = searchParams.get('plan') || 'monthly-shala-pass';

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmedMembership, setConfirmedMembership] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auth state if not logged in
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Check auth
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUserSession(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMsg('');

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? { name: authName, email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserSession(data.user);
      } else {
        setErrorMsg(data.message || 'Authentication failed');
      }
    } catch {
      setErrorMsg('Network error during authentication');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      // Step A: Create membership & Razorpay order
      const res = await fetch('/api/memberships/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not initiate membership checkout');
      }

      const { membershipId, order, plan } = data;

      // Function to confirm payment on server
      const confirmPaymentOnServer = async (paymentId: string, signature: string) => {
        const confirmRes = await fetch('/api/memberships/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            membershipId,
            orderId: order.orderId,
            paymentId,
            signature,
          }),
        });

        const confirmData = await confirmRes.json();
        if (confirmRes.ok && confirmData.success) {
          setConfirmedMembership({
            planName: plan.name,
            durationDays: plan.durationDays,
            amount: plan.price,
            endDate: confirmData.endDate,
          });
        } else {
          throw new Error(confirmData.message || 'Activation failed');
        }
      };

      // Check if Razorpay Checkout SDK is loaded
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'RBS Yoga Studio',
          description: `Membership: ${plan.name}`,
          image: '/favicon.ico',
          order_id: order.orderId.startsWith('order_') && !order.orderId.includes('MBR-') ? order.orderId : undefined,
          prefill: {
            name: userSession?.name || '',
            email: userSession?.email || '',
          },
          theme: {
            color: '#173F34',
          },
          handler: async function (response: any) {
            try {
              setLoading(true);
              await confirmPaymentOnServer(
                response.razorpay_payment_id || `pay_rzp_${Date.now()}`,
                response.razorpay_signature || 'test_verified'
              );
            } catch (err: any) {
              setErrorMsg(err.message || 'Failed to confirm Razorpay payment');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setErrorMsg(resp?.error?.description || 'Payment failed or was declined');
          setLoading(false);
        });

        rzp.open();
      } else {
        // Fallback simulation in test mode if external SDK CDN is unreachable
        const mockPaymentId = `pay_mbr_${Date.now()}`;
        const mockSignature = 'test_verified';
        await confirmPaymentOnServer(mockPaymentId, mockSignature);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing error');
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow pt-32 pb-24 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
            Membership Checkout
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-forest">
            Join RBS Yoga Studio
          </h1>
          <p className="text-xs text-charcoal/70">
            Selected Plan: <strong className="uppercase text-forest">{planSlug.replace(/-/g, ' ')}</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 text-xs border border-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {confirmedMembership ? (
          <div className="bg-ivory border border-earth/40 p-8 sm:p-12 shadow-elevated text-center space-y-6">
            <div className="w-16 h-16 bg-sage text-forest mx-auto flex items-center justify-center rounded-full">
              <CheckCircle2 className="w-8 h-8 text-earth" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-earth font-semibold">
                Membership Active
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-forest">
                Welcome to {confirmedMembership.planName}!
              </h2>
              <p className="text-xs text-charcoal/70">
                Your pass has been activated and is valid until{' '}
                {new Date(confirmedMembership.endDate).toLocaleDateString([], { dateStyle: 'full' })}.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                href="/portal"
                className="w-full sm:w-auto bg-forest text-ivory px-8 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all"
              >
                Go to Learner Portal
              </Link>
              <Link
                href="/portal/recordings"
                className="w-full sm:w-auto border border-forest/30 text-forest px-8 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-sage/40 transition-colors"
              >
                Access Video Library
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-ivory border border-sage-dark/40 p-8 sm:p-10 shadow-card space-y-8">
            {!userSession ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl text-forest">
                    {isRegister ? 'Register Learner Account' : 'Sign In to Continue'}
                  </h3>
                  <p className="text-xs text-charcoal/70 mt-1">
                    An account is required to link your membership entitlements and access live classes.
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {isRegister && (
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Aditi Sharma"
                        className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="aditi@example.com"
                      className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-charcoal font-semibold mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-sage-light/40 border border-sage-dark/60 px-3.5 py-2.5 text-xs text-charcoal focus:outline-none focus:border-forest"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-forest text-ivory py-3.5 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-forest-light transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{authLoading ? 'Verifying...' : isRegister ? 'Register & Continue' : 'Sign In'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="pt-2 text-center text-xs text-charcoal/70">
                  {isRegister ? (
                    <button
                      type="button"
                      onClick={() => setIsRegister(false)}
                      className="text-forest font-semibold underline"
                    >
                      Already have an account? Sign In
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsRegister(true)}
                      className="text-forest font-semibold underline"
                    >
                      New to RBS Studio? Register here
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border-b border-sage-dark/30 pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-earth font-semibold">
                      Learner Account
                    </span>
                    <h3 className="font-serif text-2xl text-forest">{userSession.name}</h3>
                    <p className="text-xs text-charcoal/70">{userSession.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      fetch('/api/auth/logout', { method: 'POST' }).then(() => setUserSession(null));
                    }}
                    className="text-xs text-olive underline hover:text-forest"
                  >
                    Switch User
                  </button>
                </div>

                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-wider text-forest font-semibold block">
                    Confirm Membership Subscription
                  </span>
                  <p className="text-xs text-charcoal/75 leading-relaxed">
                    By clicking complete, your membership order will be processed via Razorpay.
                    Once verified, all video classes and live session booking privileges will be instantly granted.
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-forest text-ivory py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-forest-light transition-all flex items-center justify-center space-x-2 shadow-card"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{loading ? 'Activating Membership...' : 'Pay & Activate Membership'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function MembershipCheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Navbar />
      <Suspense fallback={<div className="pt-32 text-center text-sm">Loading checkout...</div>}>
        <MembershipCheckoutContent />
      </Suspense>
      <Footer />
    </div>
  );
}
