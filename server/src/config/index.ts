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