import { Request, Response } from 'express';
import { localDb } from '../db/store.js';
import { SearchSchema } from '../types/index.js';
import { interpretSearchQuery } from '../services/geminiService.js';
import { v4 as uuidv4 } from 'uuid';

export async function searchRecommendations(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const validated = SearchSchema.parse(req.body);

    const preferences = localDb.getPreferences(userId);
    const allRecs = localDb.listRecommendations(userId);

    // AI-Assisted search interpretation
    const interpretation = await interpretSearchQuery(validated.query, preferences || undefined);

    // Record search in history
    if (validated.query.trim().length > 0) {
      localDb.recordSearch({
        id: uuidv4(),
        user_id: userId,
        search_query: validated.query,
        category: validated.category || interpretation.interpreted_category || null,
        filters: {
          max_price: validated.max_price,
          sort_by: validated.sort_by,
          personalize: validated.personalize,
        },
        created_at: new Date().toISOString(),
      });

      localDb.recordActivity({
        id: uuidv4(),
        user_id: userId,
        activity_type: 'search',
        metadata: { query: validated.query },
        created_at: new Date().toISOString(),
      });
    }

    const queryLower = validated.query.toLowerCase().trim();
    const effectiveCategory = validated.category || (validated.personalize ? interpretation.interpreted_category : undefined);
    const effectiveMaxPrice = validated.max_price ?? interpretation.extracted_max_price;

    let filtered = allRecs.filter((item) => {
      // 1. Text match (if query provided)
      if (queryLower.length > 0) {
        const titleMatch = item.title.toLowerCase().includes(queryLower);
        const descMatch = item.description.toLowerCase().includes(queryLower);
        const categoryMatch = item.category.toLowerCase().includes(queryLower);
        const tagsMatch = item.recommendation_data?.tags?.some((t) =>
          t.toLowerCase().includes(queryLower)
        );
        const keywordMatch = interpretation.extracted_keywords.some(
          (k) =>
            item.title.toLowerCase().includes(k) ||
            item.description.toLowerCase().includes(k)
        );

        if (!titleMatch && !descMatch && !categoryMatch && !tagsMatch && !keywordMatch) {
          return false;
        }
      }

      // 2. Category filter
      if (effectiveCategory && effectiveCategory !== 'All') {
        if (item.category.toLowerCase() !== effectiveCategory.toLowerCase()) {
          return false;
        }
      }

      // 3. Price filter
      if (effectiveMaxPrice !== undefined && effectiveMaxPrice > 0) {
        if ((item.estimated_price ?? 0) > effectiveMaxPrice) {
          return false;
        }
      }

      return true;
    });

    // 4. Attach user feedback flags
    const userFeedback = localDb.getFeedbackForUser(userId);
    const feedbackMap = new Map<string, Set<string>>();
    userFeedback.forEach((f) => {
      if (!feedbackMap.has(f.recommendation_id)) {
        feedbackMap.set(f.recommendation_id, new Set());
      }
      feedbackMap.get(f.recommendation_id)!.add(f.feedback_type);
    });

    let results = filtered.map((r) => {
      const fbSet = feedbackMap.get(r.id) || new Set();
      let personalizedScore = r.relevance_score;

      // Personalization boost if enabled
      if (validated.personalize && preferences) {
        if (preferences.categories.includes(r.category)) {
          personalizedScore += 5;
        }
        if (preferences.interests.some((i) => r.title.toLowerCase().includes(i.toLowerCase()))) {
          personalizedScore += 8;
        }
      }

      return {
        ...r,
        relevance_score: Math.min(99, personalizedScore),
        is_liked: fbSet.has('like'),
        is_saved: fbSet.has('save'),
        is_disliked: fbSet.has('dislike'),
      };
    });

    // 5. Sorting
    if (validated.sort_by === 'price_asc') {
      results.sort((a, b) => (a.estimated_price ?? 0) - (b.estimated_price ?? 0));
    } else if (validated.sort_by === 'price_desc') {
      results.sort((a, b) => (b.estimated_price ?? 0) - (a.estimated_price ?? 0));
    } else if (validated.sort_by === 'newest') {
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      results.sort((a, b) => b.relevance_score - a.relevance_score);
    }

    return res.json({
      interpretation: {
        detected_category: interpretation.interpreted_category,
        detected_budget: interpretation.extracted_max_price,
        keywords: interpretation.extracted_keywords,
      },
      results,
      total: results.length,
    });
  } catch (error: any) {
    console.error('searchRecommendations error:', error);
    return res.status(400).json({ error: error.message || 'Search execution failed' });
  }
}

export async function getSearchHistory(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const history = localDb.getSearchHistory(userId);
    return res.json({ history });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch search history' });
  }
}

export async function clearSearchHistory(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    localDb.clearSearchHistory(userId);
    return res.json({ message: 'Search history cleared successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to clear search history' });
  }
}
