import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [personalizationEnabled, setPersonalizationEnabled] = useState(
    profile?.personalization_enabled ?? true
  );

  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTogglePersonalization = async () => {
    const nextVal = !personalizationEnabled;
    setPersonalizationEnabled(nextVal);
    try {
      await api.updatePrivacySettings(nextVal);
      await refreshProfile();
      setMessage({ type: 'success', text: `Personalization ${nextVal ? 'enabled' : 'disabled'}` });
    } catch {
      setPersonalizationEnabled(!nextVal);
      setMessage({ type: 'error', text: 'Failed to update setting' });
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      const blob = await api.exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `persona-ai-export-${profile?.id || 'user'}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Data export downloaded successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to export data' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearHistory = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your activity history and search queries? This cannot be undone.'
      )
    ) {
      setIsClearing(true);
      try {
        await api.clearHistory();
        setMessage({ type: 'success', text: 'Activity and search logs deleted permanently' });
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to clear history' });
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-3xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          Privacy, Data Governance & Control
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          You own your digital footprint. Export, inspect, or purge your records at any time.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Control 1: Personalization Toggle */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Enable Personalized Experience
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            When enabled, Gemini adapts suggestions to your explicit feedback and goals.
          </p>
        </div>

        <button
          onClick={handleTogglePersonalization}
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

      {/* Control 2: Data Export */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-500" />
            Export My Data (GDPR & CCPA Compliant)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Download a portable JSON document containing all your profile data, feedback, and AI chats.
          </p>
        </div>

        <button
          onClick={handleExportData}
          disabled={isExporting}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          {isExporting ? 'Generating JSON...' : 'Download JSON'}
        </button>
      </div>

      {/* Control 3: Purge Activity Logs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-500" />
            Clear Browsing & Search History
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Wipes all interaction logs and search query records from your account.
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          disabled={isClearing}
          className="px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          {isClearing ? 'Purging...' : 'Purge History'}
        </button>
      </div>

      {/* Advisory Principles Card */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-indigo-500" />
          PersonaAI Advisory & Ethical Directives
        </h4>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Supabase Row-Level Security:</strong> Your database tables are protected by cryptographic JWT checks; other accounts cannot read your profile.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Zero Discriminatory Profiling:</strong> We never infer sensitive personal characteristics or discriminate based on demographics.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Advisory Clarity:</strong> Recommendations identify AI-generated suggestions vs verified vendor listings.
          </li>
        </ul>
      </div>
    </div>
  );
};
