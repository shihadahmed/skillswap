'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

function PublicProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ skillOffered: '', skillRequested: '', message: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get(`/users/${id}`).then(setProfile).catch(() => setMsg('User not found'));
  }, [id]);

  if (!profile) return <p className="muted">Loading...</p>;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      await api.post('/swaps', {
        to: id,
        skillOffered: { name: form.skillOffered },
        skillRequested: { name: form.skillRequested },
        message: form.message,
      });
      setSent(true);
      setMsg('Swap request sent!');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h1 style={{ marginBottom: 4 }}>{profile.name}</h1>
        <p className="muted">{profile.location || 'No location'}</p>
        <p style={{ margin: '10px 0' }}>{profile.bio || 'No bio.'}</p>
        <p className="muted" style={{ fontSize: '0.85rem' }}>
          Availability: {profile.availability} · Swaps completed: {profile.swapsCompleted}
        </p>
        <div style={{ marginTop: 12 }}>
          <strong style={{ fontSize: '0.85rem' }}>Offers:</strong>
          <div>
            {(profile.skillsOffered || []).map((s, i) => (
              <span key={i} className="tag tag-offered">
                {s.name} · {s.level}
              </span>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <strong style={{ fontSize: '0.85rem' }}>Wants:</strong>
          <div>
            {(profile.skillsWanted || []).map((s, i) => (
              <span key={i} className="tag tag-wanted">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {sent ? (
        <div className="toast toast-success">{msg}</div>
      ) : (
        <form className="card" onSubmit={submit}>
          <h2 style={{ marginBottom: 12 }}>Request a skill swap</h2>
          {msg && !sent && <div className="toast toast-error">{msg}</div>}
          <label>Skill you offer</label>
          <input
            value={form.skillOffered}
            onChange={(e) => setForm({ ...form, skillOffered: e.target.value })}
            placeholder="e.g. Guitar lessons"
            required
          />
          <label>Skill you want from {profile.name}</label>
          <input
            value={form.skillRequested}
            onChange={(e) => setForm({ ...form, skillRequested: e.target.value })}
            placeholder="e.g. Spanish"
            required
          />
          <label>Message</label>
          <textarea
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Say hi and propose a time..."
          />
          <button className="btn" disabled={busy}>
            {busy ? 'Sending...' : 'Send request'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function PublicProfilePage() {
  return (
    <ProtectedRoute>
      <PublicProfile />
    </ProtectedRoute>
  );
}
