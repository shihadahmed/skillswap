// Reusable skeleton loaders tailored to each surface (cards, stat boxes,
// table rows). They replace generic full-page spinners so the layout stays
// stable while dynamic data streams in.

function Shimmer({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] rounded ${className}`}
    />
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="flex flex-col bg-surface border border-line rounded-2xl p-6 shadow-soft">
      <div className="flex items-center justify-between gap-3 mb-3">
        <Shimmer className="h-5 w-20 rounded-full" />
        <Shimmer className="h-5 w-16 rounded-full" />
      </div>
      <Shimmer className="h-5 w-3/4" />
      <Shimmer className="h-3 w-full mt-3" />
      <Shimmer className="h-3 w-5/6 mt-2" />
      <Shimmer className="h-3 w-2/3 mt-2" />
      <div className="mt-5 flex items-center gap-2 pt-4 border-t border-line">
        <Shimmer className="h-8 w-8 rounded-full" />
        <div className="flex-1">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-2.5 w-16 mt-1.5" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-4 w-14" />
      </div>
    </div>
  );
}

export function FreelancerCardSkeleton() {
  return (
    <div className="flex flex-col bg-surface border border-line rounded-2xl p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <Shimmer className="h-14 w-14 rounded-full" />
        <div className="flex-1">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-3 w-40 mt-2" />
        </div>
      </div>
      <Shimmer className="h-3 w-full mt-4" />
      <Shimmer className="h-3 w-5/6 mt-2" />
      <div className="flex gap-1.5 mt-3">
        <Shimmer className="h-5 w-14 rounded-full" />
        <Shimmer className="h-5 w-16 rounded-full" />
        <Shimmer className="h-5 w-12 rounded-full" />
      </div>
      <div className="mt-4 pt-4 border-t border-line grid grid-cols-3 gap-2">
        <Shimmer className="h-8" />
        <Shimmer className="h-8" />
        <Shimmer className="h-8" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="bg-surface border border-line rounded-2xl p-4 shadow-soft">
      <Shimmer className="h-3 w-20" />
      <Shimmer className="h-7 w-16 mt-2" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }) {
  return (
    <tr className="border-b border-line last:border-0">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <Shimmer className="h-4 w-full max-w-[160px]" />
        </td>
      ))}
    </tr>
  );
}

export function ListSkeleton({ count = 3, Row }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface border border-line rounded-2xl p-4">
          <Row />
        </div>
      ))}
    </div>
  );
}

// Grid of card skeletons used by browse pages.
export function CardGridSkeleton({ count = 6, Card = TaskCardSkeleton }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} />
      ))}
    </div>
  );
}

// Row skeleton grid for table-based dashboards.
export function TableSkeleton({ cols = 5, rows = 6 }) {
  return (
    <div className="overflow-x-auto bg-surface border border-line rounded-2xl">
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mt-8">
      {Array.from({ length: count }).map((_, i) => (
        <StatSkeleton key={i} />
      ))}
    </div>
  );
}
