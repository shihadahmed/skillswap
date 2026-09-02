'use client';

import { loadStripe } from '@stripe/stripe-js';

let _promise;

export function getStripe() {
  if (typeof window === 'undefined') return null;
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  if (!_promise) _promise = loadStripe(key);
  return _promise;
}

export async function redirectToCheckout({ sessionId, url }) {
  // Prefer the explicit URL returned by Stripe's session (more reliable than
  // sessionId in older SDKs and works on every browser).
  if (url) {
    window.location.assign(url);
    return;
  }
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe is not configured on the client.');
  }
  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) throw new Error(error.message || 'Stripe redirect failed');
}
