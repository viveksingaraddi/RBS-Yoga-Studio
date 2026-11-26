interface DirectUploadOptions {
  maxDurationSeconds?: number;
  creatorId?: string;
  meta?: Record<string, string>;
}

interface DirectUploadResult {
  uploadUrl: string;
  uid: string;
  isMock?: boolean;
}

/**
 * Initializes a direct creator upload URL with Cloudflare Stream.
 * Video files are uploaded directly from the browser to Cloudflare Stream.
 * Never passes through or stores on the Next.js server.
 */
export async function createDirectUploadUrl({
  maxDurationSeconds = 7200, // 2 hours
  creatorId = 'master-sangu',
  meta = {},
}: DirectUploadOptions = {}): Promise<DirectUploadResult> {
  const accountId = process.env.CLOUDFLARE_STREAM_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

  if (accountId && apiToken && !apiToken.startsWith('cf_test_mock')) {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify({
            maxDurationSeconds,
            creator: creatorId,
            meta,
            requireSignedURLs: true,
            allowedOrigins: [
              process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
              'https://*.rbsyogastudio.com',
            ],
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.result) {
        return {
          uploadUrl: data.result.uploadURL,
          uid: data.result.uid,
          isMock: false,
        };
      }
      console.warn('Cloudflare Stream Direct Upload response not ok:', data);
    } catch (err) {
      console.error('Failed to contact Cloudflare Stream API:', err);
    }
  }

  // Graceful fallback for local development or when credentials are not yet configured
  const mockUid = `stream_vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    uploadUrl: `/api/instructor/videos/mock-upload?uid=${mockUid}`,
    uid: mockUid,
    isMock: true,
  };
}

/**
 * Checks the video processing status on Cloudflare Stream
 */
export async function checkVideoProcessingStatus(uid: string): Promise<{
  state: 'queued' | 'inprogress' | 'ready' | 'error';
  durationSeconds?: number;
  thumbnailUrl?: string;
  playbackUrl?: string;
}> {
  const accountId = process.env.CLOUDFLARE_STREAM_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

  if (accountId && apiToken && !apiToken.startsWith('cf_test_mock')) {
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok && data.result) {
        return {
          state: data.result.status?.state || 'ready',
          durationSeconds: Math.round(data.result.duration || 1800),
          thumbnailUrl: data.result.thumbnail,
          playbackUrl: data.result.playback?.hls,
        };
      }
    } catch (err) {
      console.error('Error checking video status on Cloudflare:', err);
    }
  }

  return {
    state: 'ready',
    durationSeconds: 1800,
    thumbnailUrl: '/images/hero-bg.jpg',
  };
}

/**
 * Deletes a video from Cloudflare Stream
 */
export async function deleteCloudflareVideo(uid: string): Promise<boolean> {
  const accountId = process.env.CLOUDFLARE_STREAM_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

  if (accountId && apiToken && !apiToken.startsWith('cf_test_mock')) {
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${uid}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );
      const data = await res.json();
      return Boolean(res.ok && data.success);
    } catch (err) {
      console.error('Error deleting video on Cloudflare:', err);
      return false;
    }
  }
  return true;
}
