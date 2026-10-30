import { z } from 'zod';

export const CATEGORIES = [
  'Education',
  'Technology',
  'Fashion',
  'Fitness & Lifestyle',
  'Entertainment',
  'Shopping & Products',
  'Career & Professional Growth',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const FEEDBACK_TYPES = [
  'like',
  'dislike',
  'save',
  'not_interested',
  'relevant',
  'not_relevant',
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export interface Profile {
  id: string;
  full_name: string;
  location?: string | null;
  age_range?: string | null;
  bio?: string | null;
  onboarding_completed: boolean;
  personalization_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  interests: string[];
  categories: string[];
  goals: string[];
  disliked_categories: string[];
  preferred_content_types: string[];
  budget_min: number;
  budget_max?: number | null;
  currency: string;
  recommendation_frequency: string;
  updated_at: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  estimated_price?: number | null;
  currency: string;
  relevance_score: number;
  explanation: string;
  recommendation_data: {
    next_action?: string;
    tags?: string[];
    match_reasons?: string[];
    is_simulated?: boolean;
    confidence?: number;
    difficulty_level?: string;
    item_type?: string;
  };
  source_type: 'gemini_ai' | 'algorithmic_fallback' | 'verified_catalog';
  source_url?: string | null;
  status: 'active' | 'archived' | 'dismissed';
  generated_at: string;
  created_at: string;
}

export interface RecommendationFeedback {
  id: string;
  user_id: string;
  recommendation_id: string;
  feedback_type: FeedbackType;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  recommendation_id?: string | null;
  activity_type: string;
  category?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  search_query: string;
  category?: string | null;
  filters?: Record<string, any>;
  created_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Zod schemas for input validation
export const OnboardingSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  age_range: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  goals: z.array(z.string()).min(1, 'Select at least one goal'),
  disliked_categories: z.array(z.string()).default([]),
  preferred_content_types: z.array(z.string()).default([]),
  budget_min: z.number().nonnegative().default(0),
  budget_max: z.number().positive().optional().nullable(),
  currency: z.string().default('INR'),
  recommendation_frequency: z.string().default('daily'),
});

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(1).optional(),
  age_range: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  personalization_enabled: z.boolean().optional(),
});

export const UpdatePreferencesSchema = z.object({
  interests: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  disliked_categories: z.array(z.string()).optional(),
  preferred_content_types: z.array(z.string()).optional(),
  budget_min: z.number().nonnegative().optional(),
  budget_max: z.number().positive().optional().nullable(),
  currency: z.string().optional(),
  recommendation_frequency: z.string().optional(),
});

export const FeedbackSchema = z.object({
  feedback_type: z.enum(FEEDBACK_TYPES),
});

export const SearchSchema = z.object({
  query: z.string().default(''),
  category: z.string().optional(),
  max_price: z.number().optional().nullable(),
  min_price: z.number().optional().nullable(),
  sort_by: z.enum(['relevance', 'price_asc', 'price_desc', 'newest']).default('relevance'),
  personalize: z.boolean().default(true),
});

export const ChatMessageSchema = z.object({
  conversation_id: z.string().optional(),
  message: z.string().min(1, 'Message cannot be empty'),
});
