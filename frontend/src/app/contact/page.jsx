'use client';

import { useState } from 'react';

const channels = [
  { label: 'Email', value: 'hello@skillswap.app', href: 'mailto:hello@skillswap.app' },
  { label: 'Support', value: 'support@skillswap.app', href: 'mailto:support@skillswap.app' },
  { label: 'Office', value: 'Dhaka, Bangladesh', href: null },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block text-sm font-semibold text-brand bg-brand/10 px-3 py-1 rounded-full">
          Contact
        </span>
        <h1 className="mt-4 text-4xl font-extrabold text-ink">Get in touch</h1>
        <p className="mt-3 text-muted">
          Questions, feedback or partnership ideas? Drop us a message and we’ll
          get back to you shortly.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        {/* Form */}
        <div className="bg-surface border border-line rounded-2xl p-6 md:p-8 shadow-soft">
          {sent ? (
            <div className="text-center py-10">
              <div className="mx-auto grid place-items-center h-12 w-12 rounded-full bg-brand/10 text-brand text-2xl">
                ✓
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">Message sent!</h3>
              <p className="mt-1 text-sm text-muted">
                Thanks {form.name || 'there'} — we’ll reply to {form.email || 'your email'} soon.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setForm({ name: '', email: '', message: '' });
                }}
                className="mt-6 text-sm font-semibold text-brand hover:text-brand-hover"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Your name"
                  className="m-0 w-full h-11 rounded-xl border border-line px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@email.com"
                  className="m-0 w-full h-11 rounded-xl border border-line px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={update('message')}
                  placeholder="How can we help?"
                  className="m-0 w-full rounded-xl border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Send message
              </button>
            </form>
          )}
        </div>

        {/* Channels */}
        <div className="space-y-4">
          {channels.map((c) => (
            <div
              key={c.label}
              className="bg-surface border border-line rounded-2xl p-5 shadow-soft"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {c.label}
              </p>
              {c.href ? (
                <a href={c.href} className="mt-1 block font-medium text-ink hover:text-brand">
                  {c.value}
                </a>
              ) : (
                <p className="mt-1 font-medium text-ink">{c.value}</p>
              )}
            </div>
          ))}
          <div className="bg-brand/5 border border-brand/20 rounded-2xl p-5">
            <p className="text-sm text-ink">
              Need help with a task or payment? Email{' '}
              <a href="mailto:support@skillswap.app" className="font-semibold text-brand">
                support@skillswap.app
              </a>{' '}
              for the fastest response.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
