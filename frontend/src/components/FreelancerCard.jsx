import Link from 'next/link';

function Stars({ rating = 0 }) {
  const full = Math.round(Number(rating) || 0);
  return (
    <span className="text-amber-400 text-sm" title={`${rating} / 5`}>
      {'★'.repeat(full)}
      <span className="text-line">{'★'.repeat(Math.max(0, 5 - full))}</span>
    </span>
  );
}

export default function FreelancerCard({ user }) {
  const {
    _id,
    name,
    image,
    rating = 0,
    skills = [],
    bio,
    hourlyRate,
    jobsCompleted = 0,
    role,
  } = user || {};

  if (role !== 'freelancer') return null;

  const snippet = bio && bio.length > 90 ? bio.slice(0, 90) + '…' : bio || '';

  return (
    <Link
      href={`/profile/${_id}`}
      className="group flex flex-col bg-surface border border-line rounded-2xl p-6 shadow-soft hover:border-brand/50 hover:shadow-glow transition-all"
    >
      <div className="flex items-center gap-3">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-12 w-12 rounded-full object-cover border border-line"
          />
        ) : (
          <span className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
            {name?.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate group-hover:text-brand transition-colors">
            {name}
          </p>
          <Stars rating={rating} />
        </div>
      </div>

      {snippet && (
        <p className="mt-3 text-sm text-muted line-clamp-2 flex-1">{snippet}</p>
      )}

      {skills.length > 0 && (
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

      <div className="mt-4 pt-4 border-t border-line flex items-center justify-between text-sm">
        <span className="text-muted">
          {jobsCompleted} job{jobsCompleted === 1 ? '' : 's'} done
        </span>
        {hourlyRate ? (
          <span className="font-semibold text-ink">${hourlyRate}/hr</span>
        ) : null}
      </div>
    </Link>
  );
}
