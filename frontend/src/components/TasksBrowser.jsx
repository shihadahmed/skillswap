'use client';

import { useState } from 'react';
import { useTasks } from '@/lib/hooks';
import TaskCard from './TaskCard';
import SearchBar from './SearchBar';
import { CardGridSkeleton, TaskCardSkeleton } from './Skeletons';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

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

export default function TasksBrowser({ initial } = {}) {
  const [applied, setApplied] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  // Default browse view rotates (shuffle); filtered views are stable & cached.
  const { data, isLoading, isValidating } = useTasks({
    search: applied,
    category,
    page,
    shuffle: !applied && !category,
  });

  const tasks = data?.tasks || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;
  const showSkeleton = isLoading && tasks.length === 0;
  const showEmpty = !isLoading && tasks.length === 0;

  const onSearch = (q) => {
    setApplied(q);
    setPage(1);
  };
  const onCategory = (c) => {
    setCategory((prev) => (prev === c ? '' : c));
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink">Browse Tasks</h1>
        <p className="mt-2 text-muted">
          {isValidating ? 'Refreshing…' : `${total} task${total === 1 ? '' : 's'} available`}
        </p>
      </div>

      <SearchBar
        initialValue={applied}
        placeholder="Search tasks by title, skill or keyword…"
        onSubmit={onSearch}
        className="mb-8"
      />

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

      {showSkeleton ? (
        <CardGridSkeleton count={6} Card={TaskCardSkeleton} />
      ) : showEmpty ? (
        <EmptyState
          title="No tasks match your filters"
          message="Try a different keyword or clear the category filter to see more opportunities."
          action={
            <button
              onClick={() => {
                setApplied('');
                setCategory('');
                setPage(1);
              }}
              className="text-sm font-semibold text-brand hover:underline"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {tasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
