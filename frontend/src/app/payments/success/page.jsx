'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/fees';
import { fmtBudget } from '@/lib/format';

const STATUS_STYLES = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  escrow_locked: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  released: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  refunded: 'border-slate-200 bg-slate-50 text-slate-700',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const paymentId = params.get('payment_id');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!paymentId) {
        setError('Missing payment_id in the URL.');
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/payments/${paymentId}`);
        if (active) setPayment(res.payment);
      } catch (err) {
        if (active)
          setError(
            err?.response?.data?.message || err?.message || 'Could not load payment.'
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [paymentId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted">
        Loading your payment…
      </div>
    );
  }

  if (error) {
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

  const statusClass = STATUS_STYLES[payment.payment_status] || STATUS_STYLES.pending;

  return (
    <div className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-2xl mx-auto bg-surface border border-line rounded-3xl shadow-soft overflow-hidden">
        <div className="p-8 sm:p-10 text-center bg-gradient-to-br from-brand/10 via-accent/10 to-transparent">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 grid place-items-center">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-ink">
            Payment received
          </h1>
          <p className="mt-2 text-muted text-sm">
            Your funds are now safely held in escrow. The freelancer will be
            notified to start work.
          </p>
          <span
            className={`mt-4 inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${statusClass}`}
          >
            {payment.payment_status.replace('_', ' ')}
          </span>
        </div>

        <div className="p-8 sm:p-10 border-t border-line">
          <h2 className="text-lg font-bold text-ink mb-4">Payment summary</h2>
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
        </div>

        <div className="p-6 sm:p-8 bg-slate-50 border-t border-line flex flex-wrap gap-3 justify-end">
          <button
            onClick={() => router.push('/dashboard/client/my-tasks')}
            className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            Go to my tasks
          </button>
          <Link
            href="/dashboard/freelancer"
            className="border border-line text-ink hover:bg-white px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            Freelancer dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right ${bold ? 'font-extrabold text-ink' : 'text-ink'}`}>
        {value}
      </dd>
    </div>
  );
}
