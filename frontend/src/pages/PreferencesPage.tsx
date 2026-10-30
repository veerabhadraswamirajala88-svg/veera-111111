import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  CATEGORIES,
  PREDEFINED_INTERESTS,
  PREDEFINED_GOALS,
  BUDGET_TIERS,
} from '../types';
import {
  Sliders,
  Sparkles,
  Plus,
  X,
  Check,
  DollarSign,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
  Target,
} from 'lucide-react';

export const PreferencesPage: React.FC = () => {
  const { preferences, profile, refreshProfile } = useAuth();

  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState('');
  const [dislikedCategories, setDislikedCategories] = useState<string[]>([]);
  const [budgetMax, setBudgetMax] = useState<number | ''>('');
  const [currency, setCurrency] = useState('INR');
  const [frequency, setFrequency] = useState('daily');
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (preferences) {
      setInterests(preferences.interests || []);
      setCategories(preferences.categories || []);
      setGoals(preferences.goals || []);
      setDislikedCategories(preferences.disliked_categories || []);
      setBudgetMax(preferences.budget_max ?? '');
      setCurrency(preferences.currency || 'INR');
      setFrequency(preferences.recommendation_frequency || 'daily');
    }
    if (profile) {
      setPersonalizationEnabled(profile.personalization_enabled ?? true);
    }
  }, [preferences, profile]);

  const toggleInterest = (val: string) => {
    setInterests((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    );
  };

  const removeInterest = (val: string) => {
    setInterests((prev) => prev.filter((i) => i !== val));
  };

  const addCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInterest.trim()) return;
    const clean = customInterest.trim();
    if (!interests.includes(clean)) {
      setInterests((prev) => [...prev, clean]);
    }
    setCustomInterest('');
  };

  const toggleCategory = (val: string) => {
    setCategories((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  };

  const toggleDislikedCategory = (val: string) => {
    setDislikedCategories((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  };

  const toggleGoal = (val: string) => {
    setGoals((prev) =>
      prev.includes(val) ? prev.filter((g) => g !== val) : [...prev, val]
    );
  };

  const addCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoal.trim()) return;
    const clean = customGoal.trim();
    if (!goals.includes(clean)) {
      setGoals((prev) => [...prev, clean]);
    }
    setCustomGoal('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await api.updatePreferences({
        interests,
        categories,
        goals,
        disliked_categories: dislikedCategories,
        budget_max: budgetMax === '' ? null : Number(budgetMax),
        currency,
        recommendation_frequency: frequency,
      });

      await api.updatePrivacySettings(personalizationEnabled);
      await refreshProfile();
      setSuccessMessage('Preferences updated successfully. Recommendations regenerated dynamically!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetProfile = async () => {
    if (
      window.confirm(
        'Are you sure you want to reset your personalization settings? This will clear your custom preferences and relaunch the onboarding wizard.'
      )
    ) {
      try {
        await api.resetProfile();
        await refreshProfile();
        window.location.href = '/onboarding';
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to reset profile');
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Sliders className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Preferences & Personalization Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tune your interests, goals, budget limits, and category subscriptions anytime.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="self-start sm:self-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Personalization Toggle */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Personalization Engine Status
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            When disabled, recommendations will be general and unbiased rather than tailored to your profile.
          </p>
        </div>

        <button
          onClick={() => setPersonalizationEnabled(!personalizationEnabled)}
          className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
            personalizationEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              personalizationEnabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Section 2: Interests Management */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Interests & Topics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add or remove areas of interest. Recommendations will weigh these keywords heavily.
          </p>
        </div>

        {/* Selected Interests Chips with Remove X */}
        <div className="flex flex-wrap gap-2 pt-2">
          {interests.map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-semibold"
            >
              {interest}
              <button
                type="button"
                onClick={() => removeInterest(interest)}
                className="hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {interests.length === 0 && (
            <p className="text-xs text-slate-400 italic">No interests selected. Add some below!</p>
          )}
        </div>

        {/* Add predefined suggestions */}
        <div>
          <span className="text-xs text-slate-500 block mb-2 font-medium">Quick Suggestions:</span>
          <div className="flex flex-wrap gap-1.5">
            {PREDEFINED_INTERESTS.filter((p) => !interests.includes(p)).slice(0, 8).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => toggleInterest(p)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-slate-400" />
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Interest Input */}
        <form onSubmit={addCustomInterest} className="flex gap-2 pt-2">
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            placeholder="Type custom interest..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Interest
          </button>
        </form>
      </div>

      {/* Section 3: Budget Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-500" />
            Budget Constraints
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set your strict spending ceiling. The engine will not recommend items exceeding this price.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Maximum Price Limit (Leave blank for unrestricted)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min={0}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 5000"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 4: Target Categories & Disliked Categories */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            Category Subscriptions & Exclusions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Toggle preferred domains to prioritize, and mark unwanted domains to suppress.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const isPreferred = categories.includes(cat);
            const isDisliked = dislikedCategories.includes(cat);

            return (
              <div
                key={cat}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {cat}
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      isPreferred
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isPreferred ? 'Included' : 'Include'}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleDislikedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      isDisliked
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isDisliked ? 'Blocked' : 'Block'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 5: Reset Profile Action */}
      <div className="p-6 rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
            Reset Personalization Profile
          </h4>
          <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
            Clears your current preferences and triggers the onboarding walkthrough again.
          </p>
        </div>

        <button
          onClick={handleResetProfile}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Profile
        </button>
      </div>
    </div>
  );
};
