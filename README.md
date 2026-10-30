# PersonaAI – Intelligent Personalization Platform

> **AI-Powered Adaptive Experience & Recommendation Engine**  
> Built with React, Vite, TypeScript, Tailwind CSS, Node.js, Express, Supabase PostgreSQL, and Google Gemini AI (`@google/genai`).

---

## 1. Executive Summary & Core Mission

Generic digital platforms suffer from "one-size-fits-all" stagnation, displaying identical content, courses, and products regardless of an individual's unique situation.

**PersonaAI** completely solves this problem. It is a full-stack, production-ready personalization platform that continuously understands:
- **Who the user is** (identity, background, bio, location context)
- **What they want to achieve** (learning programming, staying under budget, finding career opportunities, fitness goals)
- **Strict budget constraints** (e.g. ₹500, ₹2,000, ₹5,000 or custom)
- **Category affinities & exclusions** (prioritizing preferred domains while strictly omitting disliked categories)
- **Explicit feedback signals** (likes, dislikes, saves, not-interested flags)
- **Continuous dynamic adaptation** (real-time recalculation of recommendations when preferences or budgets change)

---

## 2. Real-World Scenario Examples

| Dimension | User A (Tech Learner) | User B (Minimalist Stylist) | User C (Home Fitness) |
| :--- | :--- | :--- | :--- |
| **Interests** | Programming, AI, Web Dev | Fashion, Sustainability | Fitness, Health & Lifestyle |
| **Budget Ceiling** | **₹5,000** | **₹2,000** | **₹3,000** |
| **Active Goal** | Learn web development | Build casual capsule wardrobe | Improve physical fitness at home |
| **Curated Feed** | Full-Stack Web Bootcamp (₹2,499) + AI Developer Toolkit (₹799) | Minimalist Organic Cotton Wardrobe (₹1,899) | Progressive Calisthenics Program (Free) + Resistance Bands (₹1,299) |
| **Rationale** | Stays well below ₹5k ceiling with high learning ROI | Complies with strict ₹2,000 budget and casual aesthetic | Saves over half the ₹3,000 budget while matching home workout goal |

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (with complete Dark & Light mode toggle)
- **Routing**: React Router DOM (v7) with protected route guards
- **Data Fetching & Cache**: TanStack React Query (v5)
- **Visual Analytics**: Recharts
- **Iconography**: Lucide React
- **Validation & Forms**: Zod + React Hook Form

### Backend
- **Runtime & Server**: Node.js + Express.js + TypeScript
- **Architecture**: REST API with clean Controllers, Services, and Types
- **AI Integration**: Official Google `@google/genai` SDK
- **Database & Auth**: Supabase PostgreSQL with Row-Level Security (RLS) + Local Persistent Store Fallback
- **Validation**: Zod schema validation

---

## 4. System Architecture & Capabilities

```
┌─────────────────────────────────────────────────────────────┐
│                       React Frontend                        │
│  Landing · Onboarding · Dashboard · Discover · AI Concierge │
│  Smart Search · Saved Items · Activity · Analytics · Privacy│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST
┌──────────────────────────────▼──────────────────────────────┐
│                    Express.js Backend                       │
│  Auth Middleware · RLS Verification · Dynamic Controller    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│     Google Gemini AI        ││      Supabase PostgreSQL     │
│ - Structured Recommendations││ - Profiles & Preferences     │
│ - Explainability Reasoning  ││ - Recommendations & Feedback │
│ - Natural Query Parser      ││ - Activity & Search History  │
│ - Conversational Assistant  ││ - Multi-Tenant RLS Security  │
└─────────────────────────────┘└──────────────────────────────┘
```

### Supported Target Domains
1. **Education**: Online courses, programming tutorials, certifications, study materials
2. **Technology**: AI tools, software libraries, gadgets, developer sandboxes
3. **Fashion**: Capsule wardrobes, sustainable clothing, minimal accessories
4. **Fitness & Lifestyle**: Calisthenics programs, resistance gear, habit journals
5. **Entertainment**: Software craftsmanship books, puzzle games, digital content
6. **Shopping & Products**: Smart desk setups, temperature mugs, lifestyle essentials
7. **Career & Professional Growth**: Technical resume masterclasses, freelance consulting toolkits

---

## 5. Complete Application Pages (Routes)

### Public Pages
1. `/` – **Landing Page**: Hero banner (*"Your Digital Experience. Your Preferences. Your World."*), scenario comparisons (User A, B, C), feature highlights, and interactive demo triggers.
2. `/login` – **Login**: Supabase email/password authentication + 1-Click Instant Demo Login for reviewers.
3. `/register` – **Register**: Creates new user account and directly redirects to interactive onboarding.
4. `/forgot-password` – **Forgot Password**: Dispatches recovery links.

