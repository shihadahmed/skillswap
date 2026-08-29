'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import TaskCard from './TaskCard';
import SearchBar from './SearchBar';

const PAGE_SIZE = 9;

const CATEGORIES = [
  'UI/UX Design',
  'Frontend Development',
  'Backend Development',
  'Full-Stack Development',
  'AI Integration',
  'AI & Machine Learning',
  'AI & Python',
  'Data Science',
  'Data Engineering',
  'Data Scraping',
  'Database',
  'DevOps',
  'DevOps & Integration',
  'Cyber Security',
  'Mobile App',
  'Graphic Design',
  '3D & Motion',
  'Animation',
  'Video Editing',
  'Blockchain',
  'Web3 & Telegram',
  'QA Testing',
  'Web Development',
  'Technical Writing',
  'Content Writing',
  'Email Design',
  'SEO & Growth',
  'Game Development',
];

export default function TasksBrowser({ initial, initialSearch = '', initialCategory = '' }) {
  const [tasks, setTasks] = useState(initial.tasks || []);
  const [applied, setApplied] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(initial.page || 1);
  const [totalPages, setTotalPages] = useState(initial.totalPages || 1);
  const [total, setTotal] = useState(initial.total || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cache page results on the client so Prev/Next feels instant.
  const cacheRef = useRef(new Map());

  const load = useCallback(async (query = '', cat = '', pageNum = 1) => {
    const key = `${query}|${cat}|${pageNum}`;
    const cached = cacheRef.current.get(key);
    if (cached) {
      setTasks(cached.tasks);
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
      if (cat) params.set('category', cat);
      // Shuffle the default browse view so cards rotate on every reload.
      if (!query && !cat) params.set('shuffle', '1');
      params.set('page', pageNum);
      params.set('limit', PAGE_SIZE);
      const data = await api.get(`/tasks?${params.toString()}`);
      const payload = {
        tasks: data.tasks || [],
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
      };
      cacheRef.current.set(key, payload);
      setTasks(payload.tasks);
      setPage(payload.page);
      setTotalPages(payload.totalPages);
      setTotal(payload.total);
    } catch (err) {
      setError(err.message || 'Could not load tasks.');
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
    load(applied, category, page);
  }, [applied, category, page, load]);

  // Scroll back to the top of the results whenever the page, search or category
  // changes, so the first card of the new page is always in view (same behaviour
  // as the freelancer browser).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, applied, category]);

  const onSearch = (q) => {
    setApplied(q);
    setPage(1);
  };

  const onCategory = (c) => {
    setCategory((prevCat) => (prevCat === c ? '' : c));
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink">Browse Tasks</h1>
        <p className="mt-2 text-muted">
          {loading ? 'Loading…' : `${total} task${total === 1 ? '' : 's'} available`}
        </p>
      </div>

      <SearchBar
        initialValue={initialSearch}
        placeholder="Search tasks by title, skill or keyword…"
        onSubmit={onSearch}
        className="mb-8"
      />

      {/* Category chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-5">
        <button
          type="button"
          onClick={() => onCategory('')}
          className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
            !category
              ? 'bg-brand text-white border-brand'
              : 'bg-surface text-muted border-line hover:border-brand/40'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategory(c)}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
              category === c
                ? 'bg-brand text-white border-brand'
                : 'bg-surface text-muted border-line hover:border-brand/40'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 mb-4 mt-6">
          {error}
        </p>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted mt-8">
          <span className="h-4 w-4 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
          Loading…
        </div>
      )}

      {!loading && tasks.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-10 text-center mt-8">
          <p className="text-muted">No tasks match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {tasks.map((t) => (
            <TaskCard key={t._id} task={t} />
          ))}
        </div>
      )}

      {/* Pagination (Prev / Next) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 h-10 rounded-xl border border-line bg-surface text-sm font-semibold text-ink disabled:opacity-40 hover:border-brand/50 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages} · {total} tasks
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
    </div>
  );
}
