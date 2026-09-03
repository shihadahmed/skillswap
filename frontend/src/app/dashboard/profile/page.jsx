'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import VerificationBanner from '@/lib/approval';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { fmtBudget } from '@/lib/format';

function Stars({ rating = 0 }) {
  const full = Math.round(Number(rating) || 0);
  return (
    <span className="text-amber-400" title={`${rating} / 5`}>
      {'★'.repeat(full)}
      <span className="text-line">{'★'.repeat(Math.max(0, 5 - full))}</span>
    </span>
  );
}

function ProfileBody() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [skill, setSkill] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        image: user.image || '',
        skills: Array.isArray(user.skills) ? user.skills : [],
      });
    }
  }, [user]);

  if (!form) {
    return <p className="text-muted py-12 text-center">Loading…</p>;
  }

  const addSkill = () => {
    const v = skill.trim();
    if (!v || form.skills.includes(v)) {
      setSkill('');
      return;
    }
    setForm({ ...form, skills: [...form.skills, v] });
    setSkill('');
  };

  const removeSkill = (s) =>
    setForm({ ...form, skills: form.skills.filter((x) => x !== s) });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const updated = await api.put('/users/me', {
        name: form.name,
        bio: form.bio,
        image: form.image,
        skills: form.skills,
      });
      updateUser(updated);
      setMsg('Profile saved!');
      toast.success('Profile details updated successfully!');
    } catch (err) {
      setMsg(err.message || 'Failed to update profile.');
      toast.error(err.message || 'Failed to update profile details.');
    } finally {
      setBusy(false);
    }
  };

  const isApproved =
    user?.isApproved === true || user?.approvalStatus === 'approved';
  const isFreelancer = user?.role === 'freelancer';

  const avatar =
    user.image ||
    `https://placehold.co/160x160?text=${encodeURIComponent(
      (user.name || 'U').charAt(0).toUpperCase()
    )}`;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
          My Profile
        </h1>
        <p className="text-muted mt-1 text-sm">
          Your public information and editable details.
        </p>
      </header>

      <VerificationBanner />

      {/* Summary card */}
      <section className="bg-surface border border-line rounded-2xl shadow-soft p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative inline-flex shrink-0">
            <img
              src={avatar}
              alt={user.name}
              className="h-24 w-24 rounded-full object-cover border border-line"
            />
            {isApproved && (
              <span
                aria-label="Verified"
                title="Verified account"
                className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center ring-2 ring-surface"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.42L8.5 12.086l6.79-6.796a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-extrabold text-ink truncate">
                {user.name}
              </h2>
              <span
                className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full ${
                  isApproved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isApproved ? 'Verified' : 'Pending verification'}
              </span>
              {user?.payment_verified && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <BadgeCheck size={12} /> Payment Verified
                </span>
              )}
              <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand">
                {user.role}
              </span>
            </div>
            <p className="text-muted text-sm truncate mt-1">{user.email}</p>
            {user.rating ? (
              <div className="mt-2">
                <Stars rating={user.rating} />
              </div>
            ) : null}
          </div>
        </div>

        {form.bio ? (
          <p className="mt-6 text-muted leading-relaxed whitespace-pre-line">
            {form.bio}
          </p>
        ) : (
          <p className="mt-6 text-muted italic">No bio yet.</p>
        )}

        {form.skills.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-ink mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {form.skills.map((s) => (
                <span
                  key={s}
                  className="text-sm bg-brand/10 text-brand px-3 py-1 rounded-full font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted">Rating</p>
            <p className="font-bold text-ink">
              {user.rating ? `${Number(user.rating).toFixed(1)} / 5` : '—'}
            </p>
          </div>
          {isFreelancer && (
            <div>
              <p className="text-muted">Jobs completed</p>
              <p className="font-bold text-ink">
                {user.jobsCompleted || 0}
              </p>
            </div>
          )}
          {isFreelancer && (
            <div>
              <p className="text-muted">Hourly rate</p>
              <p className="font-bold text-ink">
                {user.hourlyRate ? `$${user.hourlyRate}/hr` : '—'}
              </p>
            </div>
          )}
          {isFreelancer && (
            <div>
              <p className="text-muted">Available balance</p>
              <p className="font-bold text-ink">
                {fmtBudget(user.available_balance || 0)}
              </p>
            </div>
          )}
          {user?.role === 'client' && (
            <div>
              <p className="text-muted">Wallet balance</p>
              <p className="font-bold text-ink">
                {fmtBudget(user.available_balance || 0)}
              </p>
            </div>
          )}
          <div>
            <p className="text-muted">Member since</p>
            <p className="font-bold text-ink">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* Edit form */}
      <section className="bg-surface border border-line rounded-2xl shadow-soft p-6 md:p-8">
        <h2 className="text-lg font-bold text-ink">Edit details</h2>
        <p className="text-muted text-sm mt-1">
          These details appear on your public profile.
        </p>

        {msg && (
          <div
            className={`mt-4 text-sm px-3 py-2 rounded-lg border ${
              msg.includes('saved')
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-danger bg-danger/10 border-danger/30'
            }`}
          >
            {msg}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Avatar URL
            </label>
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://…"
              className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Skills</label>
            <div className="flex gap-2">
              <input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill and press Enter"
                className="flex-1 h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 h-11 rounded-xl border border-line text-muted hover:text-ink hover:border-brand/40 text-sm font-semibold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {form.skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 bg-brand/10 text-brand text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="hover:text-danger"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save Profile'}
            </button>
            <Link
              href={user.role === 'admin' ? '/dashboard/admin' : user.role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/client'}
              className="text-sm text-muted hover:text-ink font-semibold"
            >
              ← Back to dashboard
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function DashboardProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardSidebar>
        <ProfileBody />
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
