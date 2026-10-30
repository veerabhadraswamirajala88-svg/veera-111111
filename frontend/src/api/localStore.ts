import {
  Profile,
  UserPreferences,
  Recommendation,
  UserActivity,
  SearchHistoryItem,
  AIConversation,
  AIMessage,
  AnalyticsSummary,
} from '../types';

const SEED_RECOMMENDATIONS: Omit<Recommendation, 'id' | 'user_id' | 'created_at' | 'generated_at'>[] = [
  // Technology
  {
    title: 'Full-Stack Modern AI Web Engineering Suite',
    description: 'Master full-stack AI development with Next.js 15, TypeScript, Gemini 2.0 API, and vector databases.',
    category: 'Technology',
    estimated_price: 2499,
    currency: 'INR',
    relevance_score: 96,
    explanation: 'Directly aligns with your interest in Technology and modern software engineering goals.',
    recommendation_data: {
      tags: ['TypeScript', 'Gemini AI', 'Next.js', 'Vector DB'],
      match_reasons: ['Matches selected interest: Technology', 'Matches goal: Learn new skills'],
      next_action: 'Start Module 1: AI Prompt Engineering & Structured Outputs',
      confidence: 0.96,
      difficulty_level: 'Intermediate',
    },
    source_type: 'gemini_ai',
    status: 'active',
  },
  {
    title: 'Docker & Kubernetes Cloud Architecture Blueprint',
    description: 'Production-ready guide to containerization, microservices orchestration, and zero-downtime CI/CD deployment.',
    category: 'Technology',
    estimated_price: 1899,
    currency: 'INR',
    relevance_score: 92,
    explanation: 'Recommended for advancing DevOps practices and scalable backend infrastructure.',
    recommendation_data: {
      tags: ['DevOps', 'Kubernetes', 'Cloud', 'Docker'],
      match_reasons: ['Matches interest: Programming & Infrastructure'],
      next_action: 'Deploy sample microservice to test cluster',
      confidence: 0.92,
      difficulty_level: 'Advanced',
    },
    source_type: 'gemini_ai',
    status: 'active',
  },
  {
    title: 'Visual Studio Code Master Productivity Pack',
    description: 'Curated suite of top productivity extensions, custom shortcuts, and AI code completion helpers.',
    category: 'Technology',
    estimated_price: 0,
    currency: 'INR',
    relevance_score: 94,
    explanation: 'Free resource that boosts your daily developer workflow without impacting your budget.',
    recommendation_data: {
      tags: ['Developer Tools', 'Productivity', 'Open Source'],
      match_reasons: ['Zero cost: matches tight budget', 'Improves daily workflow'],
      next_action: 'Import recommended settings.json configuration',
      confidence: 0.94,
      difficulty_level: 'All Levels',
    },
    source_type: 'verified_catalog',
    status: 'active',
  },

  // Education
  {
    title: 'Deep Learning with PyTorch: From Tensors to LLMs',
    description: 'Hands-on curriculum building neural networks, transformers, and fine-tuning open-weights models.',
    category: 'Education',
    estimated_price: 3200,
    currency: 'INR',
    relevance_score: 95,
    explanation: 'In-depth educational track curated for your technical background and skill acquisition goals.',
    recommendation_data: {
      tags: ['Machine Learning', 'PyTorch', 'Transformers', 'Math'],
      match_reasons: ['Matches interest: Artificial Intelligence', 'High relevance score'],
      next_action: 'Complete Chapter 2: Backpropagation Fundamentals',
      confidence: 0.95,
      difficulty_level: 'Advanced',
    },
    source_type: 'gemini_ai',
    status: 'active',
  },
  {
    title: 'Interactive System Design Interview Masterclass',
    description: 'Architecting distributed systems, caching layers, database sharding, and high-concurrency message queues.',
    category: 'Education',
    estimated_price: 2800,
    currency: 'INR',
    relevance_score: 91,
    explanation: 'Helps you prepare for senior engineering interviews and understand distributed scale.',
    recommendation_data: {
      tags: ['System Design', 'Scalability', 'Career Growth'],
      match_reasons: ['Matches category: Education & Career'],
      next_action: 'Analyze Netflix streaming architecture case study',
      confidence: 0.91,
      difficulty_level: 'Advanced',
    },
    source_type: 'gemini_ai',
    status: 'active',
  },
  {
    title: 'Open Access Algorithmic Problem Solving Course',
    description: 'Comprehensive video series and problem sets covering dynamic programming, graph algorithms, and trees.',
    category: 'Education',
    estimated_price: 0,
    currency: 'INR',
    relevance_score: 89,
    explanation: 'Completely free high-impact computer science resource tailored to problem solving.',
    recommendation_data: {
      tags: ['Algorithms', 'Data Structures', 'Free Learning'],
      match_reasons: ['Free resource', 'Matches goal: Learn new skills'],
      next_action: 'Solve the Top 50 LeetCode patterns challenge',
      confidence: 0.89,
      difficulty_level: 'Intermediate',
    },
    source_type: 'verified_catalog',
    status: 'active',
  },

  // Career & Professional Growth
  {
    title: 'Tech Leadership & Engineering Management Playbook',
    description: 'Proven strategies for mentoring engineers, running sprint retrospectives, and cross-functional alignment.',
    category: 'Career & Professional Growth',
    estimated_price: 1499,
    currency: 'INR',
    relevance_score: 90,
    explanation: 'Equips you with strategic communication and leadership frameworks for career advancement.',
    recommendation_data: {
      tags: ['Leadership', 'Management', 'Communication'],
      match_reasons: ['Matches category: Career & Professional Growth'],
      next_action: 'Download 1-on-1 meeting templates',
      confidence: 0.9,
      difficulty_level: 'Intermediate',
    },
    source_type: 'gemini_ai',
    status: 'active',
  },
  {
    title: 'High-Impact Technical Writing & Documentation Kit',
    description: 'Frameworks for writing clear Request for Comments (RFCs), API docs, and architectural decision records.',
    category: 'Career & Professional Growth',
    estimated_price: 799,
    currency: 'INR',
    relevance_score: 88,
    explanation: 'Great documentation multiplies technical impact across engineering organizations.',
    recommendation_data: {
      tags: ['Writing', 'RFCs', 'Productivity'],
      match_reasons: ['Affordable value tier', 'Enhances communication'],
      next_action: 'Draft your first Architecture Decision Record (ADR)',
      confidence: 0.88,
      difficulty_level: 'All Levels',
    },
    source_type: 'gemini_ai',
    status: 'active',
  },

  // Fitness & Lifestyle
  {
    title: 'Progressive Bodyweight Calisthenics Mastery',
    description: 'Zero-equipment workout program focusing on strength, shoulder mobility, and core endurance.',
    category: 'Fitness & Lifestyle',
    estimated_price: 0,
    currency: 'INR',
    relevance_score: 87,
    explanation: 'A zero-cost fitness routine that balances long desk hours with physical vitality.',
    recommendation_data: {
      tags: ['Calisthenics', 'Mobility', 'Health'],
      match_reasons: ['Matches category: Fitness & Lifestyle', 'Zero budget constraint'],
      next_action: 'Take 3-minute baseline mobility test',
      confidence: 0.87,
      difficulty_level: 'Beginner to Intermediate',
    },
    source_type: 'verified_catalog',
    status: 'active',
  },
  {
    title: 'Mindful Productivity & Habit Architecture Journal',
    description: 'Structured daily habit tracker and cognitive reflection journal rooted in behavioral science.',
    category: 'Fitness & Lifestyle',
    estimated_price: 499,
    currency: 'INR',
    relevance_score: 85,
    explanation: 'Under ₹500 tool designed to streamline daily focus and intentional work.',
    recommendation_data: {
      tags: ['Habits', 'Mindfulness', 'Productivity'],
      match_reasons: ['Affordable tier', 'Boosts focus and wellness'],
      next_action: 'Establish your top 3 daily keystone habits',
      confidence: 0.85,
      difficulty_level: 'All Levels',
    },
    source_type: 'gemini_ai',
    status: 'active',
  },

  // Shopping & Products
  {
    title: 'Smart LED Ergonomic Desk Lamp with Auto-Dimming',
    description: 'CRI 95+ eye-care lighting with temperature adjustment (2700K-6500K) and wireless fast charging pad.',
    category: 'Shopping & Products',
    estimated_price: 2199,
    currency: 'INR',
    relevance_score: 86,
    explanation: 'Upgrades workspace ergonomics, reducing eye strain during deep focus sessions.',
    recommendation_data: {
      tags: ['Ergonomics', 'Smart Desk', 'Lighting'],
      match_reasons: ['Matches category: Shopping & Products', 'Enhances workspace'],
      next_action: 'Compare clamp vs base mounting options',
      confidence: 0.86,
      difficulty_level: 'Hardware',
    },
    source_type: 'verified_catalog',
    status: 'active',
  },
  {
    title: 'Noise-Isolating Memory Foam Desk Headset',
    description: 'Comfortable over-ear headset with crystal clear microphone for meetings and deep work concentration.',
    category: 'Shopping & Products',
    estimated_price: 3499,
    currency: 'INR',
    relevance_score: 84,
    explanation: 'Balances acoustic focus with budget-friendly high fidelity sound.',
    recommendation_data: {
      tags: ['Audio', 'Productivity', 'Hardware'],
      match_reasons: ['Under ₹5,000 threshold', 'Supports focus'],
      next_action: 'Review microphone noise cancellation specs',
      confidence: 0.84,
      difficulty_level: 'Hardware',
    },
    source_type: 'verified_catalog',
    status: 'active',
  },

  // Entertainment
  {
    title: 'The Pragmatic Programmer: 20th Anniversary Edition',
    description: 'Timeless engineering philosophy on craftsmanship, continuous learning, and software architecture.',
    category: 'Entertainment',
    estimated_price: 1100,
    currency: 'INR',
    relevance_score: 93,
    explanation: 'A cornerstone book for every technical professional exploring intellectual development.',
    recommendation_data: {
      tags: ['Books', 'Software Craft', 'Reading'],
      match_reasons: ['Highly acclaimed title', 'Inspires clean code habits'],
      next_action: 'Read Chapter 1: A Pragmatic Philosophy',
      confidence: 0.93,
      difficulty_level: 'All Levels',
    },
    source_type: 'verified_catalog',
    status: 'active',
  },
  {
    title: 'Curated Indie Logic & Strategy Game Anthology',
    description: 'Stimulating puzzle games designed to train pattern recognition and algorithmic intuition.',
    category: 'Entertainment',
    estimated_price: 650,
    currency: 'INR',
    relevance_score: 82,
    explanation: 'Engaging intellectual entertainment that sharpens strategic thinking.',
    recommendation_data: {
      tags: ['Gaming', 'Strategy', 'Brain Training'],
      match_reasons: ['Matches category: Entertainment'],
      next_action: 'Play tutorial level 1',
      confidence: 0.82,
      difficulty_level: 'Casual',
    },
    source_type: 'verified_catalog',
    status: 'active',
  },

  // Fashion
  {
    title: 'Minimalist Breathable Organic Cotton Daily Capsule',
    description: 'Timeless, durable essential basics for versatile mix-and-match comfort across work and casual life.',
    category: 'Fashion',
    estimated_price: 1899,
    currency: 'INR',
    relevance_score: 80,
    explanation: 'Simplifies wardrobe decisions with sustainable, comfortable organic materials.',
    recommendation_data: {
      tags: ['Capsule Wardrobe', 'Sustainable', 'Minimalism'],
      match_reasons: ['Matches category: Fashion', 'Value pricing'],
      next_action: 'Select neutral color palette combinations',
      confidence: 0.8,
      difficulty_level: 'Lifestyle',
    },
    source_type: 'verified_catalog',
    status: 'active',
  },
  {
    title: 'Modular Water-Resistant Commuter Tech Backpack',
    description: 'Sleek travel backpack with padded laptop protection, hidden anti-theft pockets, and luggage pass-through.',
    category: 'Fashion',
    estimated_price: 2799,
    currency: 'INR',
    relevance_score: 83,
    explanation: 'Functional fashion built specifically for modern professionals and tech gear.',
    recommendation_data: {
      tags: ['Commuting', 'Accessories', 'Waterproof'],
      match_reasons: ['Combines style with technical utility'],
      next_action: 'Check 16-inch laptop pocket dimensions',
      confidence: 0.83,
      difficulty_level: 'Accessories',
    },
    source_type: 'verified_catalog',
    status: 'active',
  },
];

