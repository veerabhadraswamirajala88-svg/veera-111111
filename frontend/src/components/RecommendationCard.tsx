import React, { useState } from 'react';
import { Recommendation } from '../types';
import { api } from '../api/client';
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Sparkles,
  Info,
  CheckCircle,
  EyeOff,
  ChevronRight,
  HelpCircle,
  Tag,
  ArrowUpRight,
} from 'lucide-react';

interface RecommendationCardProps {
  item: Recommendation;
  onFeedbackChange?: (id: string, type: string, active: boolean) => void;
  onOpenExplain?: (item: Recommendation) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Education: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-900',
  },
  Technology: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-900',
  },
  Fashion: {
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-200 dark:border-pink-900',
  },
  'Fitness & Lifestyle': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-900',
  },
  Entertainment: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-900',
  },
  'Shopping & Products': {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-900',
  },
  'Career & Professional Growth': {
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-900',
  },
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onFeedbackChange,
  onOpenExplain,
}) => {
  const [liked, setLiked] = useState<boolean>(Boolean(item.is_liked));
  const [disliked, setDisliked] = useState<boolean>(Boolean(item.is_disliked));
  const [saved, setSaved] = useState<boolean>(Boolean(item.is_saved));
  const [notInterested, setNotInterested] = useState<boolean>(Boolean(item.is_not_interested));
  const [showWhy, setShowWhy] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const colors = CATEGORY_COLORS[item.category] || {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
  };

  const handleFeedback = async (type: 'like' | 'dislike' | 'save' | 'not_interested') => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (type === 'like') {
        const nextState = !liked;
        setLiked(nextState);
        if (nextState) setDisliked(false);
        if (nextState) {
          await api.submitFeedback(item.id, 'like');
        } else {
          await api.removeFeedback(item.id, 'like');
        }
        onFeedbackChange?.(item.id, 'like', nextState);
      } else if (type === 'dislike') {
        const nextState = !disliked;
        setDisliked(nextState);
        if (nextState) setLiked(false);
        if (nextState) {
          await api.submitFeedback(item.id, 'dislike');
        } else {
          await api.removeFeedback(item.id, 'dislike');
        }
        onFeedbackChange?.(item.id, 'dislike', nextState);
      } else if (type === 'save') {
        const nextState = !saved;
        setSaved(nextState);
        if (nextState) {
          await api.submitFeedback(item.id, 'save');
        } else {
          await api.removeFeedback(item.id, 'save');
        }
        onFeedbackChange?.(item.id, 'save', nextState);
      } else if (type === 'not_interested') {
        const nextState = !notInterested;
        setNotInterested(nextState);
        if (nextState) {
          await api.submitFeedback(item.id, 'not_interested');
        } else {
          await api.removeFeedback(item.id, 'not_interested');
        }
        onFeedbackChange?.(item.id, 'not_interested', nextState);
      }
    } catch (err) {
      console.error('Feedback error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = () => {
    api.logActivity({
      activity_type: 'click_recommendation',
      recommendation_id: item.id,
      category: item.category,
      metadata: { title: item.title },
    });
  };

  if (notInterested) {
    return (
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 flex items-center justify-between">
        <span>Hidden: marked as not interested</span>
        <button
          onClick={() => handleFeedback('not_interested')}
          className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800/60 shadow-xs hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 overflow-hidden"
    >
      {/* Top Banner: Category, Relevance Score & Price */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {item.category}
          </span>

          <div className="flex items-center space-x-2">
            {/* Price Badge */}
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              {item.estimated_price === 0
                ? 'Free'
                : `${item.currency || 'INR'} ${(item.estimated_price ?? 0).toLocaleString()}`}
            </span>

            {/* Relevance Pill */}
            <span
              title="Personalization relevance match calculated from your profile"
              className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center gap-1 border border-indigo-200/60 dark:border-indigo-900/60"
            >
              <Sparkles className="w-3 h-3" />
              {Math.round(item.relevance_score)}% Match
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {item.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
          {item.description}
        </p>

        {/* Tags */}
        {item.recommendation_data?.tags && item.recommendation_data.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.recommendation_data.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Middle Section: Personalization Reasoning & Next Action */}
      <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        {/* Why Match Snippet */}
        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-slate-600 dark:text-slate-400 leading-tight">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Why matched: </span>
            {item.explanation}
          </p>
        </div>

        {/* Next Action Callout */}
        {item.recommendation_data?.next_action && (
          <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="font-medium flex items-center gap-1 truncate">
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              {item.recommendation_data.next_action}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Section: Feedback Actions & Explain Modal Button */}
      <div className="p-3 px-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Like */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFeedback('like');
            }}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              liked
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Like this recommendation"
          >
            <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-emerald-500' : ''}`} />
          </button>

          {/* Dislike */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFeedback('dislike');
            }}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              disliked
                ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                : 'text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Not for me (dislike)"
          >
            <ThumbsDown className={`w-4 h-4 ${disliked ? 'fill-red-500' : ''}`} />
          </button>

          {/* Save / Bookmark */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFeedback('save');
            }}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              saved
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Save for later"
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-indigo-500' : ''}`} />
          </button>

          {/* Not Interested */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFeedback('not_interested');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Hide / Not Interested"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>

        {/* Explain deep dive */}
        {onOpenExplain && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenExplain(item);
            }}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Why?
          </button>
        )}
      </div>
    </div>
  );
};
