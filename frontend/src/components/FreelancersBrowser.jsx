'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import FreelancerCard from '@/components/FreelancerCard';

const PAGE_SIZE = 9;

export default function FreelancersBrowser({ initial, initialQuery = '' }) {
  const [freelancers, setFreelancers] = useState(initial.freelancers || []);
  const [input, setInput] = useState(initialQuery);
  const [applied, setApplied] = useState(initialQuery);
  const [page, setPage] = useState(initial.page || 1);
  const [totalPages, setTotalPages] = useState(initial.totalPages || 1);
  const [total, setTotal] = useState(initial.total || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (query = '', pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const url = `/freelancers?search=${encodeURIComponent(
        query
      )}&page=${pageNum}&limit=${PAGE_SIZE}`;
      const data = await api.get(url);
      setFreelancers(data.freelancers || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'Could not load freelancers.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Skip the first effect run — the server already delivered initial data.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    load(applied, page);
  }, [applied, page, load]);

  const onSearch = (e) => {
    e.preventDefault();
    setApplied(input);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink">Browse Freelancers</h1>
        <p className="mt-2 text-muted">
          Find the right person for your next micro-task.
        </p>
      </div>

      <form onSubmit={onSearch} className="flex gap-2 max-w-xl mb-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by name, skill or keyword…"
          className="flex-1 min-w-0 h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        <button
          type="submit"
          className="shrink-0 h-11 px-5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Search
        </button>
      </form>

      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-muted">Loading freelancers…</p>
      ) : freelancers.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-10 text-center">
          <p className="text-muted">No freelancers found.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {freelancers.map((f) => (
              <FreelancerCard key={f.id} freelancer={f} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 h-10 rounded-xl border border-line bg-surface text-sm font-semibold text-ink disabled:opacity-40 hover:border-brand/50 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-sm text-muted">
                Page {page} of {totalPages} · {total} freelancers
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 h-10 rounded-xl border border-line bg-surface text-sm font-semibold text-ink disabled:opacity-40 hover:border-brand/50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
