import { describe, it, expect } from 'vitest';
import { generateStreamPlaybackUrl, verifyStreamToken } from '../src/lib/video-stream';
import { createWhatsAppEnquiryLink } from '../src/lib/whatsapp';

describe('Video Streaming Security & WhatsApp Adapter', () => {
  it('generates secure time-bound signed video stream token', () => {
    const videoId = 'video_stream_hatha_01';
    const userId = 'user_aditi_123';
    const stream = generateStreamPlaybackUrl({
      videoId,
      userId,
      expiresInSeconds: 3600,
    });

    expect(stream.playbackUrl).toContain(videoId);
    expect(stream.token).toBeDefined();
    expect(stream.expiresAt.getTime()).toBeGreaterThan(Date.now());

    // Verify token validity
    const isValid = verifyStreamToken(videoId, userId, stream.token, stream.expiresAt.getTime());
    expect(isValid).toBe(true);

    // Verify rejection if token has expired
    const isExpiredValid = verifyStreamToken(videoId, userId, stream.token, Date.now() - 1000);
    expect(isExpiredValid).toBe(false);
  });

  it('constructs correct WhatsApp click-to-chat URL with prefilled message', () => {
    const link = createWhatsAppEnquiryLink({
      phone: '+91 98765 43210',
      fullName: 'Aditi Sharma',
      program: 'Classical Hatha Yoga',
      preferredType: 'PHYSICAL',
      message: 'I want to begin practicing with Master Sangu.',
    });

    expect(link).toContain('https://wa.me/919876543210');
    expect(link).toContain('Aditi%20Sharma');
    expect(link).toContain('Classical%20Hatha%20Yoga');
  });
});
