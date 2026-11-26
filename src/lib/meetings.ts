import crypto from 'crypto';

const SECRET_KEY = crypto.createHash('sha256').update(process.env.JWT_SECRET || 'rbs_yoga_secret_2026').digest();
const IV_LENGTH = 16;

export function isValidMeetingUrl(url: string): boolean {
  return validateMeetingUrl(url).isValid;
}

/**
 * Validates a meeting URL server-side.
 */
export function validateMeetingUrl(url: string): {
  isValid: boolean;
  provider: 'GOOGLE_MEET' | 'ZOOM' | 'CUSTOM';
  error?: string;
} {
  if (!url || typeof url !== 'string') {
    return { isValid: false, provider: 'CUSTOM', error: 'Meeting URL is required.' };
  }

  const trimmed = url.trim();

  // Basic URL structure check
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, provider: 'CUSTOM', error: 'Invalid URL format.' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { isValid: false, provider: 'CUSTOM', error: 'URL must use HTTPS protocol.' };
  }

  // Google Meet validation
  if (parsed.hostname === 'meet.google.com') {
    const path = parsed.pathname.replace(/^\//, '');
    const meetPattern = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;
    if (path.length > 0) {
      return { isValid: true, provider: 'GOOGLE_MEET' };
    }
    return { isValid: false, provider: 'GOOGLE_MEET', error: 'Invalid Google Meet meeting code.' };
  }

  // Zoom validation
  if (parsed.hostname.endsWith('zoom.us')) {
    if (parsed.pathname.includes('/j/') || parsed.pathname.includes('/my/') || parsed.pathname.includes('/wc/')) {
      return { isValid: true, provider: 'ZOOM' };
    }
    return { isValid: true, provider: 'ZOOM' };
  }

  return { isValid: true, provider: 'CUSTOM' };
}

/**
 * Encrypts a meeting URL for safe storage in PostgreSQL
 */
export function encryptMeetingUrl(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a protected meeting URL
 */
export function decryptMeetingUrl(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return encryptedText; // Fallback if plain
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return encryptedText;
  }
}
