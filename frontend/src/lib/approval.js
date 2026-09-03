'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function isApprovedUser(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.isApproved === true || user.approvalStatus === 'approved';
}

export function useApproval() {
  const { user } = useAuth();
  return { user, approved: isApprovedUser(user) };
}

export function approvalBlockMessage() {
  return 'Your account is pending verification. Please complete your profile and get admin approval to unlock this action.';
}

export function requireApprovalToast(toast) {
  if (toast && typeof toast.error === 'function') {
    toast.error(approvalBlockMessage());
  }
}

export default function VerificationBanner() {
  const { user, approved } = useApproval();
  if (approved || !user || user.role === 'admin') return null;
  const href = user.role === 'freelancer' ? '/onboarding/freelancer' : '/onboarding/client';
  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="text-sm">
        <p className="font-semibold">Your account is not verified yet.</p>
        <p className="mt-1">
          Please complete your profile and get admin approval to unlock hiring,
          posting tasks, payments, and withdrawals.
        </p>
      </div>
      <Link
        href={href}
        className="self-start sm:self-auto whitespace-nowrap rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-sm font-semibold"
      >
        Complete profile
      </Link>
    </div>
  );
}
