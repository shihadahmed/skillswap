'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Other'];

const statusStyles = {
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
};
const statusLabel = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
};

function fmtBudget(b) {
  if (b == null) return '—';
  const amt = typeof b === 'object' ? b.amount : b;
  if (amt == null) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amt);
  } catch {
    return '$' + amt;
  }
}

function ClientDashboard() {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Other',
    description: '',
    budget: '',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/tasks/mine');
      setTasks(data.tasks || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const post = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/tasks', {
        title: form.title,
        category: form.category,
        description: form.description,
        budget: Number(form.budget),
        deadline: form.deadline,
      });
      setForm({
        title: '',
        category: 'Other',
        description: '',
        budget: '',
        deadline: '',
      });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to post task.');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === 'open').length,
    progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    proposals: tasks.reduce((s, t) => s + (t.proposals_count || 0), 0),
  };

  const statCards = [
    { label: 'Tasks Posted', value: stats.total },
    { label: 'Open', value: stats.open },
    { label: 'In Progress', value: stats.progress },
    { label: 'Completed', value: stats.completed },
    { label: 'Proposals', value: stats.proposals },
  ];

  return (
    <main className="flex-1 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Client Dashboard
            </h1>
            <p className="text-muted mt-1">
              Manage your tasks and review incoming proposals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm((s) => !s)}
              className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-glow transition-colors"
            >
              {showForm ? 'Close' : '+ Post a Task'}
            </button>
            <button
              onClick={logout}
              className="text-sm text-muted hover:text-ink font-medium"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mt-8">
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

        {showForm && (
          <form
            onSubmit={post}
            className="bg-surface border border-line rounded-2xl p-6 shadow-soft mt-6 space-y-4"
          >
            <h2 className="font-semibold text-ink">Post a new task</h2>

            {error && (
              <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1">
                  Title
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Build a React Native onboarding flow"
                  className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Budget (USD)
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="e.g. 250"
                  className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the task, deliverables and requirements…"
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {submitting ? 'Posting…' : 'Post Task'}
            </button>
          </form>
        )}

        <div className="mt-10">
          <h2 className="text-lg font-bold text-ink mb-4">My Tasks</h2>

          {loading ? (
            <p className="text-muted text-sm">Loading your tasks…</p>
          ) : tasks.length === 0 ? (
            <div className="bg-surface border border-line rounded-2xl p-10 text-center">
              <p className="text-muted">
                You haven&apos;t posted any tasks yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <Link
                  key={t._id}
                  href={`/tasks/${t._id}`}
                  className="flex items-center justify-between gap-4 bg-surface border border-line rounded-2xl p-4 hover:border-brand/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate">{t.title}</p>
                    <p className="text-sm text-muted mt-0.5">
                      {fmtBudget(t.budget)}
                      {t.deadline ? ` · Due ${t.deadline}` : ''} ·{' '}
                      {t.proposals_count || 0} proposal
                      {t.proposals_count === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      statusStyles[t.status] || statusStyles.open
                    }`}
                  >
                    {statusLabel[t.status] || t.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function FreelancerDashboard() {
  const { logout } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get('/proposals/mine')
      .then((d) => {
        if (active) setProposals(d.proposals || []);
      })
      .catch(() => {
        if (active) setProposals([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = {
    sent: proposals.length,
    pending: proposals.filter((p) => p.status === 'pending').length,
    accepted: proposals.filter((p) => p.status === 'accepted').length,
    earnings: proposals
      .filter((p) => p.status === 'accepted')
      .reduce((s, p) => s + (p.proposed_budget || 0), 0),
  };

  const statCards = [
    { label: 'Proposals Sent', value: stats.sent },
    { label: 'Pending', value: stats.pending },
    { label: 'Accepted', value: stats.accepted },
    { label: 'Earnings (est.)', value: fmtBudget(stats.earnings) },
  ];

  return (
    <main className="flex-1 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Freelancer Dashboard
            </h1>
            <p className="text-muted mt-1">
              Track your proposals and find new tasks to apply for.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tasks"
              className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-glow transition-colors"
            >
              Browse Tasks
            </Link>
            <button
              onClick={logout}
              className="text-sm text-muted hover:text-ink font-medium"
            >
              Log out
            </button>
          </div>
        </div>

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
          <h2 className="text-lg font-bold text-ink mb-4">My Proposals</h2>

          {loading ? (
            <p className="text-muted text-sm">Loading your proposals…</p>
          ) : proposals.length === 0 ? (
            <div className="bg-surface border border-line rounded-2xl p-10 text-center">
              <p className="text-muted">
                You haven&apos;t submitted any proposals yet.
              </p>
              <Link
                href="/tasks"
                className="inline-block mt-4 text-brand font-semibold text-sm"
              >
                Browse tasks →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.map((p) => (
                <Link
                  key={p._id}
                  href={`/tasks/${p.task_id}`}
                  className="block bg-surface border border-line rounded-2xl p-4 hover:border-brand/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink truncate">
                        {p.task?.title || 'Task'}
                      </p>
                      <p className="text-sm text-muted mt-0.5">
                        {fmtBudget(p.proposed_budget)} · {p.estimated_days} day
                        {p.estimated_days === 1 ? '' : 's'}
                        {p.task?.status ? ` · Task: ${p.task.status}` : ''}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        statusStyles[p.status] || statusStyles.pending
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  {p.cover_note && (
                    <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-2">
                      {p.cover_note}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function PlaceholderDashboard({ role, logout }) {
  const TITLES = {
    freelancer: 'Freelancer Dashboard',
    admin: 'Admin Dashboard',
  };
  return (
    <main className="flex-1 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          {TITLES[role] || 'Dashboard'}
        </h1>
        <p className="text-muted mt-1">Welcome back.</p>
        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          {['Overview', 'Activity', 'Settings'].map((card) => (
            <div
              key={card}
              className="bg-surface border border-line rounded-2xl p-5 shadow-soft"
            >
              <div className="text-sm text-muted">{card}</div>
              <div className="text-3xl font-extrabold mt-2">—</div>
            </div>
          ))}
        </div>
        <button
          onClick={logout}
          className="mt-6 text-sm text-muted hover:text-ink font-medium"
        >
          Log out
        </button>
      </div>
    </main>
  );
}

function DashboardShell({ role }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-bg">
      <aside className="w-64 shrink-0 border-r border-line bg-surface p-5 hidden md:block">
        <Logo className="mb-8" />
        <div className="flex items-center gap-3 mb-6">
          <img
            src={
              user?.image ||
              'https://placehold.co/80x80?text=' +
                encodeURIComponent((user?.name || 'U')[0])
            }
            alt=""
            className="w-10 h-10 rounded-full object-cover border border-line"
          />
          <div className="min-w-0">
            <div className="font-semibold truncate">{user?.name}</div>
            <div className="text-xs capitalize text-muted">{user?.role}</div>
          </div>
        </div>

        <nav className="space-y-1">
          <div className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium bg-brand/10 text-brand">
            Overview
          </div>
          {role === 'client' && (
            <div className="rounded-xl px-3 py-2 text-sm font-medium text-muted">
              My Tasks
            </div>
          )}
          {role === 'freelancer' && (
            <div className="rounded-xl px-3 py-2 text-sm font-medium text-muted">
              My Proposals
            </div>
          )}
        </nav>
      </aside>

      {role === 'client' ? (
        <ClientDashboard />
      ) : role === 'freelancer' ? (
        <FreelancerDashboard />
      ) : (
        <PlaceholderDashboard role={role} logout={logout} />
      )}
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
