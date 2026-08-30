'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRevalidate } from '@/lib/hooks';
import { calculateMarketplaceFees, formatCurrency } from '@/lib/fees';
import { toast } from 'react-toastify';

export default function TaskCheckout({ taskId, clientEmail, status }) {
  const { user } = useAuth();
  const revalidate = useRevalidate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const [acceptedProposal, setAcceptedProposal] = useState(null);

  const isOwner = user?.role === 'client' && user.email === clientEmail;
  if (!isOwner) return null;

  // Fetch accepted proposal to get bid amount for fee calculation
  useEffect(() => {
    if (status === 'in_progress') {
      let active = true;
      api.get(`/tasks/${taskId}/proposals`)
        .then((data) => {
          if (active) {
            const accepted = (data.proposals || []).find((p) => p.status === 'accepted');
            if (accepted) setAcceptedProposal(accepted);
          }
        })
        .catch(() => {});
      return () => { active = false; };
    }
  }, [taskId, status]);

  const refresh = () =>
    revalidate(
      (k) =>
        typeof k === 'string' &&
        (k.startsWith('/tasks/mine') ||
          k.startsWith('/client/overview') ||
          k.startsWith(`/tasks/${taskId}`) ||
          k.startsWith('/tasks?') ||
          k === '/tasks')
    );

  // Real-time fee calculation for client checkout
  const feeBreakdown = useMemo(() => {
    if (!acceptedProposal?.proposed_budget) return null;
    return calculateMarketplaceFees(Number(acceptedProposal.proposed_budget));
  }, [acceptedProposal]);

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      await api.post('/payments/checkout', { task_id: taskId });
      toast.success('Payment completed successfully! Task is now In Progress.');
      refresh();
      setBusy(false);
    } catch (e) {
      setError(e.message || 'Payment failed.');
      toast.error('Payment failed or transaction was cancelled.');
      setBusy(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api.get(`/tasks/${taskId}/proposals`);
      const accepted = (data.proposals || []).find((p) => p.status === 'accepted');
      const reviewee_email = accepted?.freelancer_email;
      if (!reviewee_email) throw new Error('No accepted freelancer found');
      await api.post('/reviews', {
        task_id: taskId,
        reviewee_email,
        rating: Number(rating),
        comment,
      });
      toast.success('Thank you! Review and rating submitted.');
      setDone(true);
      refresh();
    } catch (e) {
      setError(e.message || 'Review failed.');
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'in_progress') {
    if (!acceptedProposal) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-sm text-amber-700">Loading payment details…</p>
        </div>
      );
    }

    return (
      <div className="bg-surface border border-line rounded-2xl p-5">
        <h3 className="font-semibold text-ink mb-1">Payment Summary</h3>
        <p className="text-sm text-muted mb-4">
          Complete the payment to start the task. All fees are itemized below.
        </p>

        {/* Itemized Billing Summary */}
        {feeBreakdown && (
          <div className="space-y-2 mb-4 p-4 bg-bg border border-line rounded-xl">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Base Task Cost</span>
              <span className="font-medium text-ink">{formatCurrency(feeBreakdown.baseAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Platform Service Fee (5%)</span>
              <span className="font-medium text-ink">{formatCurrency(feeBreakdown.clientServiceFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">VAT / Tax (5% on service fee)</span>
              <span className="font-medium text-ink">{formatCurrency(feeBreakdown.vatAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Payment Processing Fee (Stripe 2.9% + $0.30)</span>
              <span className="font-medium text-ink">{formatCurrency(feeBreakdown.gatewayFee)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2">
              <span className="font-semibold text-ink">Total Payable</span>
              <span className="font-bold text-brand text-lg">{formatCurrency(feeBreakdown.totalPaidByClient)}</span>
            </div>
          </div>
        )}

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}
        <button
          onClick={pay}
          disabled={busy}
          className="w-full bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {busy ? 'Processing…' : `Pay ${formatCurrency(feeBreakdown?.totalPaidByClient || 0)}`}
        </button>
        <p className="text-xs text-muted text-center mt-2">
          Your payment secures the freelancer. Funds are held until delivery is confirmed.
        </p>
      </div>
    );
  }

  if (status === 'completed') {
    if (done) {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-sm text-emerald-700">
          Thanks! Your review was submitted.
        </div>
      );
    }
    return (
      <form
        onSubmit={submitReview}
        className="bg-surface border border-line rounded-2xl p-5"
      >
        <h3 className="font-semibold text-ink">Leave a review</h3>
        <p className="text-sm text-muted mt-1">
          Rate the freelancer you worked with.
        </p>
        <div className="mt-3 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              className={`text-2xl transition-colors ${
                n <= rating ? 'text-amber-500' : 'text-slate-300'
              }`}
              aria-label={`${n} star`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional comment…"
          className="mt-3 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-3 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {busy ? 'Submitting…' : 'Submit review'}
        </button>
      </form>
    );
  }

  return null;
}
