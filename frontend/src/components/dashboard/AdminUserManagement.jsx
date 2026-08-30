'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAdminUsers } from '@/lib/hooks';
import { toast } from 'react-toastify';
import Pagination from '@/components/Pagination';
import Modal from '@/components/dashboard/Modal';
import EmptyState from '@/components/EmptyState';
import { TableSkeleton } from '@/components/Skeletons';

const ROLES = ['client', 'freelancer', 'admin'];

export default function AdminUserManagement() {
  const [page, setPage] = useState(1);
  const { data, isLoading, mutate } = useAdminUsers(page);

  const users = data?.users || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;
  const showSkeleton = isLoading && !data;

  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client', image: '', bio: '', skills: '', isBlocked: false });
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const openAdd = () => {
    setForm({ name: '', email: '', password: '', role: 'client', image: '', bio: '', skills: '', isBlocked: false });
    setError('');
    setShowAdd(true);
  };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, image: u.image || '', bio: u.bio || '', skills: (u.skills || []).join(', '), isBlocked: !!u.isBlocked });
    setError('');
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    setBusyId('add');
    setError('');
    try {
      await api.post('/admin/users', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        image: form.image,
        bio: form.bio,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('User created.');
      setShowAdd(false);
      mutate();
    } catch (err) {
      setError(err.message || 'Create failed.');
      toast.error(err.message || 'Create failed.');
    } finally {
      setBusyId(null);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setBusyId(editUser._id);
    setError('');
    try {
      await api.put(`/admin/users/${editUser._id}`, {
        name: form.name,
        email: form.email,
        role: form.role,
        image: form.image,
        bio: form.bio,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        isBlocked: form.isBlocked,
      });
      toast.success('User updated.');
      setEditUser(null);
      mutate();
    } catch (err) {
      setError(err.message || 'Update failed.');
      toast.error(err.message || 'Update failed.');
    } finally {
      setBusyId(null);
    }
  };

  const toggleBlock = async (u) => {
    setBusyId(u._id);
    // Optimistic: flip the blocked flag in the cache instantly.
    await mutate(
      (cur) => cur && { ...cur, users: cur.users.map((x) => (x._id === u._id ? { ...x, isBlocked: !x.isBlocked } : x)) },
      { revalidate: false }
    );
    try {
      await api.put(`/admin/users/${u._id}/block`);
      toast.success(u.isBlocked ? 'User account reactivated successfully.' : 'User account has been blocked.');
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    } finally {
      mutate();
      setBusyId(null);
    }
  };

  const remove = async (u) => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    setBusyId(u._id);
    // Optimistic: remove from cache immediately.
    await mutate(
      (cur) => cur && { ...cur, users: cur.users.filter((x) => x._id !== u._id), total: Math.max(0, (cur.total || 0) - 1) },
      { revalidate: false }
    );
    try {
      await api.del(`/admin/users/${u._id}`);
      toast.success('User removed permanently from the platform.');
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      mutate();
      setBusyId(null);
    }
  };

  const avatar = (u) => u.image || 'https://placehold.co/80x80?text=' + encodeURIComponent((u.name || 'U')[0]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink">Users ({total})</h2>
        <button onClick={openAdd} className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-semibold">
          + Add User
        </button>
      </div>

      {showSkeleton ? (
        <TableSkeleton cols={5} rows={6} />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" message="Create a new user to get started." />
      ) : (
        <div className="overflow-x-auto bg-surface border border-line rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-line">
                <th className="py-3 px-4 font-medium">User</th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Joined</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-line last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={avatar(u)} alt="" className="w-8 h-8 rounded-full object-cover border border-line" />
                      <span className="font-medium text-ink">{u.name}</span>
                      {u.isBlocked && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">Blocked</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted">{u.email}</td>
                  <td className="py-3 px-4 capitalize text-muted">{u.role}</td>
                  <td className="py-3 px-4 text-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(u)} className="text-brand hover:underline text-xs font-semibold mr-3">Edit</button>
                    <button onClick={() => toggleBlock(u)} disabled={busyId === u._id} className="text-muted hover:underline text-xs font-semibold mr-3 disabled:opacity-50">
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button onClick={() => remove(u)} disabled={busyId === u._id} className="text-danger hover:underline text-xs font-semibold disabled:opacity-50">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add user">
        <UserForm form={form} setForm={setForm} error={error} busy={busyId === 'add'} submit={submitAdd} withPassword />
      </Modal>
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit user">
        <UserForm form={form} setForm={setForm} error={error} busy={busyId === editUser?._id} submit={submitEdit} withPassword={false} />
      </Modal>
    </div>
  );
}

function UserForm({ form, setForm, error, busy, submit, withPassword }) {
  return (
    <form onSubmit={submit} className="space-y-3">
      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{error}</p>
      )}
      <div>
        <label className="block text-xs font-medium text-muted mb-1">Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1">Email</label>
        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
      </div>
      {withPassword && (
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Password</label>
          <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-muted mb-1">Role</label>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40">
          {ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1">Image URL</label>
        <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1">Bio</label>
        <textarea rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1">Skills (comma separated)</label>
        <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
          className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={form.isBlocked} onChange={(e) => setForm({ ...form, isBlocked: e.target.checked })} />
        Blocked
      </label>
      <button type="submit" disabled={busy}
        className="w-full bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60">
        {busy ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
