'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function Skills({ offered = [], wanted = [] }) {
  return (
    <div>
      {offered.map((s, i) => (
        <span key={`o${i}`} className="tag tag-offered">
          {s.name} · {s.level}
        </span>
      ))}
      {wanted.map((s, i) => (
        <span key={`w${i}`} className="tag tag-wanted">
          wants {s.name}
        </span>
      ))}
    </div>
  );
}

function Explore() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (query = '') => {
    setLoading(true);
    try {
      const data = await api.get(`/users/explore${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Explore Skills</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        Find people offering what you want, and wanting what you offer.
      </p>
      <input
        className="legacy-input"
        placeholder="Search by name, skill or location..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && load(q)}
      />
      <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => load(q)}>
        Search
      </button>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : users.length === 0 ? (
        <p className="muted">No users found.</p>
      ) : (
        <div className="legacy-grid">
          {users.map((u) => (
            <div className="card" key={u._id}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>{u.name}</strong>
                <span className="muted" style={{ fontSize: '0.8rem' }}>
                  {u.location || '—'}
                </span>
              </div>
              <p className="muted" style={{ fontSize: '0.85rem', margin: '6px 0' }}>
                {u.bio || 'No bio yet.'}
              </p>
              <Skills offered={u.skillsOffered} wanted={u.skillsWanted} />
              <Link href={`/profile/${u._id}`} className="btn btn-ghost" style={{ marginTop: 12 }}>
                View & Request
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <ProtectedRoute>
      <Explore />
    </ProtectedRoute>
  );
}
