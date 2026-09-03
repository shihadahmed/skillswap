'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Wallet, CreditCard, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { redirectToCheckout } from '@/lib/stripe';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

const MIN = 1;
const MAX = 10000;
const QUICK = [10, 25, 50, 100, 250];

// Local mirror of backend/src/lib/fees.js -> calculateDepositFees().
// Keep in sync if the backend rates change.
const DEPOSIT_PLATFORM_FEE_RATE = 0.03;
const DEPOSIT_VAT_RATE = 0.05;
const STRIPE_PCT = 0.029;
const STRIPE_FIXED = 0.30;

function round2(n) {
  return Math.round(n * 100) / 100;
}

function calcDepositFees(amount) {
  const base = Number(amount) || 0;
  const platformFee = round2(base * DEPOSIT_PLATFORM_FEE_RATE);
  const taxVat = round2(base * DEPOSIT_VAT_RATE);
  const subtotal = base + platformFee + taxVat;
  const stripeProcessingFee =
    Math.round(((subtotal + STRIPE_FIXED) / (1 - STRIPE_PCT) - subtotal) * 100) / 100;
  const totalToCharge = Math.round((subtotal + stripeProcessingFee) * 100) / 100;
  return { depositAmount: base, platformFee, taxVat, stripeProcessingFee, totalToCharge };
}

function fmtUsd(n) {
  const v = Number.isFinite(n) ? n : 0;
  return `$${v.toFixed(2)}`;
}

export default function DepositModal({ open, onClose }) {
  const { refreshUser } = useAuth();
  const [amount, setAmount] = useState('50');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setError('');
      setBusy(false);
      // Focus the amount input when the modal opens.
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Allow Escape to close.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const numeric = Number(amount);
  const valid = Number.isFinite(numeric) && numeric >= MIN && numeric <= MAX;
  const fees = valid ? calcDepositFees(numeric) : null;

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!valid) {
      setError(`Amount must be between $${MIN} and $${MAX}.`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/payments/wallet-topup-session', {
        amount: numeric,
      });
      if (!res?.url) {
        throw new Error('Top-up session did not return a URL.');
      }
      // Pre-emptively refresh the user in case the redirect is a demo URL
      // (we'll still get a final refresh on the success page).
      try {
        await refreshUser?.();
      } catch (_) {
        // ignore
      }
      await redirectToCheckout({ sessionId: res.sessionId, url: res.url });
      // redirectToCheckout navigates away; the success page takes over.
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to start the deposit.';
      setError(msg);
      toast.error(msg);
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Deposit funds"
      className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose?.();
      }}
    >
      <div className="w-full max-w-md bg-surface border border-line rounded-3xl shadow-soft overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-gradient-to-br from-brand/10 via-accent/10 to-transparent">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center h-8 w-8 rounded-xl bg-brand/10 text-brand">
              <Wallet size={16} />
            </span>
            <h2 className="text-lg font-extrabold text-ink">Deposit funds</h2>
          </div>
          <button
            type="button"
            onClick={() => !busy && onClose?.()}
            aria-label="Close"
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-slate-100 disabled:opacity-50"
            disabled={busy}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          <p className="text-sm text-muted">
            Add money to your SkillSwap wallet. Funds are used to pay for task
            escrows and can be tracked from the navbar balance.
          </p>

          <div>
            <label
              htmlFor="deposit-amount"
              className="block text-sm font-medium text-ink mb-1"
            >
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-muted font-semibold">
                $
              </span>
              <input
                id="deposit-amount"
                ref={inputRef}
                type="number"
                inputMode="decimal"
                min={MIN}
                max={MAX}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={busy}
                className="w-full h-12 pl-7 pr-3 rounded-xl border border-line bg-surface text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              Min ${MIN} · Max ${MAX.toLocaleString('en-US')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                disabled={busy}
                onClick={() => setAmount(String(q))}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  String(q) === String(amount)
                    ? 'bg-brand text-white border-brand'
                    : 'bg-surface text-muted border-line hover:border-brand/40'
                }`}
              >
                ${q}
              </button>
            ))}
          </div>

          {fees && (
            <div className="rounded-xl border border-line bg-bg/50 p-4 space-y-1.5">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                Fee summary
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Wallet Credit</span>
                <span className="font-semibold text-ink">
                  {fmtUsd(fees.depositAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Platform Service Fee (3%)</span>
                <span className="font-semibold text-ink">
                  {fmtUsd(fees.platformFee)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">VAT / Tax (5%)</span>
                <span className="font-semibold text-ink">
                  {fmtUsd(fees.taxVat)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Processing Fee</span>
                <span className="font-semibold text-ink">
                  {fmtUsd(fees.stripeProcessingFee)}
                </span>
              </div>
              <div className="pt-2 mt-2 border-t border-line flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Total to Pay</span>
                <span className="text-base font-extrabold text-brand">
                  {fmtUsd(fees.totalToCharge)}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !valid}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Redirecting to checkout…
              </>
            ) : (
              <>
                <CreditCard size={16} />
                {fees
                  ? `Pay ${fmtUsd(fees.totalToCharge)} with Stripe`
                  : 'Deposit with Stripe'}
              </>
            )}
          </button>

          <p className="text-[11px] text-muted text-center">
            You will be redirected to Stripe Checkout. Funds are added to your
            wallet balance once payment is verified.
          </p>
        </form>
      </div>
    </div>
  );
}
