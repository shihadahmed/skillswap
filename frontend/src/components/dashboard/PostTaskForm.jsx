'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRevalidate } from '@/lib/hooks';
import { toast } from 'react-toastify';

const CATEGORIES = ['Design', 'Writing', 'Development', 'Marketing', 'Other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const URGENCIES = ['flexible', 'soon', 'asap'];
const EXPERIENCE_LEVELS = ['entry', 'intermediate', 'expert'];
const PROJECT_TYPES = ['one_time', 'ongoing', 'contract'];
const BUDGET_TYPES = ['fixed', 'hourly'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const urgencyLabels = {
  flexible: 'Flexible',
  soon: 'Needed Soon',
  asap: 'ASAP',
};

const experienceLabels = {
  entry: 'Entry Level',
  intermediate: 'Intermediate',
  expert: 'Expert',
};

const projectTypeLabels = {
  one_time: 'One-time Project',
  ongoing: 'Ongoing Work',
  contract: 'Contract Position',
};

const budgetTypeLabels = {
  fixed: 'Fixed Price',
  hourly: 'Hourly Rate',
};

export default function PostTaskForm({ onCreated }) {
  const revalidate = useRevalidate();
  const [form, setForm] = useState({
    title: '',
    category: 'Other',
    description: '',
    budget: {
      amount: '',
      currency: 'USD',
      type: 'fixed',
    },
    priority: 'medium',
    urgency: 'flexible',
    experience_level: 'intermediate',
    project_type: 'one_time',
    estimated_duration: '',
    skills: '',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    if (field.startsWith('budget.')) {
      const budgetField = field.replace('budget.', '');
      setForm((prev) => ({
        ...prev,
        budget: { ...prev.budget, [budgetField]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const post = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!form.title.trim() || !form.budget.amount || !form.deadline) {
      toast.error('Please fill in all required fields (Title, Budget, Deadline).');
      setSubmitting(false);
      return;
    }

    try {
      const skillsArray = form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.post('/tasks', {
        title: form.title,
        category: form.category,
        description: form.description,
        budget: {
          amount: Number(form.budget.amount),
          currency: form.budget.currency,
          type: form.budget.type,
        },
        priority: form.priority,
        urgency: form.urgency,
        experience_level: form.experience_level,
        project_type: form.project_type,
        estimated_duration: form.estimated_duration,
        skills: skillsArray,
        deadline: form.deadline,
      });

      toast.success('Task submitted for admin review! It will be published once approved.');
      setForm({
        title: '',
        category: 'Other',
        description: '',
        budget: { amount: '', currency: 'USD', type: 'fixed' },
        priority: 'medium',
        urgency: 'flexible',
        experience_level: 'intermediate',
        project_type: 'one_time',
        estimated_duration: '',
        skills: '',
        deadline: '',
      });

      revalidate(
        (k) =>
          typeof k === 'string' &&
          (k.startsWith('/tasks/mine') || k === '/tasks' || k.startsWith('/tasks?'))
      );
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message || 'Failed to post task.');
      toast.error(err.message || 'Failed to post task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={post} className="bg-surface border border-line rounded-2xl p-6 shadow-soft space-y-6">
      <h2 className="font-semibold text-ink">Post a new task</h2>
      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Title & Category */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Title <span className="text-danger">*</span></label>
          <input
            required
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g. Build a React Native onboarding flow"
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Budget Fields */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Budget Amount <span className="text-danger">*</span></label>
          <input
            required
            type="number"
            min="1"
            step="1"
            value={form.budget.amount}
            onChange={(e) => handleChange('budget.amount', e.target.value)}
            placeholder="e.g. 250"
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Currency</label>
          <select
            value={form.budget.currency}
            onChange={(e) => handleChange('budget.currency', e.target.value)}
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Budget Type</label>
          <select
            value={form.budget.type}
            onChange={(e) => handleChange('budget.type', e.target.value)}
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            {BUDGET_TYPES.map((b) => (
              <option key={b} value={b}>
                {budgetTypeLabels[b]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {priorityLabels[p]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Urgency</label>
          <select
            value={form.urgency}
            onChange={(e) => handleChange('urgency', e.target.value)}
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {urgencyLabels[u]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Experience Level</label>
          <select
            value={form.experience_level}
            onChange={(e) => handleChange('experience_level', e.target.value)}
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            {EXPERIENCE_LEVELS.map((e) => (
              <option key={e} value={e}>
                {experienceLabels[e]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Project Type</label>
          <select
            value={form.project_type}
            onChange={(e) => handleChange('project_type', e.target.value)}
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            {PROJECT_TYPES.map((p) => (
              <option key={p} value={p}>
                {projectTypeLabels[p]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Estimated Duration</label>
          <input
            value={form.estimated_duration}
            onChange={(e) => handleChange('estimated_duration', e.target.value)}
            placeholder="e.g. 2 weeks, 1 month"
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Skills Required (comma separated)</label>
          <input
            value={form.skills}
            onChange={(e) => handleChange('skills', e.target.value)}
            placeholder="e.g. React, Node.js, TypeScript, MongoDB"
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Deadline <span className="text-danger">*</span></label>
          <input
            required
            type="date"
            value={form.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Description</label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the task, deliverables, requirements, and any other details…"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
      </div>

      <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 text-sm text-brand">
        <p className="font-medium">Note:</p>
        <p className="mt-1">Your task will be submitted for admin review. Once approved, it will be published on the marketplace and you'll receive a notification.</p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 w-full sm:w-auto"
      >
        {submitting ? 'Submitting for Review…' : 'Submit for Review'}
      </button>
    </form>
  );
}