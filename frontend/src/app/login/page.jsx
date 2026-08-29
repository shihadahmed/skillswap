'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

const redirectFor = (role) => {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'freelancer') return '/dashboard/freelancer';
  return '/';
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = await login(email, password);
      router.push(redirectFor(u.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4">
      <div className="w-full max-w-md bg-surface border border-line rounded-2xl shadow-soft p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Welcome back to <span className="text-brand">SkillSwap</span>
        </h1>
        <p className="text-muted mt-1 mb-6">Log in to manage your tasks and gigs.</p>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <a
          href={`${API_URL}/auth/google`}
          className="flex items-center justify-center gap-3 w-full border border-line rounded-xl py-3 font-semibold hover:bg-slate-50 transition-colors mb-5"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C40.6 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z" />
          </svg>
          Continue with Google
        </a>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-line flex-1" />
          <span className="text-xs text-muted">or with email</span>
          <div className="h-px bg-line flex-1" />
        </div>

        <form onSubmit={submit} className="space-y-1">
          <label className="block text-sm font-medium text-muted">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-line px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <label className="block text-sm font-medium text-muted mt-3">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-line px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full mt-6 bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-xl shadow-soft transition-colors disabled:opacity-60"
          >
            {busy ? 'Please wait…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          New to SkillSwap?{' '}
          <Link href="/register" className="text-brand font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
