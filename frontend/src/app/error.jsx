'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 text-center">
      <div className="max-w-md">
        <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-danger/10 text-danger text-3xl">
          !
        </div>
        <h1 className="mt-5 text-3xl font-extrabold text-ink">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted">
          {error?.message || 'An unexpected error occurred on this page.'}
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-line bg-surface hover:border-brand/50 text-ink px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