### Authenticated Pages (Protected by Route Guards & Layout)
5. `/onboarding` – **Interactive Onboarding**: 4-step wizard collecting bio, multi-select interests (predefined + custom), domain categories, budget tier, active goals, and frequency.
6. `/dashboard` – **Personalized Dashboard**: Welcome banner, active budget pill, top ranked picks, trending domain subscriptions, and real-time activity feed.
7. `/discover` – **Recommendation Feed**: Domain filter pills, price threshold filter, sorting (relevance, price, date), feedback buttons (Like, Dislike, Save, Not Interested), and "Why?" explainability modal.
8. `/assistant` – **AI Concierge**: Conversational assistant knowing the authenticated user's preferences, goals, and budget. Answers questions like *"What should I explore today?"* or *"Recommend something within my budget"*.
9. `/search` – **Smart Personalized Search**: Natural language query interpretation extracting intent and budget with personalized relevance ranking.
10. `/saved` – **Saved Recommendations**: Bookmarked recommendations library with category filters.
11. `/activity` – **Activity History**: Complete timestamped audit trail of views, clicks, searches, and feedback.
12. `/analytics` – **Visual Analytics**: Interactive Recharts visualizations (BarChart for category distribution, AreaChart for 7-day engagement, PieChart for feedback sentiment) computed from database records.
13. `/preferences` – **Preference Control**: Dynamic modification of budget, interests, excluded domains, and instant recommendation regeneration.
14. `/profile` – **Account Profile**: Edit personal details, location, and bio.
15. `/privacy` – **Privacy & Governance**: 1-click GDPR JSON data export, activity logs clearing, and personalization toggle.
16. `*` – **Custom 404**: Clean not-found recovery page.

---

## 6. Database Schema (Supabase Migration)

The SQL migration file is located at:  
[`backend/supabase/migrations/001_initial_schema.sql`](backend/supabase/migrations/001_initial_schema.sql)

It creates all 8 required PostgreSQL tables:
- `public.profiles` (UUID, full_name, bio, onboarding_completed, personalization_enabled)
- `public.user_preferences` (user_id, interests, categories, goals, disliked_categories, budget_min, budget_max, currency)
- `public.recommendations` (user_id, title, description, category, estimated_price, currency, relevance_score, explanation, recommendation_data, source_type)
- `public.recommendation_feedback` (user_id, recommendation_id, feedback_type: like, dislike, save, not_interested, relevant, not_relevant)
- `public.user_activity` (user_id, recommendation_id, activity_type, category, metadata, created_at)
- `public.search_history` (user_id, search_query, category, filters, created_at)
- `public.ai_conversations` (user_id, title, created_at, updated_at)
- `public.ai_messages` (conversation_id, user_id, role, content, metadata)

Row-Level Security (RLS) is enabled on all tables so users can strictly only access their own private records.

---

## 7. Quick Start & Local Execution

### Prerequisites
- Node.js (v18+) and npm
- (Optional) Supabase project credentials & Google Gemini API key

### Installation
From the root workspace:
```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install
```

### Environment Configuration
1. **Backend Environment** (`backend/.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Optional: Connect your live Supabase project
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   
   # Optional: Connect Google Gemini API (from https://aistudio.google.com/)
   GEMINI_API_KEY=your-gemini-api-key
   
   CLIENT_URL=http://localhost:5173
   ```
   > *Note: If `GEMINI_API_KEY` or `SUPABASE_URL` are not provided, PersonaAI automatically activates its built-in intelligent algorithmic recommendation engine and local persistent storage fallback, allowing 100% full-feature testing immediately without external blocking!*

2. **Frontend Environment** (`frontend/.env`):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

In terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server boots at http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Vite runs at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 8. Automated Integration Testing

To run the automated 11-step end-to-end integration test suite:
```bash
cd backend
npm run build
node dist/test-api.js
```

This verifies:
1. Health check endpoint (`/api/health`)
2. User authentication & session handling
3. Profile retrieval
4. Multi-step onboarding persistence
5. Recommendation curation with scores & explainability
6. Dynamic preference updates & real-time budget clamping
7. Explicit feedback actions (Like & Save)
8. Multi-turn AI assistant chat
9. Smart search natural language interpretation
10. Database analytics calculation & category distributions
11. GDPR JSON data export

---

## 9. Deployment Guide

### Deploying Frontend to Vercel
1. Link your GitHub repository in the Vercel dashboard.
2. Set Root Directory to `frontend`.
3. Set Build Command to `npm run build` and Output Directory to `dist`.
4. Configure Environment Variables (`VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

### Deploying Backend to Node.js / Render / Railway
1. Set Root Directory to `backend`.
2. Set Build Command to `npm run build` and Start Command to `npm start`.
3. Add Environment Variables (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLIENT_URL`).

