'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRevalidate } from '@/lib/hooks';
import { toast } from 'react-toastify';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const URGENCIES = ['flexible', 'soon', 'asap'];

export default function ProposalForm({ freelancerId, freelancerName }) {
  const revalidate = useRevalidate();
  const [form, setForm] = useState({
    title: '',
    budget: '',
    deadline: '',
    description: '',
    priority: 'medium',
    urgency: 'flexible',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const post = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!form.title.trim() || !form.budget || !form.deadline) {
      toast.error('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/proposals', {
        task_id: '',
        freelancer_email: freelancerId,
        proposed_budget: Number(form.budget),
        estimated_days: '7',
        cover_note: form.description,
      });

      toast.success(`Proposal sent to ${freelancerName}!`);
      setForm({
        title: '',
        budget: '',
        deadline: '',
        description: '',
        priority: 'medium',
        urgency: 'flexible',
      });

      revalidate(
        (k) =>
          typeof k === 'string' &&
          (k.startsWith('/freelancers') || k.startsWith('/'))
      );
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message || 'Failed to submit proposal.');
      toast.error(err.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={post} className="bg-surface border border-line rounded-2xl p-6 shadow-soft space-y-4">
      <h2 className="font-semibold text-ink">Proposal to {freelancerName}</h2>
      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Task Title <span className="text-danger">*</span></label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Describe the task you want to hire for"
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Budget (USD) <span className="text-danger">*</span></label>
          <input
            required type="number" min="1" step="1"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            placeholder="e.g. 100"
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Deadline <span className="text-danger">*</span></label>
          <input
            required type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the task, deliverables and requirements…"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
      </div>
      <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 text-sm text-brand">
        <p className="font-medium">Note:</p>
        <p className="mt-1">This will create a proposal for the freelancer to review. Once accepted, you can start the project.</p>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 w-full"
      >
        {submitting ? 'Sending Proposal…' : 'Send Proposal'}
      </button>
    </form>
  );
}