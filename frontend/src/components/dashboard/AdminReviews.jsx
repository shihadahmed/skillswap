'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get('/admin/reviews')
      .then((d) => {
        if (active) setReviews(d.reviews || []);
      })
      .catch(() => {
        if (active) setReviews([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const remove = async (r) => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Delete this review?')) return;
    setBusyId(r._id);
    try {
      await api.del(`/admin/reviews/${r._id}`);
      toast.success('Review deleted.');
      setReviews((cur) => cur.filter((x) => x._id !== r._id));
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-ink mb-4">Reviews</h2>
      {loading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : reviews.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-10 text-center">
          <p className="text-muted">No reviews yet.</p>
        </div>
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
                  <td className="py-3 px-4 text-muted truncate max-w-[160px]">
                    {r.reviewer_email}
                  </td>
                  <td className="py-3 px-4 text-muted truncate max-w-[160px]">
                    {r.reviewee_email}
                  </td>
                  <td className="py-3 px-4 text-amber-500 font-semibold">
                    {'★'.repeat(r.rating)}
                    <span className="text-muted">{'★'.repeat(5 - r.rating)}</span>
                  </td>
                  <td className="py-3 px-4 text-muted max-w-[260px] truncate">
                    {r.comment || '—'}
                  </td>
                  <td className="py-3 px-4 text-muted">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => remove(r)}
                      disabled={busyId === r._id}
                      className="text-danger hover:underline text-xs font-semibold disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
