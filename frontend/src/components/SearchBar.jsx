'use client';

import { useState } from 'react';

export default function SearchBar({
  initialValue = '',
  placeholder = 'Search…',
  onSubmit,
  className = '',
}) {
  const [value, setValue] = useState(initialValue);

  const submit = (e) => {
    e.preventDefault();
    onSubmit(value.trim());
  };

  return (
    <form onSubmit={submit} className={`w-full ${className}`}>
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2 shadow-sm transition-all focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/40">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-muted shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 h-9 px-5 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
