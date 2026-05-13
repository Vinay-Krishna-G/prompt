import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load environment variables deterministically from `server/.env`,
// regardless of where `node` is executed from (repo root, process manager, etc.).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function numberFromEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error(`Invalid number env var ${name}="${raw}"`);
  return n;
}

function booleanFromEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw === 'true' || raw === '1';
}

function csvFromEnv(name) {
  const raw = process.env[name];
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function optionalTrimmed(name) {
  const raw = process.env[name];
  if (!raw) return null;
  const t = raw.trim();
  return t ? t : null;
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',
  port: numberFromEnv('PORT', 8080),

  mongoUri: required('MONGODB_URI'),

  corsAllowedOrigins: csvFromEnv('CORS_ALLOWED_ORIGINS'),

  cookie: {
    secure: booleanFromEnv('COOKIE_SECURE', true),
    sameSite: process.env.COOKIE_SAME_SITE ?? 'lax',
  },

  rateLimit: {
    windowMs: numberFromEnv('RATE_LIMIT_WINDOW_MS', 60_000),
    max: numberFromEnv('RATE_LIMIT_MAX', 300),
  },

  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: optionalTrimmed('JWT_EXPIRES_IN') ?? '7d',

  /**
   * If set, the first successful registration whose email matches (case-insensitive)
   * becomes `admin` when there are zero admins in the database. Prevents client-supplied roles.
   */
  initialAdminEmail: optionalTrimmed('INITIAL_ADMIN_EMAIL')?.toLowerCase() ?? null,
});
