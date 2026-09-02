'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PaymentCancelPage() {
  const params = useSearchParams();
  const taskId = params.get('task_id');

  return (
    <div className="min-h-screen bg-bg grid place-items-center py-12 px-4">
      <div className="max-w-xl w-full bg-surface border border-line rounded-3xl shadow-soft p-8 sm:p-10 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/15 grid place-items-center">
          <span className="text-3xl">↩</span>
        </div>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-ink">
          Payment canceled
        </h1>
        <p className="mt-2 text-muted text-sm">
          You haven&apos;t been charged. The task is still waiting for the
          freelancer to deliver — try again whenever you&apos;re ready.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {taskId ? (
            <Link
              href={`/tasks/${taskId}`}
              className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
            >
              Back to task
            </Link>
          ) : (
            <Link
              href="/dashboard/client/my-tasks"
              className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
            >
              Back to my tasks
            </Link>
          )}
          <Link
            href="/"
            className="border border-line text-ink hover:bg-slate-50 px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
