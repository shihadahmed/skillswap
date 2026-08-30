'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useFreelancerOverview, useRevalidate } from '@/lib/hooks';
import { toast } from 'react-toastify';
import { fmtBudget, statusStyles, statusLabel } from '@/lib/format';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { StatGridSkeleton, TableSkeleton } from '@/components/Skeletons';

export default function FreelancerProposals() {
  const { user, updateUser } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, mutate } = useFreelancerOverview(page);
  const revalidate = useRevalidate();

  const proposals = data?.mine?.proposals || [];
  const summary = data?.mine?.summary || { sent: 0, pending: 0, accepted: 0, earnings: 0 };
  const totalPages = data?.mine?.totalPages || 1;
  const total = data?.mine?.total || 0;

  const [editing, setEditing] = useState(false);
  const [pform, setPform] = useState({ bio: '', skills: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [deliverId, setDeliverId] = useState(null);
  const [deliverUrl, setDeliverUrl] = useState('');

  useEffect(() => {
    if (user) {
      setPform({ bio: user.bio || '', skills: (user.skills || []).join(', '), image: user.image || '' });
    }
  }, [user]);

  const statCards = [
    { label: 'Proposals Sent', value: summary.sent },
    { label: 'Pending', value: summary.pending },
    { label: 'Accepted', value: summary.accepted },
    { label: 'Total Earnings', value: fmtBudget(summary.earnings) },
  ];

  const activeJobs = proposals.filter((p) => p.status === 'accepted');
  const showSkeleton = isLoading && !data;

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skills = pform.skills.split(',').map((s) => s.trim()).filter(Boolean);
      const updated = await api.put('/users/me', { bio: pform.bio, skills, image: pform.image });
      updateUser(updated);
      toast.success('Profile updated.');
      setEditing(false);
    } catch (err) {
      toast.error(err.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const deliver = async (p, url) => {
    if (!/^https?:\/\/.+/.test(url)) {
      toast.error('Please provide a valid URL for your deliverable.');
      return;
    }
    // Optimistic: show the deliverable URL immediately.
    await mutate(
      (cur) =>
        cur && {
          ...cur,
          mine: {
            ...cur.mine,
            proposals: cur.mine.proposals.map((x) =>
              x._id === p._id ? { ...x, deliverable_url: url } : x
            ),
          },
        },
      { revalidate: false }
    );
    try {
      await api.post(`/proposals/${p._id}/deliver`, { deliverable_url: url });
      toast.success('Deliverable submitted and project marked as completed!');
    } catch (err) {
      toast.error(err.message || 'Could not submit deliverable.');
    } finally {
      mutate();
      revalidate((k) => typeof k === 'string' && k.startsWith('/tasks/'));
    }
  };

  return (
    <div>
      {showSkeleton ? (
        <StatGridSkeleton count={4} />
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-surface border border-line rounded-2xl p-4 shadow-soft">
              <div className="text-xs text-muted">{s.label}</div>
              <div className="text-2xl font-extrabold text-ink mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-ink mb-4">My Proposals</h2>

          {showSkeleton ? (
            <TableSkeleton cols={5} rows={5} />
          ) : proposals.length === 0 ? (
            <EmptyState
              title="You haven't submitted any proposals yet"
              message="Browse open tasks and send your first proposal to get started."
              action={
                <Link href="/tasks" className="inline-block mt-4 text-brand font-semibold text-sm">
                  Browse tasks →
                </Link>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto bg-surface border border-line rounded-2xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted border-b border-line">
                      <th className="py-3 px-4 font-medium">Task</th>
                      <th className="py-3 px-4 font-medium">Bid</th>
                      <th className="py-3 px-4 font-medium">Days</th>
                      <th className="py-3 px-4 font-medium">Date</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.map((p) => (
                      <tr key={p._id} className="border-b border-line last:border-0">
                        <td className="py-3 px-4">
                          <Link
                            href={`/tasks/${p.task_id}`}
                            className="font-medium text-ink hover:text-brand truncate block max-w-[220px]"
                          >
                            {p.task?.title || 'Task'}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-muted">{fmtBudget(p.proposed_budget)}</td>
                        <td className="py-3 px-4 text-muted">{p.estimated_days}</td>
                        <td className="py-3 px-4 text-muted">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[p.status] || statusStyles.pending}`}>
                            {statusLabel[p.status] || p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}

          {activeJobs.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-bold text-ink mb-4">Active Jobs</h2>
              <div className="space-y-3">
                {activeJobs.map((p) => (
                  <div key={p._id} className="bg-surface border border-line rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <Link href={`/tasks/${p.task_id}`} className="font-semibold text-ink hover:text-brand">
                          {p.task?.title || 'Task'}
                        </Link>
                        <p className="text-sm text-muted mt-0.5">Client: {p.task?.client_email || '—'}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[p.task?.status] || statusStyles.in_progress}`}>
                        {statusLabel[p.task?.status] || p.task?.status}
                      </span>
                    </div>
                    {p.task?.description && (
                      <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-3">{p.task.description}</p>
                    )}
                    {p.task?.deadline && (
                      <p className="mt-2 text-sm text-muted">Deadline: {p.task.deadline}</p>
                    )}

                    <div className="mt-4 border-t border-line pt-4">
                      {deliverId === p._id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            deliver(p, deliverUrl);
                            setDeliverId(null);
                            setDeliverUrl('');
                          }}
                          className="space-y-2"
                        >
                          <label className="block text-xs font-medium text-muted">Deliverable URL</label>
                          <input
                            autoFocus
                            value={deliverUrl}
                            onChange={(e) => setDeliverUrl(e.target.value)}
                            placeholder="https://…"
                            className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                          />
                          <div className="flex gap-2">
                            <button type="submit" className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-semibold">
                              Submit deliverable
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeliverId(null);
                                setDeliverUrl('');
                              }}
                              className="border border-line text-muted hover:text-ink px-4 py-2 rounded-xl text-sm font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setDeliverId(p._id);
                            setDeliverUrl(p.deliverable_url || '');
                          }}
                          className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-semibold"
                        >
                          {p.deliverable_url ? 'Update deliverable' : 'Submit deliverable'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-surface border border-line rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-ink">Profile</h3>
              <button
                onClick={() => setEditing((v) => !v)}
                className="text-xs font-semibold text-brand hover:underline"
              >
                {editing ? 'Cancel' : 'Quick edit'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={saveProfile} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Bio</label>
                  <textarea rows={3} value={pform.bio}
                    onChange={(e) => setPform({ ...pform, bio: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Skills (comma separated)</label>
                  <input value={pform.skills}
                    onChange={(e) => setPform({ ...pform, skills: e.target.value })}
                    className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Image URL</label>
                  <input value={pform.image}
                    onChange={(e) => setPform({ ...pform, image: e.target.value })}
                    className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />
                </div>
                <button type="submit" disabled={saving}
                  className="w-full bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save profile'}
                </button>
              </form>
            ) : (
              <div className="text-sm space-y-2">
                <p className="text-muted">{user?.bio || 'No bio added yet.'}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(user?.skills || []).map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
