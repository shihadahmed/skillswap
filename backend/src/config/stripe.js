/**
 * Stripe SDK wrapper.
 * Lazy-requires the `stripe` package so the rest of the app can boot
 * even if the dependency is not installed in a CI smoke test.
 *
 * If STRIPE_SECRET_KEY is missing or empty, `stripeClient` is `null` and
 * the rest of the app falls back to a "demo" mode that records payments
 * directly in MongoDB without contacting Stripe.
 */

let _stripe = null;

function getStripeKey() {
  return (
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET ||
    ''
  ).trim();
}

function isStripeLive() {
  return !!getStripeKey();
}

function getStripeClient() {
  if (!isStripeLive()) return null;
  if (_stripe) return _stripe;
  // Lazy require so the module is optional.
  const Stripe = require('stripe');
  _stripe = new Stripe(getStripeKey(), { apiVersion: '2024-06-20' });
  return _stripe;
}

function getWebhookSecret() {
  return (
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.STRIPE_WEBHOOK_KEY ||
    ''
  ).trim();
}

function verifyWebhookSignature({ rawBody, signatureHeader }) {
  const secret = getWebhookSecret();
  if (!secret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not configured; refusing to verify webhook in live mode.'
    );
  }
  const Stripe = require('stripe');
  return Stripe.webhooks.constructEvent(rawBody, signatureHeader, secret);
}

module.exports = {
  isStripeLive,
  getStripeClient,
  getWebhookSecret,
  verifyWebhookSignature,
};
