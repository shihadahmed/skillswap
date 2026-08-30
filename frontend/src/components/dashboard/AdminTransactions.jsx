'use client';

import { useState } from 'react';
import { useAdminTransactions } from '@/lib/hooks';
import { fmtBudget } from '@/lib/format';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { TableSkeleton } from '@/components/Skeletons';

export default function AdminTransactions() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminTransactions(page);

  const transactions = data?.transactions || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;
  const showSkeleton = isLoading && !data;

  return (
    <div>
      <h2 className="text-lg font-bold text-ink mb-4">Transactions ({total})</h2>
      {showSkeleton ? (
        <TableSkeleton cols={9} rows={6} />
      ) : transactions.length === 0 ? (
        <EmptyState title="No transactions yet" message="Payments made through the platform will appear here." />
      ) : (
        <div className="overflow-x-auto bg-surface border border-line rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-line">
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
              {transactions.map((tx) => (
                <tr key={tx._id} className="border-b border-line last:border-0">
                  <td className="py-3 px-4 text-muted truncate max-w-[140px]">{tx.client_email}</td>
                  <td className="py-3 px-4 text-muted truncate max-w-[140px]">{tx.freelancer_email}</td>
                  <td className="py-3 px-4 text-muted">{fmtBudget(tx.base_bid_amount || tx.amount)}</td>
                  <td className="py-3 px-4 text-muted">
                    {fmtBudget((tx.client_service_fee || 0) + (tx.vat_amount || 0))}
                  </td>
                  <td className="py-3 px-4 text-muted">{fmtBudget(tx.gateway_fee || 0)}</td>
                  <td className="py-3 px-4 font-semibold text-ink">{fmtBudget(tx.total_paid_by_client || tx.amount)}</td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">{fmtBudget(tx.freelancer_net_payout || 0)}</td>
                  <td className="py-3 px-4 text-brand font-medium">{fmtBudget(tx.platform_net_profit || 0)}</td>
                  <td className="py-3 px-4 text-muted">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '—'}
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
