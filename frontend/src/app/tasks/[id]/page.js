import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function getTask(id) {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.task;
  } catch {
    return null;
  }
}

const statusLabel = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
};
const statusStyles = {
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default async function TaskDetailPage({ params }) {
  const task = await getTask(params.id);
  if (!task) notFound();

  const client = task.client || {};
  const clientName = client.name || task.client_email || 'Client';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/tasks"
        className="text-sm text-muted hover:text-brand font-medium"
      >
        ← Back to tasks
      </Link>

      <div className="mt-6 bg-surface border border-line rounded-2xl p-8 shadow-soft">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center rounded-full bg-accent/10 text-accent text-xs font-semibold px-3 py-1">
            {task.category || 'General'}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              statusStyles[task.status] || statusStyles.open
            }`}
          >
            {statusLabel[task.status] || task.status}
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-ink">{task.title}</h1>

        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {task.budget != null && (
            <div>
              <p className="text-muted">Budget</p>
              <p className="text-lg font-bold text-ink">
                ${Number(task.budget).toLocaleString()}
              </p>
            </div>
          )}
          {task.deadline && (
            <div>
              <p className="text-muted">Deadline</p>
              <p className="font-semibold text-ink">
                {new Date(task.deadline).toLocaleDateString()}
              </p>
            </div>
          )}
          <div>
            <p className="text-muted">Proposals</p>
            <p className="font-semibold text-ink">{task.proposals_count || 0}</p>
          </div>
        </div>

        <hr className="my-6 border-line" />

        <h2 className="text-lg font-bold text-ink mb-2">Description</h2>
        <p className="text-muted leading-relaxed whitespace-pre-line">
          {task.description}
        </p>

        {/* Client card */}
        <div className="mt-8 flex items-center gap-4 bg-bg border border-line rounded-xl p-4">
          {client.image ? (
            <img
              src={client.image}
              alt={clientName}
              className="h-12 w-12 rounded-full object-cover border border-line"
            />
          ) : (
            <span className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
              {clientName.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-semibold text-ink">{clientName}</p>
            {client.location && (
              <p className="text-sm text-muted">{client.location}</p>
            )}
            {client.rating ? (
              <p className="text-sm text-amber-500">★ {client.rating}</p>
            ) : null}
          </div>
        </div>

        {/* Apply CTA (full proposal flow lands in Phase 6) */}
        <div className="mt-8">
          <Link
            href="/register"
            className="inline-block bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold shadow-glow transition-colors"
          >
            Apply to this task
          </Link>
          <p className="mt-2 text-xs text-muted">
            Freelancers can send a proposal after signing in.
          </p>
        </div>
      </div>
    </div>
  );
}
