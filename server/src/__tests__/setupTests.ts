// Test setup: carga variables de entorno y configuración compartida
import '../config';

// Si estamos en entorno de test, arrancar una instancia de Mongo en memoria
// para que las pruebas se puedan ejecutar sin una instalación local de mongod.
// Vitest carga este archivo antes de las pruebas (ver vitest.config.ts -> setupFiles)
import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll } from 'vitest';

let mongod: MongoMemoryServer | null = null;

beforeAll(async () => {
	// If TEST_MONGO_URI is already provided (e.g. you're running a local/docker mongod),
	// don't start an in-memory instance. This avoids issues on systems missing
	// libcrypto/OpenSSL versions required by the downloaded mongod binary.
	if (process.env.NODE_ENV === 'test') {
		if (process.env.TEST_MONGO_URI) {
			// Use the provided TEST_MONGO_URI (no in-memory mongo needed)
			// eslint-disable-next-line no-console
			console.info('[test-setup] Using existing TEST_MONGO_URI, skipping in-memory MongoDB')
			return
		}

		mongod = await MongoMemoryServer.create();
		const uri = mongod.getUri();
		// Exponer la URI para que connectDB la use (usa process.env.TEST_MONGO_URI)
		process.env.TEST_MONGO_URI = uri;
		// Asegurar nombre de BD de test por defecto
		process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || 'Puntualo_test';
		// Informativo
		// eslint-disable-next-line no-console
		console.info('[test-setup] Started in-memory MongoDB for tests')
	}
});

afterAll(async () => {
	if (mongod) {
		await mongod.stop();
		// eslint-disable-next-line no-console
		console.info('[test-setup] Stopped in-memory MongoDB')
		mongod = null;
	}
});

// Añade aquí otros mocks o configuración global adicional para las pruebas
