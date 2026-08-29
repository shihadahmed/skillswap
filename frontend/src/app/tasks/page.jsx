import TasksBrowser from '@/components/TasksBrowser';
import { API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function getTasks(searchParams) {
  const params = new URLSearchParams();
  if (searchParams?.search) params.set('search', searchParams.search);
  if (searchParams?.category) params.set('category', searchParams.category);
  // Shuffle the default browse view so cards change on every reload.
  if (!searchParams?.search && !searchParams?.category)
    params.set('shuffle', '1');
  if (searchParams?.page) params.set('page', searchParams.page);
  params.set('limit', '9');
  try {
    const res = await fetch(`${API_URL}/tasks?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return { tasks: [], total: 0, totalPages: 1, page: 1 };
    return await res.json();
  } catch {
    return { tasks: [], total: 0, totalPages: 1, page: 1 };
  }
}

export default async function TasksPage({ searchParams }) {
  const data = await getTasks(searchParams);

  return (
    <TasksBrowser
      initial={{
        tasks: data.tasks || [],
        total: data.total || 0,
        totalPages: data.totalPages || 1,
        page: Number(data.page) || 1,
      }}
      initialSearch={searchParams?.search || ''}
      initialCategory={searchParams?.category || ''}
    />
  );
}
