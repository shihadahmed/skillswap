import Link from 'next/link';
import { Suspense } from 'react';
import { API_URL } from '@/lib/api';
import TaskCard from '@/components/TaskCard';
import TaskSearch from '@/components/TaskSearch';

export const dynamic = 'force-dynamic';

async function getTasks(searchParams) {
  const params = new URLSearchParams();
  if (searchParams?.search) params.set('search', searchParams.search);
  if (searchParams?.category) params.set('category', searchParams.category);
  params.set('limit', '9');
  try {
    const res = await fetch(`${API_URL}/tasks?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return { tasks: [], total: 0, totalPages: 1, page: 1 };
    return await res.json();
  } catch {
    return { tasks: [], total: 0, totalPages: 1, page: 1 };
  }
}

export default async function TasksPage({ searchParams }) {
  const { tasks, total, totalPages, page } = await getTasks(searchParams);
  const activeCat = searchParams?.category || '';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink">Browse Tasks</h1>
        <p className="mt-2 text-muted">
          {total} task{total === 1 ? '' : 's'} available
        </p>
      </div>

      <Suspense fallback={<div className="h-11" />}>
        <TaskSearch initial={searchParams?.search || ''} category={activeCat} />
      </Suspense>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mt-5">
        <Link
          href="/tasks"
          className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
            !activeCat
              ? 'bg-brand text-white border-brand'
              : 'bg-surface text-muted border-line hover:border-brand/40'
          }`}
        >
          All
        </Link>
        {['Design', 'Writing', 'Development', 'Marketing', 'Other'].map((c) => (
          <Link
            key={c}
            href={`/tasks?category=${encodeURIComponent(c)}`}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
              activeCat === c
                ? 'bg-brand text-white border-brand'
                : 'bg-surface text-muted border-line hover:border-brand/40'
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {/* Task grid */}
      <div className="mt-8">
        {tasks.length === 0 ? (
          <div className="bg-surface border border-line rounded-2xl p-10 text-center">
            <p className="text-muted">No tasks match your filters.</p>
            <Link
              href="/tasks"
              className="inline-block mt-4 text-brand hover:text-brand-hover font-semibold"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const qs = new URLSearchParams(searchParams || {});
            qs.set('page', String(p));
            return (
              <Link
                key={p}
                href={`/tasks?${qs.toString()}`}
                className={`h-9 w-9 flex items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                  p === Number(page)
                    ? 'bg-brand text-white border-brand'
                    : 'bg-surface text-muted border-line hover:border-brand/40'
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
