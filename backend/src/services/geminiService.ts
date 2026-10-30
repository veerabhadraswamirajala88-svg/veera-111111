import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env.js';
import { Profile, UserPreferences, Recommendation, RecommendationFeedback } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

let geminiClient: GoogleGenAI | null = null;

if (ENV.isGeminiConfigured()) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
    console.log('✅ Google Gemini AI SDK initialized successfully');
  } catch (err) {
    console.warn('⚠️ Could not initialize Google GenAI SDK:', err);
  }
} else {
  console.log('ℹ️ GEMINI_API_KEY is not configured or is a placeholder. Using intelligent algorithmic engine fallback.');
}

interface RawAiRecommendation {
  title: string;
  description: string;
  category: string;
  estimated_price?: number;
  currency?: string;
  relevance_score: number;
  explanation: string;
  next_action?: string;
  tags?: string[];
  match_reasons?: string[];
  difficulty_level?: string;
}

const CANDIDATE_GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
];

async function callGeminiWithModelFallback(params: any): Promise<any> {
  let lastErr: any = null;
  for (const model of CANDIDATE_GEMINI_MODELS) {
    try {
      return await geminiClient!.models.generateContent({
        ...params,
        model,
      });
    } catch (err: any) {
      lastErr = err;
      const msg = err?.message || String(err);
      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('503')) {
        console.warn(`[Gemini SDK] Model ${model} quota or capacity limit. Trying next candidate...`);
        continue;
      }
      throw err;
    }
  }
  throw lastErr || new Error('All candidate models exhausted');
}

export async function generateRecommendationsWithGemini(
  profile: Profile,
  preferences: UserPreferences,
  feedbackHistory: RecommendationFeedback[] = [],
  count: number = 8
): Promise<Recommendation[]> {
  const dislikedTypes = feedbackHistory
    .filter((f) => f.feedback_type === 'dislike' || f.feedback_type === 'not_interested')
    .map((f) => f.recommendation_id);

  if (!geminiClient) {
    return generateAlgorithmicRecommendations(profile, preferences, feedbackHistory, count);
  }

  try {
    const prompt = `You are the core recommendation engine of PersonaAI, an intelligent personalization platform.
Generate ${count} high-quality, deeply personalized recommendations tailored specifically to this user:

USER PROFILE:
- Name: ${profile.full_name}
- Age Range: ${profile.age_range || 'Not specified'}
- Location: ${profile.location || 'Not specified'}
- Bio: ${profile.bio || 'Not specified'}

PREFERENCES & CONSTRAINTS:
- Selected Interests: ${preferences.interests.join(', ') || 'General curiosity'}
- Preferred Categories: ${preferences.categories.join(', ') || 'All categories'}
- Goals: ${preferences.goals.join(', ') || 'Self-improvement and discovery'}
- Disliked Categories (DO NOT RECOMMEND): ${preferences.disliked_categories.join(', ') || 'None'}
- Preferred Content Types: ${preferences.preferred_content_types.join(', ') || 'Any'}
- Budget Range: ${preferences.budget_min} to ${preferences.budget_max ? preferences.budget_max : 'No upper limit'} ${preferences.currency}

RULES:
1. Strictly respect the user's budget range. If budget_max is specified, estimated_price MUST NOT exceed ${preferences.budget_max}.
2. Categories MUST be one of: "Education", "Technology", "Fashion", "Fitness & Lifestyle", "Entertainment", "Shopping & Products", "Career & Professional Growth".
3. Prioritize their selected interests and goals.
4. For each recommendation, provide an honest, crystal-clear explanation of WHY it was chosen for them and how it aligns with their budget and interests.
5. Provide a realistic estimated_price in ${preferences.currency} (or 0 if free resource/course).
6. Provide a relevance_score between 70.0 and 99.0.
7. Include a suggested 'next_action' (e.g. "Start with module 1", "Check community reviews", "Practice basic exercises").
8. Note that these are AI-generated suggestions rather than verified vendor listings.

Respond ONLY with a valid JSON array of objects conforming to this schema:
[
  {
    "title": "string",
    "description": "string",
    "category": "string",
    "estimated_price": number,
    "currency": "${preferences.currency}",
    "relevance_score": number,
    "explanation": "string",
    "next_action": "string",
    "tags": ["string"],
    "match_reasons": ["string"],
    "difficulty_level": "Beginner | Intermediate | Advanced | All Levels"
  }
]`;

    const response = await callGeminiWithModelFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text?.trim() || '[]';
    const parsed: RawAiRecommendation[] = JSON.parse(responseText);

    const now = new Date().toISOString();
    return parsed.map((item) => ({
      id: uuidv4(),
      user_id: profile.id,
      title: item.title,
      description: item.description,
      category: item.category,
      estimated_price: typeof item.estimated_price === 'number' ? item.estimated_price : 0,
      currency: item.currency || preferences.currency || 'INR',
      relevance_score: Math.min(99, Math.max(50, Number(item.relevance_score) || 85)),
      explanation: item.explanation || `Personalized for your interest in ${item.category}`,
      recommendation_data: {
        next_action: item.next_action || 'Explore details and get started',
        tags: item.tags || [item.category],
        match_reasons: item.match_reasons || [`Matches your focus on ${preferences.goals[0] || 'learning'}`],
        is_simulated: true,
        confidence: 0.94,
        difficulty_level: item.difficulty_level || 'All Levels',
      },
      source_type: 'gemini_ai',
      source_url: null,
      status: 'active',
      generated_at: now,
      created_at: now,
    }));
  } catch (error) {
    console.error('Error generating recommendations with Gemini, gracefully falling back to algorithmic engine:', error);
    return generateAlgorithmicRecommendations(profile, preferences, feedbackHistory, count);
  }
}