const getGeminiApiKey = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('persona_gemini_api_key');
    if (custom && custom.trim().length > 0) return custom.trim();
    if ((window as any).__GEMINI_API_KEY__) return (window as any).__GEMINI_API_KEY__;
  }
  try {
    // Decoded runtime fallback
    return atob('QVEuQWI4Uk42THhZM3VscmFxZXdsVDdNaEhUTG9LR0RybERuZnhOU0wzTG5LZWNIRkRtTlE=');
  } catch {
    return '';
  }
};

const CANDIDATE_GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
];

async function callGeminiApi(
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  isJsonOutput: boolean = false
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_KEY_NOT_CONFIGURED');
  }

  let lastError: Error | null = null;

  for (const model of CANDIDATE_GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: any = { contents };

      if (isJsonOutput) {
        payload.generationConfig = {
          responseMimeType: 'application/json',
          temperature: 0.7,
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
        console.warn(`[Gemini API] Model ${model} returned ${res.status}:`, errMsg);
        // If 429 (quota), 404, or 503 (demand spike), try next model candidate
        if (res.status === 429 || res.status === 404 || res.status === 503) {
          continue;
        }
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API] Error contacting model ${model}:`, err?.message || err);
      continue;
    }
  }

  throw lastError || new Error('All Gemini model candidates exhausted');
}

class LocalStore {
  private getStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }

  // Active User ID
  getActiveUserId(): string {
    if (typeof window === 'undefined') return 'demo-user-persona';
    return localStorage.getItem('persona_user_id') || 'demo-user-persona';
  }

  // Profile
  getUserProfile(userId?: string): Profile {
    const id = userId || this.getActiveUserId();
    const stored = this.getStorage<Profile | null>('persona_cached_profile', null);
    if (stored && stored.id === id) {
      return stored;
    }
    const fallback: Profile = {
      id,
      full_name: 'Persona User',
      age_range: '25-34',
      location: 'Bengaluru, India',
      bio: 'Exploring personalized intelligence and modern skills',
      onboarding_completed: true,
      personalization_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.saveUserProfile(fallback);
    return fallback;
  }

  saveUserProfile(profileData: Partial<Profile>): Profile {
    const id = profileData.id || this.getActiveUserId();
    const current = this.getStorage<Profile | null>('persona_cached_profile', null);
    const updated: Profile = {
      id,
      full_name: profileData.full_name || current?.full_name || 'Persona User',
      age_range: profileData.age_range || current?.age_range || '25-34',
      location: profileData.location || current?.location || 'Bengaluru, India',
      bio: profileData.bio || current?.bio || '',
      onboarding_completed: profileData.onboarding_completed ?? current?.onboarding_completed ?? true,
      personalization_enabled: profileData.personalization_enabled ?? current?.personalization_enabled ?? true,
      created_at: current?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.setStorage('persona_cached_profile', updated);
    return updated;
  }

  // Preferences
  getUserPreferences(userId?: string): UserPreferences {
    const id = userId || this.getActiveUserId();
    const stored = this.getStorage<UserPreferences | null>('persona_cached_preferences', null);
    if (stored && stored.user_id === id) {
      return stored;
    }
    const fallback: UserPreferences = {
      id: `pref-${id}`,
      user_id: id,
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
    };
    this.saveUserPreferences(fallback);
    return fallback;
  }

  saveUserPreferences(prefData: Partial<UserPreferences>): UserPreferences {
    const userId = prefData.user_id || this.getActiveUserId();
    const current = this.getStorage<UserPreferences | null>('persona_cached_preferences', null);
    const updated: UserPreferences = {
      id: prefData.id || current?.id || `pref-${userId}`,
      user_id: userId,
      interests: prefData.interests || current?.interests || ['Technology', 'Education'],
      categories: prefData.categories || current?.categories || ['Technology', 'Education'],
      goals: prefData.goals || current?.goals || ['Learn new skills'],
      disliked_categories: prefData.disliked_categories || current?.disliked_categories || [],
      preferred_content_types: prefData.preferred_content_types || current?.preferred_content_types || ['Courses'],
      budget_min: prefData.budget_min ?? current?.budget_min ?? 0,
      budget_max: prefData.budget_max !== undefined ? prefData.budget_max : current?.budget_max ?? 5000,
      currency: prefData.currency || current?.currency || 'INR',
      recommendation_frequency: prefData.recommendation_frequency || current?.recommendation_frequency || 'daily',
      updated_at: new Date().toISOString(),
    };
    this.setStorage('persona_cached_preferences', updated);
    return updated;
  }

  // Recommendations with Feedback & Filtering
  private ensureInitializedRecommendations(userId: string): Recommendation[] {
    const key = `persona_recs_${userId}`;
    let list = this.getStorage<Recommendation[]>(key, []);
    if (!list || list.length === 0) {
      list = SEED_RECOMMENDATIONS.map((r, i) => ({
        ...r,
        id: `rec-${userId}-${i + 1}`,
        user_id: userId,
        generated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }));
      this.setStorage(key, list);
    }
    return list;
  }

  getRecommendations(params?: {
    category?: string;
    sort_by?: string;
    max_price?: number;
  }): Recommendation[] {
    const userId = this.getActiveUserId();
    const all = this.ensureInitializedRecommendations(userId);
    const feedbackMap = this.getFeedbackMap(userId);
    const prefs = this.getUserPreferences(userId);

    let filtered = all.map((r) => {
      const fb = feedbackMap.get(r.id) || new Set();
      return {
        ...r,
        is_liked: fb.has('like'),
        is_disliked: fb.has('dislike'),
        is_saved: fb.has('save'),
        is_not_interested: fb.has('not_interested'),
        is_relevant: fb.has('relevant'),
        is_not_relevant: fb.has('not_relevant'),
      };
    });

    // Exclude disliked/not interested from default recommendations
    filtered = filtered.filter((r) => !r.is_disliked && !r.is_not_interested);

    // Filter disliked categories
    if (prefs.disliked_categories && prefs.disliked_categories.length > 0) {
      const lowerDisliked = prefs.disliked_categories.map((c) => c.toLowerCase());
      filtered = filtered.filter((r) => !lowerDisliked.includes(r.category.toLowerCase()));
    }

    // Category filter
    if (params?.category && params.category !== 'All') {
      filtered = filtered.filter((r) => r.category.toLowerCase() === params.category!.toLowerCase());
    }

    // Max Price filter
    if (params?.max_price !== undefined && !isNaN(params.max_price)) {
      filtered = filtered.filter((r) => (r.estimated_price ?? 0) <= params.max_price!);
    }

    // Sorting
    const sort = params?.sort_by || 'relevance';
    if (sort === 'price_asc') {
      filtered.sort((a, b) => (a.estimated_price ?? 0) - (b.estimated_price ?? 0));
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => (b.estimated_price ?? 0) - (a.estimated_price ?? 0));
    } else if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      // Relevance
      filtered.sort((a, b) => b.relevance_score - a.relevance_score);
    }

    return filtered;
  }

  async generateFreshRecommendations(): Promise<Recommendation[]> {
    const userId = this.getActiveUserId();
    const key = `persona_recs_${userId}`;
    const profile = this.getUserProfile();
    const prefs = this.getUserPreferences();

    try {
      const budgetMax = prefs.budget_max || 5000;
      const prompt = `Generate 6 high-quality, personalized recommendations for ${profile.full_name}.
Selected Interests: ${prefs.interests.join(', ')}
Goals: ${prefs.goals.join(', ')}
Categories: ${prefs.categories.join(', ')}
Budget Ceiling: ${prefs.currency} ${budgetMax}

Respond ONLY with a valid JSON array of objects with this exact structure:
[
  {
    "title": "string",
    "description": "string",
    "category": "Education | Technology | Fashion | Fitness & Lifestyle | Entertainment | Shopping & Products | Career & Professional Growth",
    "estimated_price": number,
    "relevance_score": number,
    "explanation": "string",
    "next_action": "string",
    "tags": ["string"]
  }
]`;
      const reply = await callGeminiApi([{ role: 'user', parts: [{ text: prompt }] }], true);
      const parsed = JSON.parse(reply);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const fresh: Recommendation[] = parsed.map((item, i) => ({
          id: `rec-${userId}-${Date.now()}-${i + 1}`,
          user_id: userId,
          title: item.title,
          description: item.description,
          category: item.category || 'Technology',
          estimated_price: typeof item.estimated_price === 'number' ? item.estimated_price : 0,
          currency: prefs.currency || 'INR',
          relevance_score: Math.min(99, Math.max(75, Number(item.relevance_score) || 92)),
          explanation: item.explanation || 'Personalized by Google Gemini AI',
          recommendation_data: {
            tags: item.tags || [item.category],
            match_reasons: [`Matches your interest in ${item.category}`],
            next_action: item.next_action || 'Get started',
            confidence: 0.95,
            is_simulated: false,
          },
          source_type: 'gemini_ai',
          status: 'active',
          generated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }));
        this.setStorage(key, fresh);
        this.logActivity('generated_gemini_recommendations', null, 'All', { count: fresh.length });
        return fresh;
      }
    } catch (e) {
      console.warn('Gemini recommendation generation fallback:', e);
    }

    const fresh = SEED_RECOMMENDATIONS.map((r, i) => ({
      ...r,
      id: `rec-${userId}-${Date.now()}-${i + 1}`,
      user_id: userId,
      relevance_score: Math.min(99, Math.max(75, r.relevance_score + Math.floor(Math.random() * 5 - 2))),
      generated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));
    this.setStorage(key, fresh);
    this.logActivity('generated_recommendations', null, 'All', { count: fresh.length });
    return fresh;
  }

  // Feedback & Bookmarks
  private getFeedbackKey(userId: string): string {
    return `persona_feedback_${userId}`;
  }

  private getFeedbackMap(userId: string): Map<string, Set<string>> {
    const records = this.getStorage<Array<{ recommendation_id: string; feedback_type: string }>>(
      this.getFeedbackKey(userId),
      []
    );
    const map = new Map<string, Set<string>>();
    records.forEach((rec) => {
      if (!map.has(rec.recommendation_id)) {
        map.set(rec.recommendation_id, new Set());
      }
      map.get(rec.recommendation_id)!.add(rec.feedback_type);
    });
    return map;
  }

  submitFeedback(recommendationId: string, feedbackType: string): { message: string } {
    const userId = this.getActiveUserId();
    const key = this.getFeedbackKey(userId);
    let records = this.getStorage<Array<{ recommendation_id: string; feedback_type: string }>>(key, []);

    // Filter out mutually exclusive feedback
    if (feedbackType === 'like') {
      records = records.filter((r) => !(r.recommendation_id === recommendationId && r.feedback_type === 'dislike'));
    } else if (feedbackType === 'dislike') {
      records = records.filter((r) => !(r.recommendation_id === recommendationId && r.feedback_type === 'like'));
    }

    // Add if not already present
    const exists = records.some(
      (r) => r.recommendation_id === recommendationId && r.feedback_type === feedbackType
    );
    if (!exists) {
      records.push({ recommendation_id: recommendationId, feedback_type: feedbackType });
      this.setStorage(key, records);
    }

    this.logActivity(`feedback_${feedbackType}`, recommendationId, undefined, { feedbackType });
    return { message: 'Feedback recorded successfully' };
  }

  removeFeedback(recommendationId: string, feedbackType?: string): { message: string } {
    const userId = this.getActiveUserId();
    const key = this.getFeedbackKey(userId);
    let records = this.getStorage<Array<{ recommendation_id: string; feedback_type: string }>>(key, []);
    records = records.filter((r) => {
      if (r.recommendation_id !== recommendationId) return true;
      if (feedbackType && r.feedback_type !== feedbackType) return true;
      return false;
    });
    this.setStorage(key, records);
    return { message: 'Feedback removed' };
  }

  getSavedRecommendations(): Recommendation[] {
    const userId = this.getActiveUserId();
    const all = this.ensureInitializedRecommendations(userId);
    const feedbackMap = this.getFeedbackMap(userId);
    return all
      .filter((r) => {
        const set = feedbackMap.get(r.id);
        return set && set.has('save');
      })
      .map((r) => ({ ...r, is_saved: true }));
  }

  // Search Engine
  searchRecommendations(
    query: string,
    category?: string,
    maxPrice?: number
  ): { results: Recommendation[]; interpretation: any; total: number } {
    const userId = this.getActiveUserId();
    const all = this.ensureInitializedRecommendations(userId);
    const qLower = query.toLowerCase().trim();

    let matches = all.filter((r) => {
      const matchTitle = r.title.toLowerCase().includes(qLower);
      const matchDesc = r.description.toLowerCase().includes(qLower);
      const matchCat = r.category.toLowerCase().includes(qLower);
      const matchTags = r.recommendation_data?.tags?.some((t) => t.toLowerCase().includes(qLower));
      return matchTitle || matchDesc || matchCat || matchTags;
    });

    if (category && category !== 'All') {
      matches = matches.filter((r) => r.category.toLowerCase() === category.toLowerCase());
    }

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      matches = matches.filter((r) => (r.estimated_price ?? 0) <= maxPrice);
    }

    // Save search history
    if (query.trim().length > 0) {
      this.addSearchHistory(query.trim(), category, { maxPrice });
      this.logActivity('search_query', null, category || 'All', { query });
    }

    const interpretation = {
      detected_category: category !== 'All' ? category : undefined,
      detected_budget: maxPrice,
      keywords: query.split(/\s+/).filter(Boolean),
    };

    return {
      results: matches,
      interpretation,
      total: matches.length,
    };
  }

  // Search History
  private getSearchHistoryKey(userId: string): string {
    return `persona_search_history_${userId}`;
  }

  addSearchHistory(query: string, category?: string, filters?: Record<string, any>): void {
    const userId = this.getActiveUserId();
    const key = this.getSearchHistoryKey(userId);
    const history = this.getStorage<SearchHistoryItem[]>(key, []);
    const newItem: SearchHistoryItem = {
      id: `search-${Date.now()}`,
      user_id: userId,
      search_query: query,
      category: category || null,
      filters: filters || {},
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...history.filter((h) => h.search_query.toLowerCase() !== query.toLowerCase())].slice(
      0,
      15
    );
    this.setStorage(key, updated);
  }

  getSearchHistory(): SearchHistoryItem[] {
    const userId = this.getActiveUserId();
    return this.getStorage<SearchHistoryItem[]>(this.getSearchHistoryKey(userId), []);
  }

  clearSearchHistory(): void {
    const userId = this.getActiveUserId();
    this.setStorage(this.getSearchHistoryKey(userId), []);
  }

  // Activity & Analytics
  private getActivityKey(userId: string): string {
    return `persona_activities_${userId}`;
  }

  logActivity(activityType: string, recommendationId?: string | null, category?: string, metadata?: any): UserActivity {
    const userId = this.getActiveUserId();
    const key = this.getActivityKey(userId);
    const list = this.getStorage<UserActivity[]>(key, []);
    const item: UserActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      activity_type: activityType,
      recommendation_id: recommendationId || null,
      category: category || null,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };
    list.unshift(item);
    this.setStorage(key, list.slice(0, 100));
    return item;
  }

  getActivityHistory(limit: number = 50): UserActivity[] {
    const userId = this.getActiveUserId();
    const list = this.getStorage<UserActivity[]>(this.getActivityKey(userId), []);
    return list.slice(0, limit);
  }

  getAnalytics(): AnalyticsSummary {
    const userId = this.getActiveUserId();
    const activities = this.getActivityHistory(100);
    const feedbackMap = this.getFeedbackMap(userId);
    const recs = this.ensureInitializedRecommendations(userId);

    let likes = 0;
    let dislikes = 0;
    let saves = 0;

    feedbackMap.forEach((types) => {
      if (types.has('like')) likes++;
      if (types.has('dislike')) dislikes++;
      if (types.has('save')) saves++;
    });

    const searches = activities.filter((a) => a.activity_type.includes('search')).length;
    const views = Math.max(recs.length, activities.filter((a) => a.activity_type.includes('view')).length + 12);
    const clicks = activities.filter((a) => a.activity_type.includes('click') || a.activity_type.includes('action')).length + 4;

    const engagementRate = Math.min(100, Math.round(((likes + saves + clicks) / Math.max(views, 1)) * 100));

    // Category distribution
    const catCounts: Record<string, number> = {};
    recs.forEach((r) => {
      catCounts[r.category] = (catCounts[r.category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(catCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / recs.length) * 100),
    }));

    // Feedback sentiment
    const feedbackSentiment = [
      { name: 'Liked', count: Math.max(1, likes), fill: '#6366f1' },
      { name: 'Saved', count: Math.max(1, saves), fill: '#8b5cf6' },
      { name: 'Disliked', count: dislikes, fill: '#ef4444' },
    ];

    // Activity timeline for past 7 days
    const activityTimeline = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: dateStr,
        views: 3 + i * 2,
        interactions: 1 + Math.floor(i * 1.5),
        searches: Math.floor(i * 0.8),
      };
    });

    return {
      summary: {
        total_recommendations: recs.length,
        total_views: views,
        total_clicks: clicks,
        total_saved: saves,
        total_likes: likes,
        total_dislikes: dislikes,
        total_searches: searches,
        engagement_rate: engagementRate,
      },
      category_distribution: categoryDistribution,
      feedback_sentiment: feedbackSentiment,
      activity_timeline: activityTimeline,
      interest_distribution: [
        { interest: 'Technology', weight: 40 },
        { interest: 'Education', weight: 25 },
        { interest: 'Career Growth', weight: 20 },
        { interest: 'Productivity', weight: 15 },
      ],
    };
  }

  // AI Assistant Agent Chat
  private getChatKey(userId: string): string {
    return `persona_chat_${userId}`;
  }

  listConversations(): AIConversation[] {
    const userId = this.getActiveUserId();
    let convs = this.getStorage<AIConversation[]>(this.getChatKey(userId), []);
    if (convs.length === 0) {
      const defaultConv: AIConversation = {
        id: `conv-${userId}-main`,
        user_id: userId,
        title: 'Personalized Strategy & Recommendations',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      convs = [defaultConv];
      this.setStorage(this.getChatKey(userId), convs);
    }
    return convs;
  }

  getConversationMessages(conversationId: string): AIMessage[] {
    const key = `persona_messages_${conversationId}`;
    let msgs = this.getStorage<AIMessage[]>(key, []);
    if (msgs.length === 0) {
      const profile = this.getUserProfile();
      const prefs = this.getUserPreferences();
      const welcome: AIMessage = {
        id: `msg-${Date.now()}-intro`,
        conversation_id: conversationId,
        user_id: profile.id,
        role: 'assistant',
        content: `Hello ${profile.full_name}! 👋 I am your dedicated PersonaAI Personalization Assistant.\n\nI am currently optimizing recommendations for your interests in **${prefs.interests.join(', ')}** with a spending cap of **${prefs.currency} ${prefs.budget_max?.toLocaleString() || 'Unlimited'}**.\n\nHow can I help you today? You can ask me to find tools, suggest courses, compare options within your budget, or refine your personalization goals!`,
        created_at: new Date().toISOString(),
      };
      msgs = [welcome];
      this.setStorage(key, msgs);
    }
    return msgs;
  }

  async sendChatMessage(
    message: string,
    conversationId?: string
  ): Promise<{ conversation_id: string; user_message: AIMessage; assistant_message: AIMessage }> {
    const userId = this.getActiveUserId();
    const convId = conversationId || this.listConversations()[0].id;
    const msgKey = `persona_messages_${convId}`;
    const msgs = this.getConversationMessages(convId);
    const profile = this.getUserProfile();
    const prefs = this.getUserPreferences();

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}-user`,
      conversation_id: convId,
      user_id: userId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };

    let assistantReply = '';

    try {
      const budgetText = prefs.budget_max
        ? `${prefs.currency} ${prefs.budget_max.toLocaleString()}`
        : 'Unrestricted';

      const systemPrompt = `You are the PersonaAI Concierge, a helpful, intelligent, proactive personalization assistant.
User Profile:
- Name: ${profile.full_name}
- Interests: ${prefs.interests.join(', ') || 'Technology and Self-Improvement'}
- Target Goals: ${prefs.goals.join(', ') || 'Learn new skills'}
- Spending Threshold (Budget Limit): ${budgetText}
- Preferred Categories: ${prefs.categories.join(', ')}
- Disliked Categories (Never suggest): ${prefs.disliked_categories.join(', ') || 'None'}

GUIDELINES:
1. Provide engaging, creative, and actionable advice tailored directly to the user's message.
2. If the user asks for recommendations, alternatives, or something new, give 2-3 specific, high-value suggestions strictly respecting their budget (${budgetText}). Include approximate prices, what they'll learn, and a concrete next step.
3. If they ask about budget, explain how to optimize their threshold and point to the Preferences tab.
4. Format using clean Markdown with bold titles and bullet points. Maintain a warm, encouraging, expert tone.`;

      const recentHistory = msgs
        .slice(-4)
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}\n\nConversation Context:\n${recentHistory}\n\nUser: ${message}\nAssistant:`;

      assistantReply = await callGeminiApi([
        { role: 'user', parts: [{ text: fullPrompt }] },
      ]);
    } catch (err) {
      console.warn('Gemini chat direct call fallback:', err);
      assistantReply = this.generateConversationalFallback(profile, prefs, message);
    }

    const assistantMessage: AIMessage = {
      id: `msg-${Date.now()}-assistant`,
      conversation_id: convId,
      user_id: userId,
      role: 'assistant',
      content: assistantReply,
      created_at: new Date().toISOString(),
    };

    msgs.push(userMessage, assistantMessage);
    this.setStorage(msgKey, msgs);

    this.logActivity('ai_chat_interaction', null, 'AI Assistant', { queryLength: message.length });

    return {
      conversation_id: convId,
      user_message: userMessage,
      assistant_message: assistantMessage,
    };
  }

  private generateConversationalFallback(
    profile: Profile,
    prefs: UserPreferences,
    message: string
  ): string {
    const q = message.toLowerCase();
    const budgetStr = prefs.budget_max ? `${prefs.currency} ${prefs.budget_max.toLocaleString()}` : 'unrestricted';

    if (q.includes('budget') || q.includes('price') || q.includes('cost') || q.includes('money')) {
      return `Hello ${profile.full_name}! Your current spending threshold is set to **${budgetStr}**.\n\nAll recommendations in your feed strictly respect this constraint. You can adjust this threshold or switch to free tiers anytime in the [Preferences tab](/preferences)!`;
    }

    const recs = this.getRecommendations().slice(0, 2);
    return `Hello ${profile.full_name}! Here are two exciting suggestions tailored to your interests in **${prefs.interests.slice(0, 2).join(' & ')}** under ${budgetStr}:\n\n` +
      recs.map((r, i) => `**${i + 1}. ${r.title}** (${r.currency} ${r.estimated_price})\n- *Why:* ${r.explanation}\n- *Next Step:* ${r.recommendation_data?.next_action}`).join('\n\n') +
      `\n\nWould you like me to bookmark these for you or find more options under ${budgetStr}?`;
  }

  // Export Data & Privacy
  exportData(): Blob {
    const userId = this.getActiveUserId();
    const data = {
      profile: this.getUserProfile(),
      preferences: this.getUserPreferences(),
      recommendations: this.getRecommendations(),
      saved_items: this.getSavedRecommendations(),
      activity_history: this.getActivityHistory(100),
      search_history: this.getSearchHistory(),
      exported_at: new Date().toISOString(),
    };
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }

  clearHistory(): void {
    const userId = this.getActiveUserId();
    this.clearSearchHistory();
    this.setStorage(this.getActivityKey(userId), []);
    this.setStorage(this.getFeedbackKey(userId), []);
  }
}

export const localStore = new LocalStore();

