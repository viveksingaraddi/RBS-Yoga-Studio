import { describe, it, expect } from 'vitest';
import { generateSecureToken, hashToken } from '../src/lib/activation';
import { encryptMeetingUrl, decryptMeetingUrl, isValidMeetingUrl, validateMeetingUrl } from '../src/lib/meetings';
import { cleanWhatsAppNumber } from '../src/lib/settings';

describe('Instructor Portal Architecture & Security Suite', () => {
  describe('Student Onboarding & Cryptographic Activation Tokens', () => {
    it('generates high-entropy cryptographic activation token', () => {
      const token = generateSecureToken();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes hex = 64 characters
    });

    it('consistently hashes activation tokens with SHA-256', () => {
      const rawToken = '7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a';
      const hash1 = hashToken(rawToken);
      const hash2 = hashToken(rawToken);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(rawToken);
      expect(hash1.length).toBe(64);
    });

    it('produces completely distinct hashes for distinct tokens', () => {
      const tokenA = generateSecureToken();
      const tokenB = generateSecureToken();

      expect(hashToken(tokenA)).not.toBe(hashToken(tokenB));
    });
  });

  describe('Live Session URL Validation & AES-256-GCM Encryption', () => {
    it('validates authentic Google Meet and Zoom meeting links', () => {
      expect(isValidMeetingUrl('https://meet.google.com/abc-defg-hij')).toBe(true);
      expect(isValidMeetingUrl('https://us02web.zoom.us/j/1234567890?pwd=xyz')).toBe(true);
      expect(isValidMeetingUrl('https://zoom.us/j/987654321')).toBe(true);
    });

    it('identifies provider correctly', () => {
      const meet = validateMeetingUrl('https://meet.google.com/abc-defg-hij');
      expect(meet.isValid).toBe(true);
      expect(meet.provider).toBe('GOOGLE_MEET');

      const zoom = validateMeetingUrl('https://us02web.zoom.us/j/1234567890');
      expect(zoom.isValid).toBe(true);
      expect(zoom.provider).toBe('ZOOM');
    });

    it('rejects unverified or malicious arbitrary URLs as meeting links', () => {
      expect(isValidMeetingUrl('https://malicious-site.com/phishing')).toBe(false);
      expect(isValidMeetingUrl('javascript:alert(1)')).toBe(false);
      expect(isValidMeetingUrl('ftp://random-server.net')).toBe(false);
    });

    it('encrypts and decrypts meeting URLs symmetrically using AES-256', () => {
      const originalUrl = 'https://meet.google.com/rbs-yoga-live-batch1';
      const encrypted = encryptMeetingUrl(originalUrl);

      expect(encrypted).not.toBe(originalUrl);
      expect(encrypted).toContain(':'); // iv:authTag:ciphertext format

      const decrypted = decryptMeetingUrl(encrypted);
      expect(decrypted).toBe(originalUrl);
    });

    it('fails safely when decrypting tampered ciphertext', () => {
      const originalUrl = 'https://meet.google.com/rbs-yoga-live-batch1';
      const encrypted = encryptMeetingUrl(originalUrl);
      const tampered = encrypted.slice(0, -4) + '0000';

      const decrypted = decryptMeetingUrl(tampered);
      expect(decrypted).toBeNull();
    });
  });

  describe('WhatsApp and Communication Utilities', () => {
    it('normalizes formatted phone numbers into E.164 digits for WhatsApp links', () => {
      expect(cleanWhatsAppNumber('+91 89513 46405')).toBe('918951346405');
      expect(cleanWhatsAppNumber('89513-46405')).toBe('8951346405');
      expect(cleanWhatsAppNumber('+91 (895) 134-6405')).toBe('918951346405');
    });
  });
});
