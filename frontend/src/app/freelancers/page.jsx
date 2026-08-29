import { API_URL } from '@/lib/api';
import FreelancersBrowser from '@/components/FreelancersBrowser';

export const dynamic = 'force-dynamic';

async function getInitial(searchParams) {
  const params = new URLSearchParams();
  if (searchParams?.search) params.set('search', searchParams.search);
  params.set('page', searchParams?.page || '1');
  params.set('limit', '9');
  try {
    const res = await fetch(`${API_URL}/freelancers?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return { freelancers: [], page: 1, totalPages: 1, total: 0 };
    return await res.json();
  } catch {
    return { freelancers: [], page: 1, totalPages: 1, total: 0 };
  }
}

export default async function FreelancersPage({ searchParams }) {
  const initial = await getInitial(searchParams);
  return (
    <FreelancersBrowser
      initial={initial}
      initialQuery={searchParams?.search || ''}
    />
  );
}
