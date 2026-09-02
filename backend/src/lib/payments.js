/**
 * Payment helper utilities.
 * - toCents / fromCents: USD is the only supported currency for now.
 * - buildSuccessUrl / buildCancelUrl: redirect targets after Stripe Checkout.
 * - MIN_WITHDRAWAL: freelancer cannot request a withdrawal below this amount.
 */

const MIN_WITHDRAWAL = 10;

function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

function fromCents(cents) {
  return Math.round(Number(cents)) / 100;
}

function getClientUrl() {
  return (
    process.env.CLIENT_URL ||
    process.env.NEXT_PUBLIC_CLIENT_URL ||
    'http://localhost:3000'
  ).replace(/\/+$/, '');
}

function buildSuccessUrl({ taskId, sessionId, paymentId }) {
  const base = getClientUrl();
  if (taskId) {
    const params = new URLSearchParams();
    params.set('payment', 'success');
    if (sessionId) params.set('session_id', sessionId);
    return `${base}/tasks/${taskId}?${params.toString()}`;
  }
  const params = new URLSearchParams();
  if (paymentId) params.set('payment_id', paymentId);
  if (sessionId) params.set('session_id', sessionId);
  return `${base}/payments/success?${params.toString()}`;
}

function buildCancelUrl({ taskId, paymentId }) {
  const base = getClientUrl();
  const params = new URLSearchParams();
  if (taskId) params.set('task_id', String(taskId));
  if (paymentId) params.set('payment_id', String(paymentId));
  return `${base}/payments/cancel?${params.toString()}`;
}

module.exports = {
  MIN_WITHDRAWAL,
  toCents,
  fromCents,
  getClientUrl,
  buildSuccessUrl,
  buildCancelUrl,
};
