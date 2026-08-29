import Link from 'next/link';

const statusStyles = {
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
};
const statusLabel = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
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
  const {
    _id,
    title,
    category,
    description,
    budget,
    status = 'open',
    client,
    client_email,
    posted,
    proposals_count = 0,
  } = task || {};

  const clientName = client?.name || client_email || 'Client';
  const clientImg = client?.image;
  const clientRating = client?.rating;
  const clientReviews = client?.reviews_count;
  const budgetText = formatBudget(budget);

  const snippet =
    description && description.length > 150
      ? description.slice(0, 150) + '…'
      : description || '';

  return (
    <Link
      href={`/tasks/${_id}`}
      className="group flex flex-col bg-surface border border-line rounded-2xl p-6 shadow-soft hover:border-brand/50 hover:shadow-glow transition-all"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="inline-flex items-center rounded-full bg-accent/10 text-accent text-xs font-semibold px-3 py-1">
          {category || 'General'}
        </span>
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
              <span className="text-amber-400 font-semibold">
                ★ {clientRating}
              </span>
            ) : null}
            {clientReviews != null ? ` · ${clientReviews} reviews` : ''}
          </p>
        </div>
      </div>

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
