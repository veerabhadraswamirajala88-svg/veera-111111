import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import apiRouter from './routes/api.js';

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development and standard frontend clients
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
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

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

const PORT = ENV.PORT;
app.listen(PORT, () => {
  console.log(`🚀 PersonaAI Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check available at http://localhost:${PORT}/api/health`);
  console.log(`🤖 Gemini AI status: ${ENV.isGeminiConfigured() ? 'Connected' : 'Intelligent Algorithmic Engine Ready'}`);
  console.log(`🗄️ Supabase status: ${ENV.isSupabaseConfigured() ? 'Connected' : 'Local Persistent Store Ready'}`);
});
