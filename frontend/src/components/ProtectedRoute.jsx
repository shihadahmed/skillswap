'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function dashboardPath(role) {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'freelancer') return '/dashboard/freelancer';
  return '/dashboard/client';
}

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (roles && !roles.includes(user.role)) {
      router.replace(dashboardPath(user.role));
    }
  }, [loading, user, roles, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted">
        Loading…
      </div>
    );
  }
  if (!user) return null;
  if (roles && !roles.includes(user.role)) return null;

  return children;
}
