import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { RecommendationCard } from '../components/RecommendationCard';
import { ExplainModal } from '../components/ExplainModal';
import { GridSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { CATEGORIES, Recommendation } from '../types';
import {
  Compass,
  Filter,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  DollarSign,
  SlidersHorizontal,
} from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const activeCategory = searchParams.get('category') || 'All';
  const [sortBy, setSortBy] = useState('relevance');
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [selectedExplainItem, setSelectedExplainItem] = useState<Recommendation | null>(null);

  // Fetch recommendations with active filters
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['discover-recommendations', activeCategory, sortBy, maxPrice],
    queryFn: () =>
      api.getRecommendations({
        category: activeCategory,
        sort_by: sortBy,
        max_price: maxPrice,
      }),
  });

  // Generate new recommendations mutation
  const generateMutation = useMutation({
    mutationFn: () => api.generateRecommendations(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discover-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const recommendations = data?.recommendations || [];

  const handleCategoryChange = (category: string) => {
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Discover Personalized Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Intelligently ranked suggestions aligned with your budget, interests, and active goals.
          </p>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending || isRefetching}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          {generateMutation.isPending ? 'Generating with AI...' : 'Generate New Feed'}
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleCategoryChange('All')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              activeCategory === 'All'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Domains
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Row: Price and Sort */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Price Quick Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Max Price:
            </span>
            <div className="flex items-center gap-1.5">
              {[undefined, 1000, 3000, 5000].map((val) => (
                <button
                  key={val ?? 'any'}
                  onClick={() => setMaxPrice(val)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    maxPrice === val
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {val === undefined ? 'Any' : `≤ ₹${val.toLocaleString()}`}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="relevance">Highest Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Recently Generated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {isLoading ? (
        <GridSkeleton count={6} />
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No recommendations match your filters"
          description="Try broadening your price threshold or selecting 'All Domains' to see personalized suggestions."
          actionText="Reset Filters"
          onAction={() => {
            handleCategoryChange('All');
            setMaxPrice(undefined);
            setSortBy('relevance');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((item) => (
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
