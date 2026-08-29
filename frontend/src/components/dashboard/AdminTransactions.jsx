'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { fmtBudget } from '@/lib/format';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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
              {transactions.map((tx) => (
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
        </div>
      )}
    </div>
  );
}
