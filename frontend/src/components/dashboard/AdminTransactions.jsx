'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { fmtBudget } from '@/lib/format';
import Pagination from '@/components/Pagination';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    api
      .get('/admin/transactions')
      .then((d) => {
        if (active) setTransactions(d.transactions || []);
      })
      .catch(() => {
        if (active) setTransactions([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedTransactions = transactions.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <div>
      <h2 className="text-lg font-bold text-ink mb-4">Transactions</h2>
      {loading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : transactions.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-10 text-center">
          <p className="text-muted">No transactions yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-surface border border-line rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-line">
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium">Freelancer</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
               {pagedTransactions.map((tx) => (
                <tr key={tx._id} className="border-b border-line last:border-0">
                  <td className="py-3 px-4 text-muted truncate max-w-[160px]">
                    {tx.client_email}
                  </td>
                  <td className="py-3 px-4 text-muted truncate max-w-[160px]">
                    {tx.freelancer_email}
                  </td>
                  <td className="py-3 px-4 text-muted">{fmtBudget(tx.amount)}</td>
                  <td className="py-3 px-4 capitalize text-muted">
                    {tx.payment_status}
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
            <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
    </div>
  );
}
