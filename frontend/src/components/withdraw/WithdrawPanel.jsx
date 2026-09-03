'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { approvalBlockMessage, isApprovedUser } from '@/lib/approval';
import { toast } from 'react-toastify';
import { fmtBudget } from '@/lib/format';
import Pagination from '@/components/Pagination';

const MIN_WITHDRAWAL = 10;

const STATUS_STYLES = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default function WithdrawPanel() {
  const { user } = useAuth();
  const blocked = !!user && !isApprovedUser(user);
  const [available, setAvailable] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const load = async (p = page) => {
    setLoading(true);
    try {
      const [me, wr] = await Promise.all([
        api.get('/payments/mine'),
        api.get(`/payments/withdrawals/mine?page=${p}&limit=9`),
      ]);
      setAvailable(typeof me.available_balance === 'number' ? me.available_balance : 0);
      setWithdrawals(wr.withdrawals || []);
      setTotalPages(wr.totalPages || 1);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Could not load wallet.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (blocked) {
      toast.error(approvalBlockMessage());
      return;
    }
    const value = Number(amount);
    if (!value || value < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal is $${MIN_WITHDRAWAL}.`);
      return;
    }
    if (value > available) {
      setError('Amount exceeds your available balance.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/payments/withdraw', { amount: value });
      setAmount('');
      toast.success(
        `Withdrawal requested for ${fmtBudget(value)}. Funds are reserved and waiting for admin approval.`
      );
      setAvailable(res.available_balance ?? available - value);
      load(1);
      setPage(1);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || 'Withdrawal request failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="bg-surface border border-line rounded-2xl p-5">
          <div className="text-xs uppercase tracking-wider text-muted font-semibold">
            Available balance
          </div>
          <div className="mt-2 text-3xl font-extrabold text-ink">
            {fmtBudget(available)}
          </div>
          <p className="mt-2 text-xs text-muted">
            Withdrawable earnings from released escrow payments.
          </p>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-5 sm:col-span-2">
          <form onSubmit={submit} className="space-y-3">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
              Request withdrawal
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  min={MIN_WITHDRAWAL}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min $${MIN_WITHDRAWAL}`}
                  className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || blocked}
                title={blocked ? 'Account pending verification' : undefined}
                className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {submitting ? 'Submitting…' : 'Request withdrawal'}
              </button>
            </div>
            <p className="text-xs text-muted">
              Funds are reserved immediately and processed by an admin via
              Stripe transfer. Minimum ${MIN_WITHDRAWAL}. Rejected requests are
              refunded to your balance.
            </p>
            {error && <p className="text-sm text-danger">{error}</p>}
          </form>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-ink mb-3">Withdrawal history</h2>
        {loading ? (
          <div className="text-sm text-muted py-6 text-center bg-surface border border-line rounded-2xl">
            Loading…
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-sm text-muted py-6 text-center bg-surface border border-line rounded-2xl">
            You haven&apos;t requested any withdrawals yet.
          </div>
        ) : (
          <div className="overflow-x-auto bg-surface border border-line rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-line">
                  <th className="py-3 px-4 font-medium">Amount</th>
                  <th className="py-3 px-4 font-medium">Method</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Requested</th>
                  <th className="py-3 px-4 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w._id} className="border-b border-line last:border-0">
                    <td className="py-3 px-4 font-semibold text-ink">
                      {fmtBudget(w.amount)}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {w.method === 'stripe_transfer' ? 'Stripe transfer' : 'Manual'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          STATUS_STYLES[w.status] || STATUS_STYLES.pending
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {w.createdAt
                        ? new Date(w.createdAt).toLocaleString()
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-muted">{w.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); load(p); }} />
      </div>
    </div>
  );
}
