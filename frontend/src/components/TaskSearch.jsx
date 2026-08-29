'use client';

import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';

export default function TaskSearch({ initial = '', category = '' }) {
  const router = useRouter();

  const submit = (q) => {
    const qs = new URLSearchParams();
    if (q) qs.set('search', q);
    if (category) qs.set('category', category);
    router.push(`/tasks?${qs.toString()}`);
  };

  return (
    <SearchBar
      initialValue={initial}
      placeholder="Search tasks by title, skill or keyword…"
      onSubmit={submit}
    />
  );
}
