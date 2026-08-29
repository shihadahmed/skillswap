'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function TaskCheckout({ taskId, clientEmail, status }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);

  const isOwner = user?.role === 'client' && user.email === clientEmail;
  if (!isOwner) return null;

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      await api.post('/payments/checkout', { task_id: taskId });
      toast.success('Payment successful — task marked complete.');
      window.location.reload();
    } catch (e) {
      setError(e.message || 'Payment failed.');
      toast.error(e.message || 'Payment failed.');
      setBusy(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api.get(`/tasks/${taskId}/proposals`);
      const accepted = (data.proposals || []).find((p) => p.status === 'accepted');
      const reviewee_email = accepted?.freelancer_email;
      if (!reviewee_email) throw new Error('No accepted freelancer found');
      await api.post('/reviews', {
        task_id: taskId,
        reviewee_email,
        rating: Number(rating),
        comment,
      });
      toast.success('Thanks! Your review was submitted.');
      setDone(true);
    } catch (e) {
      setError(e.message || 'Review failed.');
      toast.error(e.message || 'Review failed.');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'in_progress') {
    return (
      <div className="bg-brand/5 border border-brand/20 rounded-2xl p-5">
        <p className="text-sm text-ink font-medium">
          A freelancer has been accepted. Complete the (dummy) payment to finish
          the task.
        </p>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <button
          onClick={pay}
          disabled={busy}
          className="mt-3 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {busy ? 'Processing…' : 'Pay now (dummy checkout)'}
        </button>
      </div>
    );
  }

  if (status === 'completed') {
    if (done) {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-sm text-emerald-700">
          Thanks! Your review was submitted.
        </div>
      );
    }
    return (
      <form
        onSubmit={submitReview}
        className="bg-surface border border-line rounded-2xl p-5"
      >
        <h3 className="font-semibold text-ink">Leave a review</h3>
        <p className="text-sm text-muted mt-1">
          Rate the freelancer you worked with.
        </p>
        <div className="mt-3 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              className={`text-2xl transition-colors ${
                n <= rating ? 'text-amber-500' : 'text-slate-300'
              }`}
              aria-label={`${n} star`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional comment…"
          className="mt-3 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-3 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {busy ? 'Submitting…' : 'Submit review'}
        </button>
      </form>
    );
  }

  return null;
}
