'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  User,
  Settings,
  Bell,
  Search,
  FileCheck,
  Wallet,
  ShieldCheck,
  Layers,
  ArrowRightLeft,
  Banknote,
  Star,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import NotificationBell from '@/components/NotificationBell';

const NAV_CONFIG = {
  client: [
    {
      group: 'Core',
      items: [
        { href: '/dashboard/client', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/client/my-tasks', label: 'My Tasks', icon: Briefcase },
        { href: '/tasks/create', label: 'Post a Task', icon: PlusCircle },
        { href: '/freelancers', label: 'Browse Freelancers', icon: Users },
      ],
    },
    {
      group: 'Preferences',
      items: [
        { href: '/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/profile', label: 'My Profile', icon: User },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ],
    },
  ],
  freelancer: [
    {
      group: 'Core',
      items: [
        { href: '/dashboard/freelancer', label: 'Overview', icon: LayoutDashboard },
        { href: '/tasks', label: 'Find Work', icon: Search },
        { href: '/dashboard/freelancer/my-proposals', label: 'My Proposals', icon: FileCheck },
        { href: '/dashboard/freelancer/wallet', label: 'Earnings & Wallet', icon: Wallet },
      ],
    },
    {
      group: 'Preferences',
      items: [
        { href: '/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/profile', label: 'My Profile', icon: User },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ],
    },
  ],
  admin: [
    {
      group: 'Platform',
      items: [
        { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/approvals', label: 'Approvals', icon: ShieldCheck },
        { href: '/dashboard/admin/users', label: 'Manage Users', icon: Users },
        { href: '/dashboard/admin/tasks', label: 'Manage Tasks', icon: Layers },
      ],
    },
    {
      group: 'Finance & Reviews',
      items: [
        { href: '/dashboard/admin/transactions', label: 'Transactions', icon: ArrowRightLeft },
        { href: '/dashboard/admin/withdrawals', label: 'Withdrawals', icon: Banknote },
        { href: '/dashboard/admin/reviews', label: 'Reviews', icon: Star },
      ],
    },
    {
      group: 'Preferences',
      items: [
        { href: '/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/profile', label: 'My Profile', icon: User },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ],
    },
  ],
};

export default function DashboardSidebar({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navGroups = NAV_CONFIG[user.role] || [];
  const avatar =
    user.image ||
    'https://placehold.co/80x80?text=' + encodeURIComponent((user.name || 'U')[0]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <div className="min-h-screen flex bg-bg relative">
      {/* Desktop Collapsed Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden md:flex fixed top-5 left-5 z-50 p-2 rounded-xl bg-surface border border-line shadow-sm text-muted hover:text-ink hover:bg-surface-raised transition-all cursor-pointer items-center justify-center"
          title="Open sidebar"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Desktop Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-line bg-surface flex-col hidden md:flex transition-transform duration-300 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-line flex items-center justify-between">
          <Logo />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-raised transition-colors cursor-pointer"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Grouped Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted/80">
                {group.group}
              </p>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-brand text-white shadow-xs'
                          : 'text-muted hover:text-ink hover:bg-surface-raised'
                      }`}
                    >
                      <Icon
                        size={17}
                        className={`transition-colors ${
                          active ? 'text-white' : 'text-muted group-hover:text-ink'
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-line">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-raised/50 border border-line/60">
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-line"
              />
              {(user?.isApproved === true || user?.approvalStatus === 'approved') && (
                <span
                  title="Verified Account"
                  className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white rounded-full p-0.5 w-3.5 h-3.5 flex items-center justify-center ring-2 ring-surface"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
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
              <p className="font-semibold truncate text-xs text-ink">{user.name}</p>
              <span className="inline-block text-[10px] font-semibold text-brand tracking-wide capitalize">
                {user.role} workspace
              </span>
            </div>
            <NotificationBell position="dropup" />
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top App Bar */}
      <div className="md:hidden fixed inset-x-0 top-0 z-40 bg-surface/95 backdrop-blur border-b border-line px-4 h-14 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <NotificationBell position="dropdown" />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-raised"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bottom-0 z-40 bg-surface/95 backdrop-blur p-4 overflow-y-auto space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted/80">
                {group.group}
              </p>
              <div className="space-y-1 pt-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                        active
                          ? 'bg-brand text-white'
                          : 'text-muted hover:text-ink hover:bg-surface-raised'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={avatar} alt={user.name} className="w-8 h-8 rounded-full border border-line" />
              <div>
                <p className="text-xs font-semibold text-ink">{user.name}</p>
                <p className="text-[10px] text-muted capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 min-w-0 pt-16 md:pt-0 transition-all duration-300 ease-in-out ${
          isOpen ? 'md:ml-64' : 'md:ml-0'
        }`}
      >
        <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}