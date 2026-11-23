'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, Calendar as CalendarIcon, MapPin, Video, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function BookSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params?.scheduleId as string;

  const [loadingHold, setLoadingHold] = useState(true);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('10:00');
  const [userSession, setUserSession] = useState<any>(null);

  // Guest / Login form state if not signed in
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Booking & Payment state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Check user session
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

  // 2. Request slot hold once user is available
  useEffect(() => {
    if (!scheduleId) return;

    const requestHold = async () => {
      setLoadingHold(true);
      setErrorMsg('');
      try {
        const res = await fetch('/api/bookings/hold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scheduleId }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setScheduleData(data.schedule);
          setHoldExpiresAt(new Date(data.expiresAt));
        } else {
          // If 401, we fetch schedule publicly
          if (res.status === 401) {
            // Need to sign in or register
          } else {
            setErrorMsg(data.message || 'Could not reserve slot.');
          }
        }
      } catch (err: any) {
        setErrorMsg('Network error while reserving slot.');
      } finally {
        setLoadingHold(false);
      }
    };

    if (userSession) {
      requestHold();
    } else {
      setLoadingHold(false);
    }
  }, [scheduleId, userSession]);

  // 3. Countdown timer for hold
  useEffect(() => {
    if (!holdExpiresAt) return;

    const interval = setInterval(() => {
      const remainingMs = holdExpiresAt.getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft('00:00');
        clearInterval(interval);
      } else {
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  // Auth Handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMsg('');

    const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegisterMode
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

  // Complete Booking & Payment Flow
  const handleProceedPayment = async () => {
    setBookingLoading(true);
    setErrorMsg('');

    try {
      // Step A: Initiate Booking & Razorpay Order
      const createRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId }),
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.success) {
        throw new Error(createData.message || 'Could not initiate booking order');
      }

      const { booking, order } = createData;

      // Step B: Razorpay Simulation / Signature Verification
      // In sandbox/test environment, simulate payment capture & signature
      const mockPaymentId = `pay_mock_${Date.now()}`;
      const mockSignature = 'test_verified';

      // Step C: Confirm payment on server-side
      const confirmRes = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          orderId: order.orderId,
          paymentId: mockPaymentId,
          signature: mockSignature,
        }),
      });

      const confirmData = await confirmRes.json();
      if (confirmRes.ok && confirmData.success) {
        setConfirmedBooking({
          bookingNumber: confirmData.bookingNumber,
          bookingId: confirmData.bookingId,
          schedule: scheduleData,
          amount: booking.amount,
        });
      } else {
        throw new Error(confirmData.message || 'Failed to verify payment confirmation');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during payment processing');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-6 sm:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-3 mb-12">
            <span className="text-[10px] uppercase tracking-[0.25em] text-earth font-semibold">
              Reserve Your Practice
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-forest">
              Class Reservation Checkout
            </h1>
            <p className="text-xs text-charcoal/70">
              Personal instruction with Master Sangu · Concurrency-safe slot reservation
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 text-xs border border-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Screen */}
          {confirmedBooking ? (
            <div className="bg-ivory border border-earth/40 p-8 sm:p-12 shadow-elevated text-center space-y-6">
              <div className="w-16 h-16 bg-sage text-forest mx-auto flex items-center justify-center rounded-full">
                <CheckCircle2 className="w-8 h-8 text-earth" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-earth font-semibold">
                  Mat Confirmed
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-forest">
                  Booking Confirmed!
                </h2>
                <p className="text-xs text-charcoal/70">
                  Confirmation receipt and calendar invitation sent to your email.
                </p>
              </div>

              <div className="max-w-md mx-auto bg-sage-light/60 p-6 border border-sage-dark/30 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-sage-dark/30 pb-2">
                  <span className="text-olive">Booking Reference:</span>
                  <span className="font-mono font-semibold text-forest">
                    {confirmedBooking.bookingNumber}
                  </span>
                </div>
                <div className="flex justify-between border-b border-sage-dark/30 pb-2">
                  <span className="text-olive">Class:</span>
                  <span className="font-medium text-forest">
                    {confirmedBooking.schedule?.title || 'Yoga Practice'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-sage-dark/30 pb-2">
                  <span className="text-olive">Lead Instructor:</span>
                  <span className="font-medium text-forest">Master Sangu (M.Sc. Yoga)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-olive">Amount Verified:</span>
                  <span className="font-serif text-lg font-bold text-forest">
                    ₹{confirmedBooking.amount}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/portal/bookings"
                  className="w-full sm:w-auto bg-forest text-ivory px-8 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all"
                >
                  View My Bookings
                </Link>
                <Link
                  href="/schedule"
                  className="w-full sm:w-auto border border-forest/30 text-forest px-8 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-sage/40 transition-colors"
                >
                  Book Another Class
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Schedule Summary & Slot Hold Timer */}
              <div className="lg:col-span-5 bg-ivory-pure border border-sage-dark/40 p-6 sm:p-8 shadow-card space-y-6">
                <div className="flex items-center justify-between border-b border-sage-dark/30 pb-4">
                  <span className="text-xs uppercase tracking-wider text-olive font-semibold">
                    Temporary Hold
                  </span>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-earth/20 text-forest">
                    {timeLeft} Left
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-earth font-semibold block">
                    Session Details
                  </span>
                  <h3 className="font-serif text-2xl text-forest">
                    {scheduleData?.title || 'Selected Yoga Class'}
                  </h3>
                  <p className="text-xs text-olive font-medium">
                    Instructor: Master Sangu (M.Sc. Yoga)
                  </p>
                </div>

                <div className="space-y-2 text-xs text-charcoal/80 pt-2 border-t border-sage-dark/30">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-earth shrink-0" />
                    <span>
                      {scheduleData?.startTime
                        ? new Date(scheduleData.startTime).toLocaleDateString([], {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Upcoming Schedule'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-earth shrink-0" />
                    <span>
                      {scheduleData?.startTime
                        ? `${new Date(scheduleData.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} - ${new Date(scheduleData.endTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : 'Schedule Time'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {scheduleData?.deliveryType === 'ONLINE' ? (
                      <Video className="w-3.5 h-3.5 text-earth shrink-0" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-earth shrink-0" />
                    )}
                    <span>{scheduleData?.location || 'RBS Studio Shala'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-sage-dark/30 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-charcoal font-semibold">
                    Session Fee:
                  </span>
                  <span className="font-serif text-2xl font-bold text-forest">
                    ₹{scheduleData?.price || 500}
                  </span>
                </div>

                <div className="text-[11px] text-charcoal/60 leading-relaxed bg-sage-light p-3 border border-sage-dark/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-earth inline mr-1" />
                  Your slot is reserved while you complete checkout. If the timer expires, the spot will return to public availability.
                </div>
              </div>

              {/* Right Column: User Auth or Direct Payment */}
              <div className="lg:col-span-7 bg-ivory border border-sage-dark/40 p-6 sm:p-8 shadow-card">
                {!userSession ? (
                  <div className="space-y-6">
                    <div className="border-b border-sage-dark/30 pb-4">
                      <h3 className="font-serif text-2xl text-forest">
                        {isRegisterMode ? 'Create Learner Account' : 'Sign In to Proceed'}
                      </h3>
                      <p className="text-xs text-charcoal/70 mt-1">
                        An account is required to link your class booking and access live meeting links.
                      </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                      {isRegisterMode && (
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
                          placeholder="learner@rbsyogastudio.com"
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
                        <span>{authLoading ? 'Verifying...' : isRegisterMode ? 'Create Account & Continue' : 'Sign In & Reserve'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>

                    <div className="pt-2 text-center text-xs text-charcoal/70">
                      {isRegisterMode ? (
                        <span>
                          Already registered?{' '}
                          <button
                            type="button"
                            onClick={() => setIsRegisterMode(false)}
                            className="text-forest font-semibold underline"
                          >
                            Sign In
                          </button>
                        </span>
                      ) : (
                        <span>
                          New to RBS Studio?{' '}
                          <button
                            type="button"
                            onClick={() => setIsRegisterMode(true)}
                            className="text-forest font-semibold underline"
                          >
                            Create an Account
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border-b border-sage-dark/30 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-earth font-semibold">
                            Logged In Learner
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
                          Switch
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs uppercase tracking-wider text-forest font-semibold block">
                        Payment & Verification
                      </span>
                      <p className="text-xs text-charcoal/75 leading-relaxed">
                        Clicking the button below activates our secure Razorpay payment gateway.
                        Upon signature verification, your booking is confirmed immediately and added to your learner schedule.
                      </p>
                    </div>

                    <div className="p-4 bg-sage-light border border-sage-dark/40 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-charcoal/70">Class Fee:</span>
                        <span className="font-medium">₹{scheduleData?.price || 500}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-charcoal/70">Gateway Processing:</span>
                        <span className="font-medium text-forest">Included</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold border-t border-sage-dark/30 pt-2 text-forest">
                        <span>Total Payable:</span>
                        <span>₹{scheduleData?.price || 500}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleProceedPayment}
                      disabled={bookingLoading}
                      className="w-full bg-forest text-ivory py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-forest-light transition-all flex items-center justify-center space-x-2 shadow-card"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{bookingLoading ? 'Verifying Transaction...' : `Pay ₹${scheduleData?.price || 500} & Confirm Booking`}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
