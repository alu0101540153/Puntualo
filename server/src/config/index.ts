import { config } from 'dotenv';
import { join } from 'path';

// Cargar el .env correspondiente según NODE_ENV
const envFile = process.env.NODE_ENV === 'test'
  ? join(process.cwd(), '.env.test')
  : process.env.NODE_ENV === 'production'
    ? undefined
    : join(process.cwd(), '.env');

if (envFile) config({ path: envFile });

export const PORT = process.env.PORT || '3000';
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
export const TEST_MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017';
export const DB_NAME = process.env.DB_NAME || 'Puntualo';
export const TEST_DB_NAME = process.env.TEST_DB_NAME || 'Puntualo_test';

// TMDB configuration
export const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

// TMDB v4 token (opcional). Si prefieres usar el token Bearer en lugar de api_key,
// ponlo en TMDB_ACCESS_TOKEN y adapta las llamadas para usar Authorization header.
export const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN || '';


// JWT 
export const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Email / SendGrid configuration
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
export const MAIL_SENDER_EMAIL = process.env.MAIL_SENDER_EMAIL || 'no-reply@puntualo.app';
export const MAIL_SENDER_NAME = process.env.MAIL_SENDER_NAME || 'Puntualo';
// Optional SendGrid Dynamic Template IDs (set these in your server/.env when using templates)
export const SENDGRID_REGISTER_TEMPLATE_ID = process.env.SENDGRID_REGISTER_TEMPLATE_ID || '';
export const SENDGRID_FOLLOW_TEMPLATE_ID = process.env.SENDGRID_FOLLOW_TEMPLATE_ID || '';
// Optional base URL for public assets (if set, backend will send image URLs instead of data-URIs)
export const ASSETS_BASE_URL = process.env.ASSETS_BASE_URL || '';