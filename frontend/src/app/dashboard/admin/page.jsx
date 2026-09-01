'use client';

import { useMemo, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAdminOverview } from '@/lib/hooks';
import { fmtBudget } from '@/lib/format';
import { StatGridSkeleton } from '@/components/Skeletons';

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminOverview();
  const stats = data?.stats;

  const barChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const pieChartRef = useRef(null);

  const barInstance = useRef(null);
  const doughnutInstance = useRef(null);
  const pieInstance = useRef(null);

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Total Users', value: stats.users || 0, change: '+12% from last mo' },
      { label: 'Total Tasks', value: stats.tasks || 0, change: 'Lifetime posted' },
      { label: 'Active Tasks', value: stats.activeTasks || 0, change: 'Currently ongoing' },
      { label: 'Platform Volume', value: fmtBudget(stats.revenue || 0), change: 'Total transacted' },
      { label: 'Net Profit', value: fmtBudget(stats.platformNetProfit || 0), change: 'Platform margin' },
      { label: 'Freelancer Payouts', value: fmtBudget(stats.freelancerPayouts || 0), change: 'Paid out' },
    ];
  }, [stats]);

  const recentPayments = useMemo(() => {
    if (!stats?.transactions) return [];
    return [...stats.transactions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [stats]);

  useEffect(() => {
    if (!stats) return;

    // 1. Bar Chart: Revenue & Margins
    if (barChartRef.current) {
      if (barInstance.current) barInstance.current.destroy();

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = 2026;

      const monthlyRevenue = months.map((_, index) => {
        const monthTxs = stats?.transactions?.filter((tx) => {
          const d = new Date(tx.createdAt || tx.date);
          return d.getMonth() === index && d.getFullYear() === currentYear;
        }) || [];
        return monthTxs.reduce((sum, tx) => sum + (tx.total_paid_by_client || tx.amount || 0), 0);
      });

      const monthlyProfit = monthlyRevenue.map((rev) => rev * 0.1);

      barInstance.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Platform Volume ($)',
              data: monthlyRevenue,
              backgroundColor: 'rgba(99, 102, 241, 0.7)',
              borderRadius: 6,
            },
            {
              label: 'Net Platform Fee ($)',
              data: monthlyProfit,
              backgroundColor: 'rgba(16, 185, 129, 0.8)',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
          },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, grid: { color: '#F1F5F9' } },
          },
        },
      });
    }

    // 2. Doughnut Chart: User Distribution
    if (doughnutChartRef.current) {
      if (doughnutInstance.current) doughnutInstance.current.destroy();

      const clientsCount = stats?.clientsCount || Math.floor((stats?.users || 0) * 0.45);
      const freelancersCount = stats?.freelancersCount || Math.floor((stats?.users || 0) * 0.53);
      const adminsCount = (stats?.users || 0) - (clientsCount + freelancersCount);

      doughnutInstance.current = new Chart(doughnutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Clients', 'Freelancers', 'Admins'],
          datasets: [
            {
              data: [clientsCount, freelancersCount, Math.max(adminsCount, 1)],
              backgroundColor: ['#6366F1', '#3B82F6', '#F59E0B'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } },
          cutout: '70%',
        },
      });
    }

    // 3. Pie Chart: Task Status
    if (pieChartRef.current) {
      if (pieInstance.current) pieInstance.current.destroy();

      const active = stats?.activeTasks || 0;
      const completed = stats?.completedTasks || Math.max((stats?.tasks || 0) - active, 0);

      pieInstance.current = new Chart(pieChartRef.current, {
        type: 'pie',
        data: {
          labels: ['Completed', 'In Progress / Open'],
          datasets: [
            {
              data: [completed, active],
              backgroundColor: ['#10B981', '#F59E0B'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } },
        },
      });
    }

    return () => {
      if (barInstance.current) barInstance.current.destroy();
      if (doughnutInstance.current) doughnutInstance.current.destroy();
      if (pieInstance.current) pieInstance.current.destroy();
    };
  }, [stats]);

  return (
    <ProtectedRoute roles={['admin']}>
      <DashboardSidebar>
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Platform Analytics</h1>
              <p className="text-muted mt-1 text-sm">
                Live financial tracking, user growth metrics, and platform operations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Network Data
              </span>
            </div>
          </header>

          {isLoading && !data ? (
            <StatGridSkeleton count={6} />
          ) : (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {statCards.map((s) => (
                <div key={s.label} className="bg-surface border border-line rounded-2xl p-5 shadow-soft hover:border-slate-300 transition-colors">
                  <div className="text-xs font-medium text-muted truncate">{s.label}</div>
                  <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">{s.value}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{s.change}</div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface border border-line rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Revenue & Margin Growth</h2>
                  <p className="text-xs text-muted">Monthly gross volume compared against platform fees</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <canvas ref={barChartRef} />
              </div>
            </div>

            <div className="bg-surface border border-line rounded-2xl p-6 shadow-soft flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">User Distribution</h2>
                <p className="text-xs text-muted mb-4">Ratio of platform participants</p>
              </div>
              <div className="h-56 relative flex items-center justify-center">
                <canvas ref={doughnutChartRef} />
              </div>
              <div className="pt-4 mt-2 border-t border-line text-center text-xs text-muted">
                Total registered accounts: <strong className="text-slate-800">{stats?.users || 0}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-surface border border-line rounded-2xl p-6 shadow-soft">
              <h2 className="text-lg font-bold text-slate-900">Task Completion Rate</h2>
              <p className="text-xs text-muted mb-6">Completed vs active contracts</p>
              <div className="h-52 relative flex items-center justify-center">
                <canvas ref={pieChartRef} />
              </div>
            </div>

            <div className="lg:col-span-2 bg-surface border border-line rounded-2xl p-6 shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
                  <span className="text-xs text-brand font-semibold">Live Audit</span>
                </div>
                {recentPayments.length > 0 ? (
                  <div className="divide-y divide-line">
                    {recentPayments.map((tx) => (
                      <div key={tx._id} className="py-3 flex items-center justify-between text-sm">
                        <div className="min-w-0 pr-4">
                          <p className="font-semibold text-slate-800 truncate">{tx.client_email || 'Verified Client'}</p>
                          <p className="text-xs text-muted">{new Date(tx.createdAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-600">+{fmtBudget(tx.total_paid_by_client || tx.amount || 0)}</span>
                          <span className="block text-[10px] text-muted uppercase tracking-wider">Completed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-44 flex items-center justify-center text-muted text-sm">No transaction records found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardSidebar>
    </ProtectedRoute>
  );
}