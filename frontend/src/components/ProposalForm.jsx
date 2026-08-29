'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function ProposalForm({ taskId, taskTitle }) {
  const { user, loading } = useAuth();
  const [budget, setBudget] = useState('');
  const [days, setDays] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (loading) {
    return <div className="h-6" />;
  }

   if (!user) {
    return (
      <div className="flex justify-center mt-2">
        <p className="text-center text-muted text-sm">
          <Link
            href="/login"
            onClick={() =>
              toast.warn('Please log in to submit a proposal or post a task.')
            }
            className="text-brand hover:underline font-medium"
          >
            Sign in
          </Link>{' '}
          as a freelancer to send a proposal.
        </p>
      </div>
    );
  }

  if (user.role !== 'freelancer') {
    return (
      <div className="bg-bg border border-line rounded-xl p-5 text-center">
        <p className="text-muted text-sm">
          Only freelancers can apply to tasks.
        </p>
        <Link
          href="/tasks"
          className="inline-block mt-2 text-brand font-semibold hover:underline"
        >
          Browse more tasks
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
        <p className="font-semibold text-emerald-700">
          Proposal sent! 🎉
        </p>
        <p className="text-sm text-emerald-700/80 mt-1">
          The client will review your application for “{taskTitle}”.
        </p>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    const proposed_budget = Number(budget);
    const estimated_days = Number(days);
    if (!proposed_budget || proposed_budget <= 0 || !estimated_days || estimated_days < 1) {
      toast.error('Please provide a valid bid amount and estimated days.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/tasks/${taskId}/proposals`, {
        proposed_budget,
        estimated_days,
        cover_note: note,
      });
      toast.success('Proposal submitted successfully!');
      setDone(true);
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('already')) {
        toast.error('You have already submitted a proposal for this task.');
      } else {
        toast.error(err.message || 'Could not submit proposal.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-surface border border-line rounded-2xl p-6 shadow-soft"
    >
      <h3 className="text-lg font-bold text-ink">Send a proposal</h3>
      <p className="text-sm text-muted mt-1">
        Tell the client why you’re the right fit.
      </p>

      <div className="grid grid-cols-2 gap-4 mt-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Your budget ($)
          </label>
          <input
            type="number"
            min="1"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 150"
            className="w-full h-11 rounded-xl border border-line bg-bg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Estimated days
          </label>
          <input
            type="number"
            min="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="e.g. 7"
            className="w-full h-11 rounded-xl border border-line bg-bg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-ink mb-1">
          Cover note
        </label>
        <textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Briefly describe your approach, experience, and deliverables…"
          className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-semibold shadow-glow transition-colors disabled:opacity-60"
      >
        {submitting ? 'Sending…' : 'Submit proposal'}
      </button>
    </form>
  );
}
