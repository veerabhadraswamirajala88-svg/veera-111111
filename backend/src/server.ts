import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import apiRouter from './routes/api.js';

interface CustomError extends Error {
  status?: number;
}

const app = express();

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // Allow local development, mobile apps, and standard clients
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'PersonaAI Backend API',
    health: '/api/health',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    engine: 'PersonaAI Recommendation Core',
    gemini_configured: ENV.isGeminiConfigured(),
    supabase_configured: ENV.isSupabaseConfigured(),
  });
});

// API Routes
app.use('/api', apiRouter);

// Global Error Handler with explicit types
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

const PORT = Number(process.env.PORT) || ENV.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 PersonaAI Backend Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Health Check available at http://${HOST}:${PORT}/api/health`);
  console.log(`🤖 Gemini AI status: ${ENV.isGeminiConfigured() ? 'Connected' : 'Intelligent Algorithmic Engine Ready'}`);
  console.log(`🗄️ Supabase status: ${ENV.isSupabaseConfigured() ? 'Connected' : 'Local Persistent Store Ready'}`);
});
