import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-accent text-white font-bold">
              S
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              Skill<span className="text-brand">Swap</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted">
            The freelance marketplace for fast, one-time micro-tasks.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold text-ink mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/tasks" className="hover:text-brand">Browse Tasks</Link></li>
            <li><Link href="/freelancers" className="hover:text-brand">Freelancers</Link></li>
            <li><Link href="/register" className="hover:text-brand">Get Started</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-ink mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/" className="hover:text-brand">About</Link></li>
            <li><Link href="/" className="hover:text-brand">Contact</Link></li>
            <li><a href="mailto:hello@skillswap.app" className="hover:text-brand">hello@skillswap.app</a></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-semibold text-ink mb-3">Follow</h4>
          <div className="flex gap-3">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="grid place-items-center w-9 h-9 rounded-lg border border-line text-ink hover:text-brand hover:border-brand transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="grid place-items-center w-9 h-9 rounded-lg border border-line text-ink hover:text-brand hover:border-brand transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.3-.5-1.5.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 5 18 5.3 18 5.3c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-line py-5 text-center text-sm text-muted">
        © {new Date().getFullYear()} SkillSwap. All rights reserved.
      </div>
    </footer>
  );
}
