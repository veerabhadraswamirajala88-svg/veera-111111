import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { RecommendationCard } from '../components/RecommendationCard';
import { ExplainModal } from '../components/ExplainModal';
import { GridSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Recommendation } from '../types';
import {
  Sparkles,
  Compass,
  Bookmark,
  TrendingUp,
  Sliders,
  DollarSign,
  Layers,
  ArrowRight,
  History,
  ThumbsUp,
  RefreshCw,
  Search,
  Zap,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { profile, preferences } = useAuth();
  const [selectedExplainItem, setSelectedExplainItem] = useState<Recommendation | null>(null);

  // Recommendations query
  const {
    data: recsData,
    isLoading: recsLoading,
    refetch: refetchRecs,
    isRefetching,
  } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.getRecommendations(),
  });

  // Saved recommendations query
  const { data: savedData } = useQuery({
    queryKey: ['saved-recommendations'],
    queryFn: () => api.getSavedRecommendations(),
  });

  // Analytics query for summary metrics
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => api.getAnalytics(),
  });

  // Activity query for recent activities
  const { data: activityData } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => api.getActivityHistory(6),
  });

  const recommendations = recsData?.recommendations || [];
  const savedItems = savedData?.saved || [];
  const summary = analyticsData?.summary;
  const categories = preferences?.categories || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-10 shadow-xl shadow-indigo-900/10">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            Adaptive Intelligence Active
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Hello, {profile?.full_name?.split(' ')[0] || 'Friend'}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-indigo-100/90 leading-relaxed">
            Your personalized feed is tuned to your interests in{' '}
            <span className="font-semibold text-white">
              {preferences?.interests.slice(0, 3).join(', ') || 'Technology and Growth'}
            </span>{' '}
            with a max budget constraint of{' '}
            <span className="font-semibold text-white">
              {preferences?.budget_max
                ? `${preferences.currency} ${preferences.budget_max.toLocaleString()}`
                : 'Unlimited'}
            </span>
            .
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/discover"
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 flex items-center gap-1.5"
            >
              Explore Discover
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/assistant"
              className="px-5 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm border border-indigo-400/30 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              Ask AI Concierge
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recommendations */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Recommendations</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {recommendations.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Curated for your profile</p>
        </div>

        {/* Saved Items */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Saved Items</span>
            <Bookmark className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {savedItems.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            <Link to="/saved" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              View saved library
            </Link>
          </p>
        </div>

        {/* Feedback Sentiment */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Likes Given</span>
            <ThumbsUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {summary?.total_likes || 0}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Improves future relevance</p>
        </div>

        {/* Budget Limit */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Budget</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {preferences?.budget_max
              ? `${preferences.currency} ${preferences.budget_max.toLocaleString()}`
              : 'Flexible'}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            <Link to="/preferences" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Adjust budget
            </Link>
          </p>
        </div>
      </div>

      {/* Main Recommendations Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500" />
              Top Recommendations for You
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked by personalized relevance, budget adherence, and your active goals.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => refetchRecs()}
              disabled={isRefetching}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh Feed
            </button>
            <Link
              to="/discover"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
            >
              See All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {recsLoading ? (
          <GridSkeleton count={6} />
        ) : recommendations.length === 0 ? (
          <EmptyState
            title="No recommendations yet"
            description="We are tailoring items for your profile. Click below to generate your initial recommendations."
            actionText="Generate Recommendations"
            onAction={() => refetchRecs()}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 6).map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                onOpenExplain={(rec) => setSelectedExplainItem(rec)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Two Column Grid: Trending Categories & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Your Preferred Categories */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Active Domain Subscriptions
            </h3>
            <Link
              to="/preferences"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Edit in Preferences
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/discover?category=${encodeURIComponent(cat)}`}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-800 flex items-center justify-between group transition-all"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {cat}
                  </span>
                  <p className="text-[11px] text-slate-400">Tap to filter feed</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent Interactions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                Recent Activity
              </h3>
              <Link
                to="/activity"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Full History
              </Link>
            </div>

            <div className="space-y-3">
              {(activityData?.activities || []).slice(0, 4).map((act) => (
                <div key={act.id} className="flex items-start space-x-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-slate-300 font-medium truncate">
                      {act.metadata?.title || act.metadata?.query || act.activity_type.replace('_', ' ')}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {(activityData?.activities?.length || 0) === 0 && (
                <p className="text-xs text-slate-400 italic">No recent activity logged yet.</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <Link
              to="/analytics"
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              View Engagement Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Explainability Breakdown Modal */}
      <ExplainModal
        item={selectedExplainItem}
        onClose={() => setSelectedExplainItem(null)}
      />
    </div>
  );
};