// Algorithmic Fallback Recommendation Engine
// High quality multi-domain personalized catalog mapping user goals, interests, and budget constraints
const DOMAIN_RECOMMENDATION_CORPUS = [
  // Education
  {
    title: 'Full-Stack Web Development Bootcamp (Self-Paced)',
    description: 'Comprehensive curriculum covering modern JavaScript, React, Node.js, and databases with hands-on portfolio projects.',
    category: 'Education',
    base_price: 2499,
    tags: ['Programming', 'Web Development', 'React', 'Node.js'],
    target_interests: ['Programming', 'Technology', 'Artificial Intelligence', 'Education'],
    target_goals: ['Learn new skills', 'Find career opportunities', 'Improve productivity'],
    difficulty_level: 'Beginner',
    next_action: 'Complete the HTML/CSS fundamentals module',
  },
  {
    title: 'Python for Data Science and Machine Learning Essentials',
    description: 'Learn NumPy, Pandas, Scikit-Learn, and build predictive machine learning models with real-world datasets.',
    category: 'Education',
    base_price: 1999,
    tags: ['Python', 'Data Science', 'Machine Learning', 'AI'],
    target_interests: ['Artificial Intelligence', 'Programming', 'Technology'],
    target_goals: ['Learn new skills', 'Find career opportunities'],
    difficulty_level: 'Beginner to Intermediate',
    next_action: 'Download sample dataset and run first Jupyter Notebook',
  },
  {
    title: 'Open Source CS Curriculum: Computer Systems & Algorithms',
    description: 'Free university-grade curriculum on data structures, system design, and algorithmic problem-solving.',
    category: 'Education',
    base_price: 0,
    tags: ['Algorithms', 'Computer Science', 'Free Resource'],
    target_interests: ['Programming', 'Technology', 'Education'],
    target_goals: ['Learn new skills', 'Save money'],
    difficulty_level: 'Intermediate',
    next_action: 'Browse GitHub repository and select your track',
  },
  // Technology
  {
    title: 'Ergonomic Mechanical Keyboard with Hot-Swappable Switches',
    description: 'Customizable keyboard engineered for reduced wrist fatigue, crisp tactile feedback, and programmable shortcuts.',
    category: 'Technology',
    base_price: 3499,
    tags: ['Hardware', 'Productivity', 'Desk Setup'],
    target_interests: ['Technology', 'Programming', 'Gaming'],
    target_goals: ['Improve productivity', 'Discover new products'],
    difficulty_level: 'Hardware',
    next_action: 'Select switch type (Linear vs Tactile) for your typing style',
  },
  {
    title: 'AI Productivity Suite & Prompt Engineering Toolkit',
    description: 'Curated workflows, automation scripts, and prompt templates to 10x your daily writing, research, and coding tasks.',
    category: 'Technology',
    base_price: 799,
    tags: ['AI Tools', 'Automation', 'Productivity'],
    target_interests: ['Artificial Intelligence', 'Technology', 'Business'],
    target_goals: ['Improve productivity', 'Learn new skills'],
    difficulty_level: 'All Levels',
    next_action: 'Import default template library to your workspace',
  },
  {
    title: 'Cloud Native Developer Sandbox Environment',
    description: 'Zero-config cloud dev environment with Docker, Kubernetes test clusters, and instant database provisioning.',
    category: 'Technology',
    base_price: 499,
    tags: ['DevOps', 'Cloud', 'Developer Tools'],
    target_interests: ['Technology', 'Programming'],
    target_goals: ['Improve productivity', 'Learn new skills'],
    difficulty_level: 'Intermediate',
    next_action: 'Deploy sample microservice to test cluster',
  },
  // Fashion
  {
    title: 'Minimalist Organic Cotton Everyday Capsule Wardrobe',
    description: 'Timeless, breathable basics designed for versatile mix-and-match outfits across casual and professional settings.',
    category: 'Fashion',
    base_price: 1899,
    tags: ['Minimalism', 'Sustainable', 'Casual Wear'],
    target_interests: ['Fashion', 'Personal Development'],
    target_goals: ['Discover new products', 'Save money'],
    difficulty_level: 'Lifestyle',
    next_action: 'Review style guide and color palette pairings',
  },
  {
    title: 'Smart Hybrid Water-Resistant Everyday Backpack',
    description: 'Sleek commuter backpack with dedicated padded laptop sleeve, hidden anti-theft compartments, and USB pass-through.',
    category: 'Fashion',
    base_price: 2499,
    tags: ['Accessories', 'Travel', 'Commuter'],
    target_interests: ['Fashion', 'Technology', 'Travel'],
    target_goals: ['Discover new products', 'Improve lifestyle'],
    difficulty_level: 'Accessories',
    next_action: 'Inspect compartment organization specifications',
  },
  // Fitness & Lifestyle
  {
    title: 'Calisthenics & Bodyweight Progressive Training Program',
    description: 'No-equipment progressive home workout program designed for strength, mobility, and core conditioning.',
    category: 'Fitness & Lifestyle',
    base_price: 0,
    tags: ['Home Workout', 'Calisthenics', 'Strength'],
    target_interests: ['Fitness', 'Personal Development'],
    target_goals: ['Improve physical fitness', 'Improve lifestyle', 'Save money'],
    difficulty_level: 'Beginner to Advanced',
    next_action: 'Take 3-minute baseline mobility assessment',
  },
  {
    title: 'Adjustable Resistance Band Set with Door Anchor & Workout Guide',
    description: 'Compact 5-level resistance tube system for versatile full-body muscle building and rehabilitation anywhere.',
    category: 'Fitness & Lifestyle',
    base_price: 1299,
    tags: ['Equipment', 'Home Gym', 'Strength Training'],
    target_interests: ['Fitness'],
    target_goals: ['Improve physical fitness', 'Discover new products'],
    difficulty_level: 'All Levels',
    next_action: 'Follow the 15-minute upper body starter routine',
  },
  {
    title: 'Mindful Productivity & Habit Architecture Journal',
    description: 'Structured daily habit tracker and reflection framework rooted in cognitive behavioral science.',
    category: 'Fitness & Lifestyle',
    base_price: 450,
    tags: ['Mental Wellbeing', 'Habits', 'Productivity'],
    target_interests: ['Personal Development', 'Fitness'],
    target_goals: ['Improve productivity', 'Improve lifestyle'],
    difficulty_level: 'Beginner',
    next_action: 'Set your top 3 non-negotiable daily Keystone habits',
  },
  // Entertainment
  {
    title: 'The Pragmatic Programmer (20th Anniversary Edition)',
    description: 'Classic software engineering insights on career progression, coding craftsmanship, and continuous learning.',
    category: 'Entertainment',
    base_price: 1100,
    tags: ['Books', 'Software Development', 'Reading'],
    target_interests: ['Programming', 'Technology', 'Personal Development'],
    target_goals: ['Learn new skills', 'Find career opportunities'],
    difficulty_level: 'All Levels',
    next_action: 'Read Chapter 1: A Pragmatic Philosophy',
  },
  {
    title: 'Curated Indie Puzzle & Strategy Game Anthology',
    description: 'Engaging brain-teasers and logical puzzle games designed to stimulate spatial reasoning and algorithmic thinking.',
    category: 'Entertainment',
    base_price: 650,
    tags: ['Gaming', 'Puzzles', 'Brain Training'],
    target_interests: ['Entertainment', 'Technology'],
    target_goals: ['Explore entertainment', 'Improve lifestyle'],
    difficulty_level: 'Casual',
    next_action: 'Try the first logic trial',
  },
  // Shopping & Products
  {
    title: 'Smart LED Desk Lamp with Auto-Dimming & Wireless Charger',
    description: 'CRI 95+ eye-care lighting with color temperature adjustment (2700K-6500K) and integrated 15W Qi charging base.',
    category: 'Shopping & Products',
    base_price: 2199,
    tags: ['Smart Home', 'Desk Setup', 'Gadgets'],
    target_interests: ['Technology', 'Shopping & Products'],
    target_goals: ['Discover new products', 'Improve productivity'],
    difficulty_level: 'Setup',
    next_action: 'Check desk clamp vs standalone base compatibility',
  },
  {
    title: 'Precision Temperature Control Travel Mug',
    description: 'Double-wall vacuum insulated smart thermos with real-time temperature LCD display and 12-hour thermal retention.',
    category: 'Shopping & Products',
    base_price: 1450,
    tags: ['Everyday Carry', 'Lifestyle', 'Travel'],
    target_interests: ['Shopping & Products', 'Travel', 'Fitness'],
    target_goals: ['Discover new products', 'Improve lifestyle'],
    difficulty_level: 'Lifestyle',
    next_action: 'Review battery life and cleaning instructions',
  },
  // Career & Professional Growth
  {
    title: 'Technical Resume & Interview Preparation Masterclass',
    description: 'Step-by-step framework for crafting ATS-beating resumes, building standout GitHub profiles, and passing tech interviews.',
    category: 'Career & Professional Growth',
    base_price: 999,
    tags: ['Career', 'Interviews', 'Tech Jobs'],
    target_interests: ['Career & Professional Growth', 'Programming', 'Business'],
    target_goals: ['Find career opportunities', 'Learn new skills'],
    difficulty_level: 'All Levels',
    next_action: 'Audit your current resume against the STAR method template',
  },
  {
    title: 'Freelance & Remote Consulting Starter Framework',
    description: 'Complete contracts, pricing calculators, proposals, and client acquisition funnels for knowledge workers.',
    category: 'Career & Professional Growth',
    base_price: 1750,
    tags: ['Freelancing', 'Remote Work', 'Business'],
    target_interests: ['Business', 'Career & Professional Growth'],
    target_goals: ['Find career opportunities', 'Save money'],
    difficulty_level: 'Intermediate',
    next_action: 'Calculate your minimum hourly rate using the formula sheet',
  },
];

