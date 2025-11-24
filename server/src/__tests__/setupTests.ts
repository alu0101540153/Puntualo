import { beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | undefined;

beforeAll(async () => {
  // If TEST_MONGO_URI is already provided (for example the CI runner started a
  // local mongod and exported TEST_MONGO_URI), skip creating an in-memory
  // instance and reuse the provided MongoDB.
  if (process.env.TEST_MONGO_URI && process.env.TEST_MONGO_URI.length > 0) {
    // Use existing Mongo (no-op)
    process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || 'Puntualo_test';
    return;
  }

  mongod = await MongoMemoryServer.create();
  process.env.TEST_MONGO_URI = mongod.getUri();
  process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || 'Puntualo_test';
});

afterAll(async () => {
  if (mongod) await mongod.stop();
});
