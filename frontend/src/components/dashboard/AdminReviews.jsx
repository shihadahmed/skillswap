'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAdminReviews, useRevalidate } from '@/lib/hooks';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { TableSkeleton } from '@/components/Skeletons';

export default function AdminReviews() {
  const [page, setPage] = useState(1);
  const { data, isLoading, mutate } = useAdminReviews(page);
  const revalidate = useRevalidate();

  const reviews = data?.reviews || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;
  const showSkeleton = isLoading && !data;
  const [busyId, setBusyId] = useState(null);

  const remove = async (r) => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Delete this review?')) return;
    // Optimistic: remove from cache immediately.
    await mutate(
      (cur) => cur && { ...cur, reviews: cur.reviews.filter((x) => x._id !== r._id), total: Math.max(0, (cur.total || 0) - 1) },
      { revalidate: false }
    );
    try {
      await api.del(`/admin/reviews/${r._id}`);
      toast.success('Review deleted.');
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      mutate();
      revalidate((k) => typeof k === 'string' && k.startsWith('/admin/reviews'));
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-ink mb-4">Reviews ({total})</h2>
      {showSkeleton ? (
        <TableSkeleton cols={6} rows={6} />
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews yet" message="Reviews left by clients for freelancers will appear here." />
      ) : (
        <div className="overflow-x-auto bg-surface border border-line rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-line">
                <th className="py-3 px-4 font-medium">Reviewer</th>
                <th className="py-3 px-4 font-medium">Reviewee</th>
                <th className="py-3 px-4 font-medium">Rating</th>
                <th className="py-3 px-4 font-medium">Comment</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r._id} className="border-b border-line last:border-0">
                  <td className="py-3 px-4 text-muted truncate max-w-[160px]">{r.reviewer_email}</td>
                  <td className="py-3 px-4 text-muted truncate max-w-[160px]">{r.reviewee_email}</td>
                  <td className="py-3 px-4 text-amber-500 font-semibold">
                    {'★'.repeat(r.rating)}
                    <span className="text-muted">{'★'.repeat(5 - r.rating)}</span>
                  </td>
                  <td className="py-3 px-4 text-muted max-w-[260px] truncate">{r.comment || '—'}</td>
                  <td className="py-3 px-4 text-muted">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => remove(r)} disabled={busyId === r._id}
                      className="text-danger hover:underline text-xs font-semibold disabled:opacity-50">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
