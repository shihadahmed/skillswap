'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

export default function AdminApprovalsPage() {
  const [tab, setTab] = useState('freelancers');
  const [freelancers, setFreelancers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingFreelancerCount, setPendingFreelancerCount] = useState(0);
  const [pendingClientCount, setPendingClientCount] = useState(0);
  const [statsPayload, setStatsPayload] = useState(null);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const list = await api.get('/admin/approvals');
        const fList = list?.freelancers || [];
        const cList = list?.clients || [];
        setFreelancers(fList);
        setClients(cList);
        setPendingFreelancerCount(list?.totalFreelancers ?? fList.length);
        setPendingClientCount(list?.totalClients ?? cList.length);
      } catch (e) {
        console.error('Failed to load approvals list:', e);
        toast.error('Could not load approvals list');
      }

      try {
        const stats = await api.get('/admin/approvals/stats');
        setStatsPayload(stats);
      } catch (e) {
        console.warn('Stats endpoint optional or not found:', e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApprove = async (id, role) => {
    try {
      await api.put(`/admin/approvals/approve-user/${id}`);
      toast.success(`${role} approved successfully!`);
      loadPending();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Approval failed');
    }
  };

  const handleReject = async (id, role) => {
    if (!window.confirm(`Are you sure you want to reject this ${role}?`)) return;
    const reason = window.prompt(`Reason for rejecting this ${role}:`, 'Incomplete profile or documentation');
    if (reason === null) return;
    try {
      await api.put(`/admin/approvals/reject-user/${id}`, { reason });
      toast.success(`${role} rejected successfully!`);
      loadPending();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Rejection failed');
    }
  };

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted font-medium">Loading pending approvals...</p>
      </div>
    );
  }

  const activeList = tab === 'freelancers' ? freelancers : clients;
  const activeCount = tab === 'freelancers' ? pendingFreelancerCount : pendingClientCount;

  return (
    <div className="space-y-6">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-xl font-bold text-ink">Admin Review Panel</h1>
          <p className="text-xs text-muted">Review and verify user accounts.</p>
        </div>

        <div className="inline-flex p-1 bg-surface border border-line rounded-xl">
          <button
            onClick={() => setTab('freelancers')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'freelancers' ? 'bg-brand text-white shadow-xs' : 'text-muted hover:text-ink'
            }`}
          >
            Pending Freelancers ({pendingFreelancerCount})
          </button>
          <button
            onClick={() => setTab('clients')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'clients' ? 'bg-brand text-white shadow-xs' : 'text-muted hover:text-ink'
            }`}
          >
            Pending Clients ({pendingClientCount})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {statsPayload && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface border border-line rounded-xl p-4">
            <p className="text-xs text-muted">Total Pending</p>
            <p className="text-xl font-bold text-ink">{statsPayload.totalPending ?? 0}</p>
          </div>
          <div className="bg-surface border border-line rounded-xl p-4">
            <p className="text-xs text-muted">Approved Freelancers</p>
            <p className="text-xl font-bold text-emerald-600">{statsPayload.approvedFreelancers ?? 0}</p>
          </div>
          <div className="bg-surface border border-line rounded-xl p-4">
            <p className="text-xs text-muted">Approved Clients</p>
            <p className="text-xl font-bold text-blue-600">{statsPayload.approvedClients ?? 0}</p>
          </div>
          <div className="bg-surface border border-line rounded-xl p-4">
            <p className="text-xs text-muted">Rejected</p>
            <p className="text-xl font-bold text-rose-600">{statsPayload.rejectedCount ?? 0}</p>
          </div>
        </div>
      )}

      {/* Main List */}
      <div>
        {activeCount === 0 ? (
          <div className="p-12 text-center bg-surface border border-line rounded-xl">
            <p className="text-sm font-medium text-muted">No pending {tab} applications.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeList.map((item) => (
              <div
                key={item._id || item.id}
                className="bg-surface border border-line rounded-xl p-5 flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0">
                    {(item.name?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-ink truncate">{item.name}</h3>
                    <p className="text-xs text-muted truncate">{item.email}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      {item.approvalStatus || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line flex gap-2">
                  <button
                    onClick={() => handleApprove(item._id || item.id, item.role || (tab === 'freelancers' ? 'freelancer' : 'client'))}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-xs font-semibold transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(item._id || item.id, item.role || (tab === 'freelancers' ? 'freelancer' : 'client'))}
                    className="flex-1 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg py-2 text-xs font-semibold transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
