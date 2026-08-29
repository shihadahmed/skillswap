'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 text-center">
      <div>
        <h1 className="text-3xl font-extrabold text-ink">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="mt-6 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
