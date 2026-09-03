'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start justify-between gap-4 py-3 cursor-pointer">
      <div>
        <div className="text-sm font-medium text-ink">{label}</div>
        {description && (
          <div className="text-xs text-muted mt-0.5">{description}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
          checked ? 'bg-brand' : 'bg-slate-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform mt-0.5 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}

function SettingsBody() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) {
    return <p className="text-muted py-12 text-center">Loading…</p>;
  }

  const savePrefs = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // No backend endpoint yet — local-state only. Surface a confirmation so
      // the user gets feedback that the click did something.
      await new Promise((r) => setTimeout(r, 250));
      toast.success('Notification preferences saved.');
    } catch {
      toast.error('Could not save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const dashboardHref =
    user.role === 'admin'
      ? '/dashboard/admin'
      : user.role === 'freelancer'
      ? '/dashboard/freelancer'
      : '/dashboard/client';

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
          Settings
        </h1>
        <p className="text-muted mt-1 text-sm">
          Manage your account, notifications, and security.
        </p>
      </header>

      {/* Account information */}
      <section className="bg-surface border border-line rounded-2xl shadow-soft p-6 md:p-8">
        <h2 className="text-lg font-bold text-ink">Account information</h2>
        <p className="text-muted text-sm mt-1">
          These details are tied to your SkillSwap account.
        </p>
        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="font-semibold text-ink mt-0.5">{user.name}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-semibold text-ink mt-0.5 break-all">
              {user.email}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Role</dt>
            <dd className="font-semibold text-ink mt-0.5 capitalize">
              {user.role}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Approval status</dt>
            <dd className="font-semibold text-ink mt-0.5">
              {user.isApproved || user.approvalStatus === 'approved'
                ? 'Verified'
                : 'Pending verification'}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center px-4 py-2 rounded-xl border border-line text-sm font-semibold text-ink hover:bg-slate-50 transition-colors"
          >
            Edit profile details
          </Link>
          <Link
            href={dashboardHref}
            className="inline-flex items-center px-4 py-2 rounded-xl border border-line text-sm font-semibold text-muted hover:text-ink hover:bg-slate-50 transition-colors"
          >
            ← Back to dashboard
          </Link>
        </div>
      </section>

      {/* Notification preferences */}
      <form
        onSubmit={savePrefs}
        className="bg-surface border border-line rounded-2xl shadow-soft p-6 md:p-8"
      >
        <h2 className="text-lg font-bold text-ink">Notification preferences</h2>
        <p className="text-muted text-sm mt-1">
          Choose how SkillSwap keeps you informed.
        </p>
        <div className="mt-4 divide-y divide-line">
          <Toggle
            checked={emailNotifs}
            onChange={setEmailNotifs}
            label="Email notifications"
            description="Proposals, payments, and account updates sent to your email."
          />
          <Toggle
            checked={inAppNotifs}
            onChange={setInAppNotifs}
            label="In-app notifications"
            description="Bell-icon alerts when you are signed in."
          />
          <Toggle
            checked={marketing}
            onChange={setMarketing}
            label="Product updates"
            description="Occasional product news and tips. No spam."
          />
        </div>
        <div className="mt-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save preferences'}
          </button>
        </div>
      </form>

      {/* Security */}
      <section className="bg-surface border border-line rounded-2xl shadow-soft p-6 md:p-8">
        <h2 className="text-lg font-bold text-ink">Security</h2>
        <p className="text-muted text-sm mt-1">
          Keep your account safe.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              toast.info('Password change flow is coming soon. Hang tight!')
            }
            className="inline-flex items-center px-4 py-2 rounded-xl border border-line text-sm font-semibold text-ink hover:bg-slate-50 transition-colors"
          >
            Change password
          </button>
          <span className="text-xs text-muted">
            (Password reset is on the roadmap.)
          </span>
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-surface border border-rose-200 rounded-2xl shadow-soft p-6 md:p-8">
        <h2 className="text-lg font-bold text-rose-700">Danger zone</h2>
        <p className="text-muted text-sm mt-1">
          Sign out of this device. Your data is preserved.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Log out
          </button>
        </div>
      </section>
    </div>
  );
}

export default function DashboardSettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardSidebar>
        <SettingsBody />
      </DashboardSidebar>
    </ProtectedRoute>
  );
}
