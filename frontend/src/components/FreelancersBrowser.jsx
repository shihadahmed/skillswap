'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import FreelancerCard from '@/components/FreelancerCard';
import SearchBar from './SearchBar';

const PAGE_SIZE = 9;

export default function FreelancersBrowser({ initial, initialQuery = '' }) {
  const [freelancers, setFreelancers] = useState(initial.freelancers || []);
  const [applied, setApplied] = useState(initialQuery);
  const [page, setPage] = useState(initial.page || 1);
  const [totalPages, setTotalPages] = useState(initial.totalPages || 1);
  const [total, setTotal] = useState(initial.total || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cache page results on the client so Prev/Next feels instant.
  const cacheRef = useRef(new Map());

  const load = useCallback(async (query = '', pageNum = 1) => {
    const key = `${query}|${pageNum}`;
    const cached = cacheRef.current.get(key);
    if (cached) {
      setFreelancers(cached.freelancers);
      setPage(cached.page);
      setTotalPages(cached.totalPages);
      setTotal(cached.total);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      // Shuffle the default browse view so cards rotate on every reload.
      if (!query) params.set('shuffle', '1');
      params.set('page', pageNum);
      params.set('limit', PAGE_SIZE);
      const url = `/freelancers?${params.toString()}`;
      const data = await api.get(url);
      const payload = {
        freelancers: data.freelancers || [],
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
      };
      cacheRef.current.set(key, payload);
      setFreelancers(payload.freelancers);
      setPage(payload.page);
      setTotalPages(payload.totalPages);
      setTotal(payload.total);
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

  // Scroll back to the top of the results whenever the page or search changes,
  // so the first card of the new page is always in view.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, applied]);

  const onSearch = (q) => {
    setApplied(q);
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

      <SearchBar
        initialValue={initialQuery}
        placeholder="Search by name, skill or keyword…"
        onSubmit={onSearch}
        className="mb-8"
      />

      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted mb-4">
          <span className="h-4 w-4 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
          Loading…
        </div>
      )}

      {!loading && freelancers.length === 0 ? (
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
