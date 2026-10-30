import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { RecommendationCard } from '../components/RecommendationCard';
import { ExplainModal } from '../components/ExplainModal';
import { CardSkeleton, GridSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { CATEGORIES, Recommendation } from '../types';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  X,
  History,
  Tag,
  ArrowUpDown,
  Filter,
  Check,
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'newest'>('relevance');
  const [personalize, setPersonalize] = useState(true);
  const [selectedExplainItem, setSelectedExplainItem] = useState<Recommendation | null>(null);

  // Search history query
  const { data: historyData } = useQuery({
    queryKey: ['search-history'],
    queryFn: () => api.getSearchHistory(),
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: () =>
      api.searchRecommendations({
        query,
        category: category !== 'All' ? category : undefined,
        max_price: maxPrice,
        sort_by: sortBy,
        personalize,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-history'] });
    },
  });

  // Initial search on mount
  useEffect(() => {
    searchMutation.mutate();
  }, [category, maxPrice, sortBy, personalize]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchMutation.mutate();
  };

  const handleChipClick = (savedQuery: string) => {
    setQuery(savedQuery);
    api
      .searchRecommendations({
        query: savedQuery,
        category: category !== 'All' ? category : undefined,
        max_price: maxPrice,
        sort_by: sortBy,
        personalize,
      })
      .then((data) => {
        searchMutation.reset();
        // Force mutation state update
        queryClient.invalidateQueries({ queryKey: ['search-history'] });
      });
  };

  const results = searchMutation.data?.results || [];
  const interpretation = searchMutation.data?.interpretation;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Search className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          Smart Personalized Search
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Search with natural language. PersonaAI interprets your intent, budget limits, and blends your profile affinity.
        </p>
      </div>

      {/* Main Search Bar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'beginner python course under 2000' or 'minimalist travel shoes'..."
              className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={searchMutation.isPending}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {searchMutation.isPending ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* AI Interpretation pill (if query entered) */}
        {interpretation && (interpretation.detected_category || interpretation.detected_budget) && (
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              <span className="font-bold">AI Query Interpretation:</span> Detected domain{' '}
              <span className="font-semibold">{interpretation.detected_category || 'General'}</span>
              {interpretation.detected_budget && (
                <>
                  {' '}with budget ceiling of{' '}
                  <span className="font-semibold">₹{interpretation.detected_budget.toLocaleString()}</span>
                </>
              )}
            </span>
          </div>
        )}

        {/* Filter Controls Row */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="relevance">Personalized Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Personalization Toggle */}
          <button
            type="button"
            onClick={() => setPersonalize(!personalize)}
            className={`px-3 py-1.5 rounded-xl font-medium border flex items-center gap-1.5 transition-colors ${
              personalize
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Personalization Boost: {personalize ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Recent Search History Chips */}
        {(historyData?.history?.length || 0) > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <History className="w-3.5 h-3.5" />
              Recent:
            </span>
            {historyData?.history.slice(0, 5).map((h) => (
              <button
                key={h.id}
                onClick={() => handleChipClick(h.search_query)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium transition-colors"
              >
                {h.search_query}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Found {results.length} personalized results</span>
      </div>

      {/* Results Grid */}
      {searchMutation.isPending ? (
        <GridSkeleton count={6} />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No search matches found"
          description="Try relaxing your filters or typing different keywords."
          actionText="Clear Search"
          onAction={() => {
            setQuery('');
            setCategory('All');
            setMaxPrice(undefined);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => (
            <RecommendationCard
              key={item.id}
              item={item}
              onOpenExplain={(rec) => setSelectedExplainItem(rec)}
            />
          ))}
        </div>
      )}

      {/* Explain Breakdown Modal */}
      <ExplainModal
        item={selectedExplainItem}
        onClose={() => setSelectedExplainItem(null)}
      />
    </div>
  );
};
