'use client';

import { useState } from 'react';
import { Video, Loader2, ExternalLink } from 'lucide-react';

interface LiveSessionJoinButtonProps {
  sessionId: string;
  sessionTitle?: string;
}

export default function LiveSessionJoinButton({
  sessionId,
  sessionTitle,
}: LiveSessionJoinButtonProps) {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    setJoining(true);
    setError('');

    try {
      const res = await fetch(`/api/live-sessions/${sessionId}/join`, {
        method: 'POST',
      });

      const data = await res.json();
      if (res.ok && data.success && data.meetingUrl) {
        window.open(data.meetingUrl, '_blank', 'noopener,noreferrer');
      } else {
        setError(data.message || 'Unable to join live session. Verify your membership pass.');
      }
    } catch {
      setError('Network connection error while joining live transmission.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={handleJoin}
        disabled={joining}
        className="w-full bg-forest text-ivory py-2 px-3 text-xs uppercase tracking-wider font-semibold hover:bg-forest-light transition-all flex items-center justify-center space-x-1.5 shadow-sm"
      >
        {joining ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Video className="w-3.5 h-3.5 text-earth" />
            <span>Join Live Broadcast</span>
            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
          </>
        )}
      </button>

      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}
