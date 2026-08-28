'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute, { dashboardPath } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

const NAV = {
  client: [
    { label: 'Overview', active: true },
    { label: 'My Tasks', soon: true },
    { label: 'Post a Task', soon: true },
    { label: 'Messages', soon: true },
  ],
  freelancer: [
    { label: 'Overview', active: true },
    { label: 'Browse Tasks', soon: true },
    { label: 'My Proposals', soon: true },
    { label: 'Earnings', soon: true },
  ],
  admin: [
    { label: 'Overview', active: true },
    { label: 'Users', soon: true },
    { label: 'Tasks', soon: true },
    { label: 'Transactions', soon: true },
  ],
};

const TITLES = {
  client: 'Client Dashboard',
  freelancer: 'Freelancer Dashboard',
  admin: 'Admin Dashboard',
};

function DashboardShell({ role }) {
  const { user, logout } = useAuth();
  const items = NAV[role] || NAV.client;

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-line bg-surface p-5 hidden md:block">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-accent text-white font-bold">
            S
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Skill<span className="text-brand">Swap</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <img
            src={user?.image || 'https://placehold.co/80x80?text=' + encodeURIComponent((user?.name || 'U')[0])}
            alt=""
            className="w-10 h-10 rounded-full object-cover border border-line"
          />
          <div className="min-w-0">
            <div className="font-semibold truncate">{user?.name}</div>
            <div className="text-xs capitalize text-muted">{user?.role}</div>
          </div>
        </div>

        <nav className="space-y-1">
          {items.map((it) => (
            <div
              key={it.label}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium ${
                it.active ? 'bg-brand/10 text-brand' : 'text-muted'
              }`}
            >
              {it.label}
              {it.soon && (
                <span className="text-[10px] uppercase tracking-wide bg-slate-100 text-muted px-2 py-0.5 rounded-full">
                  soon
                </span>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-extrabold tracking-tight">{TITLES[role]}</h1>
          <p className="text-muted mt-1">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}.
          </p>

          <div className="grid gap-4 sm:grid-cols-3 mt-8">
            {['Account', 'Activity', 'Settings'].map((card) => (
              <div key={card} className="bg-surface border border-line rounded-2xl p-5 shadow-soft">
                <div className="text-sm text-muted">{card}</div>
                <div className="text-3xl font-extrabold mt-2">—</div>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-line rounded-2xl p-6 shadow-soft mt-6">
            <h2 className="font-semibold">Getting started</h2>
            <p className="text-muted text-sm mt-2">
              Your role-based dashboard is wired up and protected. The detailed
              panels for your account will appear here in the next build phase.
            </p>
          </div>

          <button
            onClick={logout}
            className="mt-6 text-sm text-muted hover:text-ink font-medium"
          >
            Log out
          </button>
        </div>
      </main>
    </div>
  );
}

export default function RoleDashboardPage() {
  const params = useParams();
  const role = params?.role;
  const allowed = ['client', 'freelancer', 'admin'];

  if (!allowed.includes(role)) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted">
        Unknown dashboard.
      </div>
    );
  }

  return (
    <ProtectedRoute roles={[role]}>
      <DashboardShell role={role} />
    </ProtectedRoute>
  );
}