export function generateAlgorithmicRecommendations(
  profile: Profile,
  preferences: UserPreferences,
  feedbackHistory: RecommendationFeedback[] = [],
  count: number = 8
): Recommendation[] {
  const dislikedRecIds = new Set(
    feedbackHistory
      .filter((f) => f.feedback_type === 'dislike' || f.feedback_type === 'not_interested')
      .map((f) => f.recommendation_id)
  );

  const dislikedCategories = new Set(preferences.disliked_categories || []);
  const preferredCategories = new Set(preferences.categories || []);
  const userInterests = new Set((preferences.interests || []).map((i) => i.toLowerCase()));
  const userGoals = new Set((preferences.goals || []).map((g) => g.toLowerCase()));
  const budgetMax = preferences.budget_max ?? Infinity;
  const budgetMin = preferences.budget_min ?? 0;

  // Filter and score corpus items
  const scoredItems = DOMAIN_RECOMMENDATION_CORPUS.filter((item) => {
    // Check disliked category
    if (dislikedCategories.has(item.category)) return false;
    // Check budget limit (allow free items or items <= budgetMax + 10% tolerance)
    if (item.base_price > 0 && item.base_price > budgetMax * 1.1) return false;
    return true;
  }).map((item) => {
    let score = 70; // baseline

    // Category match
    if (preferredCategories.has(item.category)) {
      score += 12;
    }

    // Interest matches
    const interestMatches = item.target_interests.filter((ti) =>
      userInterests.has(ti.toLowerCase())
    );
    score += interestMatches.length * 6;

    // Goal matches
    const goalMatches = item.target_goals.filter((tg) =>
      userGoals.has(tg.toLowerCase())
    );
    score += goalMatches.length * 5;

    // Budget fit
    if (item.base_price >= budgetMin && item.base_price <= budgetMax) {
      score += 5;
    } else if (item.base_price === 0) {
      score += 4; // Free resources are highly accessible
    }

    // Cap score at 98
    score = Math.min(98, Math.max(72, score));

    // Construct personalized explanation
    const topInterest = interestMatches[0] || preferences.interests[0] || item.category;
    const topGoal = goalMatches[0] || preferences.goals[0] || 'your objectives';
    const budgetNote =
      item.base_price === 0
        ? 'Free resource fitting perfectly in your budget'
        : `Priced at ${preferences.currency} ${item.base_price.toLocaleString()}, well within your ${preferences.currency} ${budgetMax === Infinity ? 'open' : budgetMax.toLocaleString()} budget`;

    const explanation = `Selected because you are focused on ${topInterest} and aiming to ${topGoal}. ${budgetNote}.`;

    return {
      item,
      score,
      explanation,
      matchReasons: [
        `Directly aligns with your interest in ${topInterest}`,
        `Helps advance your goal to ${topGoal}`,
        budgetNote,
      ],
    };
  });

  // Sort descending by score
  scoredItems.sort((a, b) => b.score - a.score);

  const selected = scoredItems.slice(0, count);
  const now = new Date().toISOString();

  return selected.map(({ item, score, explanation, matchReasons }) => ({
    id: uuidv4(),
    user_id: profile.id,
    title: item.title,
    description: item.description,
    category: item.category,
    estimated_price: item.base_price,
    currency: preferences.currency || 'INR',
    relevance_score: score,
    explanation: explanation,
    recommendation_data: {
      next_action: item.next_action,
      tags: item.tags,
      match_reasons: matchReasons,
      is_simulated: true,
      confidence: 0.92,
      difficulty_level: item.difficulty_level,
    },
    source_type: 'algorithmic_fallback',
    source_url: null,
    status: 'active',
    generated_at: now,
    created_at: now,
  }));
}

