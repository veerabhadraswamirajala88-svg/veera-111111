import React from 'react';
import { Sparkles, Shield, Cpu, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                PersonaAI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Intelligent Personalization Platform delivering dynamic, budget-aware, and goal-aligned digital experiences powered by Google Gemini and Supabase.
            </p>
          </div>

          {/* Supported Domains */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Domains
            </h4>
            <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <li>Education & Tutorials</li>
              <li>Technology & Developer Tools</li>
              <li>Fitness & Lifestyle</li>
              <li>Career & Growth</li>
              <li>Shopping & Products</li>
            </ul>
          </div>

          {/* Privacy & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Transparency
            </h4>
            <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                Row-Level Security (RLS)
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                Google Gemini Engine
              </li>
              <li>User Data Portability</li>
              <li>Zero Discriminatory Profiling</li>
            </ul>
          </div>

          {/* System status */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Engine Status
            </h4>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">API Status:</span>
                <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Personalization:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Adaptive Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} PersonaAI. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for intelligent experiences.
          </p>
        </div>
      </div>
    </footer>
  );
};
