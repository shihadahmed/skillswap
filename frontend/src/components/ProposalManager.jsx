'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function ProposalManager({ taskId, ownerEmail }) {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const isOwner = user?.role === 'client' && user.email === ownerEmail;

  const load = useCallback(async () => {
    try {
      const data = await api.get(`/tasks/${taskId}/proposals`);
      setProposals(data.proposals || []);
    } catch {
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (isOwner) load();
    else setLoading(false);
  }, [isOwner, load]);

  if (!isOwner) return null;

  const decide = async (id, status) => {
    setBusyId(id);
    setError('');
    try {
      await api.put(`/proposals/${id}`, { status });
      if (status === 'accepted') {
        toast.info('Proposal accepted. Redirecting to payment checkout...');
      } else {
        toast.warning('Proposal rejected.');
      }
      await load();
    } catch (err) {
      setError(err.message || 'Action failed.');
      toast.error(err.message || 'Action failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-ink mb-4">
        Proposals ({proposals.length})
      </h2>

      {error && (
        <p className="mb-4 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-muted text-sm">Loading proposals…</p>
      ) : proposals.length === 0 ? (
        <p className="text-muted text-sm">No proposals yet.</p>
      ) : (
        <ul className="space-y-4">
          {proposals.map((p) => (
            <li
              key={p._id}
              className="bg-surface border border-line rounded-2xl p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-ink">{p.freelancer_email}</p>
                  <p className="text-sm text-muted mt-0.5">
                    ${Number(p.proposed_budget).toLocaleString()} ·{' '}
                    {p.estimated_days} day{p.estimated_days === 1 ? '' : 's'}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    statusStyles[p.status] || statusStyles.pending
                  }`}
                >
                  {p.status}
                </span>
              </div>

              {p.cover_note && (
                <p className="mt-3 text-sm text-muted leading-relaxed">
                  {p.cover_note}
                </p>
              )}

              {p.status === 'pending' && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => decide(p._id, 'accepted')}
                    disabled={busyId === p._id}
                    className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => decide(p._id, 'rejected')}
                    disabled={busyId === p._id}
                    className="border border-line text-muted hover:text-ink hover:border-brand/40 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
