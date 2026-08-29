'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { fmtBudget, statusStyles, statusLabel } from '@/lib/format';
import Pagination from '@/components/Pagination';
import Modal from '@/components/dashboard/Modal';
import ProposalManager from '@/components/ProposalManager';
import TaskCheckout from '@/components/TaskCheckout';

const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Other'];

export default function ClientTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Other',
    budget: '',
    deadline: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

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

  const stats = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === 'open').length,
    progress: tasks.filter((t) => t.status === 'in_progress').length,
    spent: tasks
      .filter((t) => t.status === 'completed')
      .reduce((s, t) => s + (Number(t.budget) || 0), 0),
  };
  const statCards = [
    { label: 'Total Tasks', value: stats.total },
    { label: 'Open', value: stats.open },
    { label: 'In Progress', value: stats.progress },
    { label: 'Total Spent', value: fmtBudget(stats.spent) },
  ];

  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = tasks.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openEdit = (t) => {
    setEditTask(t);
    setForm({
      title: t.title,
      category: t.category,
      budget: t.budget,
      deadline: t.deadline || '',
      description: t.description || '',
    });
    setError('');
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/tasks/${editTask._id}`, {
        title: form.title,
        category: form.category,
        budget: Number(form.budget),
        deadline: form.deadline,
        description: form.description,
      });
      toast.success('Task details updated successfully.');
      setEditTask(null);
      await load();
    } catch (err) {
      setError(err.message || 'Update failed.');
      toast.error(err.message || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (t) => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await api.del(`/tasks/${t._id}`);
      toast.success('Task deleted successfully.');
      await load();
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('proposal') || msg.includes('in progress')) {
        toast.error('Cannot delete a task that has approved proposals or is in progress.');
      } else {
        toast.error(err.message || 'Delete failed.');
      }
    }
  };

  return (
    <div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-surface border border-line rounded-2xl p-4 shadow-soft"
          >
            <div className="text-xs text-muted">{s.label}</div>
            <div className="text-2xl font-extrabold text-ink mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold text-ink mb-4">Posted Tasks</h2>

        {loading ? (
          <p className="text-muted text-sm">Loading your tasks…</p>
        ) : tasks.length === 0 ? (
          <div className="bg-surface border border-line rounded-2xl p-10 text-center">
            <p className="text-muted">You haven&apos;t posted any tasks yet.</p>
            <Link
              href="/tasks/create"
              className="inline-block mt-4 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
            >
              + Post a Task
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {paged.map((t) => (
              <div
                key={t._id}
                className="bg-surface border border-line rounded-2xl p-4"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <Link href={`/tasks/${t._id}`} className="min-w-0">
                    <p className="font-semibold text-ink truncate">{t.title}</p>
                    <p className="text-sm text-muted mt-0.5">
                      {fmtBudget(t.budget)}
                      {t.deadline ? ` · Due ${t.deadline}` : ''} ·{' '}
                      {t.proposals_count || 0} proposal
                      {t.proposals_count === 1 ? '' : 's'}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        statusStyles[t.status] || statusStyles.open
                      }`}
                    >
                      {statusLabel[t.status] || t.status}
                    </span>
                    {t.status === 'open' && (
                      <>
                        <button
                          onClick={() => openEdit(t)}
                          className="text-xs font-semibold text-brand hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(t)}
                          className="text-xs font-semibold text-danger hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    <button
                      onClick={() =>
                        setExpanded((cur) => (cur === t._id ? null : t._id))
                      }
                      className="text-xs font-semibold text-muted hover:text-ink"
                    >
                      {expanded === t._id ? 'Hide' : 'Manage'}
                    </button>
                  </div>
                </div>

                {expanded === t._id && (
                  <div className="mt-4 border-t border-line pt-4 space-y-6">
                    <ProposalManager taskId={t._id} ownerEmail={t.client_email} />
                    <TaskCheckout
                      taskId={t._id}
                      clientEmail={t.client_email}
                      status={t.status}
                    />
                  </div>
                )}
              </div>
            ))}
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit task">
        <form onSubmit={submitEdit} className="space-y-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
                className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
          </div>
          <div>
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
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
