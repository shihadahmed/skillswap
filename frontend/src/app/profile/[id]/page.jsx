'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

function Stars({ rating = 0 }) {
  const full = Math.round(Number(rating) || 0);
  return (
    <span className="text-amber-400" title={`${rating} / 5`}>
      {'★'.repeat(full)}
      <span className="text-line">{'★'.repeat(Math.max(0, 5 - full))}</span>
    </span>
  );
}

export default function PublicProfilePage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');
    api
      .get(`/users/${id}`)
      .then(setProfile)
      .catch((err) => setError(err.message || 'User not found'))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Public Profile</h1>
        <p className="mt-3 text-muted">Sign in to view member profiles.</p>
        <Link
          href="/login"
          className="inline-block mt-5 bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold shadow-glow transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted">
        Loading profile…
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-muted">{error || 'User not found.'}</p>
        <Link
          href="/freelancers"
          className="inline-block mt-4 text-brand font-semibold hover:underline"
        >
          ← Back to freelancers
        </Link>
      </div>
    );
  }

  const isFreelancer = profile.role === 'freelancer';
  const canHire = user.role === 'client' && isFreelancer && user.email !== profile.email;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/freelancers"
        className="text-sm text-muted hover:text-brand font-medium"
      >
        ← Back to freelancers
      </Link>

      <div className="mt-6 bg-surface border border-line rounded-2xl p-8 shadow-soft">
        <div className="flex items-center gap-5">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="h-20 w-20 rounded-full object-cover border border-line"
            />
          ) : (
            <span className="h-20 w-20 rounded-full bg-brand/10 text-brand flex items-center justify-center text-2xl font-bold">
              {profile.name?.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-ink">{profile.name}</h1>
            <div className="mt-1 flex items-center gap-3">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  isFreelancer
                    ? 'bg-accent/10 text-accent border-accent/30'
                    : 'bg-brand/10 text-brand border-brand/30'
                }`}
              >
                {isFreelancer ? 'Freelancer' : 'Client'}
              </span>
              {profile.rating ? <Stars rating={profile.rating} /> : null}
            </div>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-6 text-muted leading-relaxed">{profile.bio}</p>
        )}

        {profile.skills?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-ink mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span
                  key={s}
                  className="text-sm bg-accent/10 text-accent px-3 py-1 rounded-full font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {isFreelancer && profile.hourlyRate ? (
            <div>
              <p className="text-muted text-sm">Hourly rate</p>
              <p className="font-bold text-ink">${profile.hourlyRate}/hr</p>
            </div>
          ) : null}
          {isFreelancer && (
            <div>
              <p className="text-muted text-sm">Jobs completed</p>
              <p className="font-bold text-ink">{profile.jobsCompleted || 0}</p>
            </div>
          )}
          <div>
            <p className="text-muted text-sm">Member since</p>
            <p className="font-bold text-ink">
              {profile.createdAt
                ? new Date(profile.createdAt).getFullYear()
                : '—'}
            </p>
          </div>
        </div>

        {canHire && (
          <div className="mt-8">
            <Link
              href="/tasks"
              className="inline-block bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold shadow-glow transition-colors"
            >
              Hire {profile.name.split(' ')[0]} on a task
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
