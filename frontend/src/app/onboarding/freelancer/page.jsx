'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function FreelancerOnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: user?.name || '',
    headline: user?.headline || '',
    hourly_rate: user?.hourlyRate || 25,
    experience_level: user?.experience_level || 'Beginner',
    location: user?.location ? { city: user.location.city, country: user.location.country } : { city: '', country: '' },
    phone: user?.phone_number || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    categories: user?.categories || [],
    avatar: user?.image || '',
    availability_status: user?.availability?.status || 'available',
    availability_hours: user?.availability?.hours_per_week || '30+ hrs/week',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.put('/api/onboarding/freelancer', {
        full_name: form.full_name,
        headline: form.headline,
        hourly_rate: form.hourly_rate,
        experience_level: form.experience_level,
        location: form.location,
        phone: form.phone,
        bio: form.bio,
        skills: form.skills,
        categories: form.categories,
        avatar: form.avatar,
        availability_status: form.availability_status,
        availability_hours: form.availability_hours,
      });
      toast.success('Freelancer profile submitted! Awaiting admin approval.');
      router.push('/dashboard/freelancer');
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Freelancer Onboarding</h1>
          <p className="text-muted mt-1 text-base">Complete your profile to unlock proposal submissions</p>
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
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
                className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Headline</label>
              <input
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                required
                placeholder="e.g. Senior Full Stack Developer"
                className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Hourly Rate (USD)</label>
              <input
                value={form.hourly_rate}
                onChange={(e) => setForm({ ...form, hourly_rate: Number(e.target.value) })}
                type="number"
                min="1"
                required
                className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Experience Level</label>
              <select
                value={form.experience_level}
                onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
                className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              placeholder="Tell clients about your background, strengths, and expertise..."
              className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Skills</label>
              <input
                value={form.skills.join(', ')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="e.g. React, Node.js, Next.js"
                className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Categories</label>
              <input
                value={form.categories.join(', ')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    categories: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="e.g. Web Development, UI/UX Design"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Availability Status</label>
              <select
                value={form.availability_status}
                onChange={(e) => setForm({ ...form, availability_status: e.target.value })}
                className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Hours Per Week</label>
              <select
                value={form.availability_hours}
                onChange={(e) => setForm({ ...form, availability_hours: e.target.value })}
                className="w-full rounded-xl border border-line px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              >
                <option value="10+ hrs/week">10+ hrs/week</option>
                <option value="20+ hrs/week">20+ hrs/week</option>
                <option value="30+ hrs/week">30+ hrs/week</option>
                <option value="40+ hrs/week">40+ hrs/week</option>
              </select>
            </div>
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