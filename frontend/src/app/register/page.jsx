'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';
import { toast } from 'react-toastify';

const redirectFor = (role) => {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'freelancer') return '/dashboard/freelancer';
  return '/';
};

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    image: '',
    role: 'client',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(form.password)) {
      toast.error(
        'Password must be at least 6 characters with uppercase and lowercase letters.'
      );
      return;
    }
    setBusy(true);
    try {
      const u = await register(form);
      toast.success('Account created successfully! Welcome to SkillSwap.');
      router.push(redirectFor(u.role));
    } catch (err) {
      const msg = err.message || '';
      if (/already/.test(msg)) {
        toast.error('User with this email already exists.');
      } else {
        toast.error(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-surface border border-line rounded-2xl shadow-soft p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Join SkillSwap</h1>
        <p className="text-muted mt-1 mb-6">Create your account in seconds.</p>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <a
          href={`${API_URL}/auth/google?role=${form.role}`}
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
          <label className="block text-sm font-medium text-muted">Full name</label>
          <input
            value={form.name}
            onChange={update('name')}
            required
            className="w-full rounded-xl border border-line px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40"
          />

          <label className="block text-sm font-medium text-muted mt-3">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={update('email')}
            required
            className="w-full rounded-xl border border-line px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40"
          />

          <label className="block text-sm font-medium text-muted mt-3">
            Profile image URL <span className="text-muted/70">(optional)</span>
          </label>
          <input
            type="url"
            value={form.image}
            onChange={update('image')}
            placeholder="https://…"
            className="w-full rounded-xl border border-line px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40"
          />

          <label className="block text-sm font-medium text-muted mt-3">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            minLength={6}
            required
            className="w-full rounded-xl border border-line px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40"
          />

          <label className="block text-sm font-medium text-muted mt-4">I want to</label>
          <div className="flex gap-3 mt-2">
            <Link
              href="/client-signup"
              className="flex-1 text-center rounded-xl border border-brand bg-brand/5 ring-2 ring-brand/30 p-4 font-semibold text-brand hover:bg-brand/10 transition-colors"
            >
              <div>Hire Talent</div>
              <div className="text-xs text-muted mt-1">Post tasks & get them done</div>
            </Link>
            <Link
              href="/freelancer-signup"
              className="flex-1 text-center rounded-xl border border-brand bg-brand/5 ring-2 ring-brand/30 p-4 font-semibold text-brand hover:bg-brand/10 transition-colors"
            >
              <div>Work & Earn</div>
              <div className="text-xs text-muted mt-1">Apply to tasks & deliver</div>
            </Link>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-6 bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-xl shadow-soft transition-colors disabled:opacity-60"
          >
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
