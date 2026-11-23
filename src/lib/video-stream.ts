import crypto from 'crypto';

interface SignedStreamUrlOptions {
  videoId: string;
  userId: string;
  expiresInSeconds?: number;
}

export function generateStreamPlaybackUrl({
  videoId,
  userId,
  expiresInSeconds = 3600, // 1 hour token
}: SignedStreamUrlOptions): { playbackUrl: string; token: string; expiresAt: Date } {
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  const accountId = process.env.CLOUDFLARE_STREAM_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

  // If Cloudflare Stream credentials are present, we generate signed token
  if (accountId && apiToken) {
    const payload = {
      sub: videoId,
      kid: accountId,
      exp: Math.floor(expiresAt.getTime() / 1000),
      downloadable: false,
      accessRules: [
        {
          type: 'ip.geoip.country',
          action: 'allow',
          country: ['IN', 'US', 'GB', 'SG', 'AE', 'VN'],
        },
      ],
    };
    const token = crypto
      .createHmac('sha256', apiToken)
      .update(JSON.stringify(payload))
      .digest('base64url');

    return {
      playbackUrl: `https://customer-${accountId}.cloudflarestream.com/${token}/manifest/video.m3u8`,
      token,
      expiresAt,
    };
  }

  // Adapter fallback: Secure temporary signed token for protected private player
  const tokenPayload = `${videoId}:${userId}:${expiresAt.getTime()}`;
  const token = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'stream-secret')
    .update(tokenPayload)
    .digest('hex');

  return {
    playbackUrl: `/api/stream/${videoId}?token=${token}&expires=${expiresAt.getTime()}`,
    token,
    expiresAt,
  };
}

export function verifyStreamToken(videoId: string, userId: string, token: string, expires: number): boolean {
  if (Date.now() > expires) return false;
  const expectedPayload = `${videoId}:${userId}:${expires}`;
  const expectedToken = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'stream-secret')
    .update(expectedPayload)
    .digest('hex');
  return token === expectedToken;
}
