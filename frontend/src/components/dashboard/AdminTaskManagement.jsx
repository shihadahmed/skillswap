'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { fmtBudget, statusStyles, statusLabel } from '@/lib/format';
import Pagination from '@/components/Pagination';
import Modal from '@/components/dashboard/Modal';

const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Other'];
const STATUSES = ['open', 'in_progress', 'completed'];

export default function AdminTaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Other',
    budget: '',
    deadline: '',
    description: '',
    client_email: '',
    status: 'open',
  });
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/tasks');
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

  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedTasks = tasks.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openCreate = () => {
    setForm({
      title: '',
      category: 'Other',
      budget: '',
      deadline: '',
      description: '',
      client_email: '',
      status: 'open',
    });
    setError('');
    setShowCreate(true);
  };
  const openEdit = (t) => {
    setEditTask(t);
    setForm({
      title: t.title,
      category: t.category,
      budget: t.budget,
      deadline: t.deadline || '',
      description: t.description || '',
      client_email: t.client_email || '',
      status: t.status,
    });
    setError('');
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setBusyId('create');
    setError('');
    try {
      await api.post('/tasks', {
        title: form.title,
        category: form.category,
        description: form.description,
        budget: Number(form.budget),
        deadline: form.deadline,
        client_email: form.client_email,
      });
      toast.success('Task created.');
      setShowCreate(false);
      await load();
    } catch (err) {
      setError(err.message || 'Create failed.');
      toast.error(err.message || 'Create failed.');
    } finally {
      setBusyId(null);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setBusyId(editTask._id);
    setError('');
    try {
      await api.put(`/admin/tasks/${editTask._id}`, {
        title: form.title,
        category: form.category,
        description: form.description,
        budget: Number(form.budget),
        deadline: form.deadline,
        status: form.status,
      });
      toast.success('Task updated.');
      setEditTask(null);
      await load();
    } catch (err) {
      setError(err.message || 'Update failed.');
      toast.error(err.message || 'Update failed.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (t) => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    setBusyId(t._id);
    try {
      await api.del(`/admin/tasks/${t._id}`);
      toast.success('Task deleted.');
      await load();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink">Tasks</h2>
        <button
          onClick={openCreate}
          className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          + Create Task
        </button>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : (
        <div className="overflow-x-auto bg-surface border border-line rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-line">
                <th className="py-3 px-4 font-medium">Title</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Budget</th>
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
               {pagedTasks.map((t) => (
                <tr key={t._id} className="border-b border-line last:border-0">
                  <td className="py-3 px-4 font-medium text-ink max-w-[220px] truncate">
                    {t.title}
                  </td>
                  <td className="py-3 px-4 text-muted">{t.category}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        statusStyles[t.status] || statusStyles.open
                      }`}
                    >
                      {statusLabel[t.status] || t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted">{fmtBudget(t.budget)}</td>
                  <td className="py-3 px-4 text-muted truncate max-w-[160px]">
                    {t.client_email}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEdit(t)}
                      className="text-brand hover:underline text-xs font-semibold mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(t)}
                      disabled={busyId === t._id}
                      className="text-danger hover:underline text-xs font-semibold disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
              </table>
            <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create task">
        <TaskForm
          form={form}
          setForm={setForm}
          error={error}
          busy={busyId === 'create'}
          submit={submitCreate}
          withClient
        />
      </Modal>
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit task">
        <TaskForm
          form={form}
          setForm={setForm}
          error={error}
          busy={busyId === editTask?._id}
          submit={submitEdit}
          withClient={false}
        />
      </Modal>
    </div>
  );
}

function TaskForm({ form, setForm, error, busy, submit, withClient }) {
  return (
    <form onSubmit={submit} className="space-y-3">
      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div>
        <label className="block text-xs font-medium text-muted mb-1">Title</label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            Budget (USD)
          </label>
          <input
            required
            type="number"
            min="1"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1">Deadline</label>
        <input
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>
      {withClient && (
        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            Client email (post on behalf of)
          </label>
          <input
            required
            type="email"
            value={form.client_email}
            onChange={(e) => setForm({ ...form, client_email: e.target.value })}
            className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-muted mb-1">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1">
          Description
        </label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
      >
        {busy ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
