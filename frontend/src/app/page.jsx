import Link from 'next/link';
import Hero from '@/components/Hero';
import TaskCard from '@/components/TaskCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const platformHighlights = [
  { value: '$250k+', label: 'Paid to Freelancers', icon: '💰' },
  { value: '99.4%', label: 'Project Satisfaction', icon: '⭐' },
  { value: '15 Mins', label: 'Average First Proposal', icon: '⚡' },
  { value: '0% Risk', label: 'Escrow Protected Funds', icon: '🛡️' },
];

const categories = [
  { name: 'Development', desc: 'React, Next.js, Python, APIs', icon: '💻', count: '140+ tasks', tag: 'High Demand' },
  { name: 'Design', desc: 'UI/UX, Brand Identity, Figma', icon: '🎨', count: '85+ tasks', tag: 'Creative' },
  { name: 'Marketing', desc: 'SEO, Social Growth, Copywriting', icon: '📣', count: '50+ tasks', tag: 'Growth' },
  { name: 'Writing', desc: 'Articles, Tech Docs, Translation', icon: '✍️', count: '40+ tasks', tag: 'Content' },
  { name: 'Other', desc: 'Specialty gigs and one-off projects', icon: '🧩', count: '20+ tasks', tag: 'Misc' },
  { name: 'Top Rated', desc: 'Browse across every category', icon: '⭐', count: 'All listings', tag: 'See all', all: true },
];

const steps = [
  {
    n: '01',
    title: 'Publish in Minutes',
    desc: 'Specify your scope, budget, and tech stack. Our matching system instantly alerts verified talent.',
    badge: 'Fast Setup',
  },
  {
    n: '02',
    title: 'Review Tailored Proposals',
    desc: 'Evaluate custom proposals, verify past portfolios, and chat with candidates in real time.',
    badge: 'Zero Spam',
  },
  {
    n: '03',
    title: 'Escrow Protected Delivery',
    desc: 'Funds stay safely locked in escrow until milestones are achieved to your complete satisfaction.',
    badge: '100% Safe',
  },
];

const trustFeatures = [
  {
    title: 'Milestone-Based Escrow',
    desc: 'Never release funds upfront. Pay securely through Stripe only after reviewing actual milestones.',
    icon: '🔐',
  },
  {
    title: 'Hand-Screened Specialists',
    desc: 'Every freelancer undergoes automated identity and capability verification before submitting bids.',
    icon: '✨',
  },
  {
    title: 'Transparent Platform Rates',
    desc: 'Fair pricing with no hidden charges. Transparent platform margins for both clients and creators.',
    icon: '📊',
  },
];

async function getLatestTasks() {
  try {
    const res = await fetch(`${API}/tasks?limit=6`, { cache: 'no-store' });
    if (!res.ok) return { tasks: [], total: 0 };
    const data = await res.json();
    return { tasks: data.tasks || [], total: data.total || 0 };
  } catch {
    return { tasks: [], total: 0 };
  }
}

export default async function Home() {
  const { tasks, total } = await getLatestTasks();

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Platform Metrics Bar */}
      <section className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="bg-surface border border-line rounded-3xl p-6 md:p-8 shadow-soft grid grid-cols-2 lg:grid-cols-4 gap-6">
          {platformHighlights.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center text-xl shrink-0">
                {item.icon}
              </div>
              <div>
                <div className="text-2xl font-black text-ink">{item.value}</div>
                <div className="text-xs font-medium text-muted">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Popular Categories (Redesigned Grid) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Explore Opportunities</span>
            <h2 className="text-3xl font-extrabold text-ink mt-1">Popular Skill Categories</h2>
          </div>
          <p className="text-muted text-sm max-w-md">
            Find vetted specialists ready to step into your sprints immediately across top disciplines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={c.all ? '/tasks' : `/tasks?category=${encodeURIComponent(c.name)}`}
              className="group relative bg-surface border border-line hover:border-brand/50 rounded-2xl p-6 shadow-soft hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-bg border border-line flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {c.icon}
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                  {c.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-ink mt-4 group-hover:text-brand transition-colors">{c.name}</h3>
              <p className="text-xs text-muted mt-1">{c.desc}</p>
              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs font-medium text-slate-500">
                <span>{c.count}</span>
                <span className="text-brand group-hover:translate-x-1 transition-transform">Explore →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Live Tasks Board */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Active Opportunities</span>
            </div>
            <h2 className="text-3xl font-extrabold text-ink">Recent Task Feed</h2>
            <p className="text-sm text-muted mt-1">
              {total > 0
                ? `${total} active task${total === 1 ? '' : 's'} waiting for proposals`
                : 'Verified client requirements'}
            </p>
          </div>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-hover hover:underline"
          >
            View all assignments <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-surface border border-line rounded-3xl p-12 text-center max-w-lg mx-auto">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-lg font-bold text-ink">No Tasks Listed Right Now</h3>
            <p className="text-sm text-muted mt-1 mb-6">
              Be the pioneer to kickstart collaboration on SkillSwap.
            </p>
            <Link
              href="/register"
              className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl font-semibold shadow-soft transition-colors inline-block"
            >
              Post a Requirement
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((t) => (
              <TaskCard key={t._id || t.id} task={t} />
            ))}
          </div>
        )}
      </section>

      {/* 5. How It Works (Visual Card Sequence) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand">Execution Model</span>
          <h2 className="text-3xl font-extrabold text-ink mt-1">How SkillSwap Operates</h2>
          <p className="mt-2 text-sm text-muted">A streamlined pipeline from requirements to delivery.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="bg-surface border border-line rounded-3xl p-8 shadow-soft flex flex-col justify-between hover:border-brand/40 transition-colors relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-brand">{s.n}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Why Us / Trust & Security */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-lg">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Security & Integrity</span>
            <h2 className="text-3xl font-extrabold mt-2 text-white">Built on Trust, Backed by Escrow</h2>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              We eliminate marketplace friction so developers build and clients scale with zero friction.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mt-10">
            {trustFeatures.map((f) => (
              <div key={f.title} className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="font-bold text-white mt-3 text-base">{f.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Dual Action Community Callout */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* For Clients */}
          <div className="bg-surface border border-line rounded-3xl p-8 shadow-soft flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand">For Clients</span>
              <h3 className="text-2xl font-black text-ink mt-2">Ready to ship your next feature?</h3>
              <p className="text-sm text-muted mt-2">
                Hire screened freelancers with proven expertise. Post a task in under 2 minutes.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/tasks/create"
                className="inline-block bg-brand hover:bg-brand-hover text-white px-5 py-3 rounded-xl font-bold text-sm shadow-soft transition-colors"
              >
                Post Your Task Now
              </Link>
            </div>
          </div>

          {/* For Freelancers */}
          <div className="bg-surface border border-line rounded-3xl p-8 shadow-soft flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">For Freelancers</span>
              <h3 className="text-2xl font-black text-ink mt-2">Looking for quality gigs?</h3>
              <p className="text-sm text-muted mt-2">
                Find remote contracts, build client relationships, and enjoy protected payouts.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/tasks"
                className="inline-block bg-ink hover:bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-soft transition-colors"
              >
                Browse Tasks & Apply
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}