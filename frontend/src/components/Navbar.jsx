'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dashboardPath } from '@/components/ProtectedRoute';
import Logo from '@/components/Logo';

function VerifiedTick() {
  return (
    <span
      aria-label="Verified"
      title="Verified account"
      className="absolute -bottom-1 -right-1 z-10 flex items-center justify-center bg-blue-500 rounded-full w-4 h-4 p-0.5 text-white ring-2 ring-white"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
        <path
          fillRule="evenodd"
          d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.42L8.5 12.086l6.79-6.796a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

function DashboardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isApproved =
    user?.isApproved === true || user?.approvalStatus === 'approved';

  const handleLogout = () => {
    setMenuOpen(false);
    setMobileOpen(false);
    logout();
    router.replace('/');
  };

  const closeMenu = () => setMenuOpen(false);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const linkCls = 'text-muted hover:text-ink transition-colors font-medium';
  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur border-b border-line">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo onClick={closeMobile} />

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
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Open user menu"
                className="relative inline-flex items-center justify-center h-9 w-9 rounded-full bg-brand/10 overflow-hidden border border-line cursor-pointer hover:ring-2 hover:ring-brand/40 transition-shadow"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-brand font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
                {isApproved && <VerifiedTick />}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="User menu"
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-line bg-surface shadow-soft overflow-hidden z-50"
                >
                  {/* User info header */}
                  <div className="px-4 py-4 border-b border-line bg-bg/50 flex items-center gap-3">
                    <span className="relative inline-flex items-center justify-center h-11 w-11 rounded-full bg-brand/10 overflow-hidden border border-line shrink-0">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-brand font-bold">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                      {isApproved && <VerifiedTick />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate text-sm text-ink">
                        {user.name}
                      </div>
                      <div className="text-xs text-muted truncate">
                        {user.email}
                      </div>
                      <span className="inline-block mt-1 text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href={dashboardPath(user.role)}
                      role="menuitem"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-slate-50 transition-colors"
                    >
                      <DashboardIcon />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      role="menuitem"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      role="menuitem"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-slate-50 transition-colors"
                    >
                      <SettingsIcon />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-line py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
                    >
                      <LogoutIcon />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-surface px-4 py-4 space-y-3">
          <Logo onClick={closeMobile} className="mb-2" />
          <Link href="/tasks" onClick={closeMobile} className={linkCls + ' block'}>
            Browse Tasks
          </Link>
          <Link href="/freelancers" onClick={closeMobile} className={linkCls + ' block'}>
            Freelancers
          </Link>
          <div className="pt-3 border-t border-line flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  href={dashboardPath(user.role)}
                  onClick={closeMobile}
                  className={linkCls + ' flex items-center gap-2'}
                >
                  <DashboardIcon />
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  <span className="relative inline-flex items-center justify-center">
                    <span className="h-9 w-9 rounded-full bg-brand/10 grid place-items-center overflow-hidden border border-line">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-brand font-bold">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </span>
                    {isApproved && <VerifiedTick />}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-left text-muted hover:text-ink font-medium flex items-center gap-2"
                  >
                    <LogoutIcon />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMobile} className={linkCls}>
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobile}
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
