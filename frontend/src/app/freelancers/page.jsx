'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import FreelancerCard from '@/components/FreelancerCard';

export default function FreelancersPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const url = `/users/explore${query ? `?q=${encodeURIComponent(query)}` : ''}`;
      const data = await api.get(url);
      setUsers(data.filter((u) => u.role === 'freelancer'));
    } catch (err) {
      setError(err.message || 'Could not load freelancers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-extrabold text-ink">Browse Freelancers</h1>
        <p className="mt-3 text-muted">
          Sign in to discover skilled freelancers and invite them to your tasks.
        </p>
        <Link
          href="/login"
          className="inline-block mt-5 bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold shadow-glow transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink">Browse Freelancers</h1>
        <p className="mt-2 text-muted">
          Find the right person for your next micro-task.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(q);
        }}
        className="flex gap-2 max-w-xl mb-8"
      >
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
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
      ) : users.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-10 text-center">
          <p className="text-muted">No freelancers found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <FreelancerCard key={u._id} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}
