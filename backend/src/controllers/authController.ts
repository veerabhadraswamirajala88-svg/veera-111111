import { Request, Response } from 'express';
import { supabase, localDb } from '../db/store.js';
import { v4 as uuidv4 } from 'uuid';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: full_name || email.split('@')[0] },
        },
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (data.user) {
        // Ensure profile exists in local cache or supabase
        localDb.upsertProfile({
          id: data.user.id,
          full_name: full_name || email.split('@')[0],
          onboarding_completed: false,
          personalization_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        localDb.upsertPreferences({
          id: uuidv4(),
          user_id: data.user.id,
          interests: [],
          categories: [],
          goals: [],
          disliked_categories: [],
          preferred_content_types: [],
          budget_min: 0,
          budget_max: null,
          currency: 'INR',
          recommendation_frequency: 'daily',
          updated_at: new Date().toISOString(),
        });
      }

      return res.status(201).json({
        user: data.user,
        session: data.session,
        message: 'Registration successful',
      });
    }

    // Fallback local registration
    const userId = uuidv4();
    const profile = localDb.upsertProfile({
      id: userId,
      full_name: full_name || email.split('@')[0],
      onboarding_completed: false,
      personalization_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    localDb.upsertPreferences({
      id: uuidv4(),
      user_id: userId,
      interests: [],
      categories: [],
      goals: [],
      disliked_categories: [],
      preferred_content_types: [],
      budget_min: 0,
      budget_max: null,
      currency: 'INR',
      recommendation_frequency: 'daily',
      updated_at: new Date().toISOString(),
    });

    return res.status(201).json({
      user: { id: userId, email, user_metadata: { full_name: profile.full_name } },
      session: { access_token: `mock-token-${userId}`, user: { id: userId, email } },
      message: 'Registration successful (Local mode)',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error.message || 'Internal registration error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({
        user: data.user,
        session: data.session,
        message: 'Login successful',
      });
    }

    // Local login fallback
    const userId = 'default-user-persona';
    let profile = localDb.getProfile(userId);
    if (!profile) {
      profile = localDb.upsertProfile({
        id: userId,
        full_name: email.split('@')[0],
        onboarding_completed: true,
        personalization_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      user: { id: userId, email, user_metadata: { full_name: profile.full_name } },
      session: { access_token: `mock-token-${userId}`, user: { id: userId, email } },
      message: 'Login successful',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Internal login error' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    if (supabase) {
      await supabase.auth.signOut();
    }
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Logout error' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password`,
      });
      if (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    return res.status(200).json({
      message: 'Password reset link sent to your email address.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error sending reset password link' });
  }
}
