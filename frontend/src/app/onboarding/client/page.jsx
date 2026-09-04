'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function ClientOnboardingPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const defaultName = user?.name || user?.email?.split('@')[0] || '';

  const [form, setForm] = useState({
    full_name: defaultName,
    company_name: user?.company_name || '',
    headline: user?.headline || '',
    location: user?.location ? { city: user.location.city, country: user.location.country } : { city: '', country: '' },
    phone: user?.phone_number || '',
    about: user?.about || '',
    industry: user?.industry || '',
    company_size: user?.company_size || '',
    avatar: user?.image || '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.put('/api/onboarding/client', {
        full_name: form.full_name,
        company_name: form.company_name,
        headline: form.headline,
        location: form.location,
        phone: form.phone,
        about: form.about,
        industry: form.industry,
        company_size: form.company_size,
        avatar: form.avatar,
      });
      await refreshUser();
      toast.success('Client profile submitted! Awaiting admin approval.');
      router.push('/dashboard/client');
    } catch (err) {
      const msg = err.message || 'Submission failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white border border-line rounded-2xl shadow-soft p-6 sm:p-10">
        <div className="border-b border-line pb-6 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Client Onboarding</h1>
          <p className="text-muted mt-1 text-base">Complete your profile to unlock task posting</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <input
                value={form.full_name}
                readOnly
                disabled
                required
                className="w-full rounded-xl border border-line px-4 py-2.5 bg-slate-100 text-slate-500 cursor-not-allowed"
              />
              <p className="mt-1.5 text-xs text-muted">
                Name is linked to your account and cannot be changed here.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
              <input
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="e.g. Acme Studio"
                className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Headline</label>
            <input
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="e.g. Hiring top-tier tech talent for scalable products"
              className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
              <input
                value={form.location?.city || ''}
                onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })}
                required
                className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Country</label>
              <input
                value={form.location?.country || ''}
                onChange={(e) => setForm({ ...form, location: { ...form.location, country: e.target.value } })}
                required
                className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">About Yourself / Company</label>
            <textarea
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              rows={4}
              placeholder="Tell freelancers about your company, goals, and culture..."
              className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Industry</label>
              <input
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                placeholder="e.g. Software, E-commerce, Marketing"
                className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Company Size</label>
              <input
                value={form.company_size}
                onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                placeholder="e.g. 1-10, 11-50, 50+"
                className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Image URL</label>
            <input
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
            />
          </div>

          <div className="pt-4 border-t border-line">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl shadow-soft transition-colors disabled:opacity-60 text-base"
            >
              {submitting ? 'Submitting…' : 'Submit Profile for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}