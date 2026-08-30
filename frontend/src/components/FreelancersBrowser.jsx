'use client';

import { useState } from 'react';
import { useFreelancers } from '@/lib/hooks';
import FreelancerCard from '@/components/FreelancerCard';
import SearchBar from './SearchBar';
import { CardGridSkeleton, FreelancerCardSkeleton } from './Skeletons';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

export default function FreelancersBrowser({ initial } = {}) {
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isValidating } = useFreelancers({
    search: applied,
    page,
    shuffle: !applied,
  });

  const freelancers = data?.freelancers || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;
  const showSkeleton = isLoading && freelancers.length === 0;
  const showEmpty = !isLoading && freelancers.length === 0;

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
        initialValue={applied}
        placeholder="Search by name, skill or keyword…"
        onSubmit={onSearch}
        className="mb-8"
      />

      {showSkeleton ? (
        <CardGridSkeleton count={6} Card={FreelancerCardSkeleton} />
      ) : showEmpty ? (
        <EmptyState
          title="No freelancers found"
          message="Try a different search term to discover more talent."
          action={
            <button
              onClick={() => {
                setApplied('');
                setPage(1);
              }}
              className="text-sm font-semibold text-brand hover:underline"
            >
              Clear search
            </button>
          }
        />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {freelancers.map((f) => (
              <FreelancerCard key={f.id} freelancer={f} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
