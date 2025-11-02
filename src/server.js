const app = require('./app');
const { connectDB } = require('./config/database');
require('dotenv').config();

// Conectar a la base de datos al iniciar
connectDB().then(() => {
  console.log('Base de datos conectada correctamente');
}).catch(error => {
  console.error('Error al conectar con la base de datos:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});