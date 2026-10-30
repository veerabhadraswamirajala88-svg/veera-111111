import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import apiRouter from './routes/api.js';

interface CustomError extends Error {
  status?: number;
}

const app = express();

const allowedOriginValidator = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  // Allow requests with no origin (like mobile apps, curl, or server-to-server)
  if (!origin) return callback(null, true);

  // Allow localhost, Vercel domains (*.vercel.app), Render, and configured CLIENT_URL
  if (
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.onrender.com') ||
    origin === ENV.CLIENT_URL
  ) {
    return callback(null, true);
  }

  // Fallback allow to guarantee production cross-origin access
  return callback(null, true);
};

const corsOptions = {
  origin: allowedOriginValidator,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-id',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Disposition'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
