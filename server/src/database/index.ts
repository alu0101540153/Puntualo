import mongoose, { connect } from 'mongoose';
import { MONGO_URI } from '../config';

// Conecta a MongoDB y fuerza el uso de la base de datos "Puntualo"
export const connectDB = async () => {
  mongoose.set('strictQuery', true);
  try {
    await connect(MONGO_URI as string, { dbName: 'Puntualo' });
    console.log('Conectado a MongoDB - base de datos: Puntualo');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};