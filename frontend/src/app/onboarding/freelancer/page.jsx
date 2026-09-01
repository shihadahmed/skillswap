'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function FreelancerOnboardingPage() {
  const { user, updateUser } = useAuth();
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
      const { data } = await api.put('/api/onboarding/freelancer', {
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
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-soft p-8">
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">Freelancer Onboarding</h1>
        <p className="text-muted mb-6">Complete your profile to unlock proposal submissions</p>

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

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Headline</label>
            <input
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              required
              className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Hourly Rate (USD)</label>
              <input
                value={form.hourly_rate}
                onChange={(e) => setForm({ ...form, hourly_rate: Number(e.target.value) })}
                type="number"
                min="1"
                className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Experience Level</label>
              <select
                value={form.experience_level}
                onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
                className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
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
            <label className="block text-sm font-medium text-muted mb-2">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Skills</label>
              <input
                value={form.skills.join(', ')}
                onChange={(e) => setForm({ ...form, skills: e.target.value.split(',').s.map(s => s.trim()).filter(s => s) })}
                placeholder="e.g., React, Node.js, Design"
                className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Categories</label>
              <input
                value={form.categories.join(', ')}
                onChange={(e) => setForm({ ...form, categories: e.target.value.split(',').s.map(s => s.trim()).filter(s => s) })}
                placeholder="e.g., Web Development, Writing"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Availability Status</label>
              <select
                value={form.availability_status}
                onChange={(e) => setForm({ ...form, availability_status: e.target.value })}
                className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Hours Per Week</label>
              <select
                value={form.availability_hours}
                onChange={(e) => setForm({ ...form, availability_hours: e.target.value })}
                className="w-full rounded-xl border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="10+ hrs/week">10+ hrs/week</option>
                <option value="20+ hrs/week">20+ hrs/week</option>
                <option value="30+ hrs/week">30+ hrs/week</option>
                <option value="40+ hrs/week">40+ hrs/week</option>
              </select>
            </div>
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