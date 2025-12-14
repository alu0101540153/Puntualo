// Test setup: carga variables de entorno y configuración compartida
import path from 'path'
import '../config';

// Si estamos en entorno de test, arrancar una instancia de Mongo en memoria
// para que las pruebas se puedan ejecutar sin una instalación local de mongod.
// Vitest carga este archivo antes de las pruebas (ver vitest.config.ts -> setupFiles)
import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll } from 'vitest';

let mongod: MongoMemoryServer | null = null;

// Prefer newer MongoDB binary compatible with OpenSSL 3 (Ubuntu 22+/Debian 12+)
process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '7.0.14'
// Force distro detection away from ubuntu24.04 (binary not published) to ubuntu22.04 which has OpenSSL 3
process.env.MONGOMS_OS_DISTRIBUTION = process.env.MONGOMS_OS_DISTRIBUTION || 'ubuntu22.04'
process.env.MONGOMS_OS_RELEASE = process.env.MONGOMS_OS_RELEASE || '22.04'
process.env.MONGOMS_OS_PLATFORM = process.env.MONGOMS_OS_PLATFORM || 'linux'
process.env.MONGOMS_OS_ARCH = process.env.MONGOMS_OS_ARCH || 'x64'
process.env.MONGOMS_DOWNLOAD_URL = process.env.MONGOMS_DOWNLOAD_URL || 'https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-7.0.14.tgz'
process.env.MONGOMS_INSTANCE_STORAGE_ENGINE = process.env.MONGOMS_INSTANCE_STORAGE_ENGINE || 'wiredTiger'
// Use project-local download dir to avoid stale global locks
process.env.MONGOMS_DOWNLOAD_DIR = process.env.MONGOMS_DOWNLOAD_DIR || path.join(process.cwd(), '.mongodb-binaries')

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

		// Explicit binary opts to force ubuntu22.04 build (OpenSSL 3) and wiredTiger engine
		mongod = await MongoMemoryServer.create({
			instance: { storageEngine: 'wiredTiger' },
			binary: {
				version: process.env.MONGOMS_VERSION || '7.0.14',
				downloadDir: process.env.MONGOMS_DOWNLOAD_DIR || path.join(process.cwd(), '.mongodb-binaries'),
				platform: 'linux',
				arch: 'x64',
				os: { dist: 'ubuntu', release: '22.04' }
			}
		});
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
