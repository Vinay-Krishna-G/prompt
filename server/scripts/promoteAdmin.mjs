/**
 * Promote an existing user to admin by email (CLI utility).
 * Usage (from server/): npm run promote-admin -- user@example.com
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}

const email = (process.argv[2] || '').trim().toLowerCase();
if (!email) {
  console.error('Usage: npm run promote-admin -- user@example.com');
  process.exit(1);
}

await mongoose.connect(uri);
const result = await User.updateOne({ email }, { $set: { role: 'admin' } });
if (result.matchedCount === 0) {
  console.error(`No user found with email: ${email}`);
  await mongoose.disconnect();
  process.exit(1);
}
console.log(`Promoted to admin: ${email} (modified: ${result.modifiedCount})`);
await mongoose.disconnect();
