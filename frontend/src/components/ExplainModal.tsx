import React from 'react';
import { Recommendation } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Compass,
  Target,
  ShieldAlert,
  Layers,
} from 'lucide-react';

interface ExplainModalProps {
  item: Recommendation | null;
  onClose: () => void;
}

export const ExplainModal: React.FC<ExplainModalProps> = ({ item, onClose }) => {
  const { preferences, profile } = useAuth();

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Personalization Breakdown
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How PersonaAI matched this item to your profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Item summary banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              {item.category}
            </span>
            <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
              {item.title}
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {item.description}
            </p>
          </div>

          {/* Relevance Score Meter */}
          <div>
            <div className="flex justify-between items-center mb-1 text-sm font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Calculated Relevance</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {Math.round(item.relevance_score)} / 100
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${item.relevance_score}%` }}
              />
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Core Matching Dimensions
            </h4>

            {/* Interest Match */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <Layers className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Interest Affinity:
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Direct match with your selected interests:{' '}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {preferences?.interests.join(', ') || 'Exploration'}
                  </span>
                </p>
              </div>
            </div>

            {/* Goal Match */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <Target className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Goal Alignment:
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Targets your objectives:{' '}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {preferences?.goals.join(', ') || 'Growth'}
                  </span>
                </p>
              </div>
            </div>

            {/* Budget Check */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <DollarSign className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Budget Constraint Compliance:
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Estimated at{' '}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {item.estimated_price === 0
                      ? 'Free'
                      : `${item.currency} ${(item.estimated_price ?? 0).toLocaleString()}`}
                  </span>
                  , well within your maximum profile threshold of{' '}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {preferences?.budget_max
                      ? `${preferences.currency} ${preferences.budget_max.toLocaleString()}`
                      : 'unlimited'}
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* AI vs Verified Data Advisory Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold">Transparent AI Advisory:</span>
              <p className="mt-0.5 text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                This item is an AI-generated suggestion curated based on your preferences.
                Prices, resources, and availability are realistic estimates rather than live vendor listings.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
