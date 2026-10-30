import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import {
  History,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Search,
  Sliders,
  Sparkles,
  Trash2,
  Filter,
  Eye,
  CheckCircle,
} from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['activity-history'],
    queryFn: () => api.getActivityHistory(100),
  });

  const clearMutation = useMutation({
    mutationFn: () => api.clearHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-history'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
    },
  });

  const activities = data?.activities || [];

  const filtered =
    filterType === 'all'
      ? activities
      : activities.filter((a) => a.activity_type.toLowerCase().includes(filterType.toLowerCase()));

  const getActivityIcon = (type: string) => {
    if (type.includes('like')) return <ThumbsUp className="w-4 h-4 text-emerald-500" />;
    if (type.includes('dislike')) return <ThumbsDown className="w-4 h-4 text-red-500" />;
    if (type.includes('save')) return <Bookmark className="w-4 h-4 text-purple-500" />;
    if (type.includes('search')) return <Search className="w-4 h-4 text-blue-500" />;
    if (type.includes('preferences') || type.includes('profile')) return <Sliders className="w-4 h-4 text-amber-500" />;
    if (type.includes('assistant')) return <Sparkles className="w-4 h-4 text-indigo-500" />;
    return <Eye className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <History className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Activity History & Interaction Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete transparent log of all views, feedback, searches, and preference modifications.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Activities</option>
            <option value="feedback">Feedback Only</option>
            <option value="search">Searches</option>
            <option value="preferences">Profile Updates</option>
            <option value="assistant">Assistant Chats</option>
          </select>

          {activities.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your activity history?')) {
                  clearMutation.mutate();
                }
              }}
              disabled={clearMutation.isPending}
              className="px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity recorded"
          description="Your browsing, searches, and feedback submissions will be logged here with complete transparency."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          {filtered.map((act) => (
            <div
              key={act.id}
              className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {getActivityIcon(act.activity_type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold capitalize text-slate-800 dark:text-slate-200">
                      {act.activity_type.replace(/_/g, ' ')}
                    </span>
                    {act.category && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        {act.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {act.metadata?.title
                      ? `Item: ${act.metadata.title}`
                      : act.metadata?.query
                      ? `Query: "${act.metadata.query}"`
                      : act.metadata?.querySnippet
                      ? `Asked: "${act.metadata.querySnippet}"`
                      : 'System adaptation event'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-medium text-slate-400">
                  {new Date(act.created_at).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  •{' '}
                  {new Date(act.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
