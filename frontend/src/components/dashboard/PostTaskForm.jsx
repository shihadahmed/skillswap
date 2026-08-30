'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRevalidate } from '@/lib/hooks';
import { toast } from 'react-toastify';

const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Other'];

export default function PostTaskForm({ onCreated }) {
  const revalidate = useRevalidate();
  const [form, setForm] = useState({
    title: '',
    category: 'Other',
    description: '',
    budget: '',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const post = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    if (!form.title.trim() || !form.budget || !form.deadline) {
      toast.error('Please fill in all required fields properly.');
      setSubmitting(false);
      return;
    }
    try {
      await api.post('/tasks', {
        title: form.title,
        category: form.category,
        description: form.description,
        budget: Number(form.budget),
        deadline: form.deadline,
      });
      toast.success('Task published successfully!');
      setForm({
        title: '',
        category: 'Other',
        description: '',
        budget: '',
        deadline: '',
      });
      // Instantly refresh the client's task list and the public marketplace.
      revalidate(
        (k) =>
          typeof k === 'string' &&
          (k.startsWith('/tasks/mine') || k === '/tasks' || k.startsWith('/tasks?'))
      );
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message || 'Failed to post task.');
      toast.error(err.message || 'Failed to post task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={post}
      className="bg-surface border border-line rounded-2xl p-6 shadow-soft space-y-4"
    >
      <h2 className="font-semibold text-ink">Post a new task</h2>
      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Title</label>
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
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the task, deliverables and requirements…"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
      >
        {submitting ? 'Posting…' : 'Post Task'}
      </button>
    </form>
  );
}
