import { MongoMemoryServer } from 'mongodb-memory-server';

// Si ya hay una URI de Mongo para tests, no arrancamos el servidor en memoria.
// Esto permite apuntar a un mongod local (instalado en el runner) desde CI.
if (!process.env.TEST_MONGO_URI) {
  (async () => {
    try {
      const mongod = await MongoMemoryServer.create();
      process.env.TEST_MONGO_URI = mongod.getUri();
      process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || 'Puntualo_test';
      (globalThis as any).__MONGOD__ = mongod;

      // Asegurarse de detener el servidor in-memory cuando el proceso termine
      process.on('exit', async () => {
        try {
          await mongod.stop();
        } catch (err) {
          // noop
        }
      });
    } catch (err) {
      // Si falla, dejamos que los tests informen del error
      // no forzamos exit para que el runner capture el fallo
      // eslint-disable-next-line no-console
      console.error('Error starting in-memory mongo:', err);
    }
  })();
} else {
  // eslint-disable-next-line no-console
  console.log('TEST_MONGO_URI provided, skipping mongodb-memory-server startup');
}
