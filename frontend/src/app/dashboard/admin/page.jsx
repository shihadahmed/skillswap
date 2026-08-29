'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import { api } from '@/lib/api';
import { fmtBudget } from '@/lib/format';
import AdminUserManagement from '@/components/dashboard/AdminUserManagement';
import AdminTaskManagement from '@/components/dashboard/AdminTaskManagement';
import AdminTransactions from '@/components/dashboard/AdminTransactions';
import AdminReviews from '@/components/dashboard/AdminReviews';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users');

  useEffect(() => {
    let active = true;
    api
      .get('/admin/stats')
      .then((s) => {
        if (active) setStats(s);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.users },
        { label: 'Total Tasks', value: stats.tasks },
        { label: 'Active Tasks', value: stats.activeTasks },
        { label: 'Platform Revenue', value: fmtBudget(stats.revenue) },
      ]
    : [];

  const tabs = [
    { key: 'users', label: 'Users', Comp: AdminUserManagement },
    { key: 'tasks', label: 'Tasks', Comp: AdminTaskManagement },
    { key: 'transactions', label: 'Transactions', Comp: AdminTransactions },
    { key: 'reviews', label: 'Reviews', Comp: AdminReviews },
  ];
  const Active = tabs.find((t) => t.key === tab)?.Comp;

  return (
    <ProtectedRoute roles={['admin']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          <header>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Admin Dashboard
            </h1>
            <p className="text-muted mt-1">
              Platform overview, moderation, and complete management.
            </p>
          </header>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mt-8">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="bg-surface border border-line rounded-2xl p-4 shadow-soft"
              >
                <div className="text-xs text-muted">{s.label}</div>
                <div className="text-2xl font-extrabold text-ink mt-1">
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <div className="flex gap-2 border-b border-line pb-3 flex-wrap">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    tab === t.key
                      ? 'bg-brand text-white'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="mt-6">{Active && <Active />}</div>
          </div>
        </div>
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
