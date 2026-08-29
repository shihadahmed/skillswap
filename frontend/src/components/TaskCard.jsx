'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const statusStyles = {
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
};
const statusLabel = { open: 'Open', in_progress: 'In Progress', completed: 'Completed' };

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

export default function TaskCard({ task }) {
  const { user } = useAuth();
  const isAuthed = !!user;

  const {
    _id,
    title,
    category,
    description,
    budget,
    status = 'open',
    priority,
    project_type,
    experience_level,
    estimated_duration,
    skills = [],
    posted,
    proposals_count = 0,
    client,
    client_email,
  } = task || {};

  const clientName = client?.name || client_email || 'Client';
  const clientRating = client?.rating;
  const clientImg = client?.image;
  const clientLocation = client?.location;
  const clientReviews = client?.reviews_count;
  const budgetText = formatBudget(budget);

  const snippet =
    description && description.length > 150
      ? description.slice(0, 150) + '…'
      : description || '';

  const meta = [project_type, experience_level, estimated_duration]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      href={`/tasks/${_id}`}
      className="group flex flex-col bg-surface border border-line rounded-2xl p-6 shadow-soft hover:border-brand/50 hover:shadow-glow transition-all"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-accent/10 text-accent text-xs font-semibold px-3 py-1">
            {category || 'General'}
          </span>
          {priority && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                priorityStyles[priority] || priorityStyles.low
              }`}
            >
              {priority}
            </span>
          )}
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
            statusStyles[status] || statusStyles.open
          }`}
        >
          {statusLabel[status] || status}
        </span>
      </div>

      <h3 className="text-lg font-bold text-ink group-hover:text-brand transition-colors line-clamp-2">
        {title}
      </h3>

      {snippet && (
        <p className="mt-2 text-sm text-muted line-clamp-3 flex-1">{snippet}</p>
      )}

      {skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {meta && <p className="mt-3 text-xs text-muted">{meta}</p>}

      {/* Client row — always visible */}
      <div className="mt-5 flex items-center gap-2 min-w-0 pt-4 border-t border-line">
        {clientImg ? (
          <img
            src={clientImg}
            alt={clientName}
            className="h-8 w-8 rounded-full object-cover border border-line"
          />
        ) : (
          <span className="h-8 w-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold">
            {clientName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink truncate">{clientName}</p>
          <p className="text-xs text-muted truncate">
            {clientRating ? (
              <span className="text-amber-500 font-semibold">
                ★ {clientRating}
              </span>
            ) : null}
            {clientReviews != null ? ` · ${clientReviews} reviews` : ''}
            {clientRating && clientLocation ? ' · ' : ''}
            {clientLocation || ''}
          </p>
        </div>
      </div>

      {/* Rich client stats — only when logged in */}
      {isAuthed && (
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs border-t border-line pt-3">
          {client?.joined_date && (
            <div>
              <p className="text-muted">Member since</p>
              <p className="font-semibold text-ink">
                {client.joined_date.split('/').pop()}
              </p>
            </div>
          )}
          {client?.total_spent && (
            <div>
              <p className="text-muted">Total spent</p>
              <p className="font-semibold text-ink">{client.total_spent}</p>
            </div>
          )}
          {client?.hire_rate && (
            <div>
              <p className="text-muted">Hire rate</p>
              <p className="font-semibold text-ink">{client.hire_rate}</p>
            </div>
          )}
          {client?.jobs_posted != null && (
            <div>
              <p className="text-muted">Jobs posted</p>
              <p className="font-semibold text-ink">{client.jobs_posted}</p>
            </div>
          )}
          {client?.active_jobs != null && (
            <div>
              <p className="text-muted">Active jobs</p>
              <p className="font-semibold text-ink">{client.active_jobs}</p>
            </div>
          )}
          {client?.reviews_count != null && (
            <div>
              <p className="text-muted">Reviews</p>
              <p className="font-semibold text-ink">{client.reviews_count}</p>
            </div>
          )}
        </div>
      )}

      {/* Verification badges — only when logged in */}
      {isAuthed && client?.verifications && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {client.verifications.payment_verified && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Payment Verified
            </span>
          )}
          {client.verifications.identity_verified && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Identity Verified
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-muted">Posted {posted || '—'}</span>
        {budgetText ? (
          <span className="text-sm font-bold text-ink">{budgetText}</span>
        ) : null}
      </div>

      <p className="mt-1 text-xs text-muted text-right">
        {proposals_count} proposal{proposals_count === 1 ? '' : 's'}
      </p>
    </Link>
  );
}
