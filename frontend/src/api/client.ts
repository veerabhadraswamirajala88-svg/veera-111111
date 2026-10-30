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
    return this.request<{ user: any; session: any; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: password || 'demo123456' }),
    });
  }

  async register(email: string, password?: string, fullName?: string) {
    return this.request<{ user: any; session: any; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password: password || 'demo123456', full_name: fullName }),
    });
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', { method: 'POST' });
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Profile & Onboarding
  async getProfile(): Promise<{ profile: Profile; preferences: UserPreferences; email: string }> {
    try {
      return await this.request<{ profile: Profile; preferences: UserPreferences; email: string }>('/profile');
    } catch (err) {
      const cached = localStorage.getItem('persona_cached_profile');
      const cachedPref = localStorage.getItem('persona_cached_preferences');
      if (cached && cachedPref) {
        return {
          profile: JSON.parse(cached),
          preferences: JSON.parse(cachedPref),
          email: 'alex.rivera@example.com',
        };
      }
      throw err;
    }
  }

  async updateProfile(data: Partial<Profile>): Promise<{ profile: Profile }> {
    return this.request<{ profile: Profile }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async submitOnboarding(data: any): Promise<{ profile: Profile; preferences: UserPreferences }> {
    try {
      const res = await this.request<{ profile: Profile; preferences: UserPreferences }>('/profile/onboarding', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res?.profile) {
        localStorage.setItem('persona_cached_profile', JSON.stringify(res.profile));
      }
      if (res?.preferences) {
        localStorage.setItem('persona_cached_preferences', JSON.stringify(res.preferences));
      }
      return res;
    } catch (err: any) {
      const isConnectionIssue =
        err.message?.includes('Cannot connect') ||
        err.message?.includes('Production Configuration Required') ||
        err.message?.includes('fetch');

      if (isConnectionIssue) {
        console.warn('Backend unavailable during onboarding. Persisting preferences to local session cache.');
        const userId = localStorage.getItem('persona_user_id') || 'demo-user-offline';
        const mockProfile: Profile = {
          id: userId,
          full_name: data.full_name || 'Persona User',
          age_range: data.age_range || '25-34',
          location: data.location || 'India',
          bio: data.bio || '',
          onboarding_completed: true,
          personalization_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const mockPref: UserPreferences = {
          id: `pref-${userId}`,
          user_id: userId,
          interests: data.interests || [],
          categories: data.categories || [],
          goals: data.goals || [],
          disliked_categories: data.disliked_categories || [],
          preferred_content_types: data.preferred_content_types || [],
          budget_min: data.budget_min ?? 0,
          budget_max: data.budget_max ?? 3500,
          currency: data.currency || 'INR',
          recommendation_frequency: data.recommendation_frequency || 'daily',
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem('persona_cached_profile', JSON.stringify(mockProfile));
        localStorage.setItem('persona_cached_preferences', JSON.stringify(mockPref));
        return { profile: mockProfile, preferences: mockPref };
      }
      throw err;
    }
  }

  async resetProfile(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/profile/reset', { method: 'POST' });
  }

  // Preferences
  async getPreferences(): Promise<{ preferences: UserPreferences }> {
    try {
      return await this.request<{ preferences: UserPreferences }>('/preferences');
    } catch (err) {
      const cachedPref = localStorage.getItem('persona_cached_preferences');
      if (cachedPref) {
        return { preferences: JSON.parse(cachedPref) };
      }
      throw err;
    }
  }

  async updatePreferences(data: Partial<UserPreferences>): Promise<{ preferences: UserPreferences }> {
    const res = await this.request<{ preferences: UserPreferences }>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res?.preferences) {
      localStorage.setItem('persona_cached_preferences', JSON.stringify(res.preferences));
    }
    return res;
  }

  // Recommendations
  async getRecommendations(params?: {
    category?: string;
    sort_by?: string;
    max_price?: number;
  }): Promise<{ recommendations: Recommendation[] }> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.max_price) query.append('max_price', params.max_price.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ recommendations: Recommendation[] }>(`/recommendations${qs}`);
  }

  async generateRecommendations(): Promise<{ recommendations: Recommendation[] }> {
    return this.request<{ recommendations: Recommendation[] }>('/recommendations/generate', {
      method: 'POST',
    });
  }

  async getSavedRecommendations(): Promise<{ saved: Recommendation[] }> {
    return this.request<{ saved: Recommendation[] }>('/recommendations/saved');
  }

  async submitFeedback(recommendationId: string, feedbackType: string) {
    return this.request<{ message: string; feedback: any }>(
      `/recommendations/${recommendationId}/feedback`,
      {
        method: 'POST',
        body: JSON.stringify({ feedback_type: feedbackType }),
      }
    );
  }

  async removeFeedback(recommendationId: string, feedbackType?: string) {
    const qs = feedbackType ? `?type=${feedbackType}` : '';
    return this.request<{ message: string }>(`/recommendations/${recommendationId}/feedback${qs}`, {
      method: 'DELETE',
    });
  }

  // AI Assistant
  async listConversations(): Promise<{ conversations: AIConversation[] }> {
    return this.request<{ conversations: AIConversation[] }>('/assistant/conversations');
  }

  async getConversationMessages(conversationId: string): Promise<{ messages: AIMessage[] }> {
    return this.request<{ messages: AIMessage[] }>(`/assistant/conversations/${conversationId}/messages`);
  }

  async sendChatMessage(message: string, conversationId?: string): Promise<{
    conversation_id: string;
    user_message: AIMessage;
    assistant_message: AIMessage;
  }> {
    return this.request<{
      conversation_id: string;
      user_message: AIMessage;
      assistant_message: AIMessage;
    }>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });
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
    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getSearchHistory(): Promise<{ history: SearchHistoryItem[] }> {
    return this.request<{ history: SearchHistoryItem[] }>('/search/history');
  }

  async clearSearchHistory(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/search/history', { method: 'DELETE' });
  }

  // Activity & Analytics
  async logActivity(data: { activity_type: string; recommendation_id?: string; category?: string; metadata?: any }) {
    return this.request('/activity', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getActivityHistory(limit = 50): Promise<{ activities: UserActivity[] }> {
    return this.request<{ activities: UserActivity[] }>(`/activity?limit=${limit}`);
  }

  async getAnalytics(): Promise<AnalyticsSummary> {
    return this.request<AnalyticsSummary>('/analytics');
  }

  // Privacy
  async exportData(): Promise<Blob> {
    return this.request<Blob>('/privacy/export', { method: 'POST' });
  }

  async clearHistory(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/privacy/clear-history', { method: 'POST' });
  }

  async updatePrivacySettings(personalization_enabled: boolean): Promise<{ message: string; profile: Profile }> {
    return this.request('/privacy/settings', {
      method: 'PUT',
      body: JSON.stringify({ personalization_enabled }),
    });
  }
}

export const api = new ApiClient();
