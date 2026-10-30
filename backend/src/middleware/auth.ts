import { Request, Response, NextFunction } from 'express';
import { supabase, localDb } from '../db/store.js';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const customUserId = req.headers['x-user-id'] as string;

    // 1. If Supabase is connected and Bearer token provided
    if (supabase && authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        req.user = {
          id: user.id,
          email: user.email || 'user@example.com',
          full_name: user.user_metadata?.full_name || 'Personalized User',
        };
        return next();
      }
    }

    // 2. If client passed explicit user ID (e.g. from local session storage)
    if (customUserId) {
      const existingProfile = localDb.getProfile(customUserId);
      req.user = {
        id: customUserId,
        email: 'user@example.com',
        full_name: existingProfile?.full_name || 'PersonaAI User',
      };
      return next();
    }

    // 3. Fallback for seamless developer testing / guest session
    const defaultUserId = 'default-user-persona';
    let profile = localDb.getProfile(defaultUserId);
    if (!profile) {
      profile = localDb.upsertProfile({
        id: defaultUserId,
        full_name: 'Alex Rivera',
        location: 'Bengaluru, India',
        age_range: '25-34',
        bio: 'Tech enthusiast & lifelong learner',
        onboarding_completed: false,
        personalization_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      localDb.upsertPreferences({
        id: 'pref-default-1',
        user_id: defaultUserId,
        interests: ['Technology', 'Programming', 'Personal Development'],
        categories: ['Technology', 'Education', 'Career & Professional Growth'],
        goals: ['Learn new skills', 'Improve productivity'],
        disliked_categories: [],
        preferred_content_types: ['Courses', 'Tools', 'Guides'],
        budget_min: 0,
        budget_max: 5000,
        currency: 'INR',
        recommendation_frequency: 'daily',
        updated_at: new Date().toISOString(),
      });
    }

    req.user = {
      id: defaultUserId,
      email: 'alex.rivera@example.com',
      full_name: profile.full_name,
    };
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Unauthorized authentication' });
  }
}
