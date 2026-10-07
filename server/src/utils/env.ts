import dotenv from 'dotenv';
import path from 'path';
import { EnvSchema } from '../shared/schemas/index.js';

// Load .env from root or server
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
}

export const env = parsed.success ? parsed.data : {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/campus_bites',
  SESSION_SECRET: process.env.SESSION_SECRET || 'campus_bites_super_secure_jwt_session_secret_2026',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};
