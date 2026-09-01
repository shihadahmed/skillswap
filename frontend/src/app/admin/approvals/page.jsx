'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function AdminApprovalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('freelancers');
  const [freelancers, setFreelancers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingFreelancerCount, setPendingFreelancerCount] = useState(0);
  const [pendingClientCount, setPendingClientCount] = useState(0);

  const loadPending = async () => {
    setLoading(true);
    try {
      const [ff, cc] = await Promise.all([
        api.get('/api/admin/approvals'),
        api.get('/api/admin/approvals/stats'),
      ]);
      setFreelancers(ff.freelancers);
      setClients(cc);
      setPendingFreelancerCount(ff.totalFreelancerCount);
      setPendingClientCount(ff.totalClientCount);
    } catch (err) {
      toast.error(err.message || 'Failed to load pending reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, role) => {
    try {
      const { data } = await api.put(`/api/admin/approvals/approve-user/${id}`);
      toast.success(`${role} approved successfully!`);
      loadPending();
    } catch (err) {
      toast.error(err.message || 'Approval failed');
    }
  };

  const handleReject = async (id, role, reason) => {
    if (!window.confirm(`Are you sure you want to reject this ${role}?`)) return;
    try {
      const { data } = await api.put(`/api/admin/approvals/reject-user/${id}`, { reason });
      toast.success(`${role} rejected successfully!`);
      loadPending();
    } catch (err) {
      toast.error(err.message || 'Rejection failed');
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <span className="text-muted">Loading pending approvals...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-surface p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Review Panel</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setTab('freelancers')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                tab === 'freelancers' ? 'bg-brand text-white' : 'text-brand hover:bg-brand/10'
              }`}
            >
              Pending Freelancers
            </button>
            <button
              onClick={() => setTab('clients')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                tab === 'clients' ? 'bg-brand text-white' : 'text-brand hover:bg-brand/10'
              }`}
            >
              Pending Clients
            </button>
          </div>
        </div>

        {tab === 'freelancers' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-semibold">Pending Freelancers</span>
              <span className="text-muted">({pendingFreelancerCount})</span>
            </div>

            {pendingFreelancerCount === 0 ? (
              <p className="text-muted text-sm">No pending freelancer applications.</p>
            ) : (
              <div className="space-y-4">
                {freelancers.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white rounded-xl shadow-soft p-6 border border-line"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 48 48"
                          fill="none"
                          stroke="currentColor"
                          className="mx-2"
                        >
                          <path d="M22 2L2 7l20 5 5-20z" />
                          <path d="M2 2l20 5" />
                          <path d="M7 22l20 5" />
                          <path d="M22 7L2 22l20 5" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{f.name}</h3>
                        <p className="text-muted text-sm">{f.email}</p>
                        <p className="text-xs text-muted mt-1">Role: {f.role} | Status: {f.approvalStatus}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleApprove(f.id, 'freelancer')}
                        className="flex-1 bg-green-100 text-green-800 rounded-xl py-2 px-3 text-sm hover:bg-green-200 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(f.id, 'freelancer', 'Incomplete profile or documentation')}
                        className="flex-1 bg-red-100 text-red-800 rounded-xl py-2 px-3 text-sm hover:bg-red-200 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'clients' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-semibold">Pending Clients</span>
              <span className="text-muted">({pendingClientCount})</span>
            </div>

            {pendingClientCount === 0 ? (
              <p className="text-muted text-sm">No pending client applications.</p>
            ) : (
              <div className="space-y-4">
                {clients.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl shadow-soft p-6 border border-line"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 48 48"
                          fill="none"
                          stroke="currentColor"
                          className="mx-2"
                        >
                          <path d="M22 2L2 7l20 5 5-20z" />
                          <path d="M2 2l20 5" />
                          <path d="M7 22l20 5" />
                          <path d="M22 7L2 22l20 5" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{c.name}</h3>
                        <p className="text-muted text-sm">{c.email}</p>
                        <p className="text-xs text-muted mt-1">Role: {c.role} | Status: {c.approvalStatus}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleApprove(c.id, 'client')}
                        className="flex-1 bg-green-100 text-green-800 rounded-xl py-2 px-3 text-sm hover:bg-green-200 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(c.id, 'client', 'Incomplete profile or documentation')}
                        className="flex-1 bg-red-100 text-red-800 rounded-xl py-2 px-3 text-sm hover:bg-red-200 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}