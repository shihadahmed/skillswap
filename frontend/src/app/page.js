import Link from 'next/link';
import Hero from '@/components/Hero';

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

export default function Home() {
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
