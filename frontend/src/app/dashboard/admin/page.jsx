'use client';

import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, LinearScale, CategoryScale, BarElement, Tooltip, Legend } from 'chart.js';
import 'chart.js/auto';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAdminOverview } from '@/lib/hooks';
import { fmtBudget } from '@/lib/format';
import AdminUserManagement from '@/components/dashboard/AdminUserManagement';
import AdminTaskManagement from '@/components/dashboard/AdminTaskManagement';
import AdminTransactions from '@/components/dashboard/AdminTransactions';
import AdminReviews from '@/components/dashboard/AdminReviews';
import { StatGridSkeleton } from '@/components/Skeletons';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('users');
  const { data, isLoading } = useAdminOverview();

  const stats = data?.stats;
  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.users },
        { label: 'Total Tasks', value: stats.tasks },
        { label: 'Active Tasks', value: stats.activeTasks },
        { label: 'Platform Revenue', value: fmtBudget(stats.revenue) },
        { label: 'Platform Net Profit', value: fmtBudget(stats.platformNetProfit) },
        { label: 'Freelancer Payouts', value: fmtBudget(stats.freelancerPayouts) },
      ]
    : [];

  const tabs = [
    { key: 'users', label: 'Users', Comp: AdminUserManagement },
    { key: 'tasks', label: 'Tasks', Comp: AdminTaskManagement },
    { key: 'transactions', label: 'Transactions', Comp: AdminTransactions },
    { key: 'reviews', label: 'Reviews', Comp: AdminReviews },
  ];
  const Active = tabs.find((t) => t.key === tab)?.Comp;

  const chartRef = useRef(null);

  const recentPayments = stats
    ? [...stats.transactions]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    : [];

  useEffect(() => {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Calculate monthly revenue from transactions
    const monthlyRevenue = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
      const date = new Date(2024, index);
      const monthTransactions = stats?.transactions?.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate.getMonth() === date.getMonth();
      }) || [];
      return monthTransactions.reduce((sum, tx) => sum + (tx.total_paid_by_client || tx.amount || 0), 0);
    });

    chartRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Revenue',
            data: monthlyRevenue,
            backgroundColor: 'rgba(79, 70, 229, 0.5)',
            borderColor: '#4F46E5',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 500 },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [stats]);

  return (
    <ProtectedRoute roles={['admin']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          <header>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">Admin Dashboard</h1>
            <p className="text-muted mt-1">Platform overview, moderation, and complete management.</p>
          </header>

          {isLoading && !data ? (
            <StatGridSkeleton count={6} />
          ) : (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-6 mt-8">
              {statCards.map((s) => (
                <div key={s.label} className="bg-surface border border-line rounded-2xl p-4 shadow-soft">
                  <div className="text-xs text-muted">{s.label}</div>
                  <div className="text-2xl font-extrabold text-ink mt-1">{s.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="lg:col-span-6 mt-6">
            <div className="bg-surface border border-line rounded-2xl p-6 shadow-soft">
              <h2 className="text-xl font-bold text-ink mb-4">Revenue Chart</h2>
              <canvas id="revenueChart" className="w-full h-64" />
            </div>
          </div>

          <div className="lg:col-span-6 mt-6">
            <div className="bg-surface border border-line rounded-2xl p-6 shadow-soft">
              <h2 className="text-xl font-bold text-ink mb-4">Recent Payments</h2>
              {recentPayments.length > 0 ? (
                <div className="space-y-3 text-sm">
                  {recentPayments.map((tx) => (
                    <div key={tx._id} className="p-3 bg-surface rounded border border-line">
                      <div className="text-muted mb-1">Client: {tx.client_email}</div>
                      <div className="text-ink font-medium">Total: {fmtBudget(tx.total_paid_by_client || tx.amount)}</div>
                      <div className="text-muted">Date: {new Date(tx.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No payments yet</p>
              )}
            </div>
          </div>

          <div className="mt-10">
            <div className="flex gap-2 border-b border-line pb-3 flex-wrap">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    tab === t.key ? 'bg-brand text-white' : 'text-muted hover:text-ink'
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
