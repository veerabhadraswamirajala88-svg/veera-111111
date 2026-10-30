import React, { useState } from 'react';
import { getApiBaseUrl, setCustomApiUrl, clearCustomApiUrl, isProductionEnvironment, isLocalhostUrl } from '../config/api';
import { Server, CheckCircle2, AlertTriangle, RefreshCw, X, Globe, Link2 } from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const currentUrl = getApiBaseUrl();
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const isProd = isProductionEnvironment();
  const isLocal = isLocalhostUrl(currentUrl);

  const handleSave = () => {
    if (!inputUrl.trim()) return;
    setCustomApiUrl(inputUrl.trim());
    window.location.reload();
  };

  const handleReset = () => {
    clearCustomApiUrl();
    window.location.reload();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      let testTarget = inputUrl.trim().replace(/\/+$/, '');
      if (!testTarget.endsWith('/api')) {
        testTarget = `${testTarget}/api`;
      }
      const res = await fetch(`${testTarget}/health`, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        setTestResult({
          ok: true,
          message: `Connected successfully! Engine: ${json.engine || 'PersonaAI Core'}`,
        });
      } else {
        setTestResult({
          ok: false,
          message: `Server replied with HTTP status ${res.status}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err.message || 'Unable to connect to this API URL',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Backend API Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your Render backend connection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout */}
        {isProd && isLocal && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start space-x-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold mb-1">Production Environment Notice</p>
              <p>
                The frontend is running on Vercel but currently attempting to reach <code className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">{currentUrl}</code>.
                Enter your deployed Render backend URL below to connect live.
              </p>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Backend API URL
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://your-backend.onrender.com/api"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Example: <code className="text-indigo-600 dark:text-indigo-400">https://persona-ai-backend.onrender.com/api</code>
          </p>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center space-x-2.5 ${
              testResult.ok
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
            Save & Connect
          </button>
        </div>

        {/* Reset button */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
          >
            Reset to Default (Localhost / Vercel Env)
          </button>
        </div>
      </div>
    </div>
  );
};