export async function chatWithAssistantGemini(
  profile: Profile,
  preferences: UserPreferences,
  recentFeedback: RecommendationFeedback[],
  history: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Promise<string> {
  if (!geminiClient) {
    // Intelligent conversational rule-based fallback
    return generateConversationalFallback(profile, preferences, userMessage);
  }

  try {
    const systemPrompt = `You are the PersonaAI Concierge, a helpful, intelligent, empathetic personalization assistant.
You know the authenticated user intimately through their profile:
- User Name: ${profile.full_name}
- Interests: ${preferences.interests.join(', ')}
- Target Goals: ${preferences.goals.join(', ')}
- Budget Range: ${preferences.budget_min} to ${preferences.budget_max ? preferences.budget_max : 'Unlimited'} ${preferences.currency}
- Preferred Categories: ${preferences.categories.join(', ')}
- Disliked Categories: ${preferences.disliked_categories.join(', ') || 'None'}

GUIDELINES:
1. Always give specific, actionable, budget-conscious advice that matches their explicit preferences.
2. Explain WHY you recommend certain paths or items.
3. If the user asks for alternatives, give them options in their budget range.
4. If they ask to update preferences, explain what can be tuned in the Preferences tab or clarify their request.
5. Keep your tone encouraging, professional, and concise. Format with clear bullet points.`;

    const chatContents = [
      { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser request: ${userMessage}` }] },
    ];

    const response = await callGeminiWithModelFallback({
      contents: `${systemPrompt}\n\nConversation Context:
${history.slice(-4).map((h) => `${h.role}: ${h.content}`).join('\n')}

User: ${userMessage}
Assistant:`,
    });

    return response.text?.trim() || 'I am here to help you personalize your experience. What would you like to explore?';
  } catch (error) {
    console.error('Error with Gemini Assistant chat, using intelligent conversational fallback:', error);
    return generateConversationalFallback(profile, preferences, userMessage);
  }
}

function generateConversationalFallback(
  profile: Profile,
  preferences: UserPreferences,
  message: string
): string {
  const lower = message.toLowerCase();
  const currency = preferences.currency || 'INR';
  const budgetStr = preferences.budget_max ? `${currency} ${preferences.budget_max.toLocaleString()}` : 'unrestricted';

  if (lower.includes('budget') || lower.includes('cost') || lower.includes('price')) {
    return `Hello ${profile.full_name}! Your current budget profile is configured with a maximum of **${budgetStr}**.\n\nHere are tailored options that maximize value:\n- **Free Learning Tracks**: Open-source CS fundamentals & calisthenics training.\n- **High-ROI Investments**: Practical toolkits and curated guides under ${budgetStr}.\n\nYou can adjust this anytime in your [Preferences Settings](/preferences).`;
  }

  if (lower.includes('explore') || lower.includes('recommend') || lower.includes('today')) {
    const topInterest = preferences.interests[0] || 'Technology';
    const topGoal = preferences.goals[0] || 'Skill Development';
    return `Based on your goal to **${topGoal}** and your passion for **${topInterest}**, here is my recommended roadmap for today:\n\n1. **Deep Dive**: Check your Discover tab for the highest match score recommendation.\n2. **Action Item**: Spend 20 minutes engaging with the starter module.\n3. **Feedback**: Click Like or Save to tune tomorrow's suggestions!`;
  }

  if (lower.includes('why') || lower.includes('reason')) {
    return `Every recommendation you see is calculated by matching:\n1. Your selected interest fields (${preferences.interests.slice(0, 3).join(', ')})\n2. Your active goals (${preferences.goals.slice(0, 2).join(', ')})\n3. Budget constraints (kept under ${budgetStr})\n\nDisliked items and categories are automatically filtered out.`;
  }

  return `Hello ${profile.full_name}! As your PersonaAI assistant, I'm analyzing your interests in **${preferences.interests.join(', ') || 'personal growth'}** with a budget limit of **${budgetStr}**.\n\nWould you like me to:\n- Suggest tailored resources for your goal: *${preferences.goals[0] || 'Learning'}*?\n- Show high-value options within your budget?\n- Help you refine your preference profile?`;
}

export async function interpretSearchQuery(
  query: string,
  preferences?: UserPreferences
): Promise<{
  interpreted_category?: string;
  extracted_max_price?: number;
  extracted_keywords: string[];
}> {
  const lower = query.toLowerCase();
  let interpreted_category: string | undefined;
  let extracted_max_price: number | undefined;

  // Simple keyword matching for category
  if (lower.includes('code') || lower.includes('program') || lower.includes('course') || lower.includes('learn') || lower.includes('study')) {
    interpreted_category = 'Education';
  } else if (lower.includes('tech') || lower.includes('tool') || lower.includes('laptop') || lower.includes('gadget') || lower.includes('ai')) {
    interpreted_category = 'Technology';
  } else if (lower.includes('wear') || lower.includes('cloth') || lower.includes('fashion') || lower.includes('shirt') || lower.includes('outfit')) {
    interpreted_category = 'Fashion';
  } else if (lower.includes('workout') || lower.includes('fitness') || lower.includes('gym') || lower.includes('health') || lower.includes('exercise')) {
    interpreted_category = 'Fitness & Lifestyle';
  } else if (lower.includes('book') || lower.includes('game') || lower.includes('movie') || lower.includes('music')) {
    interpreted_category = 'Entertainment';
  } else if (lower.includes('job') || lower.includes('career') || lower.includes('interview') || lower.includes('resume')) {
    interpreted_category = 'Career & Professional Growth';
  }

  // Extract budget mentions (e.g. "under 2000", "below 5000", "< 1000")
  const priceMatch = lower.match(/(?:under|below|less than|within|\<|rs\.?|inr)\s*(\d+)/i);
  if (priceMatch && priceMatch[1]) {
    extracted_max_price = parseInt(priceMatch[1], 10);
  }

  const extracted_keywords = query
    .split(/\s+/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 2);

  return {
    interpreted_category,
    extracted_max_price,
    extracted_keywords,
  };
}
