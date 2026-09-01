'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function ClientOnboardingPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: user?.name || '',
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
      const { data } = await api.put('/api/onboarding/client', {
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
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-soft p-8">
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">Client Onboarding</h1>
        <p className="text-muted mb-6">Complete your profile to unlock task posting</p>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-4 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Full Name</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
              className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Company Name</label>
              <input
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Headline</label>
              <input
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">City</label>
              <input
                value={form.location?.city || ''}
                onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })}
                required
                className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Country</label>
              <input
                value={form.location?.country || ''}
                onChange={(e) => setForm({ ...form, location: { ...form.location, country: e.target.value } })}
                required
                className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Phone Number</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">About Yourself / Company</label>
            <textarea
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Industry</label>
              <input
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Company Size</label>
              <input
                value={form.company_size}
                onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Profile Image URL</label>
            <input
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-xl shadow-soft transition-colors disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit Profile'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Already have a profile?{' '}
          <a href="/login" className="text-brand hover:underline">Go to login</a>
        </div>
      </div>
    </div>
  );
}