import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { RecommendationCard } from '../components/RecommendationCard';
import { ExplainModal } from '../components/ExplainModal';
import { GridSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Recommendation } from '../types';
import { Bookmark, Compass, Filter } from 'lucide-react';

export const SavedPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExplainItem, setSelectedExplainItem] = useState<Recommendation | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['saved-recommendations'],
    queryFn: () => api.getSavedRecommendations(),
  });

  const savedList = data?.saved || [];

  const categories = ['All', ...Array.from(new Set(savedList.map((s) => s.category)))];

  const filtered =
    selectedCategory === 'All'
      ? savedList
      : savedList.filter((s) => s.category === selectedCategory);

  const handleFeedbackChange = () => {
    queryClient.invalidateQueries({ queryKey: ['saved-recommendations'] });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Saved Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access items you've bookmarked to explore, purchase, or study later.
          </p>
        </div>

        {categories.length > 2 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Filter:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <GridSkeleton count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved items yet"
          description="Whenever you find a recommendation you like, tap the bookmark icon to save it here for later."
          actionText="Explore Recommendations"
          actionHref="/discover"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <RecommendationCard
              key={item.id}
              item={item}
              onFeedbackChange={handleFeedbackChange}
              onOpenExplain={(rec) => setSelectedExplainItem(rec)}
            />
          ))}
        </div>
      )}

      <ExplainModal
        item={selectedExplainItem}
        onClose={() => setSelectedExplainItem(null)}
      />
    </div>
  );
};
