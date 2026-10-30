import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';
import { Profile, UserPreferences } from '../types';

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password?: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentSession = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data.profile);
      setPreferences(data.preferences);
      setUser({
        id: data.profile.id,
        email: data.email,
        full_name: data.profile.full_name,
      });
      localStorage.setItem('persona_user_id', data.profile.id);
    } catch (err) {
      console.warn('Session check fallback:', err);
      // Auto initialize default demo session for immediate test drive if not set
      const defaultId = 'default-user-persona';
      localStorage.setItem('persona_user_id', defaultId);
      try {
        const retryData = await api.getProfile();
        setProfile(retryData.profile);
        setPreferences(retryData.preferences);
        setUser({
          id: retryData.profile.id,
          email: retryData.email,
          full_name: retryData.profile.full_name,
        });
      } catch (e) {
        setUser(null);
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentSession();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      try {
        const response = await api.login(email, password);
        if (response.session?.access_token) {
          localStorage.setItem('persona_token', response.session.access_token);
        }
        if (response.user?.id) {
          localStorage.setItem('persona_user_id', response.user.id);
        }
        await fetchCurrentSession();
      } catch (err: any) {
        // If backend connection fails, initialize resilient client demo session
        const isOffline =
          err.message?.includes('Cannot connect') ||
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('fetch failed');
        if (isOffline) {
          console.warn('Backend server unreachable; initializing resilient client session.');
          const offlineId = 'offline-' + email.replace(/[^a-zA-Z0-9]/g, '_');
          localStorage.setItem('persona_user_id', offlineId);
          localStorage.setItem('persona_token', `offline-token-${offlineId}`);
          const fallbackUser = {
            id: offlineId,
            email,
            full_name: email.split('@')[0] || 'Persona User',
          };
          setUser(fallbackUser);
          setProfile({
            id: offlineId,
            full_name: fallbackUser.full_name,
            onboarding_completed: true,
            personalization_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setPreferences({
            id: `pref-${offlineId}`,
            user_id: offlineId,
            interests: ['Technology', 'Programming', 'Education'],
            categories: ['Technology', 'Education', 'Career & Professional Growth'],
            goals: ['Learn new skills', 'Stay under ₹3,500 budget'],
            disliked_categories: ['Fashion'],
            preferred_content_types: ['Courses', 'Tutorials'],
            budget_min: 0,
            budget_max: 3500,
            currency: 'INR',
            recommendation_frequency: 'daily',
            updated_at: new Date().toISOString(),
          });
          return;
        }
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password?: string, fullName?: string) => {
    setIsLoading(true);
    try {
      try {
        const response = await api.register(email, password, fullName);
        if (response.session?.access_token) {
          localStorage.setItem('persona_token', response.session.access_token);
        }
        if (response.user?.id) {
          localStorage.setItem('persona_user_id', response.user.id);
        }
        await fetchCurrentSession();
      } catch (err: any) {
        const isOffline =
          err.message?.includes('Cannot connect') ||
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('fetch failed');
        if (isOffline) {
          const offlineId = 'offline-' + email.replace(/[^a-zA-Z0-9]/g, '_');
          localStorage.setItem('persona_user_id', offlineId);
          localStorage.setItem('persona_token', `offline-token-${offlineId}`);
          setUser({
            id: offlineId,
            email,
            full_name: fullName || email.split('@')[0] || 'Persona User',
          });
          setProfile({
            id: offlineId,
            full_name: fullName || email.split('@')[0] || 'Persona User',
            onboarding_completed: false,
            personalization_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          return;
        }
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    }
    localStorage.removeItem('persona_token');
    localStorage.removeItem('persona_user_id');
    setUser(null);
    setProfile(null);
    setPreferences(null);
  };

  const refreshProfile = async () => {
    await fetchCurrentSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        preferences,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
