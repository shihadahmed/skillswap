'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Chart as ChartJS, BarElement, LineElement, Tooltip, Legend } from 'chart.js';
import 'chart.js/auto';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useClientOverview, useRevalidate } from '@/lib/hooks';
import { approvalBlockMessage, isApprovedUser } from '@/lib/approval';
import { toast } from 'react-toastify';
import { fmtBudget, statusStyles, statusLabel } from '@/lib/format';
import Pagination from '@/components/Pagination';
import Modal from '@/components/dashboard/Modal';
import ProposalManager from '@/components/ProposalManager';
import TaskCheckout from '@/components/TaskCheckout';
import EmptyState from '@/components/EmptyState';
import { StatGridSkeleton, TableSkeleton } from '@/components/Skeletons';

const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Other'];

export default function ClientTasks() {
  const [page, setPage] = useState(1);
  // Parallel fetch: this client's tasks + the live marketplace size, in one
  // Promise.all so neither waits on the other.
  const { data, isLoading, isValidating, mutate } = useClientOverview(page);
  const revalidate = useRevalidate();
  const { user } = useAuth();
  const blocked = !!user && !isApprovedUser(user);

  const mine = data?.mine;
  const tasks = mine?.tasks || [];
  const summary = mine?.summary || { total: 0, open: 0, in_progress: 0, spent: 0 };
  const totalPages = mine?.totalPages || 1;
  const total = mine?.total || 0;
  const marketTotal = data?.market?.total || 0;

  const [expanded, setExpanded] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Other',
    budget: { amount: '', currency: 'USD', type: 'fixed' },
    priority: 'medium',
    urgency: 'flexible',
    experience_level: 'intermediate',
    project_type: 'one_time',
    estimated_duration: '',
    skills: '',
    deadline: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
  const URGENCIES = ['flexible', 'soon', 'asap'];
  const EXPERIENCE_LEVELS = ['entry', 'intermediate', 'expert'];
  const PROJECT_TYPES = ['one_time', 'ongoing', 'contract'];
  const BUDGET_TYPES = ['fixed', 'hourly'];
  const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };
  const urgencyLabels = { flexible: 'Flexible', soon: 'Needed Soon', asap: 'ASAP' };
  const experienceLabels = { entry: 'Entry Level', intermediate: 'Intermediate', expert: 'Expert' };
  const projectTypeLabels = { one_time: 'One-time Project', ongoing: 'Ongoing Work', contract: 'Contract Position' };
  const budgetTypeLabels = { fixed: 'Fixed Price', hourly: 'Hourly Rate' };

  const handleFormChange = (field, value) => {
    if (field.startsWith('budget.')) {
      const budgetField = field.replace('budget.', '');
      setForm((prev) => ({ ...prev, budget: { ...prev.budget, [budgetField]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const openEdit = (t) => {
    setEditTask(t);
    const budget = t.budget || { amount: t.budget, currency: 'USD', type: 'fixed' };
    const skills = Array.isArray(t.skills) ? t.skills.join(', ') : '';
    setForm({
      title: t.title,
      category: t.category,
      budget: {
        amount: budget.amount || budget,
        currency: budget.currency || 'USD',
        type: budget.type || 'fixed',
      },
      priority: t.priority || 'medium',
      urgency: t.urgency || 'flexible',
      experience_level: t.experience_level || 'intermediate',
      project_type: t.project_type || 'one_time',
      estimated_duration: t.estimated_duration || '',
      skills,
      deadline: t.deadline || '',
      description: t.description || '',
    });
    setError('');
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (blocked) {
      toast.error(approvalBlockMessage());
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const skillsArray = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
      const updated = await api.put(`/tasks/${editTask._id}`, {
        title: form.title,
        category: form.category,
        budget: {
          amount: Number(form.budget.amount),
          currency: form.budget.currency,
          type: form.budget.type,
        },
        priority: form.priority,
        urgency: form.urgency,
        experience_level: form.experience_level,
        project_type: form.project_type,
        estimated_duration: form.estimated_duration,
        skills: skillsArray,
        deadline: form.deadline,
        description: form.description,
      });
      toast.success('Task details updated successfully.');
      setEditTask(null);
      // Optimistic: patch the edited task straight into the cache.
      await mutate(
        (cur) =>
          cur && {
            ...cur,
            mine: {
              ...cur.mine,
              tasks: cur.mine.tasks.map((t) => (t._id === updated.task._id ? { ...t, ...updated.task } : t)),
            },
          },
        { revalidate: false }
      );
      // Persist from server (covers both the tasks/mine list and the overview).
      revalidate(
        (k) =>
          typeof k === 'string' &&
          (k.startsWith('/tasks/mine') || k.startsWith('/client/overview'))
      );
    } catch (err) {
      setError(err.message || 'Update failed.');
      toast.error(err.message || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (t) => {
    if (typeof window === 'undefined') return;
    if (blocked) {
      toast.error(approvalBlockMessage());
      return;
    }
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    // Optimistic: drop it from the cache immediately for instant feedback.
    await mutate(
      (cur) =>
        cur && {
          ...cur,
          mine: {
            ...cur.mine,
            tasks: cur.mine.tasks.filter((x) => x._id !== t._id),
            total: Math.max(0, (cur.mine.total || 0) - 1),
          },
        },
      { revalidate: false }
    );
    try {
      await api.del(`/tasks/${t._id}`);
      toast.success('Task deleted successfully.');
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      toast.error(msg.includes('proposal') || msg.includes('in progress')
        ? 'Cannot delete a task that has approved proposals or is in progress.'
        : err.message || 'Delete failed.');
    } finally {
      // Revalidate the whole overview (mine + marketplace) from the server.
      mutate();
    }
  };

  const statCards = [
    { label: 'Total Tasks', value: summary.total },
    { label: 'Open', value: summary.open },
    { label: 'In Progress', value: summary.in_progress },
    { label: 'Total Spent', value: fmtBudget(summary.spent) },
  ];

  const chartRef = useRef(null);
  const showSkeleton = isLoading && !data;

  return (
    <div>
      {showSkeleton ? (
        <StatGridSkeleton count={4} />
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-surface border border-line rounded-2xl p-4 shadow-soft">
              <div className="text-xs text-muted">{s.label}</div>
              <div className="text-2xl font-extrabold text-ink mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-bold text-ink mb-4">Budget Over Time</h2>
        <canvas id="clientBudgetChart" className="w-full h-64" />
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-ink">Posted Tasks</h2>
          <span className="text-xs text-muted">
            {marketTotal} task{marketTotal === 1 ? '' : 's'} available on the marketplace
          </span>
        </div>

        {showSkeleton ? (
          <TableSkeleton cols={2} rows={5} />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="You haven't posted any tasks yet"
            message="Create your first task and start receiving proposals from freelancers."
            action={
              <Link href="/tasks/create" className="inline-block mt-4 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
                + Post a Task
              </Link>
            }
          />
        ) : (
          <>
            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t._id} className="bg-surface border border-line rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <Link href={`/tasks/${t._id}`} className="min-w-0">
                      <p className="font-semibold text-ink truncate">{t.title}</p>
                      <p className="text-sm text-muted mt-0.5">
                        {fmtBudget(t.budget)}
                        {t.deadline ? ` · Due ${t.deadline}` : ''} ·{' '}
                        {t.proposals_count || 0} proposal{t.proposals_count === 1 ? '' : 's'}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[t.status] || statusStyles.open}`}>
                        {statusLabel[t.status] || t.status}
                      </span>
                      {t.status === 'open' && (
                        <>
                          <button onClick={() => openEdit(t)} disabled={blocked} title={blocked ? 'Account pending verification' : undefined} className="text-xs font-semibold text-brand hover:underline disabled:opacity-60 disabled:cursor-not-allowed">Edit</button>
                          <button onClick={() => remove(t)} disabled={blocked} title={blocked ? 'Account pending verification' : undefined} className="text-xs font-semibold text-danger hover:underline disabled:opacity-60 disabled:cursor-not-allowed">Delete</button>
                        </>
                      )}
                      <button
                        onClick={() => setExpanded((cur) => (cur === t._id ? null : t._id))}
                        className="text-xs font-semibold text-muted hover:text-ink"
                      >
                        {expanded === t._id ? 'Hide' : 'Manage'}
                      </button>
                    </div>
                  </div>

                  {expanded === t._id && (
                    <div className="mt-4 border-t border-line pt-4 space-y-6">
                      <ProposalManager taskId={t._id} ownerEmail={t.client_email} />
                      <TaskCheckout taskId={t._id} clientEmail={t.client_email} status={t.status} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit task">
        <form onSubmit={submitEdit} className="space-y-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Title <span className="text-danger">*</span></label>
            <input
              required
              value={form.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Budget Amount <span className="text-danger">*</span></label>
              <input
                required type="number" min="1" step="1"
                value={form.budget.amount}
                onChange={(e) => handleFormChange('budget.amount', e.target.value)}
                className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Currency</label>
              <select
                value={form.budget.currency}
                onChange={(e) => handleFormChange('budget.currency', e.target.value)}
                className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Budget Type</label>
              <select
                value={form.budget.type}
                onChange={(e) => handleFormChange('budget.type', e.target.value)}
                className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                {BUDGET_TYPES.map((b) => (
                  <option key={b} value={b}>{budgetTypeLabels[b]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => handleFormChange('priority', e.target.value)}
                className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{priorityLabels[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Urgency</label>
              <select
                value={form.urgency}
                onChange={(e) => handleFormChange('urgency', e.target.value)}
                className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                {URGENCIES.map((u) => (
                  <option key={u} value={u}>{urgencyLabels[u]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Experience Level</label>
              <select
                value={form.experience_level}
                onChange={(e) => handleFormChange('experience_level', e.target.value)}
                className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                {EXPERIENCE_LEVELS.map((e) => (
                  <option key={e} value={e}>{experienceLabels[e]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Project Type</label>
              <select
                value={form.project_type}
                onChange={(e) => handleFormChange('project_type', e.target.value)}
                className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                {PROJECT_TYPES.map((p) => (
                  <option key={p} value={p}>{projectTypeLabels[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Estimated Duration</label>
              <input
                value={form.estimated_duration}
                onChange={(e) => handleFormChange('estimated_duration', e.target.value)}
                placeholder="e.g. 2 weeks, 1 month"
                className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink mb-1">Skills Required (comma separated)</label>
              <input
                value={form.skills}
                onChange={(e) => handleFormChange('skills', e.target.value)}
                placeholder="e.g. React, Node.js, TypeScript"
                className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink mb-1">Deadline <span className="text-danger">*</span></label>
              <input
                required type="date"
                value={form.deadline}
                onChange={(e) => handleFormChange('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink mb-1">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 w-full sm:w-auto">
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </Modal>
    </div>
  );

  useEffect(() => {
    const ctx = document.getElementById('clientBudgetChart')?.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const budgetData = months.map((month, index) => {
      const date = new Date(2024, index);
      const monthTasks = data?.mine?.tasks?.filter((t) => {
        const tDate = new Date(t.createdAt);
        return tDate.getMonth() === date.getMonth();
      }) || [];
      return monthTasks.reduce((sum, t) => {
        const budget = t.budget;
        if (typeof budget === 'object' && budget.amount) return sum + Number(budget.amount);
        if (typeof budget === 'number') return sum + budget;
        return sum;
      }, 0);
    });

    chartRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Budget',
          data: budgetData,
          backgroundColor: 'rgba(79, 70, 229, 0.5)',
          borderColor: '#4F46E5',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 100 },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

}
