import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';
import { ENV } from '../config/env.js';
import {
  Profile,
  UserPreferences,
  Recommendation,
  RecommendationFeedback,
  UserActivity,
  SearchHistory,
  AIConversation,
  AIMessage,
} from '../types/index.js';

interface DatabaseData {
  profiles: Profile[];
  user_preferences: UserPreferences[];
  recommendations: Recommendation[];
  recommendation_feedback: RecommendationFeedback[];
  user_activity: UserActivity[];
  search_history: SearchHistory[];
  ai_conversations: AIConversation[];
  ai_messages: AIMessage[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

const defaultData: DatabaseData = {
  profiles: [],
  user_preferences: [],
  recommendations: [],
  recommendation_feedback: [],
  user_activity: [],
  search_history: [],
  ai_conversations: [],
  ai_messages: [],
};

class LocalStore {
  private data: DatabaseData;

  constructor() {
    this.data = defaultData;
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = { ...defaultData, ...JSON.parse(raw) };
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('Could not load local db.json, using default in-memory state', err);
      this.data = defaultData;
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write local database file', err);
    }
  }

  // Profiles
  getProfile(id: string): Profile | null {
    return this.data.profiles.find((p) => p.id === id) || null;
  }

  findProfileByEmail(email: string): Profile | null {
    const normalized = email.toLowerCase().trim();
    return this.data.profiles.find((p) => (p.email?.toLowerCase().trim() === normalized)) || null;
  }

  upsertProfile(profile: Profile): Profile {
    const idx = this.data.profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      this.data.profiles[idx] = { ...this.data.profiles[idx], ...profile, updated_at: new Date().toISOString() };
      this.save();
      return this.data.profiles[idx];
    }
    this.data.profiles.push(profile);
    this.save();
    return profile;
  }

  updateProfile(id: string, partial: Partial<Profile>): Profile | null {
    const idx = this.data.profiles.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    this.data.profiles[idx] = {
      ...this.data.profiles[idx],
      ...partial,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.profiles[idx];
  }

  // Preferences
  getPreferences(userId: string): UserPreferences | null {
    return this.data.user_preferences.find((p) => p.user_id === userId) || null;
  }

  upsertPreferences(prefs: UserPreferences): UserPreferences {
    const idx = this.data.user_preferences.findIndex((p) => p.user_id === prefs.user_id);
    if (idx >= 0) {
      this.data.user_preferences[idx] = {
        ...this.data.user_preferences[idx],
        ...prefs,
        updated_at: new Date().toISOString(),
      };
      this.save();
      return this.data.user_preferences[idx];
    }
    this.data.user_preferences.push(prefs);
    this.save();
    return prefs;
  }

  // Recommendations
  listRecommendations(userId: string): Recommendation[] {
    return this.data.recommendations.filter((r) => r.user_id === userId && r.status !== 'dismissed');
  }

  getRecommendation(id: string): Recommendation | null {
    return this.data.recommendations.find((r) => r.id === id) || null;
  }

  saveRecommendations(recs: Recommendation[]): Recommendation[] {
    this.data.recommendations = [...this.data.recommendations, ...recs];
    this.save();
    return recs;
  }

  deleteRecommendationsForUser(userId: string): void {
    this.data.recommendations = this.data.recommendations.filter((r) => r.user_id !== userId);
    this.save();
  }

  // Feedback
  getFeedbackForUser(userId: string): RecommendationFeedback[] {
    return this.data.recommendation_feedback.filter((f) => f.user_id === userId);
  }

  upsertFeedback(feedback: RecommendationFeedback): RecommendationFeedback {
    const idx = this.data.recommendation_feedback.findIndex(
      (f) =>
        f.user_id === feedback.user_id &&
        f.recommendation_id === feedback.recommendation_id &&
        f.feedback_type === feedback.feedback_type
    );
    if (idx >= 0) {
      this.data.recommendation_feedback[idx] = feedback;
      this.save();
      return feedback;
    }
    this.data.recommendation_feedback.push(feedback);
    this.save();
    return feedback;
  }

  removeFeedback(userId: string, recommendationId: string, feedbackType?: string): void {
    this.data.recommendation_feedback = this.data.recommendation_feedback.filter((f) => {
      if (f.user_id !== userId || f.recommendation_id !== recommendationId) return true;
      if (feedbackType && f.feedback_type !== feedbackType) return true;
      return false;
    });
    this.save();
  }

  // Activity
  recordActivity(activity: UserActivity): UserActivity {
    this.data.user_activity.unshift(activity);
    if (this.data.user_activity.length > 500) {
      this.data.user_activity = this.data.user_activity.slice(0, 500);
    }
    this.save();
    return activity;
  }

  getActivity(userId: string, limit = 50): UserActivity[] {
    return this.data.user_activity
      .filter((a) => a.user_id === userId)
      .slice(0, limit);
  }

  clearActivity(userId: string): void {
    this.data.user_activity = this.data.user_activity.filter((a) => a.user_id !== userId);
    this.save();
  }

  // Search
  recordSearch(search: SearchHistory): SearchHistory {
    this.data.search_history.unshift(search);
    if (this.data.search_history.length > 200) {
      this.data.search_history = this.data.search_history.slice(0, 200);
    }
    this.save();
    return search;
  }

  getSearchHistory(userId: string, limit = 20): SearchHistory[] {
    return this.data.search_history
      .filter((s) => s.user_id === userId)
      .slice(0, limit);
  }

  clearSearchHistory(userId: string): void {
    this.data.search_history = this.data.search_history.filter((s) => s.user_id !== userId);
    this.save();
  }

  // AI Conversations & Messages
  listConversations(userId: string): AIConversation[] {
    return this.data.ai_conversations
      .filter((c) => c.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  getConversation(id: string): AIConversation | null {
    return this.data.ai_conversations.find((c) => c.id === id) || null;
  }

  createConversation(conv: AIConversation): AIConversation {
    this.data.ai_conversations.unshift(conv);
    this.save();
    return conv;
  }

  getMessages(conversationId: string): AIMessage[] {
    return this.data.ai_messages
      .filter((m) => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  createMessage(msg: AIMessage): AIMessage {
    this.data.ai_messages.push(msg);
    const conv = this.data.ai_conversations.find((c) => c.id === msg.conversation_id);
    if (conv) {
      conv.updated_at = new Date().toISOString();
    }
    this.save();
    return msg;
  }
}

export const localDb = new LocalStore();

// Supabase client instance (if configured)
export let supabase: SupabaseClient | null = null;
if (ENV.isSupabaseConfigured()) {
  try {
    supabase = createClient(
      ENV.SUPABASE_URL,
      ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY,
      {
        auth: { persistSession: false },
        realtime: { transport: ws as any },
      }
    );
    console.log('✅ Supabase Client initialized with URL:', ENV.SUPABASE_URL);
  } catch (err) {
    console.warn('⚠️ Could not initialize Supabase client, using local store fallback:', err);
  }
} else {
  console.log('ℹ️ Supabase credentials not set or using placeholders. Operating with robust local persistent store.');
}
