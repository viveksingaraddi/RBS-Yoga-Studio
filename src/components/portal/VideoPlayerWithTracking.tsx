'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, ShieldCheck, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  recordingId: string;
  initialPosition: number;
  durationSeconds: number;
}

export default function VideoPlayerWithTracking({
  recordingId,
  initialPosition,
  durationSeconds,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPosition);

  // 1. Fetch authorized playback URL from server
  useEffect(() => {
    fetch(`/api/recordings/${recordingId}/playback`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.playbackUrl) {
          setPlaybackUrl(data.playbackUrl);
        } else {
          setErrorMsg(data.message || 'Could not authorize video stream.');
        }
      })
      .catch(() => {
        setErrorMsg('Network error while requesting video stream.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [recordingId]);

  // 2. Set initial position once loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current && initialPosition > 0) {
      videoRef.current.currentTime = initialPosition;
    }
  };

  // 3. Periodic progress sync (every 10 seconds)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        const pos = videoRef.current.currentTime;
        fetch(`/api/recordings/${recordingId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            positionSeconds: pos,
            durationSeconds: videoRef.current.duration || durationSeconds,
          }),
        }).catch(() => {});
      }
    }, 10000);

    return () => clearInterval(syncInterval);
  }, [recordingId, durationSeconds]);

  if (loading) {
    return (
      <div className="aspect-[16/9] flex items-center justify-center text-ivory/80 text-xs">
        <span>Authenticating private video stream...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="aspect-[16/9] flex flex-col items-center justify-center text-ivory/90 p-6 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-xs">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] bg-black group overflow-hidden">
      <video
        ref={videoRef}
        src={playbackUrl || ''}
        controls
        controlsList="nodownload"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
