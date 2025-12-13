import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

let mongoServer: MongoMemoryServer | null = null;

beforeAll(async () => {
  // Si ya hay una TEST_MONGO_URI, usarla (más rápido)
  if (process.env.TEST_MONGO_URI) {
    console.log('[test-setup] Using existing TEST_MONGO_URI, skipping in-memory MongoDB');
    return;
  }

  // Forzar binarios compatibles con Ubuntu 22.04+ (evita dependencias libcrypto.so.1.1 y URLs 2404 inexistentes)
  process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '7.0.5';
  process.env.MONGOMS_DISTRO = process.env.MONGOMS_DISTRO || 'ubuntu-22.04';

  console.log('[test-setup] Starting in-memory MongoDB...');
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: process.env.MONGOMS_VERSION,
    },
    instance: {
      storageEngine: 'wiredTiger',
    }
  });
  const mongoUri = mongoServer.getUri();
  process.env.TEST_MONGO_URI = mongoUri;
  console.log('[test-setup] In-memory MongoDB started');
}, 90000); // 90 second timeout

afterEach(async () => {
  // Limpiar colecciones después de cada test
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
