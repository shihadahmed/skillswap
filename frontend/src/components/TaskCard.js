import Link from 'next/link';

const statusStyles = {
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
};
const statusLabel = { open: 'Open', in_progress: 'In Progress', completed: 'Completed' };

export default function TaskCard({ task }) {
  const {
    _id,
    title,
    category,
    description,
    budget,
    status = 'open',
    proposals_count = 0,
    client,
    client_email,
  } = task || {};

  const clientName = client?.name || client_email || 'Client';
  const clientRating = client?.rating;
  const clientImg = client?.image;

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
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
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

      <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-line">
        <div className="flex items-center gap-2 min-w-0">
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
            {clientRating ? (
              <p className="text-xs text-amber-500">★ {clientRating}</p>
            ) : null}
          </div>
        </div>

        <div className="text-right shrink-0">
          {budget != null ? (
            <p className="text-sm font-bold text-ink">
              ${Number(budget).toLocaleString()}
            </p>
          ) : null}
          <p className="text-xs text-muted">
            {proposals_count} proposal{proposals_count === 1 ? '' : 's'}
          </p>
        </div>
      </div>
    </Link>
  );
}
