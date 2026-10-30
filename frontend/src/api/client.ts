import {
  Profile,
  UserPreferences,
  Recommendation,
  UserActivity,
  SearchHistoryItem,
  AIConversation,
  AIMessage,
  AnalyticsSummary,
} from '../types';
import { getApiBaseUrl, formatApiErrorMessage } from '../config/api';
import { localStore } from './localStore';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('persona_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const userId = localStorage.getItem('persona_user_id');
    if (userId) {
      headers['x-user-id'] = userId;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = getApiBaseUrl();

    // If no backend is configured in production, seamlessly return null so method falls back to localStore
    if (!baseUrl) {
      throw new Error('LOCAL_MODE_ACTIVE');
    }

    const url = `${baseUrl}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers as Record<string, string>) };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
          const errorJson = await response.json();
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // If attachment/download
      const disposition = response.headers.get('content-disposition');
      if (disposition && disposition.includes('attachment')) {
        return response.blob() as unknown as T;
      }

      return response.json();
    } catch (err: unknown) {
      const friendlyMessage = formatApiErrorMessage(err, endpoint);
      throw new Error(friendlyMessage);
    }
  }

  // Auth
  async login(email: string, password?: string) {
    try {
      const res = await this.request<{ user: any; session: any; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: password || 'demo123456' }),
      });
      return res;
    } catch (err) {
      console.warn('Backend login unavailable. Using persistent client session:', err);
      const cleanEmail = email.toLowerCase().trim();
      const userId = 'user-' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const mockUser = {
        id: userId,
        email: cleanEmail,
        user_metadata: { full_name: cleanEmail.split('@')[0] || 'Persona User' },
      };
      return {
        user: mockUser,
        session: { access_token: `token-${userId}`, user: mockUser },
        message: 'Signed in successfully via persistent session',
      };
    }
  }

  async register(email: string, password?: string, fullName?: string) {
    try {
      const res = await this.request<{ user: any; session: any; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password: password || 'demo123456', full_name: fullName }),
      });
      return res;
    } catch (err) {
      console.warn('Backend register unavailable. Using persistent client registration:', err);
      const cleanEmail = email.toLowerCase().trim();
      const userId = 'user-' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const cleanName = fullName?.trim() || cleanEmail.split('@')[0] || 'Persona User';
      const mockUser = {
        id: userId,
        email: cleanEmail,
        user_metadata: { full_name: cleanName },
      };

      // Save initial profile
      localStore.saveUserProfile({
        id: userId,
        full_name: cleanName,
        onboarding_completed: false,
        personalization_enabled: true,
      });

      return {
        user: mockUser,
        session: { access_token: `token-${userId}`, user: mockUser },
        message: 'Registration successful',
      };
    }
  }

  async logout() {
    try {
      await this.request<{ message: string }>('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    try {
      return await this.request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch {
      return { message: 'If that email exists, password reset instructions have been sent.' };
    }
  }

  // Profile & Onboarding
  async getProfile(): Promise<{ profile: Profile; preferences: UserPreferences; email: string }> {
    try {
      const res = await this.request<{ profile: Profile; preferences: UserPreferences; email: string }>('/profile');
      if (res?.profile) localStore.saveUserProfile(res.profile);
      if (res?.preferences) localStore.saveUserPreferences(res.preferences);
      return res;
    } catch {
      const profile = localStore.getUserProfile();
      const preferences = localStore.getUserPreferences();
      return {
        profile,
        preferences,
        email: `${profile.full_name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      };
    }
  }

  async updateProfile(data: Partial<Profile>): Promise<{ profile: Profile }> {
    try {
      const res = await this.request<{ profile: Profile }>('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res?.profile) localStore.saveUserProfile(res.profile);
      return res;
    } catch {
      const updated = localStore.saveUserProfile(data);
      return { profile: updated };
    }
  }

  async submitOnboarding(data: any): Promise<{ profile: Profile; preferences: UserPreferences }> {
    try {
      const res = await this.request<{ profile: Profile; preferences: UserPreferences }>('/profile/onboarding', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res?.profile) localStore.saveUserProfile(res.profile);
      if (res?.preferences) localStore.saveUserPreferences(res.preferences);
      return res;
    } catch {
      const profile = localStore.saveUserProfile({
        full_name: data.full_name,
        age_range: data.age_range,
        location: data.location,
        bio: data.bio,
        onboarding_completed: true,
      });
      const preferences = localStore.saveUserPreferences({
        interests: data.interests,
        categories: data.categories,
        goals: data.goals,
        disliked_categories: data.disliked_categories,
        preferred_content_types: data.preferred_content_types,
        budget_min: data.budget_min ?? 0,
        budget_max: data.budget_max,
        currency: data.currency || 'INR',
        recommendation_frequency: data.recommendation_frequency || 'daily',
      });
      localStore.logActivity('completed_onboarding', null, 'Onboarding', { goalsCount: data.goals?.length });
      return { profile, preferences };
    }
  }

  async resetProfile(): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/profile/reset', { method: 'POST' });
    } catch {
      localStore.clearHistory();
      return { message: 'Profile reset successfully' };
    }
  }

  // Preferences
  async getPreferences(): Promise<{ preferences: UserPreferences }> {
    try {
      const res = await this.request<{ preferences: UserPreferences }>('/preferences');
      if (res?.preferences) localStore.saveUserPreferences(res.preferences);
      return res;
    } catch {
      return { preferences: localStore.getUserPreferences() };
    }
  }

  async updatePreferences(data: Partial<UserPreferences>): Promise<{ preferences: UserPreferences }> {
    try {
      const res = await this.request<{ preferences: UserPreferences }>('/preferences', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res?.preferences) localStore.saveUserPreferences(res.preferences);
      return res;
    } catch {
      const updated = localStore.saveUserPreferences(data);
      return { preferences: updated };
    }
  }

  // Recommendations
  async getRecommendations(params?: {
    category?: string;
    sort_by?: string;
    max_price?: number;
  }): Promise<{ recommendations: Recommendation[] }> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'All') query.append('category', params.category);
      if (params?.sort_by) query.append('sort_by', params.sort_by);
      if (params?.max_price) query.append('max_price', params.max_price.toString());

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await this.request<{ recommendations: Recommendation[] }>(`/recommendations${qs}`);
      return res;
    } catch {
      return { recommendations: localStore.getRecommendations(params) };
    }
  }

  async generateRecommendations(): Promise<{ recommendations: Recommendation[] }> {
    try {
      return await this.request<{ recommendations: Recommendation[] }>('/recommendations/generate', {
        method: 'POST',
      });
    } catch {
      const recs = await localStore.generateFreshRecommendations();
      return { recommendations: recs };
    }
  }

  async getSavedRecommendations(): Promise<{ saved: Recommendation[] }> {
    try {
      return await this.request<{ saved: Recommendation[] }>('/recommendations/saved');
    } catch {
      return { saved: localStore.getSavedRecommendations() };
    }
  }

  async submitFeedback(recommendationId: string, feedbackType: string) {
    try {
      return await this.request<{ message: string; feedback: any }>(
        `/recommendations/${recommendationId}/feedback`,
        {
          method: 'POST',
          body: JSON.stringify({ feedback_type: feedbackType }),
        }
      );
    } catch {
      return localStore.submitFeedback(recommendationId, feedbackType);
    }
  }

  async removeFeedback(recommendationId: string, feedbackType?: string) {
    try {
      const qs = feedbackType ? `?type=${feedbackType}` : '';
      return await this.request<{ message: string }>(`/recommendations/${recommendationId}/feedback${qs}`, {
        method: 'DELETE',
      });
    } catch {
      return localStore.removeFeedback(recommendationId, feedbackType);
    }
  }

  // AI Assistant
  async listConversations(): Promise<{ conversations: AIConversation[] }> {
    try {
      return await this.request<{ conversations: AIConversation[] }>('/assistant/conversations');
    } catch {
      return { conversations: localStore.listConversations() };
    }
  }

  async getConversationMessages(conversationId: string): Promise<{ messages: AIMessage[] }> {
    try {
      return await this.request<{ messages: AIMessage[] }>(`/assistant/conversations/${conversationId}/messages`);
    } catch {
      return { messages: localStore.getConversationMessages(conversationId) };
    }
  }

  async sendChatMessage(message: string, conversationId?: string): Promise<{
    conversation_id: string;
    user_message: AIMessage;
    assistant_message: AIMessage;
  }> {
    try {
      return await this.request<{
        conversation_id: string;
        user_message: AIMessage;
        assistant_message: AIMessage;
      }>('/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message, conversation_id: conversationId }),
      });
    } catch {
      return await localStore.sendChatMessage(message, conversationId);
    }
  }

  // Search
  async searchRecommendations(body: {
    query: string;
    category?: string;
    max_price?: number;
    sort_by?: string;
    personalize?: boolean;
  }): Promise<{
    interpretation: { detected_category?: string; detected_budget?: number; keywords: string[] };
    results: Recommendation[];
    total: number;
  }> {
    try {
      return await this.request('/search', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch {
      return localStore.searchRecommendations(body.query, body.category, body.max_price);
    }
  }

  async getSearchHistory(): Promise<{ history: SearchHistoryItem[] }> {
    try {
      return await this.request<{ history: SearchHistoryItem[] }>('/search/history');
    } catch {
      return { history: localStore.getSearchHistory() };
    }
  }

  async clearSearchHistory(): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/search/history', { method: 'DELETE' });
    } catch {
      localStore.clearSearchHistory();
      return { message: 'Search history cleared' };
    }
  }

  // Activity & Analytics
  async logActivity(data: { activity_type: string; recommendation_id?: string; category?: string; metadata?: any }) {
    try {
      return await this.request('/activity', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return localStore.logActivity(data.activity_type, data.recommendation_id, data.category, data.metadata);
    }
  }

  async getActivityHistory(limit = 50): Promise<{ activities: UserActivity[] }> {
    try {
      return await this.request<{ activities: UserActivity[] }>(`/activity?limit=${limit}`);
    } catch {
      return { activities: localStore.getActivityHistory(limit) };
    }
  }

  async getAnalytics(): Promise<AnalyticsSummary> {
    try {
      return await this.request<AnalyticsSummary>('/analytics');
    } catch {
      return localStore.getAnalytics();
    }
  }

  // Privacy
  async exportData(): Promise<Blob> {
    try {
      return await this.request<Blob>('/privacy/export', { method: 'POST' });
    } catch {
      return localStore.exportData();
    }
  }

  async clearHistory(): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/privacy/clear-history', { method: 'POST' });
    } catch {
      localStore.clearHistory();
      return { message: 'History cleared' };
    }
  }

  async updatePrivacySettings(personalization_enabled: boolean): Promise<{ message: string; profile: Profile }> {
    try {
      return await this.request('/privacy/settings', {
        method: 'PUT',
        body: JSON.stringify({ personalization_enabled }),
      });
    } catch {
      const p = localStore.saveUserProfile({ personalization_enabled });
      return { message: 'Privacy settings updated', profile: p };
    }
  }
}

export const api = new ApiClient();
