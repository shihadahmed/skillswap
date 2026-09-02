'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRevalidate } from '@/lib/hooks';
import { calculateMarketplaceFees, formatCurrency } from '@/lib/fees';
import { redirectToCheckout } from '@/lib/stripe';
import { toast } from 'react-toastify';

export default function TaskCheckout({ taskId, clientEmail, status }) {
  const { user } = useAuth();
  const revalidate = useRevalidate();
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifiedRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const [acceptedProposal, setAcceptedProposal] = useState(null);
  const [payment, setPayment] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const isOwner = user?.role === 'client' && user.email === clientEmail;
  if (!isOwner) return null;

  // Fetch accepted proposal to get bid amount for fee calculation,
  // and the most recent Payment row (if any) to render escrow state.
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await api.get(`/tasks/${taskId}/proposals`);
        if (!active) return;
        const accepted = (data.proposals || []).find(
          (p) => p.status === 'accepted'
        );
        if (accepted) setAcceptedProposal(accepted);
      } catch (_) {
        // ignore
      }
      try {
        const mine = await api.get('/payments/mine');
        const list = (mine.payments || []).filter(
          (p) => String(p.task_id) === String(taskId)
        );
        if (active && list.length) {
          // The most recent payment for this task wins.
          list.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setPayment(list[0]);
        }
      } catch (_) {
        // ignore
      }
    }
    if (status === 'in_progress' || status === 'completed') load();
    return () => {
      active = false;
    };
  }, [taskId, status]);

  // When the user lands back from Stripe Checkout, the URL carries
  //   ?payment=success&session_id=...
  // Verify the session with our backend, refresh the task, and strip the
  // query string so a refresh doesn't re-trigger verification.
  useEffect(() => {
    const paymentFlag = searchParams?.get('payment');
    const sessionId = searchParams?.get('session_id');
    if (paymentFlag !== 'success' || !sessionId || verifiedRef.current) return;
    if (status !== 'in_progress' && status !== 'open' && status !== 'pending') {
      // Still allow verification even on completed tasks — the backend is
      // idempotent. We just don't want to clobber a different status.
    }
    verifiedRef.current = true;
    let active = true;
    async function verify() {
      setVerifying(true);
      try {
        const res = await api.post('/payments/verify-session', {
          sessionId,
          taskId,
        });
        if (!active) return;
        if (res?.success) {
          toast.success('Payment verified! Task is now In Progress.');
          refresh();
        } else {
          toast.error(res?.message || 'Payment could not be verified yet.');
        }
      } catch (err) {
        if (!active) return;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Payment verification failed.';
        toast.error(msg);
      } finally {
        if (active) setVerifying(false);
        // Clean the URL so a refresh / shared link doesn't re-trigger.
        if (typeof window !== 'undefined') {
          router.replace(window.location.pathname);
        }
      }
    }
    verify();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, status, taskId]);

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

  const feeBreakdown = useMemo(() => {
    if (!acceptedProposal?.proposed_budget) return null;
    return calculateMarketplaceFees(Number(acceptedProposal.proposed_budget));
  }, [acceptedProposal]);

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/payments/create-checkout-session', {
        task_id: taskId,
      });
      if (!res?.url) {
        throw new Error('Checkout session did not return a URL.');
      }
      // Redirect to Stripe Checkout (or the demo success URL in fallback mode).
      await redirectToCheckout({ sessionId: res.sessionId, url: res.url });
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || 'Payment failed.';
      setError(msg);
      toast.error(msg);
      setBusy(false);
    }
  };

  const releaseEscrow = async () => {
    if (!payment) return;
    setBusy(true);
    setError('');
    try {
      await api.post('/payments/release', { payment_id: payment._id });
      toast.success(
        'Escrow released. Freelancer earnings are now available for withdrawal.'
      );
      refresh();
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || 'Release failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const refund = async () => {
    if (!payment) return;
    if (!window.confirm('Refund this payment? This cannot be undone.')) return;
    setBusy(true);
    setError('');
    try {
      await api.post('/payments/refund', { payment_id: payment._id });
      toast.success('Payment refunded.');
      refresh();
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || 'Refund failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api.get(`/tasks/${taskId}/proposals`);
      const accepted = (data.proposals || []).find(
        (p) => p.status === 'accepted'
      );
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
      const msg = e?.response?.data?.message || e?.message || 'Review failed.';
      setError(msg);
      toast.error(msg);
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

        {verifying && (
          <div className="mb-4 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2">
            Verifying your payment with Stripe…
          </div>
        )}

        {feeBreakdown && (
          <div className="space-y-2 mb-4 p-4 bg-bg border border-line rounded-xl">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Base Task Cost</span>
              <span className="font-medium text-ink">
                {formatCurrency(feeBreakdown.baseAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Platform Service Fee (5%)</span>
              <span className="font-medium text-ink">
                {formatCurrency(feeBreakdown.clientServiceFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">VAT / Tax (5% on service fee)</span>
              <span className="font-medium text-ink">
                {formatCurrency(feeBreakdown.vatAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">
                Payment Processing Fee (Stripe 2.9% + $0.30)
              </span>
              <span className="font-medium text-ink">
                {formatCurrency(feeBreakdown.gatewayFee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-line pt-2">
              <span className="font-semibold text-ink">Total Payable</span>
              <span className="font-bold text-brand text-lg">
                {formatCurrency(feeBreakdown.totalPaidByClient)}
              </span>
            </div>
          </div>
        )}

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}
        <button
          onClick={pay}
          disabled={busy}
          className="w-full bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {busy
            ? 'Redirecting to checkout…'
            : `Pay ${formatCurrency(feeBreakdown?.totalPaidByClient || 0)}`}
        </button>
        <p className="text-xs text-muted text-center mt-2">
          Your payment secures the freelancer. Funds are held in escrow until
          you release them.
        </p>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="space-y-4">
        {payment && (
          <div className="bg-surface border border-line rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-ink">Escrow status</h3>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  payment.payment_status === 'released' ||
                  payment.payment_status === 'completed'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : payment.payment_status === 'refunded'
                    ? 'border-slate-200 bg-slate-50 text-slate-700'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                }`}
              >
                {payment.payment_status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-muted">
              {payment.payment_status === 'released' ||
              payment.payment_status === 'completed'
                ? 'You released the funds. The freelancer can now withdraw their earnings.'
                : payment.payment_status === 'refunded'
                ? 'This payment has been refunded.'
                : 'The funds are held in escrow. Release them when you are happy with the deliverable.'}
            </p>

            {payment.payment_status === 'escrow_locked' && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={releaseEscrow}
                  disabled={busy}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
                >
                  {busy ? 'Releasing…' : 'Release escrow'}
                </button>
                <button
                  type="button"
                  onClick={refund}
                  disabled={busy}
                  className="border border-line text-muted hover:text-ink hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
                >
                  Refund
                </button>
              </div>
            )}
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          </div>
        )}

        {done ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-sm text-emerald-700">
            Thanks! Your review was submitted.
          </div>
        ) : (
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
        )}
      </div>
    );
  }

  return null;
}
