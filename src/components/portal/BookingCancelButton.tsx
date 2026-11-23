'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function BookingCancelButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you wish to cancel this booking? Your slot will be released back to the class.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Could not cancel booking.');
      }
    } catch {
      alert('Network error while cancelling booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider text-red-700 hover:text-red-900 border border-red-300 px-3 py-2 transition-colors"
    >
      <XCircle className="w-3.5 h-3.5" />
      <span>{loading ? 'Cancelling...' : 'Cancel'}</span>
    </button>
  );
}
