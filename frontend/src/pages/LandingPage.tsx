import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  Sparkles,
  ArrowRight,
  Target,
  Sliders,
  DollarSign,
  TrendingUp,
  Shield,
  Layers,
  BrainCircuit,
  MessageSquare,
  CheckCircle2,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const userScenarios = [
    {
      user: 'User A – Tech Learner',
      avatar: '💻',
      budget: '₹5,000',
      interests: 'Programming, Artificial Intelligence',
      goal: 'Learn web development from scratch',
      recommendation: 'Full-Stack Web Bootcamp (₹2,499) + AI Developer Toolkit (₹799)',
      why: 'Directly aligns with beginner learning goals and stays well under the ₹5,000 budget.',
    },
    {
      user: 'User B – Minimalist Stylist',
      avatar: '🧥',
      budget: '₹2,000',
      interests: 'Fashion, Sustainable Living',
      goal: 'Find casual capsule wardrobe pieces',
      recommendation: 'Minimalist Organic Cotton Essentials (₹1,899)',
      why: 'Respects strict ₹2,000 budget while adhering to sustainable casual styling preference.',
    },
    {
      user: 'User C – Home Fitness',
      avatar: '⚡',
      budget: '₹3,000',
      interests: 'Fitness, Health & Lifestyle',
      goal: 'Improve fitness with home workouts',
      recommendation: 'Progressive Calisthenics Program (Free) + Resistance Tube Set (₹1,299)',
      why: 'Delivers maximum training value at ₹1,299, saving over half their ₹3,000 budget.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">
        {/* Glowing Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-[130px] -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Personalization & Recommendation Engine
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Your Digital Experience.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Your Preferences.
            </span>{' '}
            Your World.
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Discover recommendations that understand your interests, goals, budget, and changing needs. Say goodbye to generic feeds and one-size-fits-all algorithms.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              {isAuthenticated ? 'Go to My Dashboard' : 'Get Started Free'}
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to={isAuthenticated ? '/discover' : '/login'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-base border border-slate-200 dark:border-slate-800 transition-colors shadow-xs"
            >
              Explore Live Demo
            </Link>
          </div>

          {/* Feature highlights pill */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Budget-Conscious Filtering
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Google Gemini Intelligence
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              100% User Control & RLS Privacy
            </span>
          </div>
        </div>
      </section>

      {/* Real-World Scenarios Section (User A, User B, User C) */}
      <section className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              Adaptive Intelligence in Action
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              One Platform. Completely Different Realities.
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Three different people with distinct goals and budgets accessing the same platform. PersonaAI understands their individuality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userScenarios.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{item.avatar}</span>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      Budget: {item.budget}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {item.user}
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-3">
                    Goal: {item.goal}
                  </p>

                  <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 block mb-1">
                      Personalized Output:
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {item.recommendation}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Why matched: </span>
                  {item.why}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Architecture Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              Comprehensive Personalization Engine
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Architected for Accuracy, Control, and Privacy
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Gemini AI Engine
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Uses official Google GenAI models to parse nuances, interpret search intent, and provide transparent rationale for every recommendation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Sliders className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Dynamic Preference Tuning
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Change your budget, remove categories, or set new goals. The engine instantly updates your feed to reflect your new reality.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Conversational Assistant
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Chat with an AI concierge that knows your profile, budget, and learning goals to suggest alternatives or plan your exploration roadmap.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                User Sovereignty
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Full transparency with 1-click JSON data export, activity logs clearing, and Row-Level Security isolating your personal profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to experience recommendations built specifically for you?
          </h2>
          <p className="mt-4 text-base text-indigo-200 max-w-2xl mx-auto">
            Set up your personalized profile in less than 2 minutes and experience the future of adaptive recommendations.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-indigo-900 font-bold text-base shadow-xl transition-all hover:scale-105"
            >
              Start Your Personalized Journey
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
