import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyRazorpaySignature, verifyWebhookSignature } from '../src/lib/razorpay';

describe('Payment & Razorpay Security', () => {
  const secret = 'rzp_secret_dummy_test_key_for_signature';

  it('verifies valid HMAC-SHA256 signature', () => {
    const orderId = 'order_test_123';
    const paymentId = 'pay_test_456';
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = verifyRazorpaySignature(orderId, paymentId, expectedSig);
    expect(isValid).toBe(true);
  });

  it('rejects invalid or forged signatures', () => {
    const orderId = 'order_test_123';
    const paymentId = 'pay_test_456';
    const forgedSig = 'forged_fake_signature_hash_0000000000';

    const isValid = verifyRazorpaySignature(orderId, paymentId, forgedSig);
    expect(isValid).toBe(false);
  });

  it('validates webhook HMAC-SHA256 signature properly', () => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_dummy_123';
    const body = JSON.stringify({ event: 'payment.captured', id: 'evt_1001' });

    const validWebhookSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    expect(verifyWebhookSignature(body, validWebhookSig)).toBe(true);
    expect(verifyWebhookSignature(body, 'invalid_sig')).toBe(false);
  });
});
