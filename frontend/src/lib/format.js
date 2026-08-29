export function fmtBudget(b) {
  if (b == null) return '—';
  const amt = typeof b === 'object' ? b.amount : b;
  if (amt == null) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amt);
  } catch {
    return '$' + amt;
  }
}

export const statusStyles = {
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const statusLabel = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
};
