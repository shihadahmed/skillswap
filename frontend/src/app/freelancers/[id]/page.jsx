import Link from 'next/link';
import { notFound } from 'next/navigation';
import { API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function getFreelancer(id) {
  try {
    const res = await fetch(`${API_URL}/freelancers/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

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
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
      <CheckIcon /> {label}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-bg border border-line rounded-xl p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-lg font-bold text-ink mt-1">{value || '—'}</p>
    </div>
  );
}

export default async function FreelancerDetailPage({ params }) {
  const f = await getFreelancer(params.id);
  if (!f) notFound();

  const rate = f.hourly_rate?.amount ? `$${f.hourly_rate.amount}/hr` : '—';
  const location = [f.location?.city, f.location?.country]
    .filter(Boolean)
    .join(', ');
  const v = f.verification || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/freelancers"
        className="text-sm text-muted hover:text-brand font-medium"
      >
        ← Back to freelancers
      </Link>

      <div className="mt-6 bg-surface border border-line rounded-2xl p-8 shadow-soft">
        <div className="flex items-start gap-5">
          {f.avatar ? (
            <img
              src={f.avatar}
              alt={f.name}
              className="h-20 w-20 rounded-full object-cover border border-line"
            />
          ) : (
            <span className="h-20 w-20 rounded-full bg-brand/10 text-brand flex items-center justify-center text-2xl font-bold">
              {f.name?.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-ink">{f.name}</h1>
              {f.badge && (
                <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                  {f.badge}
                </span>
              )}
            </div>
            {f.headline && <p className="text-muted mt-1">{f.headline}</p>}
            {location && (
              <p className="text-sm text-muted mt-1">📍 {location}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <VerifyBadge ok={v.identity_verified} label="Identity Verified" />
              <VerifyBadge ok={v.payment_verified} label="Payment Verified" />
              <VerifyBadge ok={v.phone_verified} label="Phone Verified" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Stat label="Hourly rate" value={rate} />
          <Stat label="Experience" value={f.experience_level} />
          <Stat label="Total earned" value={f.total_earned} />
          <Stat label="Job success" value={f.job_success_rate} />
          <Stat label="Jobs completed" value={f.total_completed_jobs} />
          <Stat label="Hours billed" value={f.hours_billed} />
        </div>

        {f.bio && (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-ink mb-2">About</h2>
            <p className="text-muted leading-relaxed whitespace-pre-line">
              {f.bio}
            </p>
          </section>
        )}

        {f.skills?.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-ink mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {f.skills.map((s) => (
                <span
                  key={s}
                  className="text-sm bg-accent/10 text-accent px-3 py-1 rounded-full font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {f.categories?.length > 0 && (
          <section className="mt-4">
            <h2 className="text-sm font-semibold text-ink mb-2">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {f.categories.map((c) => (
                <span
                  key={c}
                  className="text-sm border border-line text-muted px-3 py-1 rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>
          </section>
        )}

        {f.certifications?.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-ink mb-2">
              Certifications
            </h2>
            <ul className="space-y-2">
              {f.certifications.map((c, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-muted"
                >
                  <span className="text-brand">🎓</span>
                  <span className="text-ink font-medium">{c.title}</span>
                  <span>— {c.issuer}</span>
                  {c.year && <span>({c.year})</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {f.portfolio?.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-ink mb-2">Portfolio</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {f.portfolio.map((p, i) => (
                <a
                  key={i}
                  href={p.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block border border-line rounded-xl p-4 hover:border-brand/50 transition-colors"
                >
                  <p className="font-semibold text-ink">{p.project_title}</p>
                  {p.role && (
                    <p className="text-sm text-muted mt-0.5">{p.role}</p>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {f.availability && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-ink mb-2">
              Availability
            </h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium capitalize">
                {f.availability.status || '—'}
              </span>
              {f.availability.hours_per_week && (
                <span className="border border-line text-muted px-3 py-1 rounded-full">
                  {f.availability.hours_per_week}
                </span>
              )}
              {f.availability.response_time && (
                <span className="border border-line text-muted px-3 py-1 rounded-full">
                  Replies {f.availability.response_time}
                </span>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
