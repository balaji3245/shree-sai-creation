import Razorpay from 'razorpay';
import crypto from 'crypto';
import logger from '../utilities/logger.js';

let razorpayClient = null;

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function isMockPayments() {
  return (
    String(process.env.RAZORPAY_MOCK || '').toLowerCase() === 'true' ||
    !isRazorpayConfigured()
  );
}

export function getRazorpay() {
  if (isMockPayments()) return null;
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
}

export async function createRazorpayOrder({ amountInPaise, receipt, notes = {} }) {
  if (isMockPayments()) {
    const id = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
    logger.info({ id, amountInPaise }, 'Mock Razorpay order created');
    return {
      id,
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      status: 'created',
      mock: true,
    };
  }

  const client = getRazorpay();
  return client.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
    notes,
  });
}

export function verifyPaymentSignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  if (isMockPayments()) {
    return (
      String(razorpaySignature || '').startsWith('mock_') ||
      razorpaySignature === 'mock_signature'
    );
  }

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  return hmac.digest('hex') === razorpaySignature;
}

export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    if (isMockPayments()) return true;
    return false;
  }

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function createRefund({ paymentId, amountInPaise, notes = {} }) {
  if (isMockPayments()) {
    return {
      id: `rfnd_mock_${crypto.randomBytes(6).toString('hex')}`,
      payment_id: paymentId,
      amount: amountInPaise,
      status: 'processed',
      mock: true,
    };
  }

  const client = getRazorpay();
  return client.payments.refund(paymentId, {
    amount: amountInPaise,
    notes,
  });
}

export default {
  getRazorpay,
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  createRefund,
  isMockPayments,
  isRazorpayConfigured,
};
