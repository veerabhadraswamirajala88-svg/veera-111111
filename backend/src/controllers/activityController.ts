import { Request, Response } from 'express';
import { localDb } from '../db/store.js';
import { v4 as uuidv4 } from 'uuid';

export async function logActivity(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { activity_type, recommendation_id, category, metadata } = req.body;

    if (!activity_type) {
      return res.status(400).json({ error: 'activity_type is required' });
    }

    const recorded = localDb.recordActivity({
      id: uuidv4(),
      user_id: userId,
      recommendation_id: recommendation_id || null,
      activity_type,
      category: category || null,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({ activity: recorded });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to record activity' });
  }
}

export async function getActivityHistory(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const activities = localDb.getActivity(userId, limit);
    return res.json({ activities });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch activity history' });
  }
}
