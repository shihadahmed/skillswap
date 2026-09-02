'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

const STOPWORDS = new Set([
  'and', 'the', 'for', 'with', 'from', 'of', 'in', 'a', 'an', 'to',
  'on', 'at', 'by', 'as', 'or', 'is', 'be',
]);

const extractHeadlineKeywords = (headline) => {
  return (headline || '')
    .toLowerCase()
    .split(/[^a-z0-9+#./-]+/i)
    .filter((w) => w && w.length >= 3 && !STOPWORDS.has(w));
};

const matchesHeadline = (item, headline, keywords) => {
  const itemLc = (item || '').toLowerCase();
  const headlineLc = (headline || '').toLowerCase();
  if (itemLc.includes(headlineLc) || headlineLc.includes(itemLc)) return true;
  return keywords.some((k) => itemLc.includes(k));
};

export default function FreelancerOnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Dynamic Metadata from Database
  const [dbCategories, setDbCategories] = useState([]);
  const [dbSkills, setDbSkills] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [form, setForm] = useState({
    name: user?.name || '',
    headline: user?.headline || '',
    hourly_rate_amount: user?.hourly_rate?.amount || user?.hourlyRate || 25,
    experience_level: user?.experience_level || 'Beginner',
    location: {
      city: user?.location?.city || '',
      country: user?.location?.country || '',
    },
    bio: user?.bio || '',
    skills: Array.isArray(user?.skills) ? user.skills : [],
    categories: Array.isArray(user?.categories) ? user.categories : [],
    avatar: user?.avatar || user?.image || '',
    availability_status: user?.availability?.status || 'available',
    availability_hours: user?.availability?.hours_per_week || '30+ hrs/week',
  });

  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch dynamic categories & skills from database collections
  useEffect(() => {
    async function fetchMetadata() {
      try {
        setLoadingMeta(true);
        const res = await api.get('/onboarding/metadata');
        if (res?.categories) setDbCategories(res.categories);
        if (res?.skills) setDbSkills(res.skills);
      } catch (err) {
        console.error('Failed to load database metadata', err);
      } finally {
        setLoadingMeta(false);
      }
    }
    fetchMetadata();
  }, []);

  // Category Toggle
  const toggleCategory = (cat) => {
    setForm((prev) => {
      const exists = prev.categories.includes(cat);
      const updated = exists
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: updated };
    });
    if (errors.categories) setErrors((prev) => ({ ...prev, categories: '' }));
  };

  // Skill Add/Remove Handlers
  const addSkill = (skill) => {
    const clean = skill.trim();
    if (!clean) return;
    if (!form.skills.includes(clean)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, clean] }));
    }
    setSkillInput('');
    if (errors.skills) setErrors((prev) => ({ ...prev, skills: '' }));
  };

  const removeSkill = (skillToRemove) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleKeyDownSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  // Headline-driven filters
  const headlineText = (form.headline || '').trim();
  const headlineKeywords = useMemo(
    () => extractHeadlineKeywords(headlineText),
    [headlineText]
  );
  const isHeadlineActive = headlineKeywords.length > 0;

  const filteredCategories = useMemo(() => {
    if (!isHeadlineActive) return dbCategories;
    return dbCategories.filter((c) => matchesHeadline(c, headlineText, headlineKeywords));
  }, [dbCategories, headlineText, headlineKeywords, isHeadlineActive]);

  const headlineMatchedSkills = useMemo(() => {
    if (!isHeadlineActive) return dbSkills;
    return dbSkills.filter((s) => matchesHeadline(s, headlineText, headlineKeywords));
  }, [dbSkills, headlineText, headlineKeywords, isHeadlineActive]);

  // Filter skills for autocomplete suggestion
  const availableSkillSuggestions = useMemo(() => {
    const source = headlineMatchedSkills;
    return source.filter(
      (s) =>
        !form.skills.includes(s) &&
        (skillInput ? s.toLowerCase().includes(skillInput.toLowerCase()) : true)
    );
  }, [headlineMatchedSkills, form.skills, skillInput]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.headline.trim()) errs.headline = 'Professional headline is required';
    if (!form.hourly_rate_amount || Number(form.hourly_rate_amount) <= 0)
      errs.hourly_rate_amount = 'Valid hourly rate is required';
    if (!form.location.city.trim()) errs.city = 'City is required';
    if (!form.location.country.trim()) errs.country = 'Country is required';
    if (!form.bio.trim() || form.bio.trim().length < 20)
      errs.bio = 'Bio must be at least 20 characters';
    if (form.categories.length === 0)
      errs.categories = 'Please select at least one category';
    if (form.skills.length === 0)
      errs.skills = 'Please add at least one skill';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please complete all highlighted mandatory fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        full_name: form.name.trim(),
        headline: form.headline.trim(),
        avatar: form.avatar.trim(),
        hourly_rate: Number(form.hourly_rate_amount),
        location: {
          city: form.location.city.trim(),
          country: form.location.country.trim(),
        },
        experience_level: form.experience_level,
        bio: form.bio.trim(),
        skills: form.skills,
        categories: form.categories,
        availability_status: form.availability_status,
        availability_hours: form.availability_hours,
      };

      await api.put('/onboarding/freelancer', payload);

      toast.success('Freelancer profile submitted! Awaiting admin approval.');
      router.push('/dashboard/freelancer');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Submission failed. Please check required fields.';
      console.error('Onboarding submit failed:', err);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-line rounded-3xl shadow-soft p-6 sm:p-10">
        <div className="border-b border-line pb-6 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand">Profile Setup</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Freelancer Onboarding
          </h1>
          <p className="text-muted mt-1 text-sm">
            Complete your profile using real-time platform categories and skills.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Headline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Tanvir Hasan"
                className={`w-full h-11 rounded-xl border px-3.5 text-sm focus:outline-none focus:ring-2 bg-white ${
                  errors.name ? 'border-red-400 focus:ring-red-300' : 'border-line focus:ring-brand/40'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Headline <span className="text-red-500">*</span>
              </label>
              <input
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="e.g. Senior UI/UX Designer & Systems Lead"
                className={`w-full h-11 rounded-xl border px-3.5 text-sm focus:outline-none focus:ring-2 bg-white ${
                  errors.headline ? 'border-red-400 focus:ring-red-300' : 'border-line focus:ring-brand/40'
                }`}
              />
              {errors.headline && <p className="text-xs text-red-500 mt-1">{errors.headline}</p>}
            </div>
          </div>

          {/* Rate & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hourly Rate (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.hourly_rate_amount}
                onChange={(e) => setForm({ ...form, hourly_rate_amount: e.target.value })}
                className={`w-full h-11 rounded-xl border px-3.5 text-sm focus:outline-none focus:ring-2 bg-white ${
                  errors.hourly_rate_amount ? 'border-red-400 focus:ring-red-300' : 'border-line focus:ring-brand/40'
                }`}
              />
              {errors.hourly_rate_amount && <p className="text-xs text-red-500 mt-1">{errors.hourly_rate_amount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Experience Level
              </label>
              <select
                value={form.experience_level}
                onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
                className="w-full h-11 rounded-xl border border-line px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <input
                value={form.location.city}
                onChange={(e) =>
                  setForm({ ...form, location: { ...form.location, city: e.target.value } })
                }
                placeholder="e.g. Dhaka"
                className={`w-full h-11 rounded-xl border px-3.5 text-sm focus:outline-none focus:ring-2 bg-white ${
                  errors.city ? 'border-red-400 focus:ring-red-300' : 'border-line focus:ring-brand/40'
                }`}
              />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                value={form.location.country}
                onChange={(e) =>
                  setForm({ ...form, location: { ...form.location, country: e.target.value } })
                }
                placeholder="e.g. Bangladesh"
                className={`w-full h-11 rounded-xl border px-3.5 text-sm focus:outline-none focus:ring-2 bg-white ${
                  errors.country ? 'border-red-400 focus:ring-red-300' : 'border-line focus:ring-brand/40'
                }`}
              />
              {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
            </div>
          </div>

          {/* Dynamic Categories from Tasks DB */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Categories <span className="text-red-500">*</span>
            </label>

            {/* Smart filter hint */}
            {isHeadlineActive && !loadingMeta && dbCategories.length > 0 && (
              <p className="text-[11px] font-semibold text-brand uppercase tracking-wider mb-2">
                ✨ Suggestions based on your headline
              </p>
            )}

            {loadingMeta ? (
              <div className="text-xs text-muted py-2">Loading categories from database...</div>
            ) : dbCategories.length === 0 ? (
              <div className="text-xs text-muted py-2">No categories found in Tasks collection.</div>
            ) : filteredCategories.length === 0 ? (
              <>
                <div className="text-xs text-muted py-2 mb-2">
                  No exact matches found. Select from all categories:
                </div>
                <div className="flex flex-wrap gap-2.5 p-3 rounded-2xl border border-line bg-slate-50/50">
                  {dbCategories.map((cat) => {
                    const selected = form.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          selected
                            ? 'bg-brand text-white shadow-soft'
                            : 'bg-white text-slate-700 border border-line hover:border-brand/40'
                        }`}
                      >
                        <span>{selected ? '✓' : '+'}</span>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2.5 p-3 rounded-2xl border border-line bg-slate-50/50">
                {filteredCategories.map((cat) => {
                  const selected = form.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        selected
                          ? 'bg-brand text-white shadow-soft'
                          : 'bg-white text-slate-700 border border-line hover:border-brand/40'
                      }`}
                    >
                      <span>{selected ? '✓' : '+'}</span>
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
            {errors.categories && <p className="text-xs text-red-500 mt-1">{errors.categories}</p>}
          </div>

          {/* Dynamic Skills from Freelancer DB */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Skills & Expertise <span className="text-red-500">*</span>
            </label>

            {/* Selected Skills */}
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {form.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 bg-brand/10 text-brand px-3 py-1.5 rounded-xl text-xs font-semibold"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-brand/70 hover:text-brand font-bold cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input and Add Button */}
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDownSkill}
                placeholder="Type skill name or pick from database suggestions below..."
                className="flex-1 h-11 rounded-xl border border-line px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              />
              <button
                type="button"
                onClick={() => addSkill(skillInput)}
                className="px-5 h-11 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
            {errors.skills && <p className="text-xs text-red-500 mt-1">{errors.skills}</p>}

            {/* Real suggestions from Freelancers DB */}
            {availableSkillSuggestions.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                    Database Suggestions:
                  </span>
                  {isHeadlineActive && (
                    <span className="text-[11px] font-semibold text-brand uppercase tracking-wider">
                      ✨ Based on your headline
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {availableSkillSuggestions.slice(0, 15).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand/10 hover:text-brand text-slate-600 transition-colors cursor-pointer"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Bio <span className="text-red-500">*</span>{' '}
              <span className="text-muted font-normal">(Min. 20 characters)</span>
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              placeholder="Provide a comprehensive summary of your past projects and expertise..."
              className={`w-full rounded-xl border px-3.5 py-3 text-sm focus:outline-none focus:ring-2 resize-none bg-white ${
                errors.bio ? 'border-red-400 focus:ring-red-300' : 'border-line focus:ring-brand/40'
              }`}
            />
            {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio}</p>}
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Avatar Image URL <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full h-11 rounded-xl border border-line px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
            />
          </div>

          {/* Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Availability Status
              </label>
              <select
                value={form.availability_status}
                onChange={(e) => setForm({ ...form, availability_status: e.target.value })}
                className="w-full h-11 rounded-xl border border-line px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Weekly Hours
              </label>
              <select
                value={form.availability_hours}
                onChange={(e) => setForm({ ...form, availability_hours: e.target.value })}
                className="w-full h-11 rounded-xl border border-line px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 bg-white"
              >
                <option value="10+ hrs/week">10+ hrs/week</option>
                <option value="20+ hrs/week">20+ hrs/week</option>
                <option value="30+ hrs/week">30+ hrs/week</option>
                <option value="40+ hrs/week">40+ hrs/week</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-line">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl shadow-soft transition-colors disabled:opacity-60 text-sm cursor-pointer"
            >
              {submitting ? 'Submitting Application…' : 'Submit Profile for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}