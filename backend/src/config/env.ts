import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  isSupabaseConfigured: () => {
    return (
      Boolean(process.env.SUPABASE_URL) &&
      process.env.SUPABASE_URL !== 'https://your-project.supabase.co' &&
      Boolean(process.env.SUPABASE_ANON_KEY) &&
      process.env.SUPABASE_ANON_KEY !== 'your-supabase-anon-key'
    );
  },
  isGeminiConfigured: () => {
    const key = process.env.GEMINI_API_KEY;
    return (
      Boolean(key) &&
      key !== 'your-gemini-api-key' &&
      (key?.trim().length ?? 0) > 5
    );
  },
};
