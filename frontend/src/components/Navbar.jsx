'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  LayoutGrid,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  TrendingUp,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dashboardPath } from '@/components/ProtectedRoute';
import Logo from '@/components/Logo';
import NavbarBell from '@/components/NavbarBell';

const formatNumber = (n) =>
  Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

function VerifiedTick() {
  return (
    <span
      aria-label="Verified"
      title="Verified account"
      className="absolute -bottom-0.5 -right-0.5 z-20 flex items-center justify-center bg-blue-500 text-white rounded-full w-4 h-4 ring-2 ring-white"
    >
      <Check size={10} strokeWidth={3} aria-hidden="true" />
    </span>
  );
}

function Avatar({ user, size = 'sm' }) {
  const dims = size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  return (
    <span className="relative inline-flex items-center justify-center">
      <span
        className={`${dims} rounded-full overflow-hidden border border-line bg-brand/10 grid place-items-center`}
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
      </span>
      {(user?.isApproved === true || user?.approvalStatus === 'approved') && (
        <VerifiedTick />
      )}
    </span>
  );
}

function BalanceBadge({ user }) {
  if (!user || user.role === 'admin') return null;
  const isClient = user.role === 'client';
  const Icon = isClient ? Wallet : TrendingUp;
  const label = isClient ? 'Balance' : 'Earned';
  const value = `$${formatNumber(user.available_balance)}`;
  return (
    <div
      title={`${label}: ${value}`}
      className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-line bg-bg/40 text-xs font-semibold text-ink"
    >
      <Icon size={14} aria-hidden="true" className="text-brand" />
      <span>
        {label}: <span className="text-ink">{value}</span>
      </span>
    </div>
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
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
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
            <>
              <BalanceBadge user={user} />
              <NavbarBell />
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Open user menu"
                  className="rounded-full cursor-pointer hover:ring-2 hover:ring-brand/40 transition-shadow"
                >
                  <Avatar user={user} />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    aria-label="User menu"
                    className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-line bg-surface shadow-soft overflow-hidden z-50"
                  >
                    <div className="px-4 py-4 border-b border-line bg-bg/50 flex items-center gap-3">
                      <span className="shrink-0">
                        <Avatar user={user} size="lg" />
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
                        <LayoutGrid size={18} aria-hidden="true" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        role="menuitem"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-slate-50 transition-colors"
                      >
                        <User size={18} aria-hidden="true" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        role="menuitem"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-slate-50 transition-colors"
                      >
                        <SettingsIcon size={18} aria-hidden="true" />
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
                        <LogOut size={18} aria-hidden="true" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-muted hover:text-ink font-semibold"
              >
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
          {mobileOpen ? (
            <X size={24} aria-hidden="true" />
          ) : (
            <Menu size={24} aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-surface px-4 py-4 space-y-3">
          <Logo onClick={closeMobile} className="mb-2" />
          <Link
            href="/tasks"
            onClick={closeMobile}
            className={linkCls + ' block'}
          >
            Browse Tasks
          </Link>
          <Link
            href="/freelancers"
            onClick={closeMobile}
            className={linkCls + ' block'}
          >
            Freelancers
          </Link>
          <div className="pt-3 border-t border-line flex flex-col gap-3">
            {user ? (
              <>
                {user.role !== 'admin' && (
                  <div className="inline-flex items-center gap-1.5 self-start h-9 px-3 rounded-xl border border-line bg-bg/40 text-xs font-semibold text-ink">
                    {user.role === 'client' ? (
                      <Wallet size={14} aria-hidden="true" className="text-brand" />
                    ) : (
                      <TrendingUp
                        size={14}
                        aria-hidden="true"
                        className="text-brand"
                      />
                    )}
                    <span>
                      {user.role === 'client' ? 'Balance' : 'Earned'}: $
                      {formatNumber(user.available_balance)}
                    </span>
                  </div>
                )}
                <Link
                  href="/notifications"
                  onClick={closeMobile}
                  className={linkCls + ' flex items-center gap-2'}
                >
                  <Bell size={18} aria-hidden="true" />
                  Notifications
                </Link>
                <Link
                  href={dashboardPath(user.role)}
                  onClick={closeMobile}
                  className={linkCls + ' flex items-center gap-2'}
                >
                  <LayoutGrid size={18} aria-hidden="true" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={closeMobile}
                  className={linkCls + ' flex items-center gap-2'}
                >
                  <User size={18} aria-hidden="true" />
                  My Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={closeMobile}
                  className={linkCls + ' flex items-center gap-2'}
                >
                  <SettingsIcon size={18} aria-hidden="true" />
                  Settings
                </Link>
                <div className="flex items-center gap-3">
                  <Avatar user={user} />
                  <button
                    onClick={handleLogout}
                    className="text-left text-muted hover:text-ink font-medium flex items-center gap-2"
                  >
                    <LogOut size={18} aria-hidden="true" />
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
