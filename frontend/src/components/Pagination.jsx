'use client';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Build a page-number array with ellipsis for large ranges.
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  const base =
    'min-w-[34px] h-9 px-2 rounded-lg text-sm font-medium border transition-colors';
  const normal =
    'border-line text-muted hover:text-ink hover:border-brand/40 bg-surface';
  const activeCls = 'border-brand bg-brand text-white';

  // Scroll back to the top of the results whenever the page changes, so the
  // first item of the new page is always in view (mirrors the browse pages).
  const goTo = (p) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onPageChange(p);
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page === 1}
        className={`${base} ${normal} disabled:opacity-40`}
        aria-label="Previous page"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-2 text-muted select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`${base} ${p === page ? activeCls : normal}`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => goTo(page + 1)}
        disabled={page === totalPages}
        className={`${base} ${normal} disabled:opacity-40`}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}
