import { Request, Response } from 'express';
import { localDb } from '../db/store.js';
import { FeedbackSchema, Category } from '../types/index.js';
import { generateRecommendationsWithGemini } from '../services/geminiService.js';
import { v4 as uuidv4 } from 'uuid';

export async function getRecommendations(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const category = req.query.category as string | undefined;
    const sortBy = (req.query.sort_by as string) || 'relevance';
    const maxPrice = req.query.max_price ? parseFloat(req.query.max_price as string) : undefined;

    let recs = localDb.listRecommendations(userId);

    // If no recommendations exist yet, generate them immediately
    if (recs.length === 0) {
      let profile = localDb.getProfile(userId);
      let preferences = localDb.getPreferences(userId);
      if (!profile) {
        profile = localDb.upsertProfile({
          id: userId,
          full_name: req.user!.full_name || 'Personalized User',
          onboarding_completed: true,
          personalization_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      if (!preferences) {
        preferences = localDb.upsertPreferences({
          id: uuidv4(),
          user_id: userId,
          interests: ['Technology', 'Programming', 'Personal Development'],
          categories: ['Technology', 'Education', 'Career & Professional Growth'],
          goals: ['Learn new skills', 'Improve productivity'],
          disliked_categories: [],
          preferred_content_types: ['Courses', 'Tools'],
          budget_min: 0,
          budget_max: 5000,
          currency: 'INR',
          recommendation_frequency: 'daily',
          updated_at: new Date().toISOString(),
        });
      }
      const initial = await generateRecommendationsWithGemini(profile, preferences, [], 8);
      localDb.saveRecommendations(initial);
      recs = initial;
    }

    // Attach feedback
    const userFeedback = localDb.getFeedbackForUser(userId);
    const feedbackMap = new Map<string, Set<string>>();
    userFeedback.forEach((f) => {
      if (!feedbackMap.has(f.recommendation_id)) {
        feedbackMap.set(f.recommendation_id, new Set());
      }
      feedbackMap.get(f.recommendation_id)!.add(f.feedback_type);
    });

    let enriched = recs.map((r) => {
      const fbSet = feedbackMap.get(r.id) || new Set();
      return {
        ...r,
        is_liked: fbSet.has('like'),
        is_disliked: fbSet.has('dislike'),
        is_saved: fbSet.has('save'),
        is_not_interested: fbSet.has('not_interested'),
        is_relevant: fbSet.has('relevant'),
        is_not_relevant: fbSet.has('not_relevant'),
      };
    });

    // Filter out not interested / disliked if default view
    enriched = enriched.filter((r) => !r.is_not_interested && !r.is_disliked);

    // Filter by Category
    if (category && category !== 'All') {
      enriched = enriched.filter((r) => r.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by max price
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      enriched = enriched.filter((r) => (r.estimated_price ?? 0) <= maxPrice);
    }

    // Sort
    if (sortBy === 'price_asc') {
      enriched.sort((a, b) => (a.estimated_price ?? 0) - (b.estimated_price ?? 0));
    } else if (sortBy === 'price_desc') {
      enriched.sort((a, b) => (b.estimated_price ?? 0) - (a.estimated_price ?? 0));
    } else if (sortBy === 'newest') {
      enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      // Relevance default
      enriched.sort((a, b) => b.relevance_score - a.relevance_score);
    }

    return res.json({ recommendations: enriched });
  } catch (error: any) {
    console.error('getRecommendations error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch recommendations' });
  }
}

export async function generateNewRecommendations(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const profile = localDb.getProfile(userId);
    const preferences = localDb.getPreferences(userId);

    if (!profile || !preferences) {
      return res.status(404).json({ error: 'Profile or preferences not found' });
    }

    const feedback = localDb.getFeedbackForUser(userId);
    localDb.deleteRecommendationsForUser(userId);

    const freshRecs = await generateRecommendationsWithGemini(profile, preferences, feedback, 8);
    localDb.saveRecommendations(freshRecs);

    // Record activity
    localDb.recordActivity({
      id: uuidv4(),
      user_id: userId,
      activity_type: 'generate_recommendations',
      metadata: { count: freshRecs.length, source: freshRecs[0]?.source_type },
      created_at: new Date().toISOString(),
    });

    return res.json({
      message: 'New personalized recommendations generated successfully',
      recommendations: freshRecs,
    });
  } catch (error: any) {
    console.error('generateNewRecommendations error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate recommendations' });
  }
}

export async function getSavedRecommendations(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const userFeedback = localDb.getFeedbackForUser(userId);
    const savedRecIds = new Set(
      userFeedback.filter((f) => f.feedback_type === 'save').map((f) => f.recommendation_id)
    );

    const allRecs = localDb.listRecommendations(userId);
    const saved = allRecs
      .filter((r) => savedRecIds.has(r.id))
      .map((r) => ({
        ...r,
        is_saved: true,
      }));

    return res.json({ saved });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch saved items' });
  }
}

export async function submitFeedback(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const recommendationId = req.params.id;
    const validated = FeedbackSchema.parse(req.body);

    const rec = localDb.getRecommendation(recommendationId);

    const saved = localDb.upsertFeedback({
      id: uuidv4(),
      user_id: userId,
      recommendation_id: recommendationId,
      feedback_type: validated.feedback_type,
      created_at: new Date().toISOString(),
    });

    // Record activity
    localDb.recordActivity({
      id: uuidv4(),
      user_id: userId,
      recommendation_id: recommendationId,
      activity_type: `feedback_${validated.feedback_type}`,
      category: rec?.category || null,
      metadata: {
        title: rec?.title,
        feedback_type: validated.feedback_type,
      },
      created_at: new Date().toISOString(),
    });

    return res.json({ message: 'Feedback recorded', feedback: saved });
  } catch (error: any) {
    console.error('submitFeedback error:', error);
    return res.status(400).json({ error: error.message || 'Failed to record feedback' });
  }
}

export async function removeFeedback(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const recommendationId = req.params.id;
    const feedbackType = req.query.type as string | undefined;

    localDb.removeFeedback(userId, recommendationId, feedbackType);

    // Record activity
    localDb.recordActivity({
      id: uuidv4(),
      user_id: userId,
      recommendation_id: recommendationId,
      activity_type: 'undo_feedback',
      metadata: { feedbackType },
      created_at: new Date().toISOString(),
    });

    return res.json({ message: 'Feedback removed successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to remove feedback' });
  }
}
