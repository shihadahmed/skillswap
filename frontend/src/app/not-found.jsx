import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4 text-center">
      <div>
        <h1 className="text-6xl font-extrabold text-brand">404</h1>
        <p className="mt-3 text-lg text-ink font-semibold">Page not found</p>
        <p className="mt-1 text-muted">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
