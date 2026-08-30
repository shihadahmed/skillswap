'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRevalidate } from '@/lib/hooks';
import { calculateMarketplaceFees, formatCurrency } from '@/lib/fees';
import { toast } from 'react-toastify';

export default function ProposalForm({ taskId, taskTitle }) {
  const { user, loading } = useAuth();
  const revalidate = useRevalidate();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [paymentMode, setPaymentMode] = useState('project'); // 'project' | 'milestone'
  const [budget, setBudget] = useState('');
  const [days, setDays] = useState('');
  const [revisions, setRevisions] = useState(1);
  const [portfolio, setPortfolio] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [milestones, setMilestones] = useState([]);

  // Real-time fee calculation based on total bid
  const feeBreakdown = useMemo(() => {
    if (!budget) return null;
    return calculateMarketplaceFees(Number(budget));
  }, [budget]);

  // Live sum validation for milestones
  useEffect(() => {
    if (paymentMode === 'milestone' && milestones.length > 0) {
      const total = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
      const budgetNum = Number(budget) || 0;
      if (total !== budgetNum) {
        // We just validate; we don't set errors here but could highlight
      }
    }
  }, [paymentMode, milestones, budget]);

  if (loading) {
    return <div className="h-6" />;
  }

  if (!user) {
    return (
      <div className="flex justify-center mt-2">
        <p className="text-center text-muted text-sm">
          <Link
            href="/login"
            onClick={() => toast.warn('Please log in to submit a proposal or post a task.')}
            className="text-brand hover:underline font-medium"
          >
            Sign in
          </Link> as a freelancer to send a proposal.
        </p>
      </div>
    );
  }

  if (user.role !== 'freelancer') {
    return (
      <div className="bg-bg border border-line rounded-xl p-5 text-center">
        <p className="text-muted text-sm">Only freelancers can apply to tasks.</p>
        <Link
          href="/tasks"
          className="inline-block mt-2 text-brand font-semibold hover:underline"
        >
          Browse more tasks
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
        <p className="font-semibold text-emerald-700">Proposal sent! 🎉</p>
        <p className="text-sm text-emerald-700/80 mt-1">
          The client will review your application for “{taskTitle}”.
        </p>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    const proposed_budget = Number(budget);
    const estimated_days = Number(days);
    if (!proposed_budget || proposed_budget <= 0 || !estimated_days || estimated_days < 1) {
      toast.error('Please provide a valid bid amount and estimated days.');
      return;
    }

    // When in milestone mode, validate that milestones sum to budget
    if (paymentMode === 'milestone') {
      const totalMilestoneAmount = milestones.reduce(
        (sum, m) => sum + (m.amount || 0),
        0
      );
      if (totalMilestoneAmount !== proposed_budget) {
        toast.error(
          `Milestone amounts must sum to total bid (${proposed_budget}). Current sum: $${totalMilestoneAmount}`
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.post(`/tasks/${taskId}/proposals`, {
        proposed_budget,
        estimated_days,
        cover_note: coverNote,
        milestones,
      });
      toast.success('Proposal submitted successfully!');
      setDone(true);
      revalidate(
        (k) =>
          typeof k === 'string' &&
          (k.startsWith(`/tasks/${taskId}`) || k.startsWith('/proposals/mine'))
      );
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('already')) {
        toast.error('You have already submitted a proposal for this task.');
      } else {
        toast.error(err.message || 'Could not submit proposal.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle milestone removal
  const handleRemoveMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  // Handle milestone amount change
  const handleMilestoneAmountChange = (index, value) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], amount: Number(value) };
    setMilestones(newMilestones);
  };

  // Handle milestone days change
  const handleMilestoneDaysChange = (index, value) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], estimated_days: Number(value) };
    setMilestones(newMilestones);
  };

  // Handle milestone title change
  const handleMilestoneTitleChange = (index, value) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], title: value };
    setMilestones(newMilestones);
  };

  return (
    <form
      onSubmit={submit}
      className="w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm"
    >
      {/* Top Header */}
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Send a Proposal
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tell the client why you’re the right fit. Milestones divide the project into
          payable phases paid upon completion.
        </p>
      </header>

      {/* Payment Mode Selector */}
      <div className="mb-6 flex gap-4">
        <label
          className={
            paymentMode === 'project'
              ? 'flex-1 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-sm font-medium text-indigo-600'
              : 'flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-600'
          }
        >
          By Project (Single payment upon task completion)
        </label>
        <label
          className={
            paymentMode === 'milestone'
              ? 'flex-1 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-sm font-medium text-indigo-600'
              : 'flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-600'
          }
        >
          By Milestone (Divide project into multiple payable phases)
        </label>
      </div>

      {/* Milestone Builder (active when By Milestone selected) */}
      {paymentMode === 'milestone' && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-600 mb-3">Milestones</h3>
          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="flex gap-3 rounded-xl border border-slate-200 p-3 bg-slate-50"
              >
                <input
                  type="text"
                  value={m.title || ''}
                  onChange={(e) =>
                    handleMilestoneTitleChange(idx, e.target.value)
                  }
                  placeholder="Milestone title"
                  className="flex-1 rounded border border-line bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  value={m.estimated_days || ''}
                  min="1"
                  onChange={(e) =>
                    handleMilestoneDaysChange(idx, e.target.value)
                  }
                  placeholder="Days"
                  className="w-20 rounded border border-line bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  value={m.amount || ''}
                  min="0"
                  step="10"
                  onChange={(e) =>
                    handleMilestoneAmountChange(idx, e.target.value)
                  }
                  placeholder="$"
                  className="w-24 rounded border border-line bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(idx)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex gap-3 mt-3">
              <input
                type="text"
                placeholder="Milestone title"
                onChange={(e) =>
                  setMilestones([
                    ...milestones,
                    {
                      title: e.target.value,
                      estimated_days: 1,
                      amount: 0,
                    },
                  ])
                }
                className="flex-1 rounded border border-line bg-bg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() =>
                  setMilestones([
                    ...milestones,
                    { title: '', estimated_days: 1, amount: 0 },
                  ])
                }
                className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Add Milestone
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Sum of milestone amounts should equal total bid: ${milestones.reduce(
              (sum, m) => sum + (m.amount || 0),
              0
            )}
          </p>
        </div>
      )}

      {/* Form Fields - 2 Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Your Total Bid ($)
          </label>
          <input
            type="number"
            min="1"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 150"
            className="w-full h-11 rounded-xl border border-line bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Estimated days
          </label>
          <input
            type="number"
            min="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="e.g. 7"
            className="w-full h-11 rounded-xl border border-line bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Number of Revisions
          </label>
          <select
            value={revisions}
            onChange={(e) => setRevisions(Number(e.target.value))}
            className="w-full h-11 rounded-xl border border-line bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value="unlimited">Unlimited</option>
          </select>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Portfolio / Sample Project URL
          </label>
          <input
            type="url"
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            placeholder="https://github.com/... or figma.com/..."
            className="w-full h-11 rounded-xl border border-line bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Right Column */}
        <div>
          {feeBreakdown && (
            <div
              className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-5"
            >
              <h4 className="text-sm font-semibold text-indigo-600 mb-3">Real-Time Earnings Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Proposed Bid</span>
                  <span className="font-semibold text-slate-900">
                    ${formatCurrency(feeBreakdown.baseAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform Service Fee (10%)</span>
                  <span>-${formatCurrency(feeBreakdown.freelancerFeeDeducted)}</span>
                </div>
                <div className="flex justify-between border-t border-indigo-200 pt-2">
                  <span className="font-bold text-slate-900">Net Payout (Take-Home)</span>
                  <span className="font-bold text-emerald-600">
                    ${formatCurrency(feeBreakdown.freelancerNetPayout)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-600 flex-1">
                [✓] I can start working immediately
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Cover Note & Actions (Full Width) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Cover note
        </label>
        <textarea
          rows={4}
          maxLength={1000}
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          placeholder="Briefly describe your approach, experience, and deliverables…"
          className="w-full rounded-xl border border-line bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <p className="text-xs text-slate-400 mt-2">
          {coverNote.length}/1000 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-xl w-full sm:w-auto ml-auto transition-colors disabled:opacity-60"
      >
        {submitting ? 'Sending…' : 'Submit proposal'}
      </button>
    </form>
  );
}