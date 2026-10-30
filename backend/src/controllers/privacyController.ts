import { Request, Response } from 'express';
import { localDb } from '../db/store.js';

export async function exportUserData(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;
    const profile = localDb.getProfile(userId);
    const preferences = localDb.getPreferences(userId);
    const recommendations = localDb.listRecommendations(userId);
    const feedback = localDb.getFeedbackForUser(userId);
    const activity = localDb.getActivity(userId, 1000);
    const searches = localDb.getSearchHistory(userId, 1000);
    const conversations = localDb.listConversations(userId);

    const exportPayload = {
      exported_at: new Date().toISOString(),
      account: {
        id: userId,
        email: req.user!.email,
        profile,
      },
      personalization: {
        preferences,
        total_recommendations: recommendations.length,
        recommendations,
      },
      interactions: {
        feedback_records: feedback,
        activity_history: activity,
        search_history: searches,
      },
      ai_assistant: {
        conversations_count: conversations.length,
        conversations,
      },
    };

    res.setHeader('Content-Disposition', `attachment; filename="persona-ai-export-${userId}.json"`);
    res.setHeader('Content-Type', 'application/json');
    return res.json(exportPayload);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Data export failed';
    return res.status(500).json({ error: errorMsg });
  }
}

export async function clearUserHistory(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;
    localDb.clearActivity(userId);
    localDb.clearSearchHistory(userId);
    return res.json({ message: 'Activity logs and search history successfully cleared' });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to clear history';
    return res.status(500).json({ error: errorMsg });
  }
}

export async function updatePrivacySettings(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;
    const { personalization_enabled } = req.body;

    if (typeof personalization_enabled !== 'boolean') {
      return res.status(400).json({ error: 'personalization_enabled must be a boolean' });
    }

    const updated = localDb.updateProfile(userId, { personalization_enabled });
    return res.json({
      message: 'Privacy settings updated successfully',
      profile: updated,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update privacy settings';
    return res.status(500).json({ error: errorMsg });
  }
}
