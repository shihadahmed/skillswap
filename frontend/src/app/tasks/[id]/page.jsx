import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_URL } from '@/lib/api';
import ProposalForm from '@/components/ProposalForm';
import ProposalManager from '@/components/ProposalManager';
import TaskCheckout from '@/components/TaskCheckout';

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
  pending: 'Pending Review',
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};
const statusStyles = {
  pending: 'bg-purple-50 text-purple-700 border-purple-200',
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-slate-200 text-slate-600 border-slate-300',
};

const priorityStyles = {
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
};

function formatBudget(budget) {
  if (budget == null) return null;
  const amount = typeof budget === 'object' ? budget.amount : budget;
  if (amount == null) return null;
  const currency = (typeof budget === 'object' && budget.currency) || 'USD';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency === 'USD' ? '$' : ''}${amount}`;
  }
}

function formatDeadline(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (!isNaN(d.getTime())) return d.toLocaleDateString();
  return deadline; // already a formatted string like "20/09/2026"
}

const svg = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-4 w-4',
};

const CalendarIcon = () => (
  <svg {...svg}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const DollarIcon = () => (
  <svg {...svg}>
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const PercentIcon = () => (
  <svg {...svg}>
    <path d="M19 5 5 19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg {...svg}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const PulseIcon = () => (
  <svg {...svg}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
const StarIcon = () => (
  <svg {...svg}>
    <path d="M12 2l3 6.5 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5l7-.5z" />
  </svg>
);
const CheckIcon = () => (
  <svg {...svg}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function Stat({ icon, label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-brand">{icon}</span>
      <div className="leading-tight">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-semibold text-ink mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function VerifyBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
      <CheckIcon /> {children}
    </span>
  );
}

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
          {task.priority && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                priorityStyles[task.priority] || priorityStyles.low
              }`}
            >
              {task.priority}
            </span>
          )}
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
          {formatBudget(task.budget) && (
            <div>
              <p className="text-muted">Budget</p>
              <p className="text-lg font-bold text-ink">
                {formatBudget(task.budget)}
              </p>
            </div>
          )}
          {formatDeadline(task.deadline) && (
            <div>
              <p className="text-muted">Deadline</p>
              <p className="font-semibold text-ink">
                {formatDeadline(task.deadline)}
              </p>
            </div>
          )}
          <div>
            <p className="text-muted">Proposals</p>
            <p className="font-semibold text-ink">{task.proposals_count || 0}</p>
          </div>
        </div>

        {(task.priority || task.urgency || task.experience_level || task.project_type || task.estimated_duration) && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {task.priority && (
              <div>
                <p className="text-muted text-sm">Priority</p>
                <p className="font-semibold text-ink capitalize">{task.priority}</p>
              </div>
            )}
            {task.urgency && (
              <div>
                <p className="text-muted text-sm">Urgency</p>
                <p className="font-semibold text-ink capitalize">{task.urgency}</p>
              </div>
            )}
            {task.experience_level && (
              <div>
                <p className="text-muted text-sm">Experience</p>
                <p className="font-semibold text-ink">{task.experience_level}</p>
              </div>
            )}
            {task.project_type && (
              <div>
                <p className="text-muted text-sm">Project type</p>
                <p className="font-semibold text-ink">{task.project_type}</p>
              </div>
            )}
            {task.estimated_duration && (
              <div>
                <p className="text-muted text-sm">Duration</p>
                <p className="font-semibold text-ink">{task.estimated_duration}</p>
              </div>
            )}
          </div>
        )}

        {task.skills?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-ink mb-2">Skills required</h2>
            <div className="flex flex-wrap gap-2">
              {task.skills.map((s) => (
                <span
                  key={s}
                  className="text-sm bg-accent/10 text-accent px-3 py-1 rounded-full font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <hr className="my-6 border-line" />

        <h2 className="text-lg font-bold text-ink mb-2">Description</h2>
        <p className="text-muted leading-relaxed whitespace-pre-line">
          {task.description}
        </p>

        {/* Client card */}
        <div className="mt-8 bg-bg border border-line rounded-2xl p-5">
          <div className="flex items-center gap-4">
            {client.image ? (
              <img
                src={client.image}
                alt={clientName}
                className="h-14 w-14 rounded-full object-cover border border-line"
              />
            ) : (
              <span className="h-14 w-14 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xl font-bold">
                {clientName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="font-bold text-ink">{clientName}</p>
              {client.location && (
                <p className="text-sm text-muted">{client.location}</p>
              )}
              {client.rating ? (
                <p className="text-sm text-amber-500 font-semibold">
                  ★ {client.rating}
                  {client.reviews_count ? (
                    <span className="text-muted font-normal">
                      {' '}
                      ({client.reviews_count} reviews)
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>
          </div>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-3">
                <Stat
                  icon={<CalendarIcon />}
                  label="Member since"
                  value={client.joined_date?.split('/').pop()}
                />
                <Stat
                  icon={<DollarIcon />}
                  label="Total spent"
                  value={client.total_spent}
                />
                <Stat
                  icon={<PercentIcon />}
                  label="Hire rate"
                  value={client.hire_rate}
                />
                <Stat
                  icon={<BriefcaseIcon />}
                  label="Jobs posted"
                  value={client.jobs_posted}
                />
                <Stat
                  icon={<PulseIcon />}
                  label="Active jobs"
                  value={client.active_jobs}
                />
                <Stat
                  icon={<StarIcon />}
                  label="Reviews"
                  value={client.reviews_count}
                />
              </div>

              {client.verifications &&
                (client.verifications.payment_verified ||
                  client.verifications.identity_verified) && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {client.verifications.payment_verified && (
                      <VerifyBadge>Payment Verified</VerifyBadge>
                    )}
                    {client.verifications.identity_verified && (
                      <VerifyBadge>Identity Verified</VerifyBadge>
                    )}
                  </div>
                )}
        </div>

        {/* Apply / manage area */}
        <div className="mt-8">
          <ProposalForm taskId={task._id} taskTitle={task.title} />
          <div className="mt-6">
            <ProposalManager
              taskId={task._id}
              ownerEmail={task.client_email || task.client?.email}
            />
          </div>
        </div>

        <div className="mt-6">
          <Suspense fallback={null}>
            <TaskCheckout
              taskId={task._id}
              clientEmail={task.client_email}
              status={task.status}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
