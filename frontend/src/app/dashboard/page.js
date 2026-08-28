'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

function SwapCard({ swap, currentUserId }) {
  const [status, setStatus] = useState(swap.status);
  const [busy, setBusy] = useState(false);
  const isRecipient = swap.to._id === currentUserId;
  const other = isRecipient ? swap.from : swap.to;

  const act = async (s) => {
    setBusy(true);
    try {
      const updated = await api.patch(`/swaps/${swap._id}`, { status: s });
      setStatus(updated.status);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    await api.del(`/swaps/${swap._id}`);
    window.location.reload();
  };

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Link href={`/profile/${other._id}`}>
          <strong>{other.name}</strong>
        </Link>
        <span
          className="tag"
          style={{
            borderColor:
              status === 'accepted'
                ? 'var(--success)'
                : status === 'declined'
                ? 'var(--danger)'
                : 'var(--border)',
          }}
        >
          {status}
        </span>
      </div>
      <p style={{ margin: '8px 0' }}>
        <span className="tag tag-offered">{swap.skillOffered.name}</span> for{' '}
        <span className="tag tag-wanted">{swap.skillRequested.name}</span>
      </p>
      {swap.message && <p className="muted" style={{ fontSize: '0.85rem' }}>{swap.message}</p>}

      <div className="row" style={{ marginTop: 10 }}>
        {isRecipient && status === 'pending' && (
          <>
            <button className="btn" disabled={busy} onClick={() => act('accepted')}>
              Accept
            </button>
            <button className="btn btn-danger" disabled={busy} onClick={() => act('declined')}>
              Decline
            </button>
          </>
        )}
        {(status === 'accepted') && (
          <button className="btn btn-ghost" disabled={busy} onClick={() => act('completed')}>
            Mark completed
          </button>
        )}
        {status === 'pending' && (
          <button className="btn btn-ghost" disabled={busy} onClick={cancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [tab, setTab] = useState('received');
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('ss_token');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then(setMe);
    }
  }, []);

  useEffect(() => {
    Promise.all([api.get('/swaps?role=received'), api.get('/swaps?role=sent')])
      .then(([r, s]) => {
        setReceived(r);
        setSent(s);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !me) return <p className="muted">Loading...</p>;

  const list = tab === 'received' ? received : sent;

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Dashboard</h1>
      <div className="row" style={{ marginBottom: 16 }}>
        <button
          className={tab === 'received' ? 'btn' : 'btn btn-ghost'}
          onClick={() => setTab('received')}
        >
          Received ({received.length})
        </button>
        <button
          className={tab === 'sent' ? 'btn' : 'btn btn-ghost'}
          onClick={() => setTab('sent')}
        >
          Sent ({sent.length})
        </button>
        <Link href="/explore" className="btn btn-ghost">
          Find people
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="muted">No {tab} requests yet.</p>
      ) : (
        list.map((swap) => <SwapCard key={swap._id} swap={swap} currentUserId={me._id} />)
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
