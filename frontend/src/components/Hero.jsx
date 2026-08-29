import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg">
      {/* Soft gradient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[42rem] rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute top-10 right-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl animate-floaty" />
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-20 pb-24 text-center animate-fade-up">
        {/* Pill badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
          <span className="h-2 w-2 rounded-full bg-accent" />
          The freelance marketplace for micro-tasks
        </span>

        {/* Headline */}
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-[1.1]">
          Get your tasks done by{' '}
          <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
            skilled freelancers
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 mx-auto max-w-2xl text-lg text-muted">
          Post a task in minutes, receive proposals from talented people, hire the
          best fit, and pay securely when the work is done.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-white px-7 py-3.5 rounded-xl font-semibold shadow-glow transition-colors"
          >
            Post a Task
          </Link>
          <Link
            href="/tasks"
            className="w-full sm:w-auto border border-line bg-surface hover:bg-bg text-ink px-7 py-3.5 rounded-xl font-semibold transition-colors"
          >
            Browse Tasks
          </Link>
        </div>

        {/* Trust line */}
        <p className="mt-8 text-sm text-muted">
          Trusted by clients & freelancers · No upfront risk · Secure payments
        </p>
      </div>
    </section>
  );
}
