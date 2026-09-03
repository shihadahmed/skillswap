'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/fees';
import { fmtBudget } from '@/lib/format';
import { Loader2, RefreshCw } from 'lucide-react';

const STATUS_STYLES = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  escrow_locked: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  released: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  refunded: 'border-slate-200 bg-slate-50 text-slate-700',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
  wallet_topup_confirmed:
    'border-emerald-200 bg-emerald-50 text-emerald-700',
};

// State machine for the success page (top-up flow):
//   loading  -> initial GET /payments/:id
//   verifying -> POST /verify-wallet-topup in flight
//   confirmed -> verify returned success; balance is fresh
//   pending_retry -> first verify returned 402; waiting to retry
//   error     -> unrecoverable; show re-verify button
const RETRY_DELAY_MS = 1500;

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const paymentId = params.get('payment_id');
  const sessionId = params.get('session_id');

  const [phase, setPhase] = useState('loading');
  const [payment, setPayment] = useState(null);
  const [availableBalance, setAvailableBalance] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [error, setError] = useState(null);
  const retryTimerRef = useRef(null);

  const runVerify = useCallback(
    async (paymentDoc) => {
      const sid = sessionId || paymentDoc?.stripe_session_id;
      try {
        const verify = await api.post('/payments/verify-wallet-topup', {
          sessionId: sid,
          paymentId: paymentDoc?._id || paymentId,
        });
        if (verify?.payment) setPayment(verify.payment);
        if (typeof verify?.available_balance === 'number') {
          setAvailableBalance(verify.available_balance);
        }
        if (typeof verify?.payment_verified === 'boolean') {
          setPaymentVerified(verify.payment_verified);
        }
        // Refresh the auth context so the navbar / wallet card reflect the
        // new balance without a hard reload.
        try {
          await refreshUser?.();
        } catch (_) {
          // ignore
        }
        setPhase('confirmed');
        return true;
      } catch (err) {
        const status = err?.response?.status;
        const msg =
          err?.response?.data?.message || err?.message || 'Verification failed';
        if (status === 402) {
          // Stripe hasn't propagated yet — schedule one auto-retry.
          setPhase('pending_retry');
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
          retryTimerRef.current = setTimeout(() => {
            runVerify(paymentDoc);
          }, RETRY_DELAY_MS);
          return false;
        }
        setError(msg);
        setPhase('error');
        return false;
      }
    },
    [paymentId, sessionId, refreshUser]
  );

  useEffect(() => {
    let active = true;
    async function load() {
      if (!paymentId && !sessionId) {
        setError('Missing payment_id and session_id in the URL.');
        setPhase('error');
        return;
      }
      try {
        let paymentDoc = null;
        if (paymentId) {
          const res = await api.get(`/payments/${paymentId}`);
          paymentDoc = res.payment;
        }
        if (!active) return;
        setPayment(paymentDoc);

        if (paymentDoc?.payment_type === 'wallet_topup') {
          setPhase('verifying');
          await runVerify(paymentDoc);
        } else {
          setPhase('confirmed');
        }
      } catch (err) {
        if (!active) return;
        setError(
          err?.response?.data?.message || err?.message || 'Could not load payment.'
        );
        setPhase('error');
      }
    }
    load();
    return () => {
      active = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId, sessionId]);

  const handleManualReverify = useCallback(async () => {
    if (!payment) return;
    setError(null);
    setPhase('verifying');
    await runVerify(payment);
  }, [payment, runVerify]);

  if (phase === 'loading') {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted">
        <div className="flex items-center gap-2">
          <Loader2 size={18} className="animate-spin" />
          Loading your payment…
        </div>
      </div>
    );
  }

  if (phase === 'error' && !payment) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 bg-surface border border-line rounded-2xl shadow-soft text-center">
        <h1 className="text-2xl font-extrabold text-ink">Payment lookup failed</h1>
        <p className="text-muted mt-2">{error}</p>
        <Link
          href="/dashboard/client/my-tasks"
          className="inline-block mt-6 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
        >
          Back to my tasks
        </Link>
      </div>
    );
  }

  if (!payment) return null;

  const isTopup = payment.payment_type === 'wallet_topup';
  const isConfirmed = phase === 'confirmed' || payment.payment_status === 'wallet_topup_confirmed';
  const statusClass = isTopup && isConfirmed
    ? STATUS_STYLES.wallet_topup_confirmed
    : STATUS_STYLES[payment.payment_status] || STATUS_STYLES.pending;
  const backHref = isTopup ? '/dashboard/client' : '/dashboard/client/my-tasks';

  return (
    <div className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-2xl mx-auto bg-surface border border-line rounded-3xl shadow-soft overflow-hidden">
        <div className="p-8 sm:p-10 text-center bg-gradient-to-br from-brand/10 via-accent/10 to-transparent">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 grid place-items-center">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-ink">
            {isTopup ? 'Wallet top-up successful' : 'Payment received'}
          </h1>
          <p className="mt-2 text-muted text-sm">
            {isTopup
              ? isConfirmed
                ? 'Your SkillSwap wallet has been credited and your account is now payment verified.'
                : phase === 'verifying'
                ? 'Verifying your payment with Stripe…'
                : phase === 'pending_retry'
                ? 'Stripe is still confirming your payment. Retrying shortly…'
                : 'Your payment is being verified — the wallet will update as soon as Stripe confirms.'
              : 'Your funds are now safely held in escrow. The freelancer will be notified to start work.'}
          </p>
          <div className="mt-4 flex flex-col items-center gap-3">
            <span
              className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${statusClass}`}
            >
              {isTopup && isConfirmed
                ? 'wallet topup confirmed'
                : payment.payment_status.replace('_', ' ')}
            </span>
            {isTopup && (phase === 'verifying' || phase === 'pending_retry') && (
              <div className="inline-flex items-center gap-2 text-xs text-muted">
                <Loader2 size={14} className="animate-spin" />
                {phase === 'pending_retry'
                  ? 'Retrying verification…'
                  : 'Contacting Stripe…'}
              </div>
            )}
            {isTopup && phase === 'error' && (
              <div className="space-y-2">
                <p className="text-xs text-rose-600">{error}</p>
                <button
                  type="button"
                  onClick={handleManualReverify}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover"
                >
                  <RefreshCw size={12} />
                  Re-verify payment
                </button>
              </div>
            )}
            {isTopup && phase === 'pending_retry' && (
              <button
                type="button"
                onClick={handleManualReverify}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover"
              >
                <RefreshCw size={12} />
                Re-verify now
              </button>
            )}
          </div>
        </div>

        <div className="p-8 sm:p-10 border-t border-line">
          <h2 className="text-lg font-bold text-ink mb-4">
            {isTopup ? 'Top-up summary' : 'Payment summary'}
          </h2>
          {isTopup ? (
            <dl className="space-y-2 text-sm">
              <Row label="Top-up ID" value={String(payment._id)} />
              <Row label="Client" value={payment.client_email} />
              <Row label="Currency" value={payment.currency || 'USD'} />
              <hr className="my-3 border-line" />
              <Row
                label="Amount added to wallet"
                value={fmtBudget(payment.credited_to_balance || payment.base_bid_amount || payment.amount)}
                bold
              />
              {isConfirmed && typeof availableBalance === 'number' && (
                <Row
                  label="New wallet balance"
                  value={fmtBudget(availableBalance)}
                  bold
                  highlight
                />
              )}
              {isConfirmed && paymentVerified && (
                <Row
                  label="Payment verified"
                  value="Yes"
                />
              )}
            </dl>
          ) : (
            <dl className="space-y-2 text-sm">
              <Row label="Payment ID" value={String(payment._id)} />
              <Row label="Task ID" value={String(payment.task_id)} />
              <Row label="Freelancer" value={payment.freelancer_email} />
              <Row label="Client" value={payment.client_email} />
              <Row label="Currency" value={payment.currency || 'USD'} />
              <hr className="my-3 border-line" />
              <Row label="Base bid" value={fmtBudget(payment.base_bid_amount)} />
              <Row
                label="Client service fee"
                value={fmtBudget(payment.client_service_fee)}
              />
              <Row label="VAT" value={fmtBudget(payment.vat_amount)} />
              <Row label="Gateway fee" value={fmtBudget(payment.gateway_fee)} />
              <Row
                label="Total paid by client"
                value={fmtBudget(payment.total_paid_by_client)}
                bold
              />
              <hr className="my-3 border-line" />
              <Row
                label="Freelancer net payout"
                value={fmtBudget(payment.freelancer_net_payout)}
              />
              <Row
                label="Platform profit"
                value={fmtBudget(payment.platform_net_profit)}
              />
            </dl>
          )}
        </div>

        <div className="p-6 sm:p-8 bg-slate-50 border-t border-line flex flex-wrap gap-3 justify-end">
          <button
            onClick={() => router.push(backHref)}
            className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            {isTopup ? 'Back to dashboard' : 'Go to my tasks'}
          </button>
          {!isTopup && (
            <Link
              href="/dashboard/freelancer"
              className="border border-line text-ink hover:bg-white px-5 py-2.5 rounded-xl font-semibold text-sm"
            >
              Freelancer dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, highlight }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd
        className={`text-right ${
          highlight
            ? 'font-extrabold text-brand'
            : bold
            ? 'font-extrabold text-ink'
            : 'text-ink'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
