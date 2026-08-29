'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const AVAILABILITY = ['weekdays', 'weekends', 'evenings', 'flexible'];

function SkillEditor({ title, list, setList }) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState('intermediate');

  const add = () => {
    if (!name.trim()) return;
    setList([...list, { name: name.trim(), level }]);
    setName('');
  };
  const remove = (i) => setList(list.filter((_, idx) => idx !== i));

  return (
    <div style={{ marginBottom: 16 }}>
      <label>{title}</label>
      <div className="row">
        <input
          placeholder="Skill name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: 0 }}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ width: 160, marginBottom: 0 }}>
          {LEVELS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <button type="button" className="btn" onClick={add}>
          Add
        </button>
      </div>
      <div style={{ marginTop: 8 }}>
        {list.map((s, i) => (
          <span key={i} className="tag">
            {s.name} · {s.level}{' '}
            <button
              type="button"
              onClick={() => remove(i)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        location: user.location || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        availability: user.availability || 'flexible',
        skillsOffered: user.skillsOffered || [],
        skillsWanted: user.skillsWanted || [],
      });
    }
  }, [user]);

  if (!form) return <p className="muted">Loading...</p>;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const updated = await api.put('/users/me', form);
      updateUser(updated);
      setMsg('Profile saved!');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>My Profile</h1>
      {msg && <div className="toast toast-success">{msg}</div>}
      <form className="card" onSubmit={submit}>
        <label>Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label>Location</label>
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <label>Bio</label>
        <textarea
          rows={3}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
        <label>Avatar URL</label>
        <input
          value={form.avatar}
          onChange={(e) => setForm({ ...form, avatar: e.target.value })}
        />
        <label>Availability</label>
        <select
          value={form.availability}
          onChange={(e) => setForm({ ...form, availability: e.target.value })}
        >
          {AVAILABILITY.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>

        <SkillEditor
          title="Skills I Offer"
          list={form.skillsOffered}
          setList={(v) => setForm({ ...form, skillsOffered: v })}
        />
        <SkillEditor
          title="Skills I Want"
          list={form.skillsWanted}
          setList={(v) => setForm({ ...form, skillsWanted: v })}
        />

        <button className="btn" disabled={busy}>
          {busy ? 'Saving...' : 'Save Profile'}
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
