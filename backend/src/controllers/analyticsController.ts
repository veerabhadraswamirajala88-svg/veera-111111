import { Request, Response } from 'express';
import { localDb } from '../db/store.js';

export async function getAnalytics(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const recommendations = localDb.listRecommendations(userId);
    const feedback = localDb.getFeedbackForUser(userId);
    const activities = localDb.getActivity(userId, 500);
    const preferences = localDb.getPreferences(userId);

    // 1. Total counts
    const totalGenerated = recommendations.length;
    const viewsCount = activities.filter((a) => a.activity_type === 'view_recommendation').length;
    const clicksCount = activities.filter((a) => a.activity_type === 'click_recommendation').length;
    const likesCount = feedback.filter((f) => f.feedback_type === 'like').length;
    const dislikesCount = feedback.filter((f) => f.feedback_type === 'dislike').length;
    const savesCount = feedback.filter((f) => f.feedback_type === 'save').length;
    const searchCount = activities.filter((a) => a.activity_type === 'search').length;

    // 2. Category distribution of recommendations & interactions
    const categoryCountMap: Record<string, number> = {};
    recommendations.forEach((r) => {
      categoryCountMap[r.category] = (categoryCountMap[r.category] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCountMap).map(([name, count]) => ({
      name,
      count,
      percentage: totalGenerated > 0 ? Math.round((count / totalGenerated) * 100) : 0,
    }));

    // 3. Feedback sentiment breakdown
    const feedbackSentiment = [
      { name: 'Likes', count: likesCount, fill: '#10b981' },
      { name: 'Saves', count: savesCount, fill: '#6366f1' },
      { name: 'Dislikes', count: dislikesCount, fill: '#ef4444' },
      { name: 'Relevant', count: feedback.filter((f) => f.feedback_type === 'relevant').length, fill: '#3b82f6' },
    ];

    // 4. Activity engagement timeline (last 7 days)
    const daysMap: Record<string, { date: string; views: number; interactions: number; searches: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      daysMap[key] = { date: dayLabel, views: 0, interactions: 0, searches: 0 };
    }

    activities.forEach((act) => {
      const dateKey = act.created_at.split('T')[0];
      if (daysMap[dateKey]) {
        if (act.activity_type === 'view_recommendation') {
          daysMap[dateKey].views += 1;
        } else if (act.activity_type === 'search') {
          daysMap[dateKey].searches += 1;
        } else {
          daysMap[dateKey].interactions += 1;
        }
      }
    });

    const activityTimeline = Object.values(daysMap);

    // 5. User Interest distribution
    const interestDistribution = (preferences?.interests || []).map((interest) => ({
      interest,
      weight: 1,
    }));

    return res.json({
      summary: {
        total_recommendations: totalGenerated,
        total_views: viewsCount,
        total_clicks: clicksCount,
        total_saved: savesCount,
        total_likes: likesCount,
        total_dislikes: dislikesCount,
        total_searches: searchCount,
        engagement_rate:
          totalGenerated > 0
            ? Math.min(100, Math.round(((likesCount + savesCount + clicksCount) / totalGenerated) * 100))
            : 0,
      },
      category_distribution: categoryDistribution,
      feedback_sentiment: feedbackSentiment,
      activity_timeline: activityTimeline,
      interest_distribution: interestDistribution,
    });
  } catch (error: any) {
    console.error('getAnalytics error:', error);
    return res.status(500).json({ error: error.message || 'Failed to aggregate analytics' });
  }
}
