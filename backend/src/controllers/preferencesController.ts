import { Request, Response } from 'express';
import { localDb, supabase } from '../db/store.js';
import { UpdatePreferencesSchema } from '../types/index.js';
import { generateRecommendationsWithGemini } from '../services/geminiService.js';
import { v4 as uuidv4 } from 'uuid';

export async function getPreferences(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;
    let preferences = localDb.getPreferences(userId);
    if (!preferences) {
      preferences = localDb.upsertPreferences({
        id: uuidv4(),
        user_id: userId,
        interests: ['Technology', 'Programming'],
        categories: ['Technology', 'Education'],
        goals: ['Learn new skills'],
        disliked_categories: [],
        preferred_content_types: ['Courses'],
        budget_min: 0,
        budget_max: 5000,
        currency: 'INR',
        recommendation_frequency: 'daily',
        updated_at: new Date().toISOString(),
      });
    }
    return res.json({ preferences });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch preferences';
    console.error('getPreferences error:', error);
    return res.status(500).json({ error: errorMsg });
  }
}

export async function updatePreferences(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;
    const validated = UpdatePreferencesSchema.parse(req.body);

    const existing = localDb.getPreferences(userId);
    const updated = localDb.upsertPreferences({
      id: existing?.id || uuidv4(),
      user_id: userId,
      interests: validated.interests ?? existing?.interests ?? [],
      categories: validated.categories ?? existing?.categories ?? [],
      goals: validated.goals ?? existing?.goals ?? [],
      disliked_categories: validated.disliked_categories ?? existing?.disliked_categories ?? [],
      preferred_content_types: validated.preferred_content_types ?? existing?.preferred_content_types ?? [],
      budget_min: validated.budget_min ?? existing?.budget_min ?? 0,
      budget_max: validated.budget_max !== undefined ? validated.budget_max : (existing?.budget_max ?? null),
      currency: validated.currency || existing?.currency || 'INR',
      recommendation_frequency: validated.recommendation_frequency || existing?.recommendation_frequency || 'daily',
      updated_at: new Date().toISOString(),
    });

    if (supabase) {
      Promise.resolve(
        supabase.from('user_preferences').upsert({
          user_id: userId,
          interests: updated.interests,
          categories: updated.categories,
          goals: updated.goals,
          disliked_categories: updated.disliked_categories,
          preferred_content_types: updated.preferred_content_types,
          budget_min: updated.budget_min,
          budget_max: updated.budget_max,
          currency: updated.currency,
          recommendation_frequency: updated.recommendation_frequency,
          updated_at: new Date().toISOString(),
        })
      ).catch(() => {});
    }

    // Dynamic regeneration of recommendations
    const profile = localDb.getProfile(userId);
    const feedback = localDb.getFeedbackForUser(userId);
    if (profile && profile.personalization_enabled) {
      localDb.deleteRecommendationsForUser(userId);
      const freshRecs = await generateRecommendationsWithGemini(profile, updated, feedback, 8);
      localDb.saveRecommendations(freshRecs);
    }

    // Record user activity
    localDb.recordActivity({
      id: uuidv4(),
      user_id: userId,
      activity_type: 'update_preferences',
      metadata: {
        budget_max: updated.budget_max,
        interestsCount: updated.interests.length,
        categoriesCount: updated.categories.length,
      },
      created_at: new Date().toISOString(),
    });

    return res.json({
      message: 'Preferences updated and recommendations regenerated dynamically',
      preferences: updated,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Invalid preferences data';
    console.error('updatePreferences error:', error);
    return res.status(400).json({ error: errorMsg });
  }
}
