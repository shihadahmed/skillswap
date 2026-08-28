'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      router.push('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2 style={{ marginBottom: 16 }}>Create account</h2>
      {error && <div className="toast toast-error">{error}</div>}
      <form onSubmit={submit}>
        <label>Name</label>
        <input value={form.name} onChange={update('name')} required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={update('email')} required />
        <label>Password (min 6 chars)</label>
        <input
          type="password"
          value={form.password}
          onChange={update('password')}
          minLength={6}
          required
        />
        <button className="btn" disabled={busy} style={{ width: '100%' }}>
          {busy ? 'Creating...' : 'Sign up'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 14 }}>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
}
