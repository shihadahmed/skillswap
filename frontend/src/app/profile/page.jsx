'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'react-toastify';

function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [skill, setSkill] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        image: user.image || '',
        skills: user.skills || [],
      });
    }
  }, [user]);

  if (!form) return <p className="text-muted">Loading…</p>;

  const addSkill = () => {
    const v = skill.trim();
    if (!v || form.skills.includes(v)) {
      setSkill('');
      return;
    }
    setForm({ ...form, skills: [...form.skills, v] });
    setSkill('');
  };

  const removeSkill = (s) =>
    setForm({ ...form, skills: form.skills.filter((x) => x !== s) });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const updated = await api.put('/users/me', {
        name: form.name,
        bio: form.bio,
        image: form.image,
        skills: form.skills,
      });
      updateUser(updated);
      setMsg('Profile saved!');
      toast.success('Profile saved!');
    } catch (err) {
      setMsg(err.message);
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">My Profile</h1>
      <p className="text-muted mt-1">Update your public profile details.</p>

      {msg && (
        <div
          className={`mt-4 text-sm px-3 py-2 rounded-lg border ${
            msg.includes('saved')
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : 'text-danger bg-danger/10 border-danger/30'
          }`}
        >
          {msg}
        </div>
      )}

      <form
        onSubmit={submit}
        className="mt-6 bg-surface border border-line rounded-2xl p-6 shadow-soft space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Avatar URL
          </label>
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://…"
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Bio</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Skills</label>
          <div className="flex gap-2">
            <input
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill and press Enter"
              className="flex-1 h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 h-11 rounded-xl border border-line text-muted hover:text-ink hover:border-brand/40 text-sm font-semibold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {form.skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 bg-brand/10 text-brand text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="hover:text-danger"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}
