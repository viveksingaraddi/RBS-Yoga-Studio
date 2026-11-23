'use client';

import { useState } from 'react';
import { Video, Lock, ExternalLink, AlertCircle } from 'lucide-react';

export default function LiveSessionJoinButton({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleJoin = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      // Call protected server-side endpoint that checks authentication & active membership
      const res = await fetch(`/api/live-sessions/${sessionId}/join`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok && data.success && data.meetingUrl) {
        // Open protected meeting URL in a secure window
        window.open(data.meetingUrl, '_blank', 'noopener,noreferrer');
      } else {
        setErrorMsg(data.message || 'Access denied. Active membership required to enter live sessions.');
      }
    } catch {
      setErrorMsg('Failed to authorize live session. Please verify your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end space-y-2">
      {errorMsg && (
        <div className="p-2 bg-red-50 text-red-800 text-[11px] border border-red-200 max-w-xs text-right">
          {errorMsg}
        </div>
      )}

      <button
        onClick={handleJoin}
        disabled={loading}
        className="bg-forest text-ivory px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-forest-light transition-all flex items-center space-x-2 shadow-sm"
      >
        <Video className="w-3.5 h-3.5" />
        <span>{loading ? 'Authorizing Access...' : 'Join Live Stream'}</span>
        <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
}
