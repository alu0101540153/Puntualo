const { MongoClient } = require('mongodb');

// URI de conexión - usando la sintaxis del curso
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'streambooks';

let client;
let database;

/**
 * Conecta a la base de datos MongoDB
 * @returns {Promise<Db>} Instancia de la base de datos
 */
const connectDB = async () => {
  try {
    // Crear nueva instancia del cliente usando la URI
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Conectar al servidor MongoDB
    await client.connect();
    
    // Seleccionar la base de datos
    database = client.db(dbName);
    
    console.log(`Conectado a MongoDB: ${uri}`);
    console.log(`Base de datos: ${dbName}`);
    
    return database;
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    throw error;
  }
};

/**
 * Cierra la conexión con MongoDB
 */
const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
};

/**
 * Obtiene la instancia de la base de datos
 * @returns {Db} Instancia de la base de datos
 */
const getDB = () => {
  if (!database) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return database;
};

module.exports = {
  connectDB,
  closeDB,
  getDB
};