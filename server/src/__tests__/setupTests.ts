import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | undefined;

export default async function globalSetup() {
  mongod = await MongoMemoryServer.create();
  // set env vars that your code reads
  process.env.TEST_MONGO_URI = mongod.getUri();
  process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || 'Puntualo_test';

  // ensure the mongod is stopped when the process exits
  process.on('exit', async () => {
    if (mongod) await mongod.stop();
  });
}
