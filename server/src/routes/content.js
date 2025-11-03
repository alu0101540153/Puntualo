const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Content = require('../models/Content');

// Obtener todo el contenido (público)
router.get('/', async (req, res) => {
  try {
    const contentModel = new Content();
    const { type, genre, search, limit = 20 } = req.query;

    let content;

    if (search) {
      content = await contentModel.search(search);
    } else if (type) {
      content = await contentModel.findByType(type);
    } else if (genre) {
      content = await contentModel.findByGenre(genre);
    } else {
      content = await contentModel.getPopular(parseInt(limit));
    }

    res.json({
      success: true,
      data: content,
      count: content.length
    });

  } catch (error) {
    console.error('Error obteniendo contenido:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo contenido'
    });
  }
});

// Obtener contenido por ID
router.get('/:id', async (req, res) => {
  try {
    const contentModel = new Content();
    const content = await contentModel.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Contenido no encontrado'
      });
    }

    res.json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Error obteniendo contenido:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo contenido'
    });
  }
});

// Crear contenido (solo para administradores - protegido)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const contentModel = new Content();
    const content = await contentModel.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Contenido creado exitosamente',
      data: content
    });

  } catch (error) {
    console.error('Error creando contenido:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando contenido'
    });
  }
});

module.exports = router;