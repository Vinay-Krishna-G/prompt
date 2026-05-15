import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

// Utilities & Middleware imports
import { notFound, globalErrorHandler } from './middleware/errorMiddleware.js';
import { mongoSanitizeMiddleware } from './middleware/mongoSanitizeMiddleware.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import './models/index.js';

// Route imports
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import promptRouter from './routes/promptRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';
import aimodelRouter from './routes/aimodelRoutes.js';

const app = express();

// 1) GLOBAL MIDDLEWARES

// If behind a proxy (Render/Heroku/Nginx), this is required for secure cookies + accurate IPs.
// Keep it strict in production. In dev it's harmless.
if (env.isProd) app.set('trust proxy', 1);

// Implement CORS (NEVER use "*")
const devFallbackOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);
const allowedOrigins = new Set(env.corsAllowedOrigins);
if (!env.isProd && allowedOrigins.size === 0) {
  for (const o of devFallbackOrigins) allowedOrigins.add(o);
  logger.warn('CORS_ALLOWED_ORIGINS is empty; using localhost dev fallback');
}

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser requests (curl/postman) with no Origin header
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);

// Set Security HTTP headers
app.use(helmet());

// Development logging
app.use(morgan(env.isProd ? 'combined' : 'dev'));

// Limit requests from same IP (Denial of service protection)
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Limit requests from same IP (Denial of service protection)
const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  limit: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Data sanitization against NoSQL query injection
// app.use(mongoSanitizeMiddleware());

// Data sanitization against XSS (cross-site scripting)
// app.use(xss());

// Prevent parameter pollution (e.g., duplicate query parameters causing array conversion bugs)
app.use(hpp({
  whitelist: [
    'likes',
    'copies',
    'category',
    'aiModel'
  ]
}));

// Apply data compression to server responses for performance gains
app.use(compression());

// 2) ROUTES

app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('--- DEBUG LOG ---');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', JSON.stringify(req.body));
    console.log('-----------------');
  }
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'PromptVault API Operational' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/prompts', promptRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/aimodels', aimodelRouter);

// 3) CATCH-ALL ERROR HANDLING
app.use(notFound);
app.use(globalErrorHandler);

export default app;
