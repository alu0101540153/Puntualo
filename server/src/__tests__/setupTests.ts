import { beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | undefined;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.TEST_MONGO_URI = mongod.getUri();
  process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || 'Puntualo_test';
});

afterAll(async () => {
  if (mongod) await mongod.stop();
});
