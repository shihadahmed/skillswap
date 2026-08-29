import Link from 'next/link';
import Hero from '@/components/Hero';
import TaskCard from '@/components/TaskCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const steps = [
  {
    n: '01',
    title: 'Post a Task',
    desc: 'Describe what you need — design, writing, development, or marketing. Set a budget and deadline.',
  },
  {
    n: '02',
    title: 'Get Proposals',
    desc: 'Skilled freelancers apply with their price, timeline, and a short cover note.',
  },
  {
    n: '03',
    title: 'Hire & Pay',
    desc: 'Pick the best fit, pay securely via Stripe, and mark complete when the work is done.',
  },
];

const categories = [
  { name: 'Design', icon: '🎨' },
  { name: 'Writing', icon: '✍️' },
  { name: 'Development', icon: '💻' },
  { name: 'Marketing', icon: '📣' },
  { name: 'Other', icon: '✨' },
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
    <div>
      <Hero />

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-ink">How it works</h2>
          <p className="mt-2 text-muted">Three simple steps to get started.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="bg-surface border border-line rounded-2xl p-7 shadow-soft hover:border-brand/40 transition-colors"
            >
              <span className="text-sm font-bold text-accent">{s.n}</span>
              <h3 className="mt-3 text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest tasks (real data) */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-ink">Latest tasks</h2>
            <p className="mt-2 text-muted">
              {total > 0
                ? `${total} task${total === 1 ? '' : 's'} waiting for the right freelancer`
                : 'Fresh opportunities posted by clients'}
            </p>
          </div>
          <Link
            href="/tasks"
            className="shrink-0 text-brand hover:text-brand-hover font-semibold text-sm"
          >
            Browse all →
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-surface border border-line rounded-2xl p-10 text-center">
            <p className="text-muted">
              No tasks yet — be the first to post one!
            </p>
            <Link
              href="/register"
              className="inline-block mt-4 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
          </div>
        )}
      </section>

      {/* Popular categories */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-ink">Popular categories</h2>
          <p className="mt-2 text-muted">Browse tasks by what you need.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={`/tasks?category=${encodeURIComponent(c.name)}`}
              className="group flex flex-col items-center justify-center gap-2 bg-surface border border-line rounded-2xl p-6 shadow-soft hover:border-brand hover:-translate-y-0.5 transition-all"
            >
              <span className="text-3xl">{c.icon}</span>
              <span className="font-semibold text-ink group-hover:text-brand">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
