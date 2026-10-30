import { Request, Response } from 'express';
import { localDb } from '../db/store.js';
import { OnboardingSchema, UpdateProfileSchema } from '../types/index.js';
import { generateRecommendationsWithGemini } from '../services/geminiService.js';
import { v4 as uuidv4 } from 'uuid';

export async function getProfile(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;
    let profile = localDb.getProfile(userId);
    let preferences = localDb.getPreferences(userId);

    if (!profile) {
      profile = localDb.upsertProfile({
        id: userId,
        full_name: req.user!.full_name || 'Personalized User',
        onboarding_completed: false,
        personalization_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    if (!preferences) {
      preferences = localDb.upsertPreferences({
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
    }

    return res.json({ profile, preferences, email: req.user!.email });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch profile';
    console.error('getProfile error:', error);
    return res.status(500).json({ error: errorMsg });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;
    const validated = UpdateProfileSchema.parse(req.body);

    const updated = localDb.updateProfile(userId, validated);
    if (!updated) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Record activity
    localDb.recordActivity({
      id: uuidv4(),
      user_id: userId,
      activity_type: 'update_profile',
      metadata: validated,
      created_at: new Date().toISOString(),
    });

    return res.json({ profile: updated });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Invalid profile data';
    console.error('updateProfile error:', error);
    return res.status(400).json({ error: errorMsg });
  }
}

export async function submitOnboarding(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;
    const validated = OnboardingSchema.parse(req.body);

    // 1. Update Profile
    const profile = localDb.upsertProfile({
      id: userId,
      full_name: validated.full_name,
      location: validated.location || null,
      age_range: validated.age_range || null,
      bio: validated.bio || null,
      onboarding_completed: true,
      personalization_enabled: true,
      created_at: localDb.getProfile(userId)?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 2. Update User Preferences
    const preferences = localDb.upsertPreferences({
      id: localDb.getPreferences(userId)?.id || uuidv4(),
      user_id: userId,
      interests: validated.interests,
      categories: validated.categories,
      goals: validated.goals,
      disliked_categories: validated.disliked_categories || [],
      preferred_content_types: validated.preferred_content_types || [],
      budget_min: validated.budget_min,
      budget_max: validated.budget_max || null,
      currency: validated.currency || 'INR',
      recommendation_frequency: validated.recommendation_frequency || 'daily',
      updated_at: new Date().toISOString(),
    });

    // 3. Clear any stale initial recommendations and generate fresh ones
    localDb.deleteRecommendationsForUser(userId);
    const freshRecs = await generateRecommendationsWithGemini(profile, preferences, [], 8);
    localDb.saveRecommendations(freshRecs);

    // 4. Record onboarding completed activity
    localDb.recordActivity({
      id: uuidv4(),
      user_id: userId,
      activity_type: 'completed_onboarding',
      metadata: {
        interestsCount: validated.interests.length,
        categoriesCount: validated.categories.length,
        budget: validated.budget_max,
      },
      created_at: new Date().toISOString(),
    });

    return res.json({
      message: 'Onboarding completed successfully',
      profile,
      preferences,
      initial_recommendations_count: freshRecs.length,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Onboarding validation failed';
    console.error('submitOnboarding error:', error);
    return res.status(400).json({ error: errorMsg });
  }
}

export async function resetProfile(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;
    localDb.updateProfile(userId, { onboarding_completed: false });
    localDb.deleteRecommendationsForUser(userId);
    localDb.clearActivity(userId);
    localDb.clearSearchHistory(userId);

    return res.json({ message: 'Profile personalization reset successfully' });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Reset failed';
    return res.status(500).json({ error: errorMsg });
  }
}
