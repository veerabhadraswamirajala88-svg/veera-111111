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

export const PREDEFINED_INTERESTS = [
  'Technology',
  'Artificial Intelligence',
  'Programming',
  'Web Development',
  'Data Science',
  'Fashion & Styling',
  'Fitness & Workouts',
  'Healthy Eating',
  'Books & Literature',
  'Gaming',
  'Productivity',
  'Personal Finance',
  'Career Advancement',
  'Startups & Business',
  'Travel & Exploration',
  'Music & Podcasts',
];

export const PREDEFINED_GOALS = [
  'Learn new skills',
  'Save money',
  'Discover new products',
  'Improve productivity',
  'Find career opportunities',
  'Explore entertainment',
  'Improve physical fitness',
  'Improve lifestyle',
];

export const BUDGET_TIERS = [
  { label: 'No budget restriction', min: 0, max: null },
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹2,000', min: 500, max: 2000 },
  { label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
  { label: '₹5,000 – ₹10,000', min: 500, max: 10000 },
  { label: 'Above ₹10,000', min: 10000, max: null },
];

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
  };
  source_type: 'gemini_ai' | 'algorithmic_fallback' | 'verified_catalog';
  source_url?: string | null;
  status: 'active' | 'archived' | 'dismissed';
  generated_at: string;
  created_at: string;
  is_liked?: boolean;
  is_disliked?: boolean;
  is_saved?: boolean;
  is_not_interested?: boolean;
  is_relevant?: boolean;
  is_not_relevant?: boolean;
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

export interface SearchHistoryItem {
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

export interface AnalyticsSummary {
  summary: {
    total_recommendations: number;
    total_views: number;
    total_clicks: number;
    total_saved: number;
    total_likes: number;
    total_dislikes: number;
    total_searches: number;
    engagement_rate: number;
  };
  category_distribution: { name: string; count: number; percentage: number }[];
  feedback_sentiment: { name: string; count: number; fill: string }[];
  activity_timeline: { date: string; views: number; interactions: number; searches: number }[];
  interest_distribution: { interest: string; weight: number }[];
}
