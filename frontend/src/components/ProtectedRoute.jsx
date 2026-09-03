'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export function dashboardPath(role) {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'freelancer') return '/dashboard/freelancer';
  return '/dashboard/client';
}

export function onboardingPath(role) {
  if (role === 'freelancer') return '/onboarding/freelancer';
  return '/onboarding/client';
}

function isVerifiedOrComplete(user) {
  return (
    user.isApproved === true ||
    user.approvalStatus === 'approved' ||
    user.isProfileComplete === true
  );
}

export function postLoginPath(user) {
  if (!user) return '/login';
  if (user.role === 'admin') return dashboardPath('admin');
  if (!isVerifiedOrComplete(user)) return onboardingPath(user.role);
  return dashboardPath(user.role);
}

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const needsOnboarding =
    !!user &&
    user.role !== 'admin' &&
    !isVerifiedOrComplete(user) &&
    !(pathname || '').startsWith('/onboarding');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (roles && !roles.includes(user.role)) {
      toast.error('Access denied! You do not have permission to view this dashboard.');
      router.replace(dashboardPath(user.role));
      return;
    }
    if (needsOnboarding) {
      router.replace(onboardingPath(user.role));
    }
  }, [loading, user, roles, router, pathname, needsOnboarding]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted">
        Loading…
      </div>
    );
  }
  if (!user) return null;
  if (roles && !roles.includes(user.role)) return null;
  if (needsOnboarding) return null;

  return children;
}
