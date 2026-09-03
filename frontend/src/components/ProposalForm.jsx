'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRevalidate } from '@/lib/hooks';
import { approvalBlockMessage, isApprovedUser } from '@/lib/approval';
import { toast } from 'react-toastify';

export default function ProposalForm({
  taskId,
  taskTitle,
  freelancerId,
  freelancerName,
  onSuccess,
}) {
  const revalidate = useRevalidate();
  const { user } = useAuth();
  const blocked = !!user && !isApprovedUser(user);
  const isTaskMode = Boolean(taskId);

  const [form, setForm] = useState({
    title: '',
    budget: '',
    deadline: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const heading = isTaskMode
    ? `Apply for: ${taskTitle || 'this task'}`
    : `Hire ${freelancerName || 'Freelancer'}`;

  const submit = async (e) => {
    e.preventDefault();
    if (blocked) {
      toast.error(approvalBlockMessage());
      return;
    }
    setSubmitting(true);
    setError('');

    if (!form.budget) {
      toast.error('Please enter your proposed budget.');
      setSubmitting(false);
      return;
    }

    try {
      if (isTaskMode) {
        const estimatedDays = form.deadline
          ? Math.max(
              1,
              Math.ceil(
                (new Date(form.deadline) - new Date()) / (1000 * 60 * 60 * 24)
              )
            )
          : 7;

        await api.post(`/tasks/${taskId}/proposals`, {
          proposed_budget: Number(form.budget),
          estimated_days: estimatedDays,
          cover_note: form.description,
        });

        toast.success('Proposal sent to the client!');
      } else {
        await api.post('/proposals', {
          freelancer_email: freelancerId,
          proposed_budget: Number(form.budget),
          estimated_days: 7,
          cover_note: form.description,
        });

        toast.success(`Proposal sent to ${freelancerName}!`);
      }

      setForm({ title: '', budget: '', deadline: '', description: '' });

      revalidate(
        (k) =>
          typeof k === 'string' &&
          (k.startsWith('/tasks') ||
            k.startsWith('/freelancers') ||
            k.startsWith('/'))
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit proposal.');
      toast.error(err.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-surface border border-line rounded-2xl p-6 shadow-soft space-y-4"
    >
      <h2 className="font-semibold text-ink">{heading}</h2>
      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {!isTaskMode && (
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Task Title <span className="text-danger">*</span>
          </label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Describe the task you want to hire for"
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            {isTaskMode ? 'Your Bid (USD)' : 'Budget (USD)'}{' '}
            <span className="text-danger">*</span>
          </label>
          <input
            required
            type="number"
            min="1"
            step="1"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            placeholder={isTaskMode ? 'e.g. 150' : 'e.g. 100'}
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            {isTaskMode ? 'Delivery by' : 'Deadline'}
          </label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          {isTaskMode ? 'Cover Note' : 'Description'}
        </label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder={
            isTaskMode
              ? 'Why are you a great fit for this task?'
              : 'Describe the task, deliverables and requirements…'
          }
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>

      {isTaskMode ? (
        <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 text-sm text-brand">
          <p className="font-medium">Note:</p>
          <p className="mt-1">
            Your proposal will be sent to the client. If accepted, the task
            moves to in-progress and other pending proposals are auto-rejected.
          </p>
        </div>
      ) : (
        <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 text-sm text-brand">
          <p className="font-medium">Note:</p>
          <p className="mt-1">
            This will create a proposal for the freelancer to review. Once
            accepted, you can start the project.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || blocked}
        title={blocked ? 'Account pending verification' : undefined}
        className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed w-full"
      >
        {submitting
          ? 'Sending Proposal…'
          : isTaskMode
          ? 'Submit Proposal'
          : 'Send Proposal'}
      </button>
    </form>
  );
}
