'use client';

import { useState, useMemo } from 'react';
import { useAdminTransactions } from '@/lib/hooks';
import { fmtBudget } from '@/lib/format';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { TableSkeleton } from '@/components/Skeletons';

const STATUS_STYLES = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  escrow_locked: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  released: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  refunded: 'border-slate-200 bg-slate-50 text-slate-700',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default function AdminTransactions() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useAdminTransactions(page);

  const transactions = data?.transactions || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;
  const showSkeleton = isLoading && !data;

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter && t.payment_type !== typeFilter) return false;
      if (statusFilter && t.payment_status !== statusFilter) return false;
      return true;
    });
  }, [transactions, typeFilter, statusFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Transactions ({total})</h2>
          <p className="text-xs text-muted">
            Filter by type or status to narrow the list. Filters apply to the
            current page.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-sm"
          >
            <option value="">All types</option>
            <option value="task_deposit">Task deposit</option>
            <option value="freelancer_withdraw">Withdrawal</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="escrow_locked">Escrow locked</option>
            <option value="released">Released</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
            <option value="paid">Paid (legacy)</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {showSkeleton ? (
        <TableSkeleton cols={11} rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No transactions match the current filters"
          message="Try clearing the filter or check back after a new payment is recorded."
        />
      ) : (
        <div className="overflow-x-auto bg-surface border border-line rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-line">
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium">Freelancer</th>
                <th className="py-3 px-4 font-medium">Base Bid</th>
                <th className="py-3 px-4 font-medium">Client Fees</th>
                <th className="py-3 px-4 font-medium">Gateway</th>
                <th className="py-3 px-4 font-medium">Total Paid</th>
                <th className="py-3 px-4 font-medium">Freelancer Net</th>
                <th className="py-3 px-4 font-medium">Platform Profit</th>
                <th className="py-3 px-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx._id} className="border-b border-line last:border-0">
                  <td className="py-3 px-4 text-xs text-muted">
                    {tx.payment_type === 'freelancer_withdraw'
                      ? 'Withdraw'
                      : 'Deposit'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                        STATUS_STYLES[tx.payment_status] ||
                        STATUS_STYLES.pending
                      }`}
                    >
                      {(tx.payment_status || 'pending').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted truncate max-w-[140px]">
                    {tx.client_email}
                  </td>
                  <td className="py-3 px-4 text-muted truncate max-w-[140px]">
                    {tx.freelancer_email}
                  </td>
                  <td className="py-3 px-4 text-muted">
                    {fmtBudget(tx.base_bid_amount || tx.amount)}
                  </td>
                  <td className="py-3 px-4 text-muted">
                    {fmtBudget(
                      (tx.client_service_fee || 0) + (tx.vat_amount || 0)
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted">
                    {fmtBudget(tx.gateway_fee || 0)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-ink">
                    {fmtBudget(tx.total_paid_by_client || tx.amount)}
                  </td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">
                    {fmtBudget(tx.freelancer_net_payout || 0)}
                  </td>
                  <td className="py-3 px-4 text-brand font-medium">
                    {fmtBudget(tx.platform_net_profit || 0)}
                  </td>
                  <td className="py-3 px-4 text-muted">
                    {tx.createdAt
                      ? new Date(tx.createdAt).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
