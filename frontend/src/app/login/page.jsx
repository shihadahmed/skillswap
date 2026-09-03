'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';
import { dashboardPath, postLoginPath } from '@/components/ProtectedRoute';
import { toast } from 'react-toastify';
import Logo from '@/components/Logo';

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
      toast.success('Logged in successfully!');
      router.push(postLoginPath(u));
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('blocked')) {
        toast.error('Your account has been blocked by Admin.');
      } else if (msg.includes('invalid')) {
        toast.error('Invalid email or password.');
      } else {
        toast.error(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-surface border border-line rounded-3xl shadow-soft overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Column: Platform Highlights & Branding */}
        <div className="hidden lg:flex lg:col-span-5 bg-slate-900 text-white p-8 sm:p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <Logo />
          </div>

          <div className="relative z-10 space-y-6 my-auto py-8">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
              Welcome Back
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
              Manage your tasks, contracts, and secure payments.
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Log back in to review live proposals, collaborate in real time with clients and specialists, and monitor escrow milestones.
            </p>

            <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-black text-white">$250k+</div>
                <div className="text-xs text-slate-400 mt-0.5">Escrow protected</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">99.4%</div>
                <div className="text-xs text-slate-400 mt-0.5">Dispute-free payouts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 bg-surface flex flex-col justify-center">
          <div className="text-center sm:text-left mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back to <span className="text-brand">SkillSwap</span>
            </h2>
            <p className="text-muted text-sm mt-1.5">
              Log in to manage your active tasks and gigs.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 mb-5 font-medium">
              {error}
            </div>
          )}

          {/* Google Login Link */}
          <a
            href={`${API_URL}/auth/google`}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-2xl border border-line bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-colors shadow-sm cursor-pointer mb-6"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="m6.3 14.7 6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C40.6 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"
              />
            </svg>
            Continue with Google
          </a>

          {/* Centered Single Line 'or with email' Divider */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px bg-line flex-1" />
            <span className="text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">
              or with email
            </span>
            <div className="h-px bg-line flex-1" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full h-11 rounded-xl border border-line px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full h-11 rounded-xl border border-line px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full h-12 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl shadow-soft transition-colors disabled:opacity-60 text-sm cursor-pointer !mt-6"
            >
              {busy ? 'Please wait…' : 'Log In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            New to SkillSwap?{' '}
            <Link
              href="/register"
              className="font-bold text-brand hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}