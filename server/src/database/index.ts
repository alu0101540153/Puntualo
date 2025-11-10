import mongoose, { connect, Mongoose } from 'mongoose';
import { MONGO_URI, TEST_MONGO_URI, DB_NAME, TEST_DB_NAME } from '../config';

// Conecta a MongoDB usando el dbName apropiado según NODE_ENV
export const connectDB = async (): Promise<Mongoose | void> => {
  mongoose.set('strictQuery', true);
  const isTest = process.env.NODE_ENV === 'test';
  const uri = isTest ? process.env.TEST_MONGO_URI || TEST_MONGO_URI : process.env.MONGO_URI || MONGO_URI;
  const dbName = isTest ? process.env.TEST_DB_NAME || TEST_DB_NAME : process.env.DB_NAME || DB_NAME;

  try {
    await connect(uri as string, { dbName });
    console.log(`Conectado a MongoDB - base de datos: ${dbName}`);
    return mongoose;
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    // En entorno de test no salimos del proceso (para que el runner de tests capture el error)
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
    process.exit(1);
  }
};

export const dropTestDatabase = async () => {
  const isTest = process.env.NODE_ENV === 'test';
  if (!isTest) return;
  try {
    const conn = mongoose.connection;
    if (conn.readyState === 1) {
      await conn.dropDatabase();
      console.log('Base de datos de test borrada');
    }
  } catch (err) {
    console.error('Error al borrar la base de datos de test:', err);
  }
};