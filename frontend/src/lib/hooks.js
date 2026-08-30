'use client';

import useSWR, { useSWRConfig } from 'swr';
import { api } from './api';
import { fetcher } from './fetcher';

// Build a query string, skipping empty/undefined values.
function qs(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

const PAGE = 25; // server-side page size used across every dynamic listing
const ADMIN_PAGE = 25; // larger page size for admin tables

// ---------------------------------------------------------------------------
// Public / client-side listings
// ---------------------------------------------------------------------------

export function useTasks({ search = '', category = '', page = 1, shuffle = false } = {}) {
  const key = `/tasks${qs({ search, category, page, limit: PAGE, shuffle: shuffle ? 1 : '' })}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR(key, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: true,
  });
  return { data, error, isLoading, isValidating, mutate };
}

export function useFreelancers({ search = '', category = '', page = 1, shuffle = false } = {}) {
  const key = `/freelancers${qs({ search, category, page, limit: PAGE, shuffle: shuffle ? 1 : '' })}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR(key, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: true,
  });
  return { data, error, isLoading, isValidating, mutate };
}

export function useTask(id) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/tasks/${id}` : null, fetcher, {
    revalidateOnFocus: true,
  });
  return { data, error, isLoading, mutate };
}

export function useReviews(freelancer_email, page = 1) {
  const key = freelancer_email ? `/reviews${qs({ freelancer_email, page, limit: PAGE })}` : null;
  const { data, error, isLoading, isValidating, mutate } = useSWR(key, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: true,
  });
  return { data, error, isLoading, isValidating, mutate };
}

// ---------------------------------------------------------------------------
// Authenticated dashboards
// ---------------------------------------------------------------------------

export function useMyTasks(page = 1) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    `/tasks/mine${qs({ page, limit: PAGE })}`,
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: true, refreshInterval: 15000 }
  );
  return { data, error, isLoading, isValidating, mutate };
}

export function useMyProposals(page = 1) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    `/proposals/mine${qs({ page, limit: PAGE })}`,
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: true, refreshInterval: 15000 }
  );
  return { data, error, isLoading, isValidating, mutate };
}

// Parallel overview for the Client dashboard: the client's own tasks plus the
// live size of the public marketplace — fetched together so neither blocks the
// other (no sequential waterfall).
export function useClientOverview(page = 1) {
  const key = `/client/overview${qs({ page })}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    async () => {
      const [mine, market] = await Promise.all([
        api.get(`/tasks/mine${qs({ page, limit: PAGE })}`),
        api.get('/tasks?limit=1'),
      ]);
      return { mine, market };
    },
    { keepPreviousData: true, revalidateOnFocus: true, refreshInterval: 15000 }
  );
  return { data, error, isLoading, isValidating, mutate };
}

// Parallel overview for the Freelancer dashboard: the freelancer's proposals
// plus the live size of the freelancer marketplace.
export function useFreelancerOverview(page = 1) {
  const key = `/freelancer/overview${qs({ page })}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    async () => {
      const [mine, market] = await Promise.all([
        api.get(`/proposals/mine${qs({ page, limit: PAGE })}`),
        api.get('/freelancers?limit=1'),
      ]);
      return { mine, market };
    },
    { keepPreviousData: true, revalidateOnFocus: true, refreshInterval: 15000 }
  );
  return { data, error, isLoading, isValidating, mutate };
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export function useAdminStats() {
  const { data, error, isLoading, mutate } = useSWR('/admin/stats', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 15000,
  });
  return { data, error, isLoading, mutate };
}

export function useAdminUsers(page = 1) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    `/admin/users${qs({ page, limit: ADMIN_PAGE })}`,
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: true, refreshInterval: 15000 }
  );
  return { data, error, isLoading, isValidating, mutate };
}

export function useAdminTasks(page = 1) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    `/admin/tasks${qs({ page, limit: ADMIN_PAGE })}`,
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: true, refreshInterval: 15000 }
  );
  return { data, error, isLoading, isValidating, mutate };
}

export function useAdminReviews(page = 1) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    `/admin/reviews${qs({ page, limit: ADMIN_PAGE })}`,
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: true, refreshInterval: 15000 }
  );
  return { data, error, isLoading, isValidating, mutate };
}

export function useAdminTransactions(page = 1) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    `/admin/transactions${qs({ page, limit: ADMIN_PAGE })}`,
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: true, refreshInterval: 15000 }
  );
  return { data, error, isLoading, isValidating, mutate };
}

// Parallel overview for the Admin dashboard: stats + first pages of every
// management table, fetched in a single Promise.all so the overview cards and
// tables populate simultaneously instead of one after another.
export function useAdminOverview() {
  const key = `/admin/overview`;
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    async () => {
      const [stats, users, tasks, transactions] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/users${qs({ page: 1, limit: ADMIN_PAGE })}`),
        api.get(`/admin/tasks${qs({ page: 1, limit: ADMIN_PAGE })}`),
        api.get(`/admin/transactions${qs({ page: 1, limit: ADMIN_PAGE })}`),
      ]);
      return { stats, users, tasks, transactions };
    },
    { revalidateOnFocus: true, refreshInterval: 15000 }
  );
  return { data, error, isLoading, isValidating, mutate };
}

export function useExploreUsers({ q = '', skill = '', page = 1 } = {}) {
  const key = `/users/explore${qs({ q, skill, page, limit: PAGE })}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR(key, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: true,
  });
  return { data, error, isLoading, isValidating, mutate };
}

// Global revalidation helper for cross-cutting mutations (e.g. submitting a
// proposal updates both the task detail and the task listing). Passing only a
// key matcher makes SWR re-fetch (revalidate) every matching cache entry.
export function useRevalidate() {
  const { mutate } = useSWRConfig();
  return (keyMatcher) => mutate(keyMatcher);
}
