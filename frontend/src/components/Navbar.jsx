'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dashboardPath } from '@/components/ProtectedRoute';
import Logo from '@/components/Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push('/');
  };

  const linkCls =
    'text-muted hover:text-ink transition-colors font-medium';
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur border-b border-line">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Logo onClick={close} />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={linkCls}>
            Home
          </Link>
          <Link href="/tasks" className={linkCls}>
            Browse Tasks
          </Link>
          <Link href="/freelancers" className={linkCls}>
            Freelancers
          </Link>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={dashboardPath(user.role)}
                className="inline-flex items-center gap-2 text-muted hover:text-ink font-medium transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                Dashboard
              </Link>

              <span className="h-9 w-9 rounded-full bg-brand/10 grid place-items-center overflow-hidden border border-line">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-brand font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </span>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-muted hover:text-ink font-medium transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-ink font-semibold">
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl font-semibold shadow-soft transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-ink"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-line bg-surface px-4 py-4 space-y-3">
          <Logo onClick={close} className="mb-2" />
          <Link href="/tasks" onClick={close} className={linkCls + ' block'}>
            Browse Tasks
          </Link>
          <Link href="/freelancers" onClick={close} className={linkCls + ' block'}>
            Freelancers
          </Link>
          <div className="pt-3 border-t border-line flex flex-col gap-3">
              {user ? (
                <>
                  <Link href={dashboardPath(user.role)} onClick={close} className={linkCls + ' flex items-center gap-2'}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full bg-brand/10 grid place-items-center overflow-hidden border border-line">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-brand font-bold">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </span>
                    <button onClick={handleLogout} className="text-left text-muted hover:text-ink font-medium flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="M16 17l5-5-5-5" />
                        <path d="M21 12H9" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              ) : (
              <>
                <Link href="/login" onClick={close} className={linkCls}>
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={close}
                  className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl font-semibold text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
