import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserPreferences } from '../types';
import { api } from '../api/client';
import { localStore } from '../api/localStore';

interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
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
      const storedId = localStorage.getItem('persona_user_id');
      if (storedId) {
        const localProfile = localStore.getUserProfile(storedId);
        const localPref = localStore.getUserPreferences(storedId);
        setProfile(localProfile);
        setPreferences(localPref);
        setUser({
          id: localProfile.id,
          email: `${localProfile.id.replace('user-', '')}@example.com`,
          full_name: localProfile.full_name,
        });
      } else {
        setUser(null);
        setProfile(null);
        setPreferences(null);
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
      const response = await api.login(email, password);
      if (response.session?.access_token) {
        localStorage.setItem('persona_token', response.session.access_token);
      }
      if (response.user?.id) {
        localStorage.setItem('persona_user_id', response.user.id);
      }
      await fetchCurrentSession();
    } catch (err: any) {
      console.warn('Login fallback triggered:', err);
      const cleanEmail = email.toLowerCase().trim();
      const userId = 'user-' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      localStorage.setItem('persona_user_id', userId);
      localStorage.setItem('persona_token', `token-${userId}`);
      await fetchCurrentSession();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password?: string, fullName?: string) => {
    setIsLoading(true);
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
      console.warn('Register fallback triggered:', err);
      const cleanEmail = email.toLowerCase().trim();
      const userId = 'user-' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const cleanName = fullName?.trim() || cleanEmail.split('@')[0] || 'Persona User';

      localStorage.setItem('persona_user_id', userId);
      localStorage.setItem('persona_token', `token-${userId}`);

      localStore.saveUserProfile({
        id: userId,
        full_name: cleanName,
        onboarding_completed: false,
        personalization_enabled: true,
      });

      await fetchCurrentSession();
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
