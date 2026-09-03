'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Settings as SettingsIcon, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import NotificationBell from '@/components/NotificationBell';

const navByRole = {
  client: [
    { href: '/dashboard/client', label: 'Overview' },
    { href: '/dashboard/client/my-tasks', label: 'My Tasks' },
    { href: '/tasks/create', label: 'Post a Task' },
    { href: '/freelancers', label: 'Browse Freelancers' },
    { href: '/dashboard/profile', label: 'My Profile', icon: 'user' },
    { href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
    { href: '/notifications', label: 'Notifications' },
  ],
  freelancer: [
    { href: '/dashboard/freelancer', label: 'Overview' },
    { href: '/tasks', label: 'Browse Tasks' },
    { href: '/dashboard/freelancer/my-proposals', label: 'My Proposals' },
    { href: '/dashboard/freelancer/wallet', label: 'Wallet' },
    { href: '/dashboard/profile', label: 'My Profile', icon: 'user' },
    { href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
    { href: '/notifications', label: 'Notifications' },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Overview' },
    { href: '/admin/approvals', label: 'Approvals' },
    { href: '/dashboard/admin/users', label: 'Manage Users' },
    { href: '/dashboard/admin/tasks', label: 'Manage Tasks' },
    { href: '/dashboard/admin/transactions', label: 'Transactions' },
    { href: '/dashboard/admin/withdrawals', label: 'Withdrawals' },
    { href: '/dashboard/admin/reviews', label: 'Reviews' },
    { href: '/dashboard/profile', label: 'My Profile', icon: 'user' },
    { href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
    { href: '/notifications', label: 'Notifications' },
  ],
};

function iconFor(kind) {
  if (kind === 'user') return <User size={18} aria-hidden="true" />;
  if (kind === 'settings') return <SettingsIcon size={18} aria-hidden="true" />;
  return null;
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

function isActiveRoute(pathname, href) {
  return pathname === href;
}

export default function DashboardSidebar({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  if (!user) return null;

  const nav = navByRole[user.role] || [];
  const avatar =
    user.image ||
    'https://placehold.co/80x80?text=' + encodeURIComponent((user.name || 'U')[0]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <div className="min-h-screen flex bg-bg relative">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden md:flex fixed top-6 left-6 z-50 p-2.5 rounded-xl bg-surface border border-line shadow-soft text-muted hover:text-ink hover:bg-slate-50 transition-all cursor-pointer items-center justify-center"
          title="Open sidebar"
          aria-label="Open sidebar"
        >
          <MenuIcon />
        </button>
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-line bg-surface p-5 hidden md:flex md:flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-slate-100 transition-colors cursor-pointer"
            title="Hide sidebar"
            aria-label="Hide sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="space-y-1 flex-1 min-h-0 overflow-y-auto">
          {nav.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            const icon = iconFor(item.icon);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand/10 text-brand font-semibold'
                    : 'text-muted hover:text-ink hover:bg-slate-50'
                }`}
              >
                {icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-line flex items-center gap-3">
          <NotificationBell />
          <span className="relative inline-block">
            <img
              src={avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border border-line"
            />
            {(user?.isApproved === true || user?.approvalStatus === 'approved') && (
              <span
                aria-label="Verified"
                title="Verified account"
                className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center ring-2 ring-surface"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.42L8.5 12.086l6.79-6.796a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate text-sm text-ink">
              {user.name}
            </div>
            <span className="inline-block mt-0.5 text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand">
              {user.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="text-muted hover:text-ink cursor-pointer"
            aria-label="Log out"
          >
            <LogoutIcon />
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed inset-x-0 top-0 z-40 bg-surface/95 backdrop-blur border-b border-line">
        <div className="flex items-center justify-between px-4 h-14">
          <Logo />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand">
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              title="Log out"
              className="text-muted hover:text-ink cursor-pointer"
              aria-label="Log out"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
          {nav.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            const icon = iconFor(item.icon);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand/10 text-brand font-semibold'
                    : 'text-muted hover:text-ink bg-slate-50'
                }`}
              >
                {icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <main
        className={`flex-1 min-w-0 pt-28 md:pt-0 transition-all duration-300 ease-in-out ${
          isOpen ? 'md:ml-64' : 'md:ml-0 md:pl-16'
        }`}
      >
        {children}
      </main>
    </div>
  );
}