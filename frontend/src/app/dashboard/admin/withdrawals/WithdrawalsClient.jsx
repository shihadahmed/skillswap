'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { fmtBudget } from '@/lib/format';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { TableSkeleton } from '@/components/Skeletons';

const STATUS_STYLES = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default function AdminWithdrawalsClient() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ withdrawals: [], totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(p), limit: '12' });
      if (status) qs.set('status', status);
      const res = await api.get(`/admin/withdrawals?${qs.toString()}`);
      setData(res);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Could not load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const act = async (id, kind) => {
    setBusyId(id);
    try {
      const note = kind === 'reject' ? window.prompt('Reason for rejection (optional):') || '' : undefined;
      await api.put(`/admin/withdrawals/${id}/${kind}`, kind === 'reject' ? { note } : {});
      toast.success(`Withdrawal ${kind}d.`);
      load(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || `Failed to ${kind}.`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Withdrawal requests</h2>
          <p className="text-sm text-muted">
            {data.total} total request{data.total === 1 ? '' : 's'}
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          className="h-10 rounded-xl border border-line bg-surface px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton cols={5} rows={6} />
      ) : data.withdrawals.length === 0 ? (
        <EmptyState
          title="No withdrawal requests"
          message="Freelancers will appear here once they request a payout."
        />
      ) : (
        <>
          <div className="overflow-x-auto bg-surface border border-line rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-line">
                  <th className="py-3 px-4 font-medium">Freelancer</th>
                  <th className="py-3 px-4 font-medium">Amount</th>
                  <th className="py-3 px-4 font-medium">Method</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Requested</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.withdrawals.map((w) => (
                  <tr key={w._id} className="border-b border-line last:border-0">
                    <td className="py-3 px-4 text-ink">{w.freelancer_email}</td>
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
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex gap-2">
                        {w.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => act(w._id, 'approve')}
                            disabled={busyId === w._id}
                            className="border border-line text-ink hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                          >
                            Approve
                          </button>
                        )}
                        {(w.status === 'pending' || w.status === 'approved') && (
                          <button
                            type="button"
                            onClick={() => act(w._id, 'pay')}
                            disabled={busyId === w._id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                          >
                            Mark paid
                          </button>
                        )}
                        {w.status !== 'paid' && w.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => act(w._id, 'reject')}
                            disabled={busyId === w._id}
                            className="border border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
