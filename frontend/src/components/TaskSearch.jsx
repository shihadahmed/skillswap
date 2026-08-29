'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function TaskSearch({ initial = '', category = '' }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const params = useSearchParams();

  const submit = (e) => {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (value.trim()) qs.set('search', value.trim());
    if (category) qs.set('category', category);
    router.push(`/tasks?${qs.toString()}`);
  };

  return (
    <form onSubmit={submit} className="flex gap-2 max-w-xl">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search tasks by title or keyword…"
        className="flex-1 min-w-0 h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
      <button
        type="submit"
        className="shrink-0 h-11 px-5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Search
      </button>
    </form>
  );
}
