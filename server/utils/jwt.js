import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import AppError from './AppError.js';

/**
 * @param {{ userId: string; role: 'user' | 'admin' }} payload
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: 'promptvault-api',
  });
}

/**
 * @returns {{ userId: string; role: 'user' | 'admin'; iat: number; exp: number }}
 */
export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, env.jwtSecret, {
      issuer: 'promptvault-api',
    });
    if (typeof decoded === 'string' || !decoded.userId) {
      throw new AppError('Invalid token payload', 401);
    }
    return decoded;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err?.name === 'TokenExpiredError') {
      throw new AppError('Token expired. Please sign in again.', 401);
    }
    if (err?.name === 'JsonWebTokenError' || err?.name === 'NotBeforeError') {
      throw new AppError('Invalid token', 401);
    }
    throw new AppError('Authentication failed', 401);
  }
}
