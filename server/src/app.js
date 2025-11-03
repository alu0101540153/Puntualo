const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '¡Backend de StreamBooks funcionando!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      content: '/api/content',
      health: '/api/health'
    }
  });
});

// Rutas de la API
app.use('/api', require('./routes/index'));

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    message: 'La ruta que buscas no existe en este servidor'
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
});

module.exports = app;