import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error('MongoDB connection error', { message: error?.message });
    throw error;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.connection.close(false);
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.warn('MongoDB connection close error', { message: error?.message });
  }
}
