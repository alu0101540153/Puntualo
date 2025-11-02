const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const contentRoutes = require('./content');

// Usar rutas
router.use('/auth', authRoutes);
router.use('/content', contentRoutes);

// Ruta de salud de la API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API de StreamBooks funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;