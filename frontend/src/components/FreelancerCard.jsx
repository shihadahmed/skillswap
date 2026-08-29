import Link from 'next/link';

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function VerifyBadge({ ok, label }) {
  if (!ok) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <CheckIcon /> {label}
    </span>
  );
}

export default function FreelancerCard({ freelancer }) {
  const f = freelancer || {};
  const name = f.name || 'Freelancer';
  const avatar = f.avatar;
  const rate = f.hourly_rate?.amount ? `$${f.hourly_rate.amount}/hr` : null;
  const location = [f.location?.city, f.location?.country]
    .filter(Boolean)
    .join(', ');
  const v = f.verification || {};
  const snippet =
    f.bio && f.bio.length > 110 ? f.bio.slice(0, 110) + '…' : f.bio || '';

  return (
    <Link
      href={`/freelancers/${f.id}`}
      className="group flex flex-col bg-surface border border-line rounded-2xl p-6 shadow-soft hover:border-brand/50 hover:shadow-glow transition-all"
    >
      <div className="flex items-start gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-14 w-14 rounded-full object-cover border border-line"
          />
        ) : (
          <span className="h-14 w-14 rounded-full bg-brand/10 text-brand flex items-center justify-center text-lg font-bold">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-ink truncate group-hover:text-brand transition-colors">
              {name}
            </p>
            {f.badge && (
              <span className="text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                {f.badge}
              </span>
            )}
          </div>
          {f.headline && (
            <p className="text-sm text-muted mt-0.5 line-clamp-2">{f.headline}</p>
          )}
        </div>
      </div>

      {snippet && (
        <p className="mt-3 text-sm text-muted line-clamp-3 flex-1">{snippet}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(f.skills || []).slice(0, 4).map((s) => (
          <span
            key={s}
            className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-line flex gap-2">
        <div className="flex-1">
          <p className="text-[11px] text-muted">Rate</p>
          <p className="text-sm font-semibold text-ink">{rate || '—'}</p>
        </div>
        <div className="flex-1">
          <p className="text-[11px] text-muted">Success</p>
          <p className="text-sm font-semibold text-ink">
            {f.job_success_rate || '—'}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-[11px] text-muted">Jobs</p>
          <p className="text-sm font-semibold text-ink">
            {f.total_completed_jobs || 0}
          </p>
        </div>
      </div>

      {(f.experience_level || f.total_earned || (f.availability && f.availability.status)) && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          {f.experience_level && (
            <span>
              Experience:{' '}
              <span className="text-ink font-medium">{f.experience_level}</span>
            </span>
          )}
          {f.total_earned && (
            <span>
              Earned: <span className="text-ink font-medium">{f.total_earned}</span>
            </span>
          )}
          {f.availability?.status && (
            <span className="capitalize text-emerald-600 font-medium">
              ● {f.availability.status}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-muted truncate">{location || '—'}</span>
        {(v.identity_verified || v.payment_verified || v.phone_verified) && (
          <div className="flex flex-wrap gap-1">
            <VerifyBadge ok={v.identity_verified} label="ID" />
            <VerifyBadge ok={v.payment_verified} label="Pay" />
            <VerifyBadge ok={v.phone_verified} label="Phone" />
          </div>
        )}
      </div>
    </Link>
  );
}
