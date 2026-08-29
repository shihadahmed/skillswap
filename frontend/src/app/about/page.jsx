import Link from 'next/link';

const stats = [
  { value: '12k+', label: 'Tasks completed' },
  { value: '8k+', label: 'Active freelancers' },
  { value: '4.9/5', label: 'Average rating' },
  { value: '120+', label: 'Skill categories' },
];

const steps = [
  {
    title: 'Post a task',
    desc: 'Describe what you need, set a budget and a deadline. It takes less than a minute.',
  },
  {
    title: 'Receive proposals',
    desc: 'Skilled freelancers apply with their price, timeline and a cover note.',
  },
  {
    title: 'Hire & collaborate',
    desc: 'Pick the best fit, chat, review deliverables and release payment when done.',
  },
];

const values = [
  { title: 'Speed', desc: 'Micro-tasks matched in minutes, not weeks.' },
  { title: 'Trust', desc: 'Verified freelancers and transparent reviews.' },
  { title: 'Simplicity', desc: 'A clean, focused workflow without the clutter.' },
];

export const metadata = {
  title: 'About — SkillSwap',
  description: 'Learn about SkillSwap, the freelance marketplace for fast micro-tasks.',
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand/5 to-bg">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <span className="inline-block text-sm font-semibold text-brand bg-brand/10 px-3 py-1 rounded-full">
            About SkillSwap
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-ink">
            The marketplace for fast, one-time micro-tasks
          </h1>
          <p className="mt-4 text-lg text-muted">
            We connect clients who need small jobs done with freelancers who love
            tackling them — quickly, securely and without the overhead of traditional
            platforms.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/tasks"
              className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Browse Tasks
            </Link>
            <Link
              href="/register"
              className="border border-line bg-surface hover:border-brand/50 text-ink px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Join free
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-surface border border-line rounded-2xl p-6 text-center shadow-soft"
            >
              <p className="text-3xl font-extrabold text-brand">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold text-ink">Our mission</h2>
        <p className="mt-4 text-muted leading-relaxed">
          Small tasks shouldn’t require a long hiring process. SkillSwap exists to
          make micro-work effortless — for the client who needs a logo tweaked tonight,
          and for the freelancer who wants to pick up meaningful bite-sized projects
          between larger engagements.
        </p>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-extrabold text-ink text-center">How it works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="bg-surface border border-line rounded-2xl p-6 shadow-soft"
            >
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-brand/10 text-brand font-bold">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface border-y border-line">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-extrabold text-ink text-center">What we value</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <h3 className="font-semibold text-ink">{v.title}</h3>
                <p className="mt-1 text-sm text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
