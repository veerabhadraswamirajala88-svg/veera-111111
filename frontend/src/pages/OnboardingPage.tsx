import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  CATEGORIES,
  PREDEFINED_INTERESTS,
  PREDEFINED_GOALS,
  BUDGET_TIERS,
} from '../types';
import { ApiConfigModal } from '../components/ApiConfigModal';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  DollarSign,
  User,
  MapPin,
  Target,
  Sliders,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [ageRange, setAgeRange] = useState('25-34');
  const [location, setLocation] = useState('Bengaluru, India');
  const [bio, setBio] = useState('Exploring intelligent tools and personalized recommendations');

  // Preferences
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Technology',
    'Programming',
    'Personal Development',
  ]);
  const [customInterest, setCustomInterest] = useState('');

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Technology',
    'Education',
    'Career & Professional Growth',
  ]);

  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Learn new skills',
    'Improve productivity',
  ]);
  const [customGoal, setCustomGoal] = useState('');

  const [dislikedCategories, setDislikedCategories] = useState<string[]>([]);
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState(3); // ₹2,000 - ₹5,000
  const [customBudgetMax, setCustomBudgetMax] = useState<number | ''>('');
  const [currency, setCurrency] = useState('INR');
  const [frequency, setFrequency] = useState('daily');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const addCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInterest.trim()) return;
    const clean = customInterest.trim();
    if (!selectedInterests.includes(clean)) {
      setSelectedInterests((prev) => [...prev, clean]);
    }
    setCustomInterest('');
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleDisliked = (cat: string) => {
    setDislikedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const addCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoal.trim()) return;
    const clean = customGoal.trim();
    if (!selectedGoals.includes(clean)) {
      setSelectedGoals((prev) => [...prev, clean]);
    }
    setCustomGoal('');
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      setStep(2);
      return;
    }
    if (selectedCategories.length === 0) {
      setError('Please select at least one preferred category');
      setStep(2);
      return;
    }
    if (selectedGoals.length === 0) {
      setError('Please select at least one goal');
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const budgetMax =
      customBudgetMax !== ''
        ? Number(customBudgetMax)
        : BUDGET_TIERS[selectedBudgetIndex].max;

    const payload = {
      full_name: fullName.trim() || 'PersonaAI User',
      age_range: ageRange,
      location: location.trim(),
      bio: bio.trim(),
      interests: selectedInterests,
      categories: selectedCategories,
      goals: selectedGoals,
      disliked_categories: dislikedCategories,
      preferred_content_types: ['Courses', 'Tools', 'Guides'],
      budget_min: 0,
      budget_max: budgetMax,
      currency: currency,
      recommendation_frequency: frequency,
    };

    try {
      await api.submitOnboarding(payload);
      await refreshProfile();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to save onboarding preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 flex items-center justify-center transition-colors">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header with step progress indicator */}
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                Personalization Setup
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              Step {step} of 4
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">{error}</div>
            <button
              type="button"
              onClick={() => setConfigModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/60 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 font-semibold text-[11px] whitespace-nowrap self-start sm:self-auto"
            >
              Configure Backend URL
            </button>
          </div>
        )}

        {/* Step Contents */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: Personal Identity */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Who are you?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Let's personalize your identity and baseline location context
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Age Range
                  </label>
                  <select
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value="Under 18">Under 18</option>
                    <option value="18-24">18–24</option>
                    <option value="25-34">25–34</option>
                    <option value="35-49">35–49</option>
                    <option value="50+">50+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bengaluru, India"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Bio / Focus Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell PersonaAI what you're currently working on or curious about..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Interests & Categories */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  What sparks your interest?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Select your core interests and domains you want to explore.
                </p>
              </div>

              {/* Interests Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Interests (Select multiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_INTERESTS.map((interest) => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" />}
                        {interest}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Interest Input */}
                <form onSubmit={addCustomInterest} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    placeholder="Add custom interest (e.g. Quantum Computing, Ceramics)..."
                    className="flex-1 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </form>
              </div>

              {/* Target Categories */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Target Categories
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const active = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                          active
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs font-semibold">{cat}</span>
                        {active && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Goals & Exclusions */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  What are your goals?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  PersonaAI personalizes recommendations to directly advance what you want to achieve.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Active Objectives
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PREDEFINED_GOALS.map((goal) => {
                    const active = selectedGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                          active
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs font-semibold">{goal}</span>
                        {active && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={addCustomGoal} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="Add custom goal (e.g. Launch a side business, Run 5k)..."
                    className="flex-1 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </form>
              </div>

              {/* Exclude / Disliked Categories */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Disliked Categories (Never Recommend)
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Items in these domains will be strictly omitted from your feed.
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const isDisliked = dislikedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleDisliked(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          isDisliked
                            ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300'
                        }`}
                      >
                        {isDisliked ? `✕ Blocked: ${cat}` : cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Budget Range & Frequency */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Budget & Constraints
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Every recommendation respects your spending threshold without surprise costs.
                </p>
              </div>

              {/* Budget Tiers */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Spending Threshold ({currency})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {BUDGET_TIERS.map((tier, idx) => (
                    <button
                      key={tier.label}
                      type="button"
                      onClick={() => {
                        setSelectedBudgetIndex(idx);
                        setCustomBudgetMax('');
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        selectedBudgetIndex === idx && customBudgetMax === ''
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-100 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xs">{tier.label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Budget Max Input */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Or specify custom limit:</span>
                  <div className="relative w-40">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={customBudgetMax}
                      onChange={(e) => setCustomBudgetMax(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 7500"
                      className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Recommendation Frequency */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Recommendation Refresh Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="daily">Daily Refresh (Recommended)</option>
                  <option value="weekly">Weekly Digest</option>
                  <option value="instant">Continuous Real-Time Updates</option>
                </select>
              </div>

              {/* Summary notice */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                  <span className="font-bold">Ready to generate:</span> When you complete setup, PersonaAI's Gemini recommendation engine will curate your first 8 personalized recommendations based on your {selectedInterests.length} interests and goals.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !fullName.trim()) {
                  setError('Please provide your full name');
                  return;
                }
                setError(null);
                setStep(step + 1);
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Your Feed...
                </>
              ) : (
                <>
                  Complete & Launch Dashboard
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <ApiConfigModal isOpen={configModalOpen} onClose={() => setConfigModalOpen(false)} />
    </div>
  );
};
